'use client';

import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Switch} from '@/components/ui/switch';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Staff, Availability} from '@/types/database';

const DAYS = [
  {value: 1, label: 'Senin'},
  {value: 2, label: 'Selasa'},
  {value: 3, label: 'Rabu'},
  {value: 4, label: 'Kamis'},
  {value: 5, label: 'Jumat'},
  {value: 6, label: 'Sabtu'},
  {value: 0, label: 'Minggu'},
];

type DaySchedule = {
  enabled: boolean;
  start_time: string;
  end_time: string;
};

export default function StaffAvailabilityManager({staffList, initialAvailability}: {staffList: Staff[]; initialAvailability: Availability[]}) {
  const [selectedStaffId, setSelectedStaffId] = useState<string>(staffList[0]?.id ?? '');

  function handleStaffChange(value: string | null) {
    if (value) setSelectedStaffId(value);
  }

  const [saving, setSaving] = useState(false);

  // Bangun jadwal awal per staff dari data availability yang ada
  function buildScheduleFor(staffId: string): Record<number, DaySchedule> {
    const schedule: Record<number, DaySchedule> = {};
    for (const day of DAYS) {
      const existing = initialAvailability.find((a) => a.staff_id === staffId && a.day_of_week === day.value);
      schedule[day.value] = existing
        ? {
            enabled: true,
            start_time: existing.start_time.slice(0, 5),
            end_time: existing.end_time.slice(0, 5),
          }
        : {enabled: false, start_time: '09:00', end_time: '17:00'};
    }
    return schedule;
  }

  const [schedules, setSchedules] = useState<Record<string, Record<number, DaySchedule>>>(() => {
    const initial: Record<string, Record<number, DaySchedule>> = {};
    for (const staff of staffList) {
      initial[staff.id] = buildScheduleFor(staff.id);
    }
    return initial;
  });

  const currentSchedule = schedules[selectedStaffId] || {};

  function updateDay(day: number, patch: Partial<DaySchedule>) {
    setSchedules((prev) => ({
      ...prev,
      [selectedStaffId]: {
        ...prev[selectedStaffId],
        [day]: {...prev[selectedStaffId][day], ...patch},
      },
    }));
  }

  async function handleSave() {
    setSaving(true);

    const payload = Object.entries(currentSchedule)
      .filter(([, s]) => s.enabled)
      .map(([day, s]) => ({
        day_of_week: Number(day),
        start_time: s.start_time,
        end_time: s.end_time,
      }));

    const res = await fetch(`/api/staff/${selectedStaffId}/availability`, {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      alert('Jadwal berhasil disimpan.');
    } else {
      alert('Gagal menyimpan jadwal.');
    }

    setSaving(false);
  }

  if (staffList.length === 0) {
    return <p className="text-gray-400 mt-4">Belum ada staff terdaftar.</p>;
  }

  return (
    <div className="mt-6 space-y-6">
      <div>
        <label className="font-mono text-xs uppercase tracking-wide text-ink/50 mb-2 block">Pilih Staff</label>
        <Select value={selectedStaffId} onValueChange={handleStaffChange}>
          <SelectTrigger className="w-64 border-ink/20 rounded-sm bg-bone">
            <SelectValue>{(value: string) => staffList.find((s) => s.id === value)?.name ?? 'Pilih staff'}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {staffList.map((staff) => (
              <SelectItem key={staff.id} value={staff.id}>
                {staff.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        {DAYS.map((day) => {
          const daySchedule = currentSchedule[day.value] || {
            enabled: false,
            start_time: '09:00',
            end_time: '17:00',
          };

          return (
            <div key={day.value} className="flex items-center gap-4 border border-ink/10 bg-bone rounded-sm p-3">
              <Switch checked={daySchedule.enabled} onCheckedChange={(checked) => updateDay(day.value, {enabled: checked})} />
              <span className="w-20 font-mono text-xs uppercase tracking-wide text-ink/70">{day.label}</span>

              {daySchedule.enabled ? (
                <div className="flex items-center gap-2">
                  <Input type="time" value={daySchedule.start_time} onChange={(e) => updateDay(day.value, {start_time: e.target.value})} className="w-32 border-ink/20 rounded-sm font-mono text-sm" />
                  <span className="text-ink/30">—</span>
                  <Input type="time" value={daySchedule.end_time} onChange={(e) => updateDay(day.value, {end_time: e.target.value})} className="w-32 border-ink/20 rounded-sm font-mono text-sm" />
                </div>
              ) : (
                <span className="font-mono text-xs text-ink/30">Libur</span>
              )}
            </div>
          );
        })}
      </div>

      <Button onClick={handleSave} disabled={saving} className="bg-brass hover:bg-brass/90 text-ink rounded-sm">
        {saving ? 'Menyimpan...' : 'Simpan Jadwal'}
      </Button>
    </div>
  );
}
