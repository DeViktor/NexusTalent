create extension if not exists pgcrypto;
 
create table if not exists course_enrollments (
  id uuid primary key default gen_random_uuid(),
  course_id text references courses(id) on delete cascade not null,
  student_id uuid references auth.users(id) on delete cascade not null,
  status text not null default 'Em Curso' check (status in ('Em Curso', 'Concluído', 'Cancelado')),
  progress integer not null default 0 check (progress >= 0 and progress <= 100),
  quiz_grade numeric,
  final_grade numeric,
  enrolled_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_activity_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
 
create unique index if not exists course_enrollments_unique on course_enrollments (course_id, student_id);
create index if not exists course_enrollments_course_idx on course_enrollments (course_id, updated_at desc);
create index if not exists course_enrollments_student_idx on course_enrollments (student_id, updated_at desc);
 
alter table course_enrollments enable row level security;
 
drop policy if exists "Students view own enrollments" on course_enrollments;
create policy "Students view own enrollments"
  on course_enrollments for select using (auth.uid() = student_id);
 
drop policy if exists "Students update own progress" on course_enrollments;
create policy "Students update own progress"
  on course_enrollments for update using (auth.uid() = student_id) with check (auth.uid() = student_id);
 
drop policy if exists "Instructors view course enrollments" on course_enrollments;
create policy "Instructors view course enrollments"
  on course_enrollments for select using (
    exists (
      select 1 from courses c
      where c.id = course_enrollments.course_id
      and c.owner_id = auth.uid()
    )
    or auth.uid() in (select id from users where role = 'admin')
  );
 
drop policy if exists "Instructors update course grades" on course_enrollments;
create policy "Instructors update course grades"
  on course_enrollments for update using (
    exists (
      select 1 from courses c
      where c.id = course_enrollments.course_id
      and c.owner_id = auth.uid()
    )
    or auth.uid() in (select id from users where role = 'admin')
  ) with check (
    exists (
      select 1 from courses c
      where c.id = course_enrollments.course_id
      and c.owner_id = auth.uid()
    )
    or auth.uid() in (select id from users where role = 'admin')
  );
