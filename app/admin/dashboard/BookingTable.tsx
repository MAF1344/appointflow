'use client';

import {useState} from 'react';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {Badge} from '@/components/ui/badge';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {BookingWithRelations, BookingStatus} from '@/types/database';
import {format, parseISO} from 'date-fns';
import {id as localeId} from 'date-fns/locale';

const statusOptions: BookingStatus[] = ['PENDING', 'APPROVED', 'COMPLETED', 'CANCELLED'];

const statusColors: Record<BookingStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
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
      {/* Filter Status */}
      <div className="mb-4 flex items-center gap-2">
        <span className="text-sm font-medium">Filter Status:</span>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
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
        <span className="text-sm text-gray-400 ml-2">{filteredBookings.length} booking</span>
      </div>

      {/* Tabel */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Layanan</TableHead>
              <TableHead>Staff</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Jam</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ubah Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-400 py-8">
                  Tidak ada booking dengan status ini.
                </TableCell>
              </TableRow>
            ) : (
              filteredBookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>
                    <div className="font-medium">{booking.customer_name}</div>
                    <div className="text-xs text-gray-400">{booking.customer_email}</div>
                  </TableCell>
                  <TableCell>{booking.services?.title ?? '-'}</TableCell>
                  <TableCell>{booking.staff?.name ?? '-'}</TableCell>
                  <TableCell>
                    {format(parseISO(booking.booking_date), 'd MMM yyyy', {
                      locale: localeId,
                    })}
                  </TableCell>
                  <TableCell>
                    {booking.start_time.slice(0, 5)} - {booking.end_time.slice(0, 5)}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[booking.status]}>{booking.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Select value={booking.status} onValueChange={(value) => handleStatusChange(booking.id, value as BookingStatus)} disabled={updatingId === booking.id}>
                      <SelectTrigger className="w-40">
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
