'use client';

import {useState, useEffect} from 'react';
import {Calendar} from '@/components/ui/calendar';
import {Button} from '@/components/ui/button';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {format} from 'date-fns';
import {id} from 'date-fns/locale';
import {Service} from '@/types/database';

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

  // Setiap kali staff atau tanggal berubah, fetch ulang slot tersedia
  useEffect(() => {
    if (!selectedDate) return;

    async function fetchSlots() {
      setLoading(true);
      setSelectedSlot(null);

      const dateStr = format(selectedDate!, 'yyyy-MM-dd');
      const staffParam = selectedStaffId === 'any' ? '' : `&staffId=${selectedStaffId}`;

      const res = await fetch(`/api/available-slots?serviceId=${service.id}&date=${dateStr}${staffParam}`);
      const data = await res.json();

      setAvailableSlots(data.slots || []);
      setLoading(false);
    }

    fetchSlots();
  }, [selectedDate, selectedStaffId, service.id]);

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

      {/* Tombol Lanjut (form booking, dibuat di task berikutnya) */}
      {selectedSlot && (
        <Button className="w-full" size="lg">
          Lanjut ke Form Booking — {selectedSlot}
        </Button>
      )}
    </div>
  );
}
