-- Drop all existing functions
drop function if exists decrement_funds(uuid, decimal);
drop function if exists increment_funds(uuid, decimal);
drop function if exists decrement_funds(uuid, numeric);
drop function if exists increment_funds(uuid, numeric);
drop function if exists decrement_funds(uuid, double precision);
drop function if exists increment_funds(uuid, double precision);

-- Create a simpler version of decrement_funds
create or replace function decrement_funds(user_id uuid, amount double precision)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
    current_balance double precision;
begin
    -- Get or create funds record
    insert into funds (user_id, currency, amount)
    values (user_id, 'USD', 10000)
    on conflict (user_id, currency) do nothing;

    -- Get current balance
    select amount into current_balance
    from funds
    where funds.user_id = decrement_funds.user_id
    and currency = 'USD';

    -- Check if sufficient funds
    if current_balance < amount then
        return json_build_object(
            'success', false,
            'error', 'Insufficient funds',
            'current_balance', current_balance,
            'required_amount', amount
        );
    end if;

    -- Update balance
    update funds
    set amount = amount - decrement_funds.amount
    where funds.user_id = decrement_funds.user_id
    and currency = 'USD';

    return json_build_object(
        'success', true,
        'previous_balance', current_balance,
        'new_balance', current_balance - amount
    );
exception when others then
    return json_build_object(
        'success', false,
        'error', SQLERRM
    );
end;
$$;

-- Create a simpler version of increment_funds
create or replace function increment_funds(user_id uuid, amount double precision)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
    current_balance double precision;
begin
    -- Get or create funds record
    insert into funds (user_id, currency, amount)
    values (user_id, 'USD', 10000)
    on conflict (user_id, currency) do nothing;

    -- Get current balance
    select amount into current_balance
    from funds
    where funds.user_id = increment_funds.user_id
    and currency = 'USD';

    -- Update balance
    update funds
    set amount = amount + increment_funds.amount
    where funds.user_id = increment_funds.user_id
    and currency = 'USD';

    return json_build_object(
        'success', true,
        'previous_balance', current_balance,
        'new_balance', current_balance + amount
    );
exception when others then
    return json_build_object(
        'success', false,
        'error', SQLERRM
    );
end;
$$;

-- Add some test functions
create or replace function test_funds(user_id uuid)
returns json
language plpgsql
security definer
as $$
declare
    current_balance double precision;
begin
    select amount into current_balance
    from funds
    where funds.user_id = test_funds.user_id
    and currency = 'USD';

    return json_build_object(
        'has_funds', current_balance is not null,
        'balance', coalesce(current_balance, 0)
    );
end;
$$;
