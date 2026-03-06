-- 1. DROP existing tables to ensure clean slate (be careful in production!)
drop table if exists courses;
drop table if exists course_categories;

-- 2. Ensure users table has a role column
alter table if exists users add column if not exists role text default 'student';

-- 3. Create course categories table
create table course_categories (
  id text primary key,
  name text not null
);

-- 4. Create courses table with ALL required columns
create table courses (
  id text primary key,
  name text not null,
  category text references course_categories(id),
  image_id text,
  image_data_uri text,
  duration text,
  format text check (format in ('Online', 'Presencial', 'Híbrido')),
  price numeric,
  currency text default 'AOA',
  general_objective text,
  what_you_will_learn jsonb default '[]'::jsonb,
  modules jsonb default '[]'::jsonb,
  status text check (status in ('Ativo', 'Pendente', 'Rejeitado', 'Rascunho')) default 'Rascunho',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Enable RLS
alter table course_categories enable row level security;
alter table courses enable row level security;

-- 6. Create Policies

-- Categories Policies
create policy "Categories are viewable by everyone" 
  on course_categories for select using (true);

create policy "Categories are insertable by admins only" 
  on course_categories for insert with check (
    auth.uid() in (select id from users where role = 'admin')
  );

-- Courses Policies
create policy "Courses are viewable by everyone" 
  on courses for select using (true);

create policy "Courses are insertable by admins and instructors" 
  on courses for insert with check (
    auth.uid() in (select id from users where role in ('admin', 'instructor'))
  );

create policy "Courses are updatable by admins and instructors" 
  on courses for update using (
    auth.uid() in (select id from users where role in ('admin', 'instructor'))
  );

create policy "Courses are deletable by admins" 
  on courses for delete using (
    auth.uid() in (select id from users where role = 'admin')
  );

-- 7. Force schema cache reload
NOTIFY pgrst, 'reload schema';
