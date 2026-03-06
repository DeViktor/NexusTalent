insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', false)
on conflict (id) do nothing;

drop policy if exists "Authenticated users can upload resumes" on storage.objects;
create policy "Authenticated users can upload resumes"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'resumes'
);

drop policy if exists "Users can view own resumes" on storage.objects;
create policy "Users can view own resumes"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'resumes'
  and owner = auth.uid()
);
