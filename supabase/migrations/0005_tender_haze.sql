/*
  # Fix funds manipulation functions

  1. Changes
    - Add proper parameters for user identification
    - Add proper transaction handling
    - Add proper error handling
    - Fix return types
    
  2. Purpose
    - Ensure atomic updates
    - Prevent race conditions
    - Add proper error handling
*/

-- Function to increment funds
CREATE OR REPLACE FUNCTION increment_funds(p_user_id uuid, p_amount double precision)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE funds
  SET amount = amount + p_amount
  WHERE user_id = p_user_id AND currency = 'USD';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No funds record found for user';
  END IF;
END;
$$;

-- Function to decrement funds
CREATE OR REPLACE FUNCTION decrement_funds(p_user_id uuid, p_amount double precision)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_amount double precision;
BEGIN
  -- Get current amount with row lock
  SELECT amount INTO v_current_amount
  FROM funds
  WHERE user_id = p_user_id AND currency = 'USD'
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No funds record found for user';
  END IF;
  
  IF v_current_amount < p_amount THEN
    RAISE EXCEPTION 'Insufficient funds';
  END IF;
  
  UPDATE funds
  SET amount = amount - p_amount
  WHERE user_id = p_user_id AND currency = 'USD';
END;
$$;