export type Service = {
  id: string;
  title: string;
  description: string | null;
  duration_minutes: number;
  price: number;
  is_active: boolean;
  created_at: string;
};

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
  services: {title: string}[] | null;
  staff: {name: string}[] | null;
};

export type Staff = {
  id: string;
  name: string;
  avatar_url: string | null;
  is_active: boolean;
};

export type Availability = {
  id: string;
  staff_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
};
