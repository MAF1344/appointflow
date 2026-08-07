'use client';

import {useState, useEffect} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {Calendar} from '@/components/ui/calendar';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {format} from 'date-fns';
import {id} from 'date-fns/locale';
import {Service} from '@/types/database';
import {bookingFormSchema, BookingFormValues} from '@/lib/validations/booking';

type Staff = {
  id: string;
  name: string;
};

export default function BookingCalendar({service, staffList}: {service: Service; staffList: Staff[]}) {
  const [selectedStaffId, setSelectedStaffId] = useState<string>('any');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      customer_name: '',
      customer_email: '',
      customer_phone: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (!selectedDate) return;

    async function fetchSlots() {
      setLoading(true);
      setSelectedSlot(null);
      setShowForm(false);

      const dateStr = format(selectedDate!, 'yyyy-MM-dd');
      const staffParam = selectedStaffId === 'any' ? '' : `&staffId=${selectedStaffId}`;

      const res = await fetch(`/api/available-slots?serviceId=${service.id}&date=${dateStr}${staffParam}`);
      const data = await res.json();

      setAvailableSlots(data.slots || []);
      setLoading(false);
    }

    fetchSlots();
  }, [selectedDate, selectedStaffId, service.id]);

  async function onSubmit(values: BookingFormValues) {
    if (!selectedDate || !selectedSlot) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          ...values,
          service_id: service.id,
          staff_id: selectedStaffId === 'any' ? null : selectedStaffId,
          booking_date: format(selectedDate, 'yyyy-MM-dd'),
          start_time: selectedSlot,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data.error || 'Terjadi kesalahan, coba lagi.');
        return;
      }

      setSubmitSuccess(true);
    } catch {
      setSubmitError('Gagal terhubung ke server. Coba lagi.');
    } finally {
      setSubmitting(false);
    }
  }

  if (submitSuccess) {
    return (
      <div className="mt-6 p-6 border rounded-lg bg-green-50 text-green-700">
        <h3 className="font-semibold text-lg">Booking Berhasil!</h3>
        <p className="text-sm mt-1">Kami sudah mengirim konfirmasi ke email kamu. Sampai jumpa!</p>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-6">
      {/* Pilih Staff */}
      <div>
        <label className="text-sm font-medium mb-2 block">Pilih Staff</label>
        <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Siapa saja yang tersedia</SelectItem>
            {staffList.map((staff) => (
              <SelectItem key={staff.id} value={staff.id}>
                {staff.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Pilih Tanggal */}
      <div>
        <label className="text-sm font-medium mb-2 block">Pilih Tanggal</label>
        <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))} locale={id} className="rounded-md border" />
      </div>

      {/* Pilih Slot Waktu */}
      {selectedDate && (
        <div>
          <label className="text-sm font-medium mb-2 block">Pilih Jam</label>
          {loading ? (
            <p className="text-sm text-gray-400">Memuat slot tersedia...</p>
          ) : availableSlots.length === 0 ? (
            <p className="text-sm text-gray-400">Tidak ada slot tersedia di tanggal ini.</p>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {availableSlots.map((slot) => (
                <Button key={slot} variant={selectedSlot === slot ? 'default' : 'outline'} size="sm" onClick={() => setSelectedSlot(slot)}>
                  {slot}
                </Button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tombol Lanjut */}
      {selectedSlot && !showForm && (
        <Button className="w-full" size="lg" onClick={() => setShowForm(true)}>
          Lanjut ke Form Booking — {selectedSlot}
        </Button>
      )}

      {/* Form Booking */}
      {showForm && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 border-t pt-6">
            <h3 className="font-semibold text-lg">Lengkapi Data Kamu</h3>

            <FormField
              control={form.control}
              name="customer_name"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Nama Lengkap</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customer_email"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="john@email.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customer_phone"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Nomor Telepon</FormLabel>
                  <FormControl>
                    <Input placeholder="08123456789" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Catatan (opsional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Ada permintaan khusus?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {submitError && <p className="text-sm text-red-500">{submitError}</p>}

            <Button type="submit" className="w-full" size="lg" disabled={submitting}>
              {submitting ? 'Memproses...' : 'Konfirmasi Booking'}
            </Button>
          </form>
        </Form>
      )}
    </div>
  );
}
