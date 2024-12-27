-- Drop existing functions
drop function if exists decrement_funds(uuid, decimal);
drop function if exists increment_funds(uuid, decimal);
drop function if exists decrement_funds(uuid, numeric);
drop function if exists increment_funds(uuid, numeric);

-- Create the decrement_funds function with explicit numeric type
create or replace function decrement_funds(p_user_id uuid, p_amount numeric)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
    v_current_amount numeric;
    v_new_amount numeric;
    v_result json;
begin
    -- Get current amount
    select amount into v_current_amount
    from funds
    where user_id = p_user_id and currency = 'USD'
    for update;  -- Lock the row

    if not found then
        -- Create initial funds if not exists
        insert into funds (user_id, currency, amount)
        values (p_user_id, 'USD', 10000)
        returning amount into v_current_amount;
    end if;

    -- Calculate new amount
    v_new_amount := v_current_amount - p_amount;

    -- Check if sufficient funds
    if v_new_amount < 0 then
        return json_build_object(
            'success', false,
            'error', 'Insufficient funds',
            'current_amount', v_current_amount,
            'required_amount', p_amount
        );
    end if;

    -- Update funds
    update funds
    set amount = v_new_amount,
        updated_at = now()
    where user_id = p_user_id and currency = 'USD';

    return json_build_object(
        'success', true,
        'previous_amount', v_current_amount,
        'new_amount', v_new_amount
    );
exception when others then
    return json_build_object(
        'success', false,
        'error', SQLERRM,
        'detail', SQLSTATE
    );
end;
$$;

-- Create the increment_funds function with explicit numeric type
create or replace function increment_funds(p_user_id uuid, p_amount numeric)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
    v_current_amount numeric;
    v_new_amount numeric;
    v_result json;
begin
    -- Get current amount
    select amount into v_current_amount
    from funds
    where user_id = p_user_id and currency = 'USD'
    for update;  -- Lock the row

    if not found then
        -- Create initial funds if not exists
        insert into funds (user_id, currency, amount)
        values (p_user_id, 'USD', 10000)
        returning amount into v_current_amount;
    end if;

    -- Calculate new amount
    v_new_amount := v_current_amount + p_amount;

    -- Update funds
    update funds
    set amount = v_new_amount,
        updated_at = now()
    where user_id = p_user_id and currency = 'USD';

    return json_build_object(
        'success', true,
        'previous_amount', v_current_amount,
        'new_amount', v_new_amount
    );
exception when others then
    return json_build_object(
        'success', false,
        'error', SQLERRM,
        'detail', SQLSTATE
    );
end;
$$;

-- Update the funds table to use numeric type
alter table funds 
alter column amount type numeric using amount::numeric;
