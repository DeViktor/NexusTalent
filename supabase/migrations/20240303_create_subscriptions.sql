-- Create a table for managing subscriptions
create table if not exists subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  status text check (status in ('active', 'trialing', 'past_due', 'canceled', 'unpaid', 'incomplete', 'incomplete_expired', 'paused')) not null,
  price_id text,
  quantity integer,
  cancel_at_period_end boolean,
  created timestamp with time zone default timezone('utc'::text, now()) not null,
  current_period_start timestamp with time zone default timezone('utc'::text, now()) not null,
  current_period_end timestamp with time zone default timezone('utc'::text, now()) not null,
  ended_at timestamp with time zone default timezone('utc'::text, now()),
  cancel_at timestamp with time zone default timezone('utc'::text, now()),
  canceled_at timestamp with time zone default timezone('utc'::text, now()),
  trial_start timestamp with time zone default timezone('utc'::text, now()),
  trial_end timestamp with time zone default timezone('utc'::text, now()),
  stripe_subscription_id text unique
);

-- Create a table for purchased courses (one-time payments)
create table if not exists purchased_courses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  course_id text not null, -- references the ID in your course catalog (e.g., 'TA-001')
  purchase_date timestamp with time zone default timezone('utc'::text, now()) not null,
  amount integer not null, -- amount paid in cents
  currency text not null,
  stripe_checkout_session_id text unique
);

-- Add RLS policies
alter table subscriptions enable row level security;
create policy "Can view own subscription data." on subscriptions for select using (auth.uid() = user_id);

alter table purchased_courses enable row level security;
create policy "Can view own purchased courses." on purchased_courses for select using (auth.uid() = user_id);

-- Create a function to handle new users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function every time a user is created
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
