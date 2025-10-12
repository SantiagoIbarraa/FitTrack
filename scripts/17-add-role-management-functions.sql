-- Add functions to manage roles that bypass RLS for specific operations

-- Function to allow users to request professional status
CREATE OR REPLACE FUNCTION public.request_professional_role()
RETURNS JSON AS $$
DECLARE
  current_user_id UUID;
  existing_role TEXT;
  result JSON;
BEGIN
  -- Get current user
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RETURN json_build_object('error', 'No autenticado');
  END IF;
  
  -- Check if user already has a role
  SELECT role INTO existing_role
  FROM public.user_roles
  WHERE user_id = current_user_id;
  
  -- If already professional or admin, return error
  IF existing_role IN ('professional', 'admin') THEN
    RETURN json_build_object('error', 'Ya tienes un rol profesional o de administrador');
  END IF;
  
  -- Insert or update role to professional (pending approval)
  INSERT INTO public.user_roles (user_id, role, is_active)
  VALUES (current_user_id, 'professional', false)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    role = 'professional',
    is_active = false,
    updated_at = NOW();
  
  RETURN json_build_object(
    'success', true, 
    'message', 'Solicitud enviada. Un administrador la revisará pronto.'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to allow admins to change their own role (for testing)
CREATE OR REPLACE FUNCTION public.change_own_role(new_role TEXT)
RETURNS JSON AS $$
DECLARE
  current_user_id UUID;
  is_user_admin BOOLEAN;
  result JSON;
BEGIN
  -- Get current user
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RETURN json_build_object('error', 'No autenticado');
  END IF;
  
  -- Check if user is admin
  is_user_admin := public.is_admin(current_user_id);
  
  -- Only allow admins to change to admin role
  IF new_role = 'admin' AND NOT is_user_admin THEN
    RETURN json_build_object('error', 'No autorizado para asignarte rol de administrador');
  END IF;
  
  -- Validate role
  IF new_role NOT IN ('user', 'professional', 'admin') THEN
    RETURN json_build_object('error', 'Rol inválido');
  END IF;
  
  -- Insert or update role
  INSERT INTO public.user_roles (user_id, role, is_active)
  VALUES (current_user_id, new_role, true)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    role = new_role,
    is_active = true,
    updated_at = NOW();
  
  RETURN json_build_object(
    'success', true, 
    'message', 'Rol cambiado a ' || new_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.request_professional_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.change_own_role(TEXT) TO authenticated;
