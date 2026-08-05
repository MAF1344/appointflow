import {createClient} from '@/lib/supabase/server';
import {Service} from '@/types/database';

export default async function ServicesPage() {
  const supabase = await createClient();

  const {data: services, error} = await supabase.from('services').select('*').eq('is_active', true).order('created_at', {ascending: true});

  if (error) {
    return <p className="p-8 text-red-500">Gagal memuat layanan: {error.message}</p>;
  }

  return (
    <main className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Pilih Layanan</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        {(services as Service[]).map((service) => (
          <div key={service.id} className="border rounded-lg p-5 hover:shadow-md transition-shadow">
            <h2 className="text-xl font-semibold">{service.title}</h2>
            <p className="text-gray-500 text-sm mt-1">{service.description}</p>
            <div className="flex justify-between items-center mt-4">
              <span className="text-sm text-gray-400">{service.duration_minutes} menit</span>
              <span className="font-bold text-lg">Rp {service.price.toLocaleString('id-ID')}</span>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
