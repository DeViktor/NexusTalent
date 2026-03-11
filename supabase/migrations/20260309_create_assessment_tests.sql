create extension if not exists pgcrypto;
 
create table if not exists assessment_tests (
  id uuid primary key default gen_random_uuid(),
  vacancy_id text references vacancies(id) on delete cascade not null,
  recruiter_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text,
  questions jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
 
create index if not exists assessment_tests_vacancy_idx on assessment_tests (vacancy_id, updated_at desc);
create index if not exists assessment_tests_recruiter_idx on assessment_tests (recruiter_id, updated_at desc);
 
alter table assessment_tests enable row level security;
 
drop policy if exists "Recruiters manage own assessment tests" on assessment_tests;
create policy "Recruiters manage own assessment tests"
  on assessment_tests for all using (
    auth.uid() = recruiter_id
    or auth.uid() in (select id from users where role = 'admin')
  ) with check (
    auth.uid() = recruiter_id
    or auth.uid() in (select id from users where role = 'admin')
  );
