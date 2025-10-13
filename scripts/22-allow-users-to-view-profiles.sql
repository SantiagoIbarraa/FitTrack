-- Allow all authenticated users to view basic profile information of other users
-- This is needed for the messaging system where users need to see who they can chat with

-- Drop the existing policy if it exists
DROP POLICY IF EXISTS "Users can view all active profiles" ON public.user_profiles;

-- Create a new policy that allows all authenticated users to view basic profile info
CREATE POLICY "Users can view all active profiles" ON public.user_profiles
  FOR SELECT USING (
    -- Users can always see their own profile
    auth.uid() = id 
    OR 
    -- Users can see other active users' profiles
    (is_active = true AND auth.uid() IS NOT NULL)
  );

-- Create a function to get all active users for messaging
-- This function is accessible to all authenticated users
CREATE OR REPLACE FUNCTION get_all_active_users_for_messaging()
RETURNS TABLE (
  id uuid,
  full_name text,
  role text,
  is_professional boolean,
  is_active boolean
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Return all active users
  RETURN QUERY
  SELECT 
    up.id,
    up.full_name,
    up.role,
    up.is_professional,
    up.is_active
  FROM user_profiles up
  WHERE up.is_active = true
    AND up.id != auth.uid() -- Exclude the current user
  ORDER BY up.full_name;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_all_active_users_for_messaging() TO authenticated;

COMMENT ON FUNCTION get_all_active_users_for_messaging() IS 'Returns all active users for messaging. Accessible by all authenticated users.';
