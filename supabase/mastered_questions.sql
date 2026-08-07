create table public.mastered_questions (
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id integer not null,
  created_at timestamptz not null default now(),
  primary key (user_id, question_id)
);

alter table public.mastered_questions enable row level security;

create policy "Users can read their mastered questions"
on public.mastered_questions for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can mark questions as mastered"
on public.mastered_questions for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can unmark their mastered questions"
on public.mastered_questions for delete to authenticated
using ((select auth.uid()) = user_id);
