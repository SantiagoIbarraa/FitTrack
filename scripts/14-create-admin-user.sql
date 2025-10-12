-- Create admin user with email juan@ejemplo.com
-- Note: First create the user through Supabase Auth, then run this script

-- Update existing user to admin role or create profile if needed
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Get the user ID from auth.users
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'juan@ejemplo.com';

  -- If user exists, update their role to admin
  IF admin_user_id IS NOT NULL THEN
    UPDATE public.user_profiles
    SET role = 'admin', 
        is_active = true, 
        approved_at = NOW()
    WHERE id = admin_user_id;
    
    -- If no rows were updated, the profile doesn't exist yet
    IF NOT FOUND THEN
      RAISE NOTICE 'User profile not found for juan@ejemplo.com. Please ensure the user has completed registration.';
    ELSE
      RAISE NOTICE 'Admin role assigned to user: %', admin_user_id;
    END IF;
  ELSE
    RAISE NOTICE 'User with email juan@ejemplo.com not found in auth.users. Please create the user first through sign up.';
  END IF;
END $$;
