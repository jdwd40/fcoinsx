-- Create the decrement_funds function
create or replace function decrement_funds(p_user_id uuid, p_amount decimal)
returns void
language plpgsql
security definer
as $$
begin
  update funds
  set amount = amount - p_amount
  where user_id = p_user_id and currency = 'USD';
end;
$$;

-- Create the increment_funds function
create or replace function increment_funds(p_user_id uuid, p_amount decimal)
returns void
language plpgsql
security definer
as $$
begin
  update funds
  set amount = amount + p_amount
  where user_id = p_user_id and currency = 'USD';
end;
$$;

-- Create or update the funds table
create table if not exists funds (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  currency text not null,
  amount decimal not null default 10000,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, currency)
);

-- Create or update the portfolios table
create table if not exists portfolios (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  coin_symbol text not null,
  quantity decimal not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, coin_symbol)
);

-- Create or update the transactions table
create table if not exists transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  coin_symbol text not null,
  transaction_type text not null check (transaction_type in ('BUY', 'SELL')),
  quantity decimal not null,
  price_per_coin decimal not null,
  total_amount decimal not null,
  status text not null default 'pending' check (status in ('pending', 'completed', 'failed')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS policies
alter table funds enable row level security;
alter table portfolios enable row level security;
alter table transactions enable row level security;

-- Funds policies
create policy "Users can view their own funds"
  on funds for select
  using (auth.uid() = user_id);

create policy "Users can update their own funds"
  on funds for update
  using (auth.uid() = user_id);

create policy "Users can insert their own funds"
  on funds for insert
  with check (auth.uid() = user_id);

-- Portfolio policies
create policy "Users can view their own portfolio"
  on portfolios for select
  using (auth.uid() = user_id);

create policy "Users can update their own portfolio"
  on portfolios for update
  using (auth.uid() = user_id);

create policy "Users can insert into their own portfolio"
  on portfolios for insert
  with check (auth.uid() = user_id);

-- Transaction policies
create policy "Users can view their own transactions"
  on transactions for select
  using (auth.uid() = user_id);

create policy "Users can insert their own transactions"
  on transactions for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own transactions"
  on transactions for update
  using (auth.uid() = user_id);
