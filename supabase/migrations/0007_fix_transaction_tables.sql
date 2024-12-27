-- Drop existing tables if they exist
drop table if exists transactions;
drop table if exists portfolios;
drop table if exists funds;

-- Create the funds table
create table funds (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  currency text not null,
  amount decimal not null default 10000,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique(user_id, currency)
);

-- Create the portfolios table
create table portfolios (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  coin_symbol text not null,
  quantity decimal not null default 0,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique(user_id, coin_symbol)
);

-- Create the transactions table
create table transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  coin_symbol text not null,
  transaction_type text not null check (transaction_type in ('BUY', 'SELL')),
  quantity decimal not null,
  price_per_coin decimal not null,
  total_amount decimal not null,
  status text not null default 'pending' check (status in ('pending', 'completed', 'failed')),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Create RLS policies
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

-- Create or replace the decrement_funds function
create or replace function decrement_funds(p_user_id uuid, p_amount decimal)
returns void
language plpgsql
security definer
as $$
begin
  update funds
  set amount = amount - p_amount,
      updated_at = now()
  where user_id = p_user_id and currency = 'USD';
end;
$$;

-- Create or replace the increment_funds function
create or replace function increment_funds(p_user_id uuid, p_amount decimal)
returns void
language plpgsql
security definer
as $$
begin
  update funds
  set amount = amount + p_amount,
      updated_at = now()
  where user_id = p_user_id and currency = 'USD';
end;
$$;

-- Add updated_at triggers
create or replace function update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger funds_updated_at
  before update on funds
  for each row
  execute function update_updated_at();

create trigger portfolios_updated_at
  before update on portfolios
  for each row
  execute function update_updated_at();

create trigger transactions_updated_at
  before update on transactions
  for each row
  execute function update_updated_at();
