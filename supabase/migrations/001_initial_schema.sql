-- ============================================
-- 1. PROFILES (extends auth.users)
-- ============================================
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text,
  phone text,
  role text not null default 'CUSTOMER' check (role in ('ADMIN', 'CUSTOMER')),
  created_at timestamptz not null default now()
);

-- Trigger: otomatis buat row profile saat ada user baru daftar
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- 2. SERVICES
-- ============================================
create table services (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  duration_minutes integer not null,
  price numeric(10,2) not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ============================================
-- 3. STAFF
-- ============================================
create table staff (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  avatar_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ============================================
-- 4. AVAILABILITY (jam kerja staff per hari)
-- ============================================
create table availability (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references staff(id) on delete cascade,
  day_of_week integer not null check (day_of_week between 0 and 6), -- 0=Minggu, 6=Sabtu
  start_time time not null,
  end_time time not null,
  created_at timestamptz not null default now()
);

-- ============================================
-- 5. BOOKINGS
-- ============================================
create table bookings (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  service_id uuid not null references services(id),
  staff_id uuid references staff(id),
  booking_date date not null,
  start_time time not null,
  end_time time not null,
  status text not null default 'PENDING' check (status in ('PENDING', 'APPROVED', 'COMPLETED', 'CANCELLED')),
  notes text,
  created_at timestamptz not null default now(),
  -- cegah double-booking di level database
  constraint unique_staff_slot unique (staff_id, booking_date, start_time)
);