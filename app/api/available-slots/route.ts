import {createClient} from '@/lib/supabase/server';
import {NextRequest, NextResponse} from 'next/server';

// Ubah "HH:MM:SS" jadi total menit sejak jam 00:00, biar gampang dihitung
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const serviceId = searchParams.get('serviceId');
  const staffId = searchParams.get('staffId'); // bisa null = "siapa saja"
  const date = searchParams.get('date'); // format: YYYY-MM-DD

  if (!serviceId || !date) {
    return NextResponse.json({error: 'serviceId dan date wajib diisi'}, {status: 400});
  }

  const supabase = await createClient();

  // 1. Ambil durasi layanan
  const {data: service, error: serviceError} = await supabase.from('services').select('duration_minutes').eq('id', serviceId).single();

  if (serviceError || !service) {
    return NextResponse.json({error: 'Layanan tidak ditemukan'}, {status: 404});
  }

  const duration = service.duration_minutes;
  const dayOfWeek = new Date(date + 'T00:00:00').getDay(); // 0-6

  // 2. Tentukan daftar staff yang mau dicek
  let staffIds: string[] = [];
  if (staffId) {
    staffIds = [staffId];
  } else {
    const {data: allStaff} = await supabase.from('staff').select('id').eq('is_active', true);
    staffIds = (allStaff || []).map((s) => s.id);
  }

  // 3. Untuk tiap staff, hitung slot kosongnya, lalu gabungkan
  const allAvailableSlots = new Set<string>();

  for (const currentStaffId of staffIds) {
    // Ambil jam kerja staff ini di hari tsb
    const {data: availability} = await supabase.from('availability').select('start_time, end_time').eq('staff_id', currentStaffId).eq('day_of_week', dayOfWeek);

    if (!availability || availability.length === 0) continue;

    // Ambil booking yang sudah ada untuk staff+tanggal ini
    const {data: existingBookings} = await supabase.from('bookings').select('start_time, end_time').eq('staff_id', currentStaffId).eq('booking_date', date).in('status', ['PENDING', 'APPROVED']); // yang CANCELLED tidak dihitung

    for (const slot of availability) {
      const slotStart = timeToMinutes(slot.start_time);
      const slotEnd = timeToMinutes(slot.end_time);

      // Generate kandidat slot tiap 30 menit
      for (let time = slotStart; time + duration <= slotEnd; time += 30) {
        const candidateStart = time;
        const candidateEnd = time + duration;

        // Cek bentrok dengan booking yang sudah ada
        const isOverlapping = (existingBookings || []).some((booking) => {
          const bookedStart = timeToMinutes(booking.start_time);
          const bookedEnd = timeToMinutes(booking.end_time);
          return candidateStart < bookedEnd && candidateEnd > bookedStart;
        });

        if (!isOverlapping) {
          allAvailableSlots.add(minutesToTime(candidateStart));
        }
      }
    }
  }

  const sortedSlots = Array.from(allAvailableSlots).sort();

  return NextResponse.json({slots: sortedSlots});
}
