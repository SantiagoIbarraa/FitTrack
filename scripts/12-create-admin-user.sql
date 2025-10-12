-- Insert admin user role
-- Note: This assumes the admin user has already been created through Supabase Auth
-- Email: juan@ejemplo.com
-- Password: 123456

-- First, you need to create the user through Supabase Auth UI or sign up
-- Then run this script to assign admin role

-- Get the user ID for juan@ejemplo.com and assign admin role
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Get the user ID from auth.users
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'juan@ejemplo.com';

  -- If user exists, insert admin role
  IF admin_user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role, is_active, approved_at)
    VALUES (admin_user_id, 'admin', true, NOW())
    ON CONFLICT (user_id) DO UPDATE
    SET role = 'admin', is_active = true, approved_at = NOW();
    
    RAISE NOTICE 'Admin role assigned to user: %', admin_user_id;
  ELSE
    RAISE NOTICE 'User with email juan@ejemplo.com not found. Please create the user first.';
  END IF;
END $$;

-- Insert default user role for all existing users without a role
INSERT INTO public.user_roles (user_id, role, is_active)
SELECT id, 'user', true
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_roles)
ON CONFLICT (user_id) DO NOTHING;
