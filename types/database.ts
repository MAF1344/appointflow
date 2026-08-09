export type BookingStatus = 'PENDING' | 'APPROVED' | 'COMPLETED' | 'CANCELLED';

export type BookingWithRelations = {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  notes: string | null;
  services: {title: string} | null;
  staff: {name: string} | null;
};
