-- Ensure users table has a role column
alter table if exists users add column if not exists role text default 'student';

-- Create course categories table
create table if not exists course_categories (
  id text primary key,
  name text not null
);

-- Create courses table
create table if not exists courses (
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
  what_you_will_learn jsonb, -- array of strings
  modules jsonb, -- complex object structure
  status text check (status in ('Ativo', 'Pendente', 'Rejeitado', 'Rascunho')) default 'Rascunho',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table course_categories enable row level security;
alter table courses enable row level security;

-- Policies for course_categories
create policy "Categories are viewable by everyone" 
  on course_categories for select using (true);

create policy "Categories are insertable by admins only" 
  on course_categories for insert with check (
    auth.uid() in (select id from users where role = 'admin')
  );

-- Policies for courses
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
