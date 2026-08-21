-- StudyInChinaNow — Supabase setup.
-- Run this once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
--
-- This is for a NEW project. If the project already has the applications and
-- contact_messages tables and only needs the scholarships table added, run
-- add-scholarships.sql instead — this file would fail on the tables that
-- already exist.

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

-- ============ Scholarships ============
-- The programmes shown on the public site. Editable from /admin, so the office
-- can add or change a scholarship without a developer. If this table is empty
-- (or unreachable) the site falls back to the programmes bundled in the code,
-- so the scholarships page is never blank.
create table public.scholarships (
  -- Text id, because it is the URL slug: /scholarships/<id>.
  id text primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Display order on the site. The home page shows the first three.
  sort_order integer not null default 0,
  -- Drafts stay out of the public site until this is switched on.
  published boolean not null default true,
  title text not null,
  short_title text,
  levels text not null default '',
  level_keys text[] not null default '{}',
  location text not null default '',
  status text not null default 'Open',
  closing_label text not null default '',
  closing_kv text not null default '',
  csca_required boolean not null default false,
  majors text[] not null default '{}',
  -- { tuition, accommodation, taughtIn, openTo, extraAward }
  compare jsonb not null default '{}'::jsonb,
  blurb text not null default '',
  about1 text not null default '',
  about2 text not null default '',
  -- [{ label, value }, ...]
  facts jsonb not null default '[]'::jsonb,
  eligibility text[] not null default '{}',
  funding text not null default '',
  timeline text not null default '',
  fees text not null default ''
);

create index scholarships_order_idx on public.scholarships (sort_order, created_at);

alter table public.scholarships enable row level security;

-- Visitors read the published programmes only.
create policy "public can read published scholarships"
  on public.scholarships for select
  to anon, authenticated
  using (published);

-- Signed-in admins see drafts too, and can create, edit and delete.
create policy "admins can read all scholarships"
  on public.scholarships for select
  to authenticated
  using (true);

create policy "admins can insert scholarships"
  on public.scholarships for insert
  to authenticated
  with check (true);

create policy "admins can update scholarships"
  on public.scholarships for update
  to authenticated
  using (true);

create policy "admins can delete scholarships"
  on public.scholarships for delete
  to authenticated
  using (true);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger scholarships_touch_updated_at
  before update on public.scholarships
  for each row execute function public.touch_updated_at();

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
