-- Mental Reps: optional accounts.
-- Per-user progress and the specialty profile from the onboarding quiz.
-- Row level security limits every row to its owner; the app uses only the publishable key.

-- ——— Progress: one row per user per procedure ———

create table public.progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  procedure_id text not null check (char_length(procedure_id) between 1 and 100),
  attempts integer not null default 0 check (attempts >= 0),
  successes integer not null default 0 check (successes between 0 and attempts),
  current_streak integer not null default 0 check (current_streak >= 0),
  best_streak integer not null default 0 check (best_streak >= current_streak),
  best_time_ms integer check (best_time_ms is null or best_time_ms >= 0),
  last_outcome text check (last_outcome in ('success', 'failure')),
  last_played_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, procedure_id)
);

alter table public.progress enable row level security;

create policy "Users read their own progress"
  on public.progress for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users add their own progress"
  on public.progress for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users update their own progress"
  on public.progress for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

grant select, insert, update on public.progress to authenticated;

-- ——— Profile: the onboarding quiz answers ———

create table public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  training_stage text not null
    check (training_stage in ('student', 'intern', 'resident', 'fellow', 'attending', 'other')),
  specialty text not null check (char_length(specialty) between 1 and 40),
  interests text[] not null default '{}' check (cardinality(interests) <= 20),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users read their own profile"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users add their own profile"
  on public.profiles for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users update their own profile"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

grant select, insert, update on public.profiles to authenticated;

-- ——— Keep updated_at honest on progress (profiles carry the client's edit time for merging) ———

create function public.touch_updated_at() returns trigger
  language plpgsql
  set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger progress_touch_updated_at
  before update on public.progress
  for each row execute function public.touch_updated_at();

-- ——— In-app account deletion (required by the App Store for apps that create accounts) ———
-- Deletes only the caller. Progress and profile rows go with it (on delete cascade).

create function public.delete_own_account() returns void
  language sql
  security definer
  set search_path = ''
as $$
  delete from auth.users where id = (select auth.uid());
$$;

revoke execute on function public.delete_own_account() from public, anon;
grant execute on function public.delete_own_account() to authenticated;
