create extension if not exists pgcrypto;
 
create table if not exists recruiter_company_profiles (
  recruiter_id uuid primary key references auth.users(id) on delete cascade,
  company_name text not null,
  about text not null,
  culture text not null,
  values text[] not null default '{}',
  benefits text[] not null default '{}',
  photos text[] not null default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
 
alter table recruiter_company_profiles enable row level security;
 
drop policy if exists "Recruiters manage own company profile" on recruiter_company_profiles;
create policy "Recruiters manage own company profile"
  on recruiter_company_profiles for all using (
    auth.uid() = recruiter_id
    or auth.uid() in (select id from users where role = 'admin')
  ) with check (
    auth.uid() = recruiter_id
    or auth.uid() in (select id from users where role = 'admin')
  );
