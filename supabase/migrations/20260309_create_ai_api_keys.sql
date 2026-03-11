create table if not exists public.ai_api_keys (
  id uuid primary key default gen_random_uuid(),
  owner_type text not null check (owner_type in ('system', 'user')),
  owner_id uuid,
  provider text not null default 'gemini',
  api_key_ciphertext text not null,
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone('utc'::text, now())
);

create unique index if not exists ai_api_keys_system_unique
  on public.ai_api_keys (provider)
  where owner_type = 'system' and owner_id is null;

create unique index if not exists ai_api_keys_user_unique
  on public.ai_api_keys (owner_id, provider)
  where owner_type = 'user' and owner_id is not null;

alter table public.ai_api_keys enable row level security;

notify pgrst, 'reload schema';
