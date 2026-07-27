-- Weekly challenges: one row of progress per family per ISO week. The challenge
-- definitions themselves live in the app (curated, deterministic rotation); the
-- server only stores progress so it syncs across a parent's devices.

create table if not exists weekly_challenge_progress (
  family_id uuid not null references families (id) on delete cascade,
  week_key text not null,
  challenge_id text not null,
  count integer not null default 0,
  target integer not null,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (family_id, week_key)
);

create index if not exists idx_weekly_challenge_family
  on weekly_challenge_progress (family_id, week_key);

-- updated_at trigger (set_updated_at defined in 0001)
drop trigger if exists trg_updated_at on weekly_challenge_progress;
create trigger trg_updated_at before update on weekly_challenge_progress
  for each row execute function set_updated_at();

-- RLS: family-scoped, reusing owns_family() from 0001.
alter table weekly_challenge_progress enable row level security;

drop policy if exists weekly_challenge_progress_family on weekly_challenge_progress;
create policy weekly_challenge_progress_family on weekly_challenge_progress
  using (owns_family(family_id))
  with check (owns_family(family_id));
