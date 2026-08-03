-- Patch: submissions failed with "new row violates row-level security policy"
-- when the browser also had an admin session. Uploads then run as the
-- 'authenticated' role, which had no insert rights (only 'anon' did).
-- Run once in the dashboard: SQL Editor -> paste -> Run.

create policy "signed-in can submit applications"
  on public.applications for insert
  to authenticated
  with check (true);

create policy "signed-in can send messages"
  on public.contact_messages for insert
  to authenticated
  with check (true);

create policy "signed-in can upload application files"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'application-files');
