import {createClient} from '@/lib/supabase/server';
import {redirect} from 'next/navigation';
import Link from 'next/link';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import ServicesManager from './ServicesManager';
import StaffAvailabilityManager from './StaffAvailabilityManager';

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  const {data: services} = await supabase.from('services').select('*').order('created_at', {ascending: true});

  const {data: staffList} = await supabase.from('staff').select('*').order('name', {ascending: true});

  const {data: availability} = await supabase.from('availability').select('*');

  return (
    <main className="min-h-screen bg-parchment">
      <div
        className="h-1.5"
        style={{
          backgroundImage: 'repeating-linear-gradient(135deg, var(--color-barber-red) 0 12px, var(--color-bone) 12px 24px, var(--color-brass) 24px 36px)',
        }}
      />

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <p className="font-mono text-xs tracking-[0.3em] uppercase text-brass mb-1">Panel Admin</p>
            <h1 className="font-display text-3xl font-bold text-ink">Pengaturan</h1>
          </div>
          <Link href="/admin/dashboard" className="font-mono text-xs uppercase tracking-wide text-ink/60 hover:text-brass transition-colors">
            ← Dashboard
          </Link>
        </div>

        <Tabs defaultValue="services">
          <TabsList className="bg-bone border border-ink/10 rounded-sm p-1">
            <TabsTrigger value="services" className="font-mono text-xs uppercase tracking-wide rounded-sm data-[state=active]:bg-ink data-[state=active]:text-bone">
              Kelola Layanan
            </TabsTrigger>
            <TabsTrigger value="availability" className="font-mono text-xs uppercase tracking-wide rounded-sm data-[state=active]:bg-ink data-[state=active]:text-bone">
              Jam Kerja Staff
            </TabsTrigger>
          </TabsList>

          <TabsContent value="services">
            <ServicesManager initialServices={services || []} />
          </TabsContent>

          <TabsContent value="availability">
            <StaffAvailabilityManager staffList={staffList || []} initialAvailability={availability || []} />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
