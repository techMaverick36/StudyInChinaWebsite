-- Patch: staged deletion for applications (trash -> restore / permanent delete).
-- Run once in the dashboard: SQL Editor -> paste -> Run.

-- Trashed applications keep their data but carry a deletion timestamp.
alter table public.applications add column deleted_at timestamptz;

-- Permanent deletion (admin panel, after typed confirmation).
create policy "admins can delete applications"
  on public.applications for delete
  to authenticated
  using (true);

create policy "admins can delete application files"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'application-files');
