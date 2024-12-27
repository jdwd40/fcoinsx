/*
  # Initial Schema Setup for FantasyCoinX

  1. New Tables
    - profiles
      - id (uuid, PK, references auth.users)
      - email (text, unique)
      - display_name (text, nullable)
      - avatar_url (text, nullable)
      - created_at (timestamptz)
    
    - funds
      - id (uuid, PK)
      - user_id (uuid, FK → profiles)
      - currency (text)
      - amount (decimal)
      - last_updated (timestamptz)
    
    - portfolio
      - id (uuid, PK)
      - user_id (uuid, FK → profiles)
      - coin_symbol (text)
      - quantity (decimal)
      - cost_basis (decimal)
      - last_updated (timestamptz)
    
    - transactions
      - id (uuid, PK)
      - user_id (uuid, FK → profiles)
      - coin_symbol (text)
      - transaction_type (text)
      - quantity (decimal)
      - price_per_coin (decimal)
      - status (text)
      - created_at (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to:
      - Read their own data
      - Create new records for themselves
      - Update their own records
      - Delete their own records (where applicable)
*/

-- Create profiles table
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  display_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

-- Create funds table
CREATE TABLE funds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  amount decimal NOT NULL DEFAULT 0 CHECK (amount >= 0),
  last_updated timestamptz DEFAULT now(),
  UNIQUE(user_id, currency)
);

-- Create portfolio table
CREATE TABLE portfolio (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  coin_symbol text NOT NULL,
  quantity decimal NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  cost_basis decimal NOT NULL DEFAULT 0,
  last_updated timestamptz DEFAULT now(),
  UNIQUE(user_id, coin_symbol)
);

-- Create transactions table
CREATE TABLE transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  coin_symbol text NOT NULL,
  transaction_type text NOT NULL CHECK (transaction_type IN ('BUY', 'SELL')),
  quantity decimal NOT NULL CHECK (quantity > 0),
  price_per_coin decimal NOT NULL CHECK (price_per_coin > 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE funds ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Funds policies
CREATE POLICY "Users can view own funds"
  ON funds FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own funds"
  ON funds FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own funds"
  ON funds FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Portfolio policies
CREATE POLICY "Users can view own portfolio"
  ON portfolio FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own portfolio"
  ON portfolio FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert into own portfolio"
  ON portfolio FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Transactions policies
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pending transactions"
  ON transactions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND status = 'pending');

-- Create indexes for better query performance
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_funds_user_currency ON funds(user_id, currency);
CREATE INDEX idx_portfolio_user_symbol ON portfolio(user_id, coin_symbol);
CREATE INDEX idx_transactions_user_created ON transactions(user_id, created_at DESC);
CREATE INDEX idx_transactions_status ON transactions(status);

-- Create function to update portfolio and funds after transaction
CREATE OR REPLACE FUNCTION process_transaction()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process completed transactions
  IF NEW.status = 'completed' THEN
    -- Update portfolio
    INSERT INTO portfolio (user_id, coin_symbol, quantity, cost_basis)
    VALUES (
      NEW.user_id,
      NEW.coin_symbol,
      CASE WHEN NEW.transaction_type = 'BUY' THEN NEW.quantity ELSE -NEW.quantity END,
      NEW.price_per_coin
    )
    ON CONFLICT (user_id, coin_symbol) DO UPDATE
    SET 
      quantity = portfolio.quantity + 
        CASE WHEN NEW.transaction_type = 'BUY' THEN NEW.quantity ELSE -NEW.quantity END,
      cost_basis = CASE
        WHEN NEW.transaction_type = 'BUY' THEN 
          (portfolio.cost_basis * portfolio.quantity + NEW.price_per_coin * NEW.quantity) / 
          (portfolio.quantity + NEW.quantity)
        ELSE portfolio.cost_basis
      END,
      last_updated = now();
    
    -- Update funds
    UPDATE funds
    SET amount = amount + 
      CASE 
        WHEN NEW.transaction_type = 'SELL' THEN NEW.quantity * NEW.price_per_coin
        ELSE -(NEW.quantity * NEW.price_per_coin)
      END,
      last_updated = now()
    WHERE user_id = NEW.user_id AND currency = 'USD';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for transaction processing
CREATE TRIGGER after_transaction_update
  AFTER UPDATE ON transactions
  FOR EACH ROW
  WHEN (OLD.status = 'pending' AND NEW.status = 'completed')
  EXECUTE FUNCTION process_transaction();