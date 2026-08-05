-- ============================================
-- SEED: Services
-- ============================================
insert into services (title, description, duration_minutes, price, is_active) values
  ('Haircut & Styling', 'Potong rambut profesional dengan konsultasi gaya', 45, 75000, true),
  ('Beard Trim', 'Rapikan janggut dan kumis dengan pisau cukur', 20, 35000, true),
  ('Hair Coloring', 'Pewarnaan rambut dengan produk berkualitas', 90, 250000, true);

-- ============================================
-- SEED: Staff
-- ============================================
insert into staff (name, avatar_url, is_active) values
  ('Budi Santoso', null, true),
  ('Andi Wijaya', null, true);

-- ============================================
-- SEED: Availability
-- Senin-Jumat (1-5), jam 09:00-17:00 untuk kedua staff
-- ============================================
insert into availability (staff_id, day_of_week, start_time, end_time)
select id, day, '09:00', '17:00'
from staff, generate_series(1, 5) as day
where staff.name in ('Budi Santoso', 'Andi Wijaya');