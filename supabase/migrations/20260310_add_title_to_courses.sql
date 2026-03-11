alter table public.courses
  add column if not exists title text;

update public.courses
set title = name
where title is null;

notify pgrst, 'reload schema';
