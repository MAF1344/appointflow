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
    <main className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold">{service.title}</h1>
      <p className="text-gray-500 mt-1">
        {service.duration_minutes} menit — Rp {service.price.toLocaleString('id-ID')}
      </p>

      <BookingCalendar service={service} staffList={staffList || []} />
    </main>
  );
}
