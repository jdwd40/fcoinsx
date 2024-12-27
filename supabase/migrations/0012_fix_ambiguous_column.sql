-- Drop existing function
drop function if exists decrement_funds(uuid, float8);

-- Create a simple decrement_funds function with fixed column references
create or replace function decrement_funds(
    p_user_id uuid,
    p_amount float8
) returns jsonb
language plpgsql security definer
as $$
declare
    v_balance float8;
begin
    -- Get current balance, creating record if it doesn't exist
    insert into funds (user_id, currency, amount)
    values (p_user_id, 'USD', 10000)
    on conflict (user_id, currency) 
    do update set updated_at = now()
    returning amount into v_balance;

    -- If we still don't have a balance, something went wrong
    if v_balance is null then
        return jsonb_build_object(
            'success', false,
            'error', 'Could not get current balance'
        );
    end if;

    -- Check if sufficient funds
    if v_balance < p_amount then
        return jsonb_build_object(
            'success', false,
            'error', 'Insufficient funds',
            'balance', v_balance,
            'required', p_amount
        );
    end if;

    -- Update the balance
    update funds 
    set amount = amount - p_amount,
        updated_at = now()
    where user_id = p_user_id 
    and currency = 'USD';

    return jsonb_build_object(
        'success', true,
        'previous_balance', v_balance,
        'new_balance', v_balance - p_amount
    );
exception when others then
    return jsonb_build_object(
        'success', false,
        'error', SQLERRM
    );
end;
$$;