-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;

-- Create a security definer function to check if user is admin
-- This bypasses RLS and prevents infinite recursion
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM public.user_roles
  WHERE user_id = check_user_id;
  
  RETURN user_role = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create new policies using the security definer function
CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT USING (
    public.is_admin(auth.uid())
  );

CREATE POLICY "Admins can update roles" ON public.user_roles
  FOR UPDATE USING (
    public.is_admin(auth.uid())
  );

CREATE POLICY "Admins can insert roles" ON public.user_roles
  FOR INSERT WITH CHECK (
    public.is_admin(auth.uid())
  );

-- Grant execute permission on the function to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated;
