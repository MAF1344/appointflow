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
    <main className="min-h-screen bg-ink flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Barber pole stripe di atas card */}
        <div
          className="h-1.5 mb-8 rounded-full"
          style={{
            backgroundImage: 'repeating-linear-gradient(135deg, var(--color-barber-red) 0 10px, var(--color-bone) 10px 20px, var(--color-brass) 20px 30px)',
          }}
        />

        <p className="font-mono text-xs tracking-[0.3em] uppercase text-brass text-center mb-2">Area Terbatas</p>
        <h1 className="font-display text-3xl font-bold text-bone text-center mb-8">Admin Login</h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="font-mono text-xs uppercase tracking-wide text-bone/60 mb-1.5 block">Email</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-bone/5 border-bone/20 text-bone rounded-sm placeholder:text-bone/30" />
          </div>

          <div>
            <label className="font-mono text-xs uppercase tracking-wide text-bone/60 mb-1.5 block">Password</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="bg-bone/5 border-bone/20 text-bone rounded-sm placeholder:text-bone/30" />
          </div>

          {error && <p className="text-sm text-barber-red">{error}</p>}

          <Button type="submit" disabled={loading} className="w-full bg-brass hover:bg-brass/90 text-ink rounded-sm mt-2">
            {loading ? 'Memproses...' : 'Masuk'}
          </Button>
        </form>
      </div>
    </main>
  );
}
