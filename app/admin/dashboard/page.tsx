import {createClient} from '@/lib/supabase/server';
import {redirect} from 'next/navigation';
import LogoutButton from './LogoutButton';

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  return (
    <main className="max-w-4xl mx-auto p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-500 mt-2">Selamat datang, {user.email}</p>
        </div>
        <LogoutButton />
      </div>
    </main>
  );
}
