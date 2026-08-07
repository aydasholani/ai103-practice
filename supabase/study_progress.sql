create table if not exists public.study_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id integer not null,
  last_answers jsonb not null default '{}'::jsonb,
  was_correct boolean not null,
  confidence text check (confidence in ('guessed', 'unsure', 'confident')),
  review_step integer not null default 0 check (review_step between 0 and 3),
  next_review_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, question_id)
);

alter table public.study_progress enable row level security;
create policy "Users read own study progress" on public.study_progress for select using (auth.uid() = user_id);
create policy "Users insert own study progress" on public.study_progress for insert with check (auth.uid() = user_id);
create policy "Users update own study progress" on public.study_progress for update using (auth.uid() = user_id);
