-- Insert admin role for the admin user
-- First, you need to create the user through Supabase Auth with email: juan@ejemplo.com and password: 123456
-- Then run this script to assign the admin role

-- Insert admin role (replace the UUID with the actual user ID after creating the user)
-- You can find the user ID by logging in and checking the auth.users table
INSERT INTO public.user_roles (user_id, role, is_active, approved_at)
SELECT id, 'admin', true, NOW()
FROM auth.users
WHERE email = 'juan@ejemplo.com'
ON CONFLICT (user_id) DO UPDATE
SET role = 'admin', is_active = true, approved_at = NOW();

-- Verify the admin was created
SELECT u.id, u.email, ur.role, ur.is_active
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email = 'juan@ejemplo.com';
