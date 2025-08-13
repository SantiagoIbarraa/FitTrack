-- Insert a default user for the application without authentication
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'default@pregister.app',
  '$2a$10$dummy.encrypted.password.hash.for.default.user',
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Usuario por Defecto"}',
  false,
  'authenticated'
) ON CONFLICT (id) DO NOTHING;
