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
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>('any');
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

  // Step tracking untuk progress indicator
  const step2Active = !!selectedDate;
  const step3Active = showForm;

  if (submitSuccess) {
    return (
      <div className="max-w-md mx-auto mt-10 p-8 border-2 border-sage bg-bone text-center">
        <p className="font-mono text-xs tracking-[0.3em] uppercase text-sage mb-3">Booking Dikonfirmasi</p>
        <h3 className="font-display text-3xl font-bold text-ink">Sampai Jumpa!</h3>
        <p className="text-ink/60 text-sm mt-3">Kami sudah mengirim detail booking ke email kamu.</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      {/* Progress indicator — barber pole stripe */}
      <div className="flex items-center gap-2 mb-8 max-w-md mx-auto md:max-w-none md:justify-center">
        {[true, step2Active, step3Active].map((active, i) => (
          <div
            key={i}
            className="h-1.5 flex-1 md:w-24 md:flex-none rounded-full transition-colors"
            style={{
              backgroundImage: active ? 'repeating-linear-gradient(135deg, var(--color-barber-red) 0 8px, var(--color-bone) 8px 16px, var(--color-brass) 16px 24px)' : undefined,
              backgroundColor: active ? undefined : 'color-mix(in srgb, var(--color-ink) 10%, transparent)',
            }}
          />
        ))}
      </div>

      {/* Wizard columns — vertical di mobile, horizontal & center di desktop */}
      <div className="flex flex-col md:flex-row md:justify-center gap-8 items-start">
        {/* KOLOM 1: Staff + Kalender */}
        <div className="w-full md:w-80 shrink-0 space-y-6">
          <div>
            <p className="font-mono text-xs tracking-[0.2em] uppercase text-brass mb-2">01 — Staff</p>
            <Select value={selectedStaffId ?? 'any'} onValueChange={setSelectedStaffId}>
              <SelectTrigger className="w-full border-ink/20 rounded-sm">
                <SelectValue>
                  {(value: string | null) => {
                    if (!value || value === 'any') return 'Siapa saja yang tersedia';
                    const staff = staffList.find((s) => s.id === value);
                    return staff?.name ?? value;
                  }}
                </SelectValue>
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

          <div>
            <p className="font-mono text-xs tracking-[0.2em] uppercase text-brass mb-2">02 — Tanggal</p>
            <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))} locale={id} className="rounded-sm border border-ink/20 bg-bone" />
          </div>
        </div>

        {/* KOLOM 2: Slot Waktu — muncul setelah pilih tanggal */}
        {step2Active && (
          <div className="w-full md:w-64 shrink-0">
            <p className="font-mono text-xs tracking-[0.2em] uppercase text-brass mb-2">03 — Jam</p>
            {loading ? (
              <p className="text-sm text-ink/40">Memuat slot tersedia...</p>
            ) : availableSlots.length === 0 ? (
              <p className="text-sm text-ink/40">Tidak ada slot tersedia di tanggal ini.</p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {availableSlots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setSelectedSlot(slot)}
                    className={`font-mono text-sm py-2 rounded-sm border transition-colors ${selectedSlot === slot ? 'bg-ink text-bone border-ink' : 'border-ink/20 text-ink hover:border-brass'}`}>
                    {slot}
                  </button>
                ))}
              </div>
            )}

            {selectedSlot && !showForm && (
              <Button className="w-full mt-6 bg-brass hover:bg-brass/90 text-ink rounded-sm" onClick={() => setShowForm(true)}>
                Lanjut →
              </Button>
            )}
          </div>
        )}

        {/* KOLOM 3: Form Booking — muncul setelah klik lanjut */}
        {step3Active && (
          <div className="w-full md:w-80 shrink-0">
            <p className="font-mono text-xs tracking-[0.2em] uppercase text-brass mb-2">04 — Data Kamu</p>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="customer_name"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel className="text-ink/70">Nama Lengkap</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" className="border-ink/20 rounded-sm" {...field} />
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
                      <FormLabel className="text-ink/70">Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john@email.com" className="border-ink/20 rounded-sm" {...field} />
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
                      <FormLabel className="text-ink/70">Nomor Telepon</FormLabel>
                      <FormControl>
                        <Input placeholder="08123456789" className="border-ink/20 rounded-sm" {...field} />
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
                      <FormLabel className="text-ink/70">Catatan (opsional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Ada permintaan khusus?" className="border-ink/20 rounded-sm" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {submitError && <p className="text-sm text-barber-red">{submitError}</p>}

                <Button type="submit" disabled={submitting} className="w-full bg-ink hover:bg-ink/90 text-bone rounded-sm">
                  {submitting ? 'Memproses...' : 'Konfirmasi Booking'}
                </Button>
              </form>
            </Form>
          </div>
        )}
      </div>
    </div>
  );
}
