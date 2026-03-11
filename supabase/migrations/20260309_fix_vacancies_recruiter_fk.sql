alter table if exists public.vacancies
  drop constraint if exists vacancies_recruiter_id_fkey;

alter table if exists public.vacancies
  add constraint vacancies_recruiter_id_fkey
  foreign key (recruiter_id)
  references public.users(id);

notify pgrst, 'reload schema';
