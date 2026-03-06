alter table if exists courses
  add column if not exists owner_id uuid references auth.users(id);

create index if not exists idx_courses_owner_id on courses(owner_id);

drop policy if exists "Courses are insertable by admins and instructors" on courses;
drop policy if exists "Courses are updatable by admins and instructors" on courses;
drop policy if exists "Courses are deletable by admins" on courses;
drop policy if exists "Courses are updatable by owner or admin" on courses;
drop policy if exists "Courses are deletable by owner or admin" on courses;

create policy "Courses are insertable by admins and instructors"
  on courses for insert with check (
    owner_id = auth.uid()
    and auth.uid() in (select id from users where role in ('admin', 'instructor'))
  );

create policy "Courses are updatable by owner or admin"
  on courses for update using (
    owner_id = auth.uid()
    or auth.uid() in (select id from users where role = 'admin')
  );

create policy "Courses are deletable by owner or admin"
  on courses for delete using (
    owner_id = auth.uid()
    or auth.uid() in (select id from users where role = 'admin')
  );
