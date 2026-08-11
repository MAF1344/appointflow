import {createClient} from '@/lib/supabase/server';
import {redirect} from 'next/navigation';
import Link from 'next/link';
import LogoutButton from './LogoutButton';
import BookingTable from './BookingTable';

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  const {data: bookings} = await supabase
    .from('bookings')
    .select(
      `
      id, customer_name, customer_email, customer_phone,
      booking_date, start_time, end_time, status, notes,
      services ( title ), staff ( name )
    `,
    )
    .order('booking_date', {ascending: false})
    .order('start_time', {ascending: false});

  return (
    <main className="min-h-screen bg-parchment">
      <div
        className="h-1.5"
        style={{
          backgroundImage: 'repeating-linear-gradient(135deg, var(--color-barber-red) 0 12px, var(--color-bone) 12px 24px, var(--color-brass) 24px 36px)',
        }}
      />

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <p className="font-mono text-xs tracking-[0.3em] uppercase text-brass mb-1">Panel Admin</p>
            <h1 className="font-display text-3xl font-bold text-ink">Dashboard</h1>
            <p className="text-ink/50 text-sm mt-1">{user.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin/settings" className="font-mono text-xs uppercase tracking-wide text-ink/60 hover:text-brass transition-colors">
              Pengaturan
            </Link>
            <LogoutButton />
          </div>
        </div>

        <BookingTable initialBookings={bookings || []} />
      </div>
    </main>
  );
}
