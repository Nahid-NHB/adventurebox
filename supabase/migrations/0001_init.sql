-- AdventureBox cloud schema (Postgres / Supabase).
-- Mirrors the local SQLite model. Every family-owned table is protected by RLS
-- keyed on families.owner_user_id = auth.uid(). Curated activities are world
-- readable; AI/user activities are family-scoped.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists families (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users (id) on delete cascade,
  subscription_status text not null default 'free',
  subscription_tier text not null default 'free',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_families_owner on families (owner_user_id);

create table if not exists children (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families (id) on delete cascade,
  name text not null,
  age int not null check (age between 2 and 14),
  avatar_key text,
  interests jsonb not null default '[]',
  favorite_colors jsonb not null default '[]',
  learning_goals jsonb not null default '[]',
  energy_default text not null default 'medium',
  updated_at timestamptz not null default now()
);
create index if not exists idx_children_family on children (family_id);

create table if not exists family_settings (
  family_id uuid primary key references families (id) on delete cascade,
  materials jsonb not null default '[]',
  environment text not null default 'apartment',
  default_time_minutes int not null default 20,
  indoor_outdoor_pref text not null default 'either',
  notify_hour int not null default 9,
  updated_at timestamptz not null default now()
);

-- Activities: curated rows have family_id NULL and are public; ai/user rows are
-- owned by a family.
create table if not exists activities (
  id text primary key,
  family_id uuid references families (id) on delete cascade,
  source text not null check (source in ('curated','ai')),
  status text not null default 'approved' check (status in ('draft','approved','rejected')),
  premium_pack text,
  title text not null,
  story_intro text not null,
  mission text not null,
  objective text not null,
  steps jsonb not null,
  safety_tips jsonb not null default '[]',
  learning_explanation text not null,
  reflection_questions jsonb not null,
  parent_tip text,
  category text not null,
  skills jsonb not null,
  min_age int not null,
  max_age int not null,
  min_time int not null,
  max_time int not null,
  materials_required jsonb not null default '[]',
  indoor_outdoor text not null,
  weather_tags jsonb not null,
  energy_level text not null,
  difficulty text not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_activities_family on activities (family_id);
create index if not exists idx_activities_moderation on activities (status) where source = 'ai';

create table if not exists assignments (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families (id) on delete cascade,
  child_id uuid not null references children (id) on delete cascade,
  activity_id text not null,
  date date not null,
  status text not null check (status in ('suggested','started','completed','skipped')),
  started_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz not null default now()
);
create index if not exists idx_assignments_family on assignments (family_id, date);

create table if not exists streaks (
  family_id uuid primary key references families (id) on delete cascade,
  current_streak int not null default 0,
  longest_streak int not null default 0,
  last_completed_date date,
  explorer_level int not null default 1,
  xp int not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists favorites (
  family_id uuid not null references families (id) on delete cascade,
  activity_id text not null,
  created_at timestamptz not null default now(),
  primary key (family_id, activity_id)
);

create table if not exists journal_entries (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families (id) on delete cascade,
  assignment_id uuid,
  child_id uuid not null references children (id) on delete cascade,
  activity_id text not null,
  before_photo_key text,
  after_photo_key text,
  child_comment text,
  learning_note text,
  created_at timestamptz not null default now()
);
create index if not exists idx_journal_family on journal_entries (family_id, created_at desc);

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

do $$
declare t text;
begin
  foreach t in array array['families','children','family_settings','assignments','streaks','journal_entries']
  loop
    execute format('drop trigger if exists trg_updated_at on %I;', t);
    execute format('create trigger trg_updated_at before update on %I for each row execute function set_updated_at();', t);
  end loop;
end $$;

-- Auto-provision a family + settings + streak when a user signs up.
create or replace function handle_new_user() returns trigger as $$
declare fam_id uuid;
begin
  insert into families (owner_user_id) values (new.id) returning id into fam_id;
  insert into family_settings (family_id) values (fam_id);
  insert into streaks (family_id) values (fam_id);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table families enable row level security;
alter table children enable row level security;
alter table family_settings enable row level security;
alter table activities enable row level security;
alter table assignments enable row level security;
alter table streaks enable row level security;
alter table favorites enable row level security;
alter table journal_entries enable row level security;

-- Helper: is the given family owned by the current user?
create or replace function owns_family(fid uuid) returns boolean as $$
  select exists (
    select 1 from families f where f.id = fid and f.owner_user_id = auth.uid()
  );
$$ language sql security definer stable;

-- families: owner only
drop policy if exists families_owner on families;
create policy families_owner on families
  using (owner_user_id = auth.uid())
  with check (owner_user_id = auth.uid());

-- family-scoped tables: reuse owns_family()
do $$
declare t text;
begin
  foreach t in array array['children','family_settings','assignments','streaks','favorites','journal_entries']
  loop
    execute format('drop policy if exists %1$s_family on %1$s;', t);
    execute format(
      'create policy %1$s_family on %1$s using (owns_family(family_id)) with check (owns_family(family_id));',
      t
    );
  end loop;
end $$;

-- activities: curated rows are public read; family rows are owner-scoped.
drop policy if exists activities_read on activities;
create policy activities_read on activities
  for select
  using (source = 'curated' or (family_id is not null and owns_family(family_id)));

drop policy if exists activities_write on activities;
create policy activities_write on activities
  for all
  using (family_id is not null and owns_family(family_id))
  with check (family_id is not null and owns_family(family_id));

-- ---------------------------------------------------------------------------
-- Storage bucket for journal photos (family-scoped by path prefix families/<id>/)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('journal', 'journal', false)
on conflict (id) do nothing;

drop policy if exists journal_read on storage.objects;
create policy journal_read on storage.objects
  for select using (
    bucket_id = 'journal'
    and owns_family((split_part(name, '/', 2))::uuid)
  );

drop policy if exists journal_write on storage.objects;
create policy journal_write on storage.objects
  for insert with check (
    bucket_id = 'journal'
    and owns_family((split_part(name, '/', 2))::uuid)
  );
