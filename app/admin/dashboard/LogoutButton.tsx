'use client';

import {useRouter} from 'next/navigation';
import {createClient} from '@/lib/supabase/client';
import {Button} from '@/components/ui/button';

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <Button variant="outline" onClick={handleLogout} className="border-ink/20 text-ink hover:bg-ink hover:text-bone rounded-sm">
      Logout
    </Button>
  );
}
