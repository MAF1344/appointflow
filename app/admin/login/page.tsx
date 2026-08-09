'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {createClient} from '@/lib/supabase/client';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();

    const {data, error: signInError} = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError('Email atau password salah.');
      setLoading(false);
      return;
    }

    // Cek role setelah berhasil login
    const {data: profile} = await supabase.from('profiles').select('role').eq('id', data.user.id).single();

    if (profile?.role !== 'ADMIN') {
      setError('Akun ini tidak memiliki akses admin.');
      await supabase.auth.signOut();
      setLoading(false);
      return;
    }

    router.push('/admin/dashboard');
    router.refresh();
  }

  return (
    <main className="max-w-sm mx-auto mt-20 p-6 border rounded-lg">
      <h1 className="text-xl font-bold mb-6">Admin Login</h1>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Email</label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Password</label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Memproses...' : 'Login'}
        </Button>
      </form>
    </main>
  );
}
