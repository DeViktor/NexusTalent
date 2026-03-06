create table if not exists vacancies (
  id text primary key,
  title text not null,
  description text not null,
  company text not null,
  location text not null,
  salary_range text,
  job_type text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  expires_at timestamp with time zone,
  recruiter_id uuid references auth.users(id) not null,
  status text not null default 'active',
  requirements text[] default '{}',
  benefits text[] default '{}',
  featured boolean default false
);

create table if not exists applications (
  id uuid default gen_random_uuid() primary key,
  job_posting_id text references vacancies(id) on delete cascade not null,
  applicant_id uuid references auth.users(id) not null,
  status text not null default 'Recebida',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  resume_url text,
  cover_letter text,
  notes text,
  test_score numeric,
  interview_date timestamp with time zone
);

alter table if exists vacancies add column if not exists title text;
alter table if exists vacancies add column if not exists description text;
alter table if exists vacancies add column if not exists company text;
alter table if exists vacancies add column if not exists location text;
alter table if exists vacancies add column if not exists salary_range text;
alter table if exists vacancies add column if not exists job_type text;
alter table if exists vacancies add column if not exists recruiter_id uuid references auth.users(id);
alter table if exists vacancies add column if not exists status text default 'active';
alter table if exists vacancies add column if not exists requirements text[] default '{}';
alter table if exists vacancies add column if not exists benefits text[] default '{}';
alter table if exists vacancies add column if not exists featured boolean default false;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'applications' and column_name = 'user_id'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'applications' and column_name = 'applicant_id'
  ) then
    execute 'alter table public.applications rename column user_id to applicant_id';
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'applications' and column_name = 'vacancy_id'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'applications' and column_name = 'job_posting_id'
  ) then
    execute 'alter table public.applications rename column vacancy_id to job_posting_id';
  end if;
end $$;

alter table if exists applications add column if not exists job_posting_id text;
alter table if exists applications add column if not exists applicant_id uuid references auth.users(id);
alter table if exists applications add column if not exists status text default 'Recebida';
alter table if exists applications add column if not exists created_at timestamp with time zone default timezone('utc'::text, now());
alter table if exists applications add column if not exists updated_at timestamp with time zone default timezone('utc'::text, now());
alter table if exists applications add column if not exists resume_url text;
alter table if exists applications add column if not exists cover_letter text;
alter table if exists applications add column if not exists notes text;
alter table if exists applications add column if not exists test_score numeric;
alter table if exists applications add column if not exists interview_date timestamp with time zone;

alter table vacancies enable row level security;
alter table applications enable row level security;

drop policy if exists "Vacancies are viewable by everyone" on vacancies;
create policy "Vacancies are viewable by everyone"
  on vacancies for select using (true);

drop policy if exists "Recruiters and admins manage vacancies" on vacancies;
create policy "Recruiters and admins manage vacancies"
  on vacancies for all using (
    auth.uid() = recruiter_id
    or auth.uid() in (select id from users where role = 'admin')
  ) with check (
    auth.uid() = recruiter_id
    or auth.uid() in (select id from users where role = 'admin')
  );

drop policy if exists "Applicants view own applications" on applications;
create policy "Applicants view own applications"
  on applications for select using (
    auth.uid() = applicant_id
  );

drop policy if exists "Applicants insert own applications" on applications;
create policy "Applicants insert own applications"
  on applications for insert with check (
    auth.uid() = applicant_id
  );

drop policy if exists "Recruiters view vacancy applications" on applications;
create policy "Recruiters view vacancy applications"
  on applications for select using (
    exists (
      select 1 from vacancies v
      where v.id = applications.job_posting_id
      and v.recruiter_id = auth.uid()
    )
    or auth.uid() in (select id from users where role = 'admin')
  );
