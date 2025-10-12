-- Script para marcar usuarios como profesionales
-- Reemplaza 'email@ejemplo.com' con el email del usuario que quieres marcar como profesional

-- Opción 1: Marcar un usuario específico como profesional por su email
INSERT INTO user_roles (user_id, role, is_professional, is_active)
SELECT 
  id,
  'user',
  true,
  true
FROM auth.users
WHERE email = 'email@ejemplo.com'  -- CAMBIA ESTE EMAIL
ON CONFLICT (user_id) 
DO UPDATE SET 
  is_professional = true,
  is_active = true;

-- Opción 2: Ver todos los usuarios disponibles para marcar como profesionales
-- Ejecuta esta consulta primero para ver qué usuarios tienes
SELECT 
  id,
  email,
  raw_user_meta_data->>'full_name' as nombre
FROM auth.users
ORDER BY created_at DESC;

-- Opción 3: Marcar TODOS los usuarios como profesionales (solo para pruebas)
-- ¡CUIDADO! Esto marca a todos como profesionales
-- INSERT INTO user_roles (user_id, role, is_professional, is_active)
-- SELECT 
--   id,
--   'user',
--   true,
--   true
-- FROM auth.users
-- ON CONFLICT (user_id) 
-- DO UPDATE SET 
--   is_professional = true,
--   is_active = true;
