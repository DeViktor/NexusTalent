
-- Ensure purchased_courses table exists
create table if not exists purchased_courses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  course_id text not null,
  purchase_date timestamp with time zone default timezone('utc'::text, now()) not null,
  amount integer not null,
  currency text not null,
  stripe_checkout_session_id text unique
);

-- Ensure subscriptions table exists
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

-- Enable RLS
alter table purchased_courses enable row level security;
alter table subscriptions enable row level security;

-- Policies (using DO block to avoid errors if they exist)
do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'purchased_courses' and policyname = 'Can view own purchased courses.') then
    create policy "Can view own purchased courses." on purchased_courses for select using (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies where tablename = 'subscriptions' and policyname = 'Can view own subscription data.') then
    create policy "Can view own subscription data." on subscriptions for select using (auth.uid() = user_id);
  end if;
end
$$;
