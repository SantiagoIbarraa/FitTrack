-- Fix the get_users_for_messaging function to correctly query user_roles table
-- and handle is_professional as string ('0', '1') or boolean

DROP FUNCTION IF EXISTS get_users_for_messaging();

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
  -- Join with user_roles to get is_professional field
  RETURN QUERY
  SELECT 
    au.id,
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
    COALESCE(ur.role, 'user') as role,
    -- Handle is_professional as string ('0', '1') or boolean
    CASE 
      WHEN ur.is_professional IS NULL THEN false
      WHEN ur.is_professional::text = '1' THEN true
      WHEN ur.is_professional::text = 't' THEN true
      WHEN ur.is_professional::text = 'true' THEN true
      ELSE false
    END as is_professional,
    COALESCE(ur.is_active, true) as is_active
  FROM auth.users au
  LEFT JOIN user_roles ur ON au.id = ur.user_id
  WHERE au.id != auth.uid()
    AND COALESCE(ur.is_active, true) = true
  ORDER BY 
    -- Sort professionals first
    CASE 
      WHEN ur.is_professional IS NULL THEN false
      WHEN ur.is_professional::text = '1' THEN true
      WHEN ur.is_professional::text = 't' THEN true
      WHEN ur.is_professional::text = 'true' THEN true
      ELSE false
    END DESC,
    full_name ASC;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_users_for_messaging() TO authenticated;

-- Add comment
COMMENT ON FUNCTION get_users_for_messaging() IS 'Returns all active users with their metadata for messaging. Handles is_professional as string or boolean. Accessible by all authenticated users.';
