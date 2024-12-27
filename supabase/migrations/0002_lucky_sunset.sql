/*
  # Add profile creation policy

  1. Changes
    - Add policy to allow authenticated users to create their own profile
    - This is required for the registration process to work correctly

  2. Security
    - Only allows users to create a profile with their own auth.uid()
    - Maintains existing RLS security model
*/

CREATE POLICY "Users can create their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);