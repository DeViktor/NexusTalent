-- 1. DROP existing tables with CASCADE to handle dependencies
-- WARNING: This will delete 'course_modules', 'course_wishlist' and any other tables referencing 'courses'
drop table if exists courses cascade;
drop table if exists course_categories cascade;

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

-- 5. Re-create dependent tables (Optional - only if you need wishlist functionality back immediately)
-- Example: Wishlist table (simplified version)
create table if not exists course_wishlist (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  course_id text references courses(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, course_id)
);

-- 6. Enable RLS
alter table course_categories enable row level security;
alter table courses enable row level security;
alter table course_wishlist enable row level security;

-- 7. Create Policies

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

-- Wishlist Policies
create policy "Users can view their own wishlist" 
  on course_wishlist for select using (auth.uid() = user_id);

create policy "Users can add to their own wishlist" 
  on course_wishlist for insert with check (auth.uid() = user_id);

create policy "Users can remove from their own wishlist" 
  on course_wishlist for delete using (auth.uid() = user_id);

-- 8. Force schema cache reload
NOTIFY pgrst, 'reload schema';
