/*
  # Add funds policies

  1. Security
    - Enable RLS on funds table
    - Add policies for users to manage their funds
*/

-- Create policy for users to create their own funds
CREATE POLICY "Users can create their own funds"
  ON funds FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create policy for users to read their own funds
CREATE POLICY "Users can read their own funds"
  ON funds FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policy for users to update their own funds
CREATE POLICY "Users can update their own funds"
  ON funds FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);