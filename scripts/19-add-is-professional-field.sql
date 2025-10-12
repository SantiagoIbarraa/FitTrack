-- Add is_professional boolean field to user_roles table
-- This simplifies the role system: users are either 'user' or 'admin'
-- and professionals are users with is_professional=true

-- Add the is_professional column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_roles' 
    AND column_name = 'is_professional'
  ) THEN
    ALTER TABLE user_roles 
    ADD COLUMN is_professional BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Update existing 'professional' roles to be 'user' with is_professional=true
UPDATE user_roles 
SET role = 'user', is_professional = true 
WHERE role = 'professional';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_roles_is_professional 
ON user_roles(is_professional) 
WHERE is_professional = true;

-- Update the get_all_users_with_roles function to include is_professional
CREATE OR REPLACE FUNCTION get_all_users_with_roles()
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT,
  role TEXT,
  is_active BOOLEAN,
  is_professional BOOLEAN,
  created_at TIMESTAMPTZ
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if the current user is an admin
  IF NOT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can view all users';
  END IF;

  RETURN QUERY
  SELECT 
    au.id,
    au.email::TEXT,
    COALESCE(
      au.raw_user_meta_data->>'full_name',
      CONCAT(
        au.raw_user_meta_data->>'first_name',
        ' ',
        au.raw_user_meta_data->>'last_name'
      ),
      au.email::TEXT
    ) as full_name,
    COALESCE(ur.role, 'user') as role,
    COALESCE(ur.is_active, true) as is_active,
    COALESCE(ur.is_professional, false) as is_professional,
    au.created_at
  FROM auth.users au
  LEFT JOIN user_roles ur ON au.id = ur.user_id
  ORDER BY au.created_at DESC;
END;
$$;

COMMENT ON FUNCTION get_all_users_with_roles() IS 
'Returns all users with their roles and professional status. Only accessible by admins.';
