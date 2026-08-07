import {z} from 'zod';

export const bookingFormSchema = z.object({
  customer_name: z.string().min(3, 'Nama minimal 3 karakter'),
  customer_email: z.string().email('Format email tidak valid'),
  customer_phone: z
    .string()
    .min(10, 'Nomor telepon minimal 10 digit')
    .regex(/^[0-9+\s-]+$/, 'Nomor telepon hanya boleh angka'),
  notes: z.string().optional(),
});

export type BookingFormValues = z.infer<typeof bookingFormSchema>;
