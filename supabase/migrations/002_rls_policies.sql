-- ============================================
-- Aktifkan RLS di semua tabel
-- ============================================
alter table profiles enable row level security;
alter table services enable row level security;
alter table staff enable row level security;
alter table availability enable row level security;
alter table bookings enable row level security;

-- ============================================
-- PROFILES: user hanya bisa lihat/edit profile sendiri
-- ============================================
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- ============================================
-- SERVICES: semua orang (termasuk yang belum login) boleh baca
-- ============================================
create policy "Anyone can view active services"
  on services for select
  using (is_active = true);

-- ============================================
-- STAFF: semua orang boleh baca staff aktif
-- ============================================
create policy "Anyone can view active staff"
  on staff for select
  using (is_active = true);

-- ============================================
-- AVAILABILITY: semua orang boleh baca (butuh ini buat hitung slot kosong)
-- ============================================
create policy "Anyone can view availability"
  on availability for select
  using (true);

-- ============================================
-- BOOKINGS: siapapun boleh membuat booking (customer belum tentu login)
-- ============================================
create policy "Anyone can create a booking"
  on bookings for insert
  with check (true);

-- Tapi untuk MELIHAT booking, hanya admin yang boleh (dashboard)
create policy "Only admins can view bookings"
  on bookings for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'ADMIN'
    )
  );