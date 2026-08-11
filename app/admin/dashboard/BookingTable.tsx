'use client';

import {useState} from 'react';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {BookingWithRelations, BookingStatus} from '@/types/database';
import {format, parseISO} from 'date-fns';
import {id as localeId} from 'date-fns/locale';

const statusOptions: BookingStatus[] = ['PENDING', 'APPROVED', 'COMPLETED', 'CANCELLED'];

const statusStyles: Record<BookingStatus, string> = {
  PENDING: 'bg-brass/15 text-brass border-brass/30',
  APPROVED: 'bg-sage/15 text-sage border-sage/30',
  COMPLETED: 'bg-ink/10 text-ink border-ink/20',
  CANCELLED: 'bg-barber-red/10 text-barber-red border-barber-red/30',
};

export default function BookingTable({initialBookings}: {initialBookings: BookingWithRelations[]}) {
  const [bookings, setBookings] = useState(initialBookings);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filteredBookings = filterStatus === 'ALL' ? bookings : bookings.filter((b) => b.status === filterStatus);

  async function handleStatusChange(bookingId: string, newStatus: BookingStatus) {
    setUpdatingId(bookingId);

    const res = await fetch(`/api/bookings/${bookingId}/status`, {
      method: 'PATCH',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({status: newStatus}),
    });

    if (res.ok) {
      setBookings((prev) => prev.map((b) => (b.id === bookingId ? {...b, status: newStatus} : b)));
    } else {
      alert('Gagal mengubah status. Coba lagi.');
    }

    setUpdatingId(null);
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <span className="font-mono text-xs uppercase tracking-wide text-ink/50">Filter</span>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48 border-ink/20 rounded-sm">
            <SelectValue>{(value: string) => (value === 'ALL' ? 'Semua Status' : value)}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Semua Status</SelectItem>
            {statusOptions.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="font-mono text-xs text-ink/40">{filteredBookings.length} booking</span>
      </div>

      <div className="border border-ink/10 rounded-sm overflow-hidden bg-bone">
        <Table>
          <TableHeader>
            <TableRow className="border-ink/10 hover:bg-transparent">
              <TableHead className="font-mono text-xs uppercase tracking-wide text-ink/50">Customer</TableHead>
              <TableHead className="font-mono text-xs uppercase tracking-wide text-ink/50">Layanan</TableHead>
              <TableHead className="font-mono text-xs uppercase tracking-wide text-ink/50">Staff</TableHead>
              <TableHead className="font-mono text-xs uppercase tracking-wide text-ink/50">Tanggal</TableHead>
              <TableHead className="font-mono text-xs uppercase tracking-wide text-ink/50">Jam</TableHead>
              <TableHead className="font-mono text-xs uppercase tracking-wide text-ink/50">Status</TableHead>
              <TableHead className="font-mono text-xs uppercase tracking-wide text-ink/50">Ubah</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-ink/40 py-10">
                  Tidak ada booking dengan status ini.
                </TableCell>
              </TableRow>
            ) : (
              filteredBookings.map((booking) => (
                <TableRow key={booking.id} className="border-ink/10">
                  <TableCell>
                    <div className="font-medium text-ink">{booking.customer_name}</div>
                    <div className="text-xs text-ink/40">{booking.customer_email}</div>
                  </TableCell>
                  <TableCell className="text-ink/80">{booking.services?.title ?? '-'}</TableCell>
                  <TableCell className="text-ink/80">{booking.staff?.name ?? '-'}</TableCell>
                  <TableCell className="font-mono text-sm text-ink/80">
                    {format(parseISO(booking.booking_date), 'd MMM yyyy', {
                      locale: localeId,
                    })}
                  </TableCell>
                  <TableCell className="font-mono text-sm text-ink/80">
                    {booking.start_time.slice(0, 5)} - {booking.end_time.slice(0, 5)}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-block px-2.5 py-1 text-xs font-mono uppercase tracking-wide border rounded-sm ${statusStyles[booking.status]}`}>{booking.status}</span>
                  </TableCell>
                  <TableCell>
                    <Select value={booking.status} onValueChange={(value) => handleStatusChange(booking.id, value as BookingStatus)} disabled={updatingId === booking.id}>
                      <SelectTrigger className="w-40 border-ink/20 rounded-sm">
                        <SelectValue>{(value: string) => value}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
