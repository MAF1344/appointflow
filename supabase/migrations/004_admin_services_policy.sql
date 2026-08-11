create policy "Admins can view all services"
  on services for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'ADMIN'
    )
  );