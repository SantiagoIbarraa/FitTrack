-- Create a function to get all active users with their metadata for messaging
-- This function joins user_profiles with auth.users to get email and full_name

CREATE OR REPLACE FUNCTION get_users_for_messaging()
RETURNS TABLE (
  id uuid,
  email text,
  full_name text,
  profile_photo_url text,
  role text,
  is_professional boolean,
  is_active boolean
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;

  -- Return all active users except the current user
  RETURN QUERY
  SELECT 
    up.id,
    au.email,
    COALESCE(
      (au.raw_user_meta_data->>'full_name')::text,
      CONCAT(
        (au.raw_user_meta_data->>'first_name')::text,
        ' ',
        (au.raw_user_meta_data->>'last_name')::text
      )
    ) as full_name,
    (au.raw_user_meta_data->>'profile_photo_url')::text as profile_photo_url,
    up.role,
    COALESCE(up.is_professional, false) as is_professional,
    COALESCE(up.is_active, true) as is_active
  FROM user_profiles up
  INNER JOIN auth.users au ON au.id = up.id
  WHERE up.id != auth.uid()
    AND COALESCE(up.is_active, true) = true
  ORDER BY 
    COALESCE(up.is_professional, false) DESC,
    full_name ASC;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_users_for_messaging() TO authenticated;

-- Add comment
COMMENT ON FUNCTION get_users_for_messaging() IS 'Returns all active users with their metadata for messaging. Accessible by all authenticated users.';
