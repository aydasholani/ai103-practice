create table public.question_attempts (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id integer not null,
  category text not null,
  mode text not null check (mode in ('practice', 'exam')),
  is_correct boolean not null,
  earned_points integer not null default 0,
  maximum_points integer not null default 1,
  answered_at timestamptz not null default now()
);

create index question_attempts_user_question_idx
on public.question_attempts (user_id, question_id);

alter table public.question_attempts enable row level security;

create policy "Users can read their question attempts"
on public.question_attempts for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can save their question attempts"
on public.question_attempts for insert to authenticated
with check ((select auth.uid()) = user_id);
