create extension if not exists pgcrypto;
 
create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  recruiter_id uuid references auth.users(id) not null,
  candidate_id uuid references auth.users(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_message_at timestamp with time zone
);
 
create unique index if not exists conversations_unique_pair on conversations (recruiter_id, candidate_id);
create index if not exists conversations_recruiter_idx on conversations (recruiter_id, updated_at desc);
create index if not exists conversations_candidate_idx on conversations (candidate_id, updated_at desc);
 
create table if not exists conversation_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations(id) on delete cascade not null,
  sender_id uuid references auth.users(id) not null,
  sender_role text not null check (sender_role in ('recruiter','candidate')),
  body text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
 
create index if not exists conversation_messages_conversation_idx on conversation_messages (conversation_id, created_at asc);
create index if not exists conversation_messages_sender_idx on conversation_messages (sender_id, created_at desc);
 
alter table conversations enable row level security;
alter table conversation_messages enable row level security;
 
drop policy if exists "Participants view conversations" on conversations;
create policy "Participants view conversations"
  on conversations for select using (
    auth.uid() = recruiter_id
    or auth.uid() = candidate_id
  );
 
drop policy if exists "Recruiters create conversations" on conversations;
create policy "Recruiters create conversations"
  on conversations for insert with check (
    auth.uid() = recruiter_id
  );
 
drop policy if exists "Participants view messages" on conversation_messages;
create policy "Participants view messages"
  on conversation_messages for select using (
    exists (
      select 1 from conversations c
      where c.id = conversation_messages.conversation_id
      and (c.recruiter_id = auth.uid() or c.candidate_id = auth.uid())
    )
  );
 
drop policy if exists "Participants send messages" on conversation_messages;
create policy "Participants send messages"
  on conversation_messages for insert with check (
    sender_id = auth.uid()
    and exists (
      select 1 from conversations c
      where c.id = conversation_messages.conversation_id
      and (
        (c.recruiter_id = auth.uid() and sender_role = 'recruiter')
        or (c.candidate_id = auth.uid() and sender_role = 'candidate')
      )
    )
  );
