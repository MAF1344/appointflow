import {createClient} from '@/lib/supabase/server';
import {notFound} from 'next/navigation';
import BookingCalendar from './BookingCalendar';

export default async function BookingPage({params}: {params: Promise<{serviceId: string}>}) {
  const {serviceId} = await params;
  const supabase = await createClient();

  const {data: service} = await supabase.from('services').select('*').eq('id', serviceId).eq('is_active', true).single();

  if (!service) {
    notFound();
  }

  const {data: staffList} = await supabase.from('staff').select('*').eq('is_active', true);

  return (
    <main className="min-h-screen bg-parchment px-6 py-12">
      <div className="max-w-4xl mx-auto text-center">
        <p className="font-mono text-xs tracking-[0.3em] uppercase text-brass mb-2">Booking</p>
        <h1 className="font-display text-4xl font-bold text-ink">{service.title}</h1>
        <p className="text-ink/60 mt-2">
          {service.duration_minutes} menit — Rp {service.price.toLocaleString('id-ID')}
        </p>
      </div>

      <BookingCalendar service={service} staffList={staffList || []} />
    </main>
  );
}
