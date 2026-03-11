create extension if not exists pgcrypto;
 
create table if not exists recruiter_team_members (
  id uuid primary key default gen_random_uuid(),
  owner_recruiter_id uuid references auth.users(id) not null,
  member_user_id uuid references auth.users(id) not null,
  role text not null check (role in ('Admin', 'Recrutador', 'Gestor de Contratação')),
  status text not null default 'Ativo' check (status in ('Ativo', 'Convidado', 'Desativado')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
 
create unique index if not exists recruiter_team_members_unique on recruiter_team_members (owner_recruiter_id, member_user_id);
create index if not exists recruiter_team_members_owner_idx on recruiter_team_members (owner_recruiter_id, updated_at desc);
 
create table if not exists recruiter_team_invites (
  id uuid primary key default gen_random_uuid(),
  owner_recruiter_id uuid references auth.users(id) not null,
  email text not null,
  role text not null check (role in ('Admin', 'Recrutador', 'Gestor de Contratação')),
  status text not null default 'Convidado' check (status in ('Convidado', 'Aceito', 'Revogado')),
  token text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
 
create index if not exists recruiter_team_invites_owner_idx on recruiter_team_invites (owner_recruiter_id, updated_at desc);
create index if not exists recruiter_team_invites_email_idx on recruiter_team_invites (email);
 
alter table recruiter_team_members enable row level security;
alter table recruiter_team_invites enable row level security;
 
drop policy if exists "Recruiter manages team members" on recruiter_team_members;
create policy "Recruiter manages team members"
  on recruiter_team_members for all using (
    auth.uid() = owner_recruiter_id
    or auth.uid() in (select id from users where role = 'admin')
  ) with check (
    auth.uid() = owner_recruiter_id
    or auth.uid() in (select id from users where role = 'admin')
  );
 
drop policy if exists "Recruiter manages team invites" on recruiter_team_invites;
create policy "Recruiter manages team invites"
  on recruiter_team_invites for all using (
    auth.uid() = owner_recruiter_id
    or auth.uid() in (select id from users where role = 'admin')
  ) with check (
    auth.uid() = owner_recruiter_id
    or auth.uid() in (select id from users where role = 'admin')
  );
