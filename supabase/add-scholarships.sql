-- StudyInChinaNow — adds the `scholarships` table to an existing project.
--
-- Run this once in the Supabase dashboard: SQL Editor -> New query -> paste ->
-- Run. It is the scholarships half of setup.sql on its own, so a project that
-- already has the applications and contact_messages tables can be brought up to
-- date without touching them. Safe to run more than once.
--
-- After it runs: sign in at /admin, open the Scholarships tab, and use
-- "Copy the built-in programmes in" to load the eight programmes that ship with
-- the site. Until at least one published programme exists, the public pages
-- keep showing those built-in ones.

-- ============ Scholarships ============
-- The programmes shown on the public site. Editable from /admin, so the office
-- can add or change a scholarship without a developer.
create table if not exists public.scholarships (
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

create index if not exists scholarships_order_idx
  on public.scholarships (sort_order, created_at);

alter table public.scholarships enable row level security;

-- Postgres has no "create policy if not exists", so each policy is dropped
-- first. That makes the whole script safe to run again.

-- Visitors read the published programmes only.
drop policy if exists "public can read published scholarships" on public.scholarships;
create policy "public can read published scholarships"
  on public.scholarships for select
  to anon, authenticated
  using (published);

-- Signed-in admins see drafts too, and can create, edit and delete.
drop policy if exists "admins can read all scholarships" on public.scholarships;
create policy "admins can read all scholarships"
  on public.scholarships for select
  to authenticated
  using (true);

drop policy if exists "admins can insert scholarships" on public.scholarships;
create policy "admins can insert scholarships"
  on public.scholarships for insert
  to authenticated
  with check (true);

drop policy if exists "admins can update scholarships" on public.scholarships;
create policy "admins can update scholarships"
  on public.scholarships for update
  to authenticated
  using (true);

drop policy if exists "admins can delete scholarships" on public.scholarships;
create policy "admins can delete scholarships"
  on public.scholarships for delete
  to authenticated
  using (true);

-- Keeps updated_at honest without the app having to remember to set it.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists scholarships_touch_updated_at on public.scholarships;
create trigger scholarships_touch_updated_at
  before update on public.scholarships
  for each row execute function public.touch_updated_at();
