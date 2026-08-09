'use client';

import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Switch} from '@/components/ui/switch';
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from '@/components/ui/dialog';
import {Service} from '@/types/database';

export default function ServicesManager({initialServices}: {initialServices: Service[]}) {
  const [services, setServices] = useState(initialServices);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [price, setPrice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function openAddDialog() {
    setEditingService(null);
    setTitle('');
    setDescription('');
    setDuration('');
    setPrice('');
    setDialogOpen(true);
  }

  function openEditDialog(service: Service) {
    setEditingService(service);
    setTitle(service.title);
    setDescription(service.description || '');
    setDuration(String(service.duration_minutes));
    setPrice(String(service.price));
    setDialogOpen(true);
  }

  async function handleSubmit() {
    setSubmitting(true);

    const payload = {
      title,
      description,
      duration_minutes: Number(duration),
      price: Number(price),
    };

    const res = editingService
      ? await fetch(`/api/services/${editingService.id}`, {
          method: 'PATCH',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(payload),
        })
      : await fetch('/api/services', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(payload),
        });

    if (res.ok) {
      const data = await res.json();
      if (editingService) {
        setServices((prev) => prev.map((s) => (s.id === editingService.id ? data.service : s)));
      } else {
        setServices((prev) => [...prev, data.service]);
      }
      setDialogOpen(false);
    } else {
      alert('Gagal menyimpan layanan.');
    }

    setSubmitting(false);
  }

  async function toggleActive(service: Service) {
    const res = await fetch(`/api/services/${service.id}`, {
      method: 'PATCH',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({is_active: !service.is_active}),
    });

    if (res.ok) {
      const data = await res.json();
      setServices((prev) => prev.map((s) => (s.id === service.id ? data.service : s)));
    }
  }

  return (
    <div className="mt-4">
      <div className="flex justify-end mb-4">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog}>+ Tambah Layanan</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingService ? 'Edit Layanan' : 'Tambah Layanan'}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Nama Layanan</label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Deskripsi</label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">Durasi (menit)</label>
                  <Input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Harga (Rp)</label>
                  <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
                </div>
              </div>

              <Button onClick={handleSubmit} disabled={submitting} className="w-full">
                {submitting ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {services.map((service) => (
          <div key={service.id} className="flex items-center justify-between border rounded-lg p-4">
            <div>
              <p className="font-medium">{service.title}</p>
              <p className="text-sm text-gray-500">
                {service.duration_minutes} menit — Rp {service.price.toLocaleString('id-ID')}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={service.is_active} onCheckedChange={() => toggleActive(service)} />
              <Button variant="outline" size="sm" onClick={() => openEditDialog(service)}>
                Edit
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
