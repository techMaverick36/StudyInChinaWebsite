-- StudyInChinaNow — Supabase setup.
-- Run this once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.

-- ============ Applications ============
create table public.applications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  scholarship_id text not null,
  scholarship_title text not null,
  level text not null,
  form jsonb not null,
  uploads jsonb not null default '{}'::jsonb,
  status text not null default 'New',
  deleted_at timestamptz
);

alter table public.applications enable row level security;

-- The public form may submit applications, but never read or change them.
-- ('authenticated' is included so a signed-in admin testing the form in the
-- same browser is not blocked.)
create policy "public can submit applications"
  on public.applications for insert
  to anon, authenticated
  with check (true);

-- Signed-in admins can read and update.
create policy "admins can read applications"
  on public.applications for select
  to authenticated
  using (true);

create policy "admins can update applications"
  on public.applications for update
  to authenticated
  using (true);

create policy "admins can delete applications"
  on public.applications for delete
  to authenticated
  using (true);

-- ============ Contact messages ============
create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  contact text not null,
  message text not null,
  handled boolean not null default false
);

alter table public.contact_messages enable row level security;

create policy "public can send messages"
  on public.contact_messages for insert
  to anon, authenticated
  with check (true);

create policy "admins can read messages"
  on public.contact_messages for select
  to authenticated
  using (true);

create policy "admins can update messages"
  on public.contact_messages for update
  to authenticated
  using (true);

-- ============ Uploaded documents ============
-- Private bucket: applicants can upload, only signed-in admins can read.
insert into storage.buckets (id, name, public)
values ('application-files', 'application-files', false);

create policy "public can upload application files"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'application-files');

create policy "admins can read application files"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'application-files');

create policy "admins can delete application files"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'application-files');
