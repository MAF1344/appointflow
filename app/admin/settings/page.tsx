import {createClient} from '@/lib/supabase/server';
import {redirect} from 'next/navigation';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import ServicesManager from './ServiceManager';
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
    <main className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Pengaturan</h1>

      <Tabs defaultValue="services">
        <TabsList>
          <TabsTrigger value="services">Kelola Layanan</TabsTrigger>
          <TabsTrigger value="availability">Jam Kerja Staff</TabsTrigger>
        </TabsList>

        <TabsContent value="services">
          <ServicesManager initialServices={services || []} />
        </TabsContent>

        <TabsContent value="availability">
          <StaffAvailabilityManager staffList={staffList || []} initialAvailability={availability || []} />
        </TabsContent>
      </Tabs>
    </main>
  );
}
