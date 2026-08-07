import {createClient} from '@/lib/supabase/server';
import {NextRequest, NextResponse} from 'next/server';
import {bookingFormSchema} from '@/lib/validations/booking';
import {z} from 'zod';
import {createAdminClient} from '../../../lib/supabase/admin';

// Skema lengkap untuk request body (form data + info booking)
const createBookingSchema = bookingFormSchema.extend({
  service_id: z.string().uuid(),
  staff_id: z.string().uuid().nullable(),
  booking_date: z.string(), // format YYYY-MM-DD
  start_time: z.string(), // format HH:MM
});

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  // 1. Validasi struktur data dengan Zod
  const parsed = createBookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({error: 'Data tidak valid', details: parsed.error.flatten()}, {status: 400});
  }

  const {service_id, staff_id, booking_date, start_time, ...customerData} = parsed.data;

  //   const supabase = await createClient();
  const supabase = createAdminClient();

  // 2. Ambil durasi layanan (untuk hitung end_time & cek overlap)
  const {data: service, error: serviceError} = await supabase.from('services').select('duration_minutes').eq('id', service_id).single();

  if (serviceError || !service) {
    return NextResponse.json({error: 'Layanan tidak ditemukan'}, {status: 404});
  }

  const duration = service.duration_minutes;
  const startMinutes = timeToMinutes(start_time);
  const endMinutes = startMinutes + duration;
  const end_time = minutesToTime(endMinutes);

  // 3. Tentukan staff mana yang akan dapat booking ini
  let assignedStaffId = staff_id;

  if (!assignedStaffId) {
    // Customer pilih "Siapa saja" — cari staff yang benar-benar kosong di slot ini
    const {data: allStaff} = await supabase.from('staff').select('id').eq('is_active', true);

    const dayOfWeek = new Date(booking_date + 'T00:00:00').getDay();

    for (const staff of allStaff || []) {
      // Cek staff ini kerja di hari itu jam segitu
      const {data: availability} = await supabase.from('availability').select('start_time, end_time').eq('staff_id', staff.id).eq('day_of_week', dayOfWeek);

      const isWorking = (availability || []).some((a) => {
        const workStart = timeToMinutes(a.start_time);
        const workEnd = timeToMinutes(a.end_time);
        return startMinutes >= workStart && endMinutes <= workEnd;
      });

      if (!isWorking) continue;

      // Cek staff ini tidak bentrok booking lain
      const {data: conflicts} = await supabase.from('bookings').select('id').eq('staff_id', staff.id).eq('booking_date', booking_date).in('status', ['PENDING', 'APPROVED']).lt('start_time', end_time).gt('end_time', start_time);

      if (!conflicts || conflicts.length === 0) {
        assignedStaffId = staff.id;
        break;
      }
    }

    if (!assignedStaffId) {
      return NextResponse.json({error: 'Maaf, slot ini baru saja terisi. Silakan pilih jam lain.'}, {status: 409});
    }
  } else {
    // Customer pilih staff spesifik — validasi ulang staff itu benar-benar kosong
    const {data: conflicts} = await supabase.from('bookings').select('id').eq('staff_id', assignedStaffId).eq('booking_date', booking_date).in('status', ['PENDING', 'APPROVED']).lt('start_time', end_time).gt('end_time', start_time);

    if (conflicts && conflicts.length > 0) {
      return NextResponse.json({error: 'Maaf, slot ini baru saja terisi. Silakan pilih jam lain.'}, {status: 409});
    }
  }

  // 4. Insert booking — unique constraint di DB jadi lapisan terakhir kalau ada race condition
  const {data: booking, error: insertError} = await supabase
    .from('bookings')
    .insert({
      ...customerData,
      service_id,
      staff_id: assignedStaffId,
      booking_date,
      start_time,
      end_time,
      status: 'PENDING',
    })
    .select()
    .single();

  if (insertError) {
    console.error('Insert booking error:', insertError)
    if (insertError.code === '23505') {
      return NextResponse.json(
        { error: 'Maaf, slot ini baru saja terisi. Silakan pilih jam lain.' },
        { status: 409 }
      )
    }
    return NextResponse.json({ error: 'Gagal menyimpan booking' }, { status: 500 })
  }

  return NextResponse.json({booking}, {status: 201});
}
