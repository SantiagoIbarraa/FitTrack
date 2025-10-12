-- Function to get all users with their roles (for admin dashboard)
-- This function uses SECURITY DEFINER to access auth.users table

CREATE OR REPLACE FUNCTION get_all_users_with_roles()
RETURNS TABLE (
  id uuid,
  email text,
  full_name text,
  role text,
  is_active boolean,
  is_professional boolean,
  created_at timestamptz
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if the current user is an admin
  IF NOT EXISTS (
    SELECT 1 FROM user_roles ur_check
    WHERE ur_check.user_id = auth.uid() 
    AND ur_check.role = 'admin'
  ) THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;

  -- Return all users with their roles
  RETURN QUERY
  SELECT 
    au.id,
    au.email::text,
    COALESCE(
      au.raw_user_meta_data->>'full_name',
      CONCAT(
        COALESCE(au.raw_user_meta_data->>'first_name', ''),
        ' ',
        COALESCE(au.raw_user_meta_data->>'last_name', '')
      ),
      'Sin nombre'
    )::text,
    COALESCE(ur.role, 'user')::text,
    COALESCE(ur.is_active, true),
    COALESCE(ur.is_professional, false),
    au.created_at
  FROM auth.users au
  LEFT JOIN user_roles ur ON ur.user_id = au.id
  ORDER BY au.created_at DESC;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_all_users_with_roles() TO authenticated;

COMMENT ON FUNCTION get_all_users_with_roles() IS 'Returns all users with their roles. Only accessible by admins.';
