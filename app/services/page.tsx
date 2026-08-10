import {createClient} from '@/lib/supabase/server';
import {Service} from '@/types/database';
import Link from 'next/link';

export default async function ServicesPage() {
  const supabase = await createClient();

  const {data: services, error} = await supabase.from('services').select('*').eq('is_active', true).order('created_at', {ascending: true});

  if (error) {
    return <p className="p-8 text-barber-red">Gagal memuat layanan: {error.message}</p>;
  }

  return (
    <main className="min-h-screen bg-parchment">
      {/* Header dengan aksen garis barber pole */}
      <div className="relative border-b-4 border-ink overflow-hidden">
        <div
          className="absolute inset-x-0 top-0 h-1.5"
          style={{
            backgroundImage: 'repeating-linear-gradient(135deg, var(--color-barber-red) 0 12px, var(--color-bone) 12px 24px, var(--color-brass) 24px 36px)',
          }}
        />
        <div className="max-w-4xl mx-auto px-6 pt-12 pb-10">
          <p className="font-mono text-xs tracking-[0.3em] uppercase text-brass mb-3">Est. Layanan Terpercaya</p>
          <h1 className="font-display text-5xl font-bold text-ink leading-tight">Pilih Layanan Kamu</h1>
          <p className="text-ink/60 mt-3 max-w-md">Dari potong rapi sampai warna baru — semua dikerjakan staff berpengalaman.</p>
        </div>
      </div>

      {/* Daftar layanan */}
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="grid gap-5 sm:grid-cols-2">
          {(services as Service[]).map((service, idx) => (
            <Link href={`/booking/${service.id}`} key={service.id} className="group relative bg-bone border border-ink/10 rounded-sm p-6 hover:border-brass transition-colors">
              <span className="font-mono text-xs text-brass">{String(idx + 1).padStart(2, '0')}</span>
              <h2 className="font-display text-2xl font-semibold text-ink mt-2">{service.title}</h2>
              <p className="text-ink/60 text-sm mt-2 leading-relaxed">{service.description}</p>

              <div className="flex justify-between items-end mt-6 pt-4 border-t border-ink/10">
                <span className="font-mono text-xs text-ink/50">{service.duration_minutes} menit</span>
                <span className="font-display font-bold text-lg text-ink group-hover:text-brass transition-colors">Rp {service.price.toLocaleString('id-ID')}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
