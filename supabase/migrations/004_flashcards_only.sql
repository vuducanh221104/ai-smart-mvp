-- Create flashcard_sets table and RLS policies
create extension if not exists pgcrypto;

create table if not exists public.flashcard_sets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  language text default 'English',
  card_count integer not null default 0 check (card_count >= 0),
  data jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.flashcard_sets enable row level security;

-- Policies
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'flashcard_sets' and policyname = 'select own flashcard_sets'
  ) then
    create policy "select own flashcard_sets"
      on public.flashcard_sets for select
      using (auth.uid() = user_id);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'flashcard_sets' and policyname = 'insert own flashcard_sets'
  ) then
    create policy "insert own flashcard_sets"
      on public.flashcard_sets for insert
      with check (auth.uid() = user_id);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'flashcard_sets' and policyname = 'delete own flashcard_sets'
  ) then
    create policy "delete own flashcard_sets"
      on public.flashcard_sets for delete
      using (auth.uid() = user_id);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'flashcard_sets' and policyname = 'update own flashcard_sets'
  ) then
    create policy "update own flashcard_sets"
      on public.flashcard_sets for update
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end $$;

-- Helpful indexes
create index if not exists idx_flashcard_sets_user_created on public.flashcard_sets(user_id, created_at desc);
