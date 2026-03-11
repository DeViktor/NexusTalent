create extension if not exists pgcrypto;
 
create table if not exists email_campaigns (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references auth.users(id) not null,
  subject text not null,
  body_html text not null,
  audience_count integer not null default 0,
  open_count integer not null default 0,
  click_count integer not null default 0,
  status text not null default 'Enviada' check (status in ('Rascunho', 'Enviada')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  sent_at timestamp with time zone
);
 
create index if not exists email_campaigns_created_at_idx on email_campaigns (created_at desc);
 
create table if not exists email_campaign_events (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references email_campaigns(id) on delete cascade not null,
  user_id uuid references auth.users(id),
  action text not null check (action in ('Abertura', 'Clique')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
 
create index if not exists email_campaign_events_campaign_idx on email_campaign_events (campaign_id, created_at desc);
 
alter table email_campaigns enable row level security;
alter table email_campaign_events enable row level security;
 
drop policy if exists "Admins manage email campaigns" on email_campaigns;
create policy "Admins manage email campaigns"
  on email_campaigns for all using (auth.uid() in (select id from users where role = 'admin'))
  with check (auth.uid() in (select id from users where role = 'admin'));
 
drop policy if exists "Admins manage email campaign events" on email_campaign_events;
create policy "Admins manage email campaign events"
  on email_campaign_events for all using (auth.uid() in (select id from users where role = 'admin'))
  with check (auth.uid() in (select id from users where role = 'admin'));
