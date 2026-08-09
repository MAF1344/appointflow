import {createClient} from '@/lib/supabase/server';
import {redirect} from 'next/navigation';
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
      id,
      customer_name,
      customer_email,
      customer_phone,
      booking_date,
      start_time,
      end_time,
      status,
      notes,
      services ( title ),
      staff ( name )
    `,
    )
    .order('booking_date', {ascending: false})
    .order('start_time', {ascending: false});

  return (
    <main className="max-w-6xl mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Selamat datang, {user.email}</p>
        </div>
        <LogoutButton />
      </div>

      <BookingTable initialBookings={bookings || []} />
    </main>
  );
}
