-- Fix RLS policy for gym_exercises to allow updates
-- The issue is that the policy needs both USING and WITH CHECK clauses for updates

-- Drop the existing policy
DROP POLICY IF EXISTS "Only admins can manage gym exercises" ON gym_exercises;

-- Create separate policies for better control
-- Policy for INSERT
CREATE POLICY "Only admins can insert gym exercises"
  ON gym_exercises
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Policy for UPDATE
CREATE POLICY "Only admins can update gym exercises"
  ON gym_exercises
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Policy for DELETE
CREATE POLICY "Only admins can delete gym exercises"
  ON gym_exercises
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );
