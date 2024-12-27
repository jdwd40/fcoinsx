/*
  # Add functions for safe funds manipulation

  1. New Functions
    - `increment_funds`: Safely increment funds amount
    - `decrement_funds`: Safely decrement funds amount
    
  2. Purpose
    - Ensure atomic operations on funds
    - Prevent race conditions
    - Maintain data consistency
*/

-- Function to increment funds
CREATE OR REPLACE FUNCTION increment_funds(amount double precision)
RETURNS double precision
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN COALESCE(NEW.amount, 0) + amount;
END;
$$;

-- Function to decrement funds
CREATE OR REPLACE FUNCTION decrement_funds(amount double precision)
RETURNS double precision
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN GREATEST(0, COALESCE(NEW.amount, 0) - amount);
END;
$$;