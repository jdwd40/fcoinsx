-- Create function to handle portfolio cleanup
CREATE OR REPLACE FUNCTION clean_zero_quantities()
RETURNS TRIGGER AS $$
BEGIN
    -- Delete the row if quantity is zero or very close to zero
    IF NEW.quantity IS NULL OR NEW.quantity <= 0.00000001 THEN
        RETURN NULL; -- This prevents the insert/update and effectively deletes the row
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS cleanup_portfolio_trigger ON portfolios;

-- Create the trigger
CREATE TRIGGER cleanup_portfolio_trigger
    BEFORE INSERT OR UPDATE ON portfolios
    FOR EACH ROW
    EXECUTE FUNCTION clean_zero_quantities();
