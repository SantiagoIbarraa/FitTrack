/*
  # Sistema de Roles y Mensajería entre Usuarios y Profesionales

  ## Descripción
  Implementa un sistema completo de roles de usuario (admin, profesional, usuario) y 
  mensajería entre usuarios y profesionales aprobados por administradores.

  ## 1. Nuevas Tablas
  
  ### `user_roles`
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `role` (text: 'admin', 'professional', 'user')
  - `is_approved` (boolean) - Si el rol profesional está aprobado por admin
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `conversations`
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users) - Usuario normal
  - `professional_id` (uuid, references auth.users) - Profesional
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `messages`
  - `id` (uuid, primary key)
  - `conversation_id` (uuid, references conversations)
  - `sender_id` (uuid, references auth.users)
  - `content` (text)
  - `is_read` (boolean)
  - `created_at` (timestamptz)

  ## 2. Modificaciones
  - Se crea automáticamente un rol 'user' para todos los usuarios nuevos mediante trigger
  - Se establece juan@ejemplo.com como administrador inicial

  ## 3. Seguridad (RLS)
  - Todas las tablas tienen RLS habilitado
  - Usuarios solo pueden ver sus propios roles
  - Administradores pueden ver y modificar todos los roles
  - Solo administradores pueden aprobar profesionales
  - Usuarios solo pueden ver conversaciones y mensajes donde participan
  - Solo profesionales aprobados aparecen en listados para usuarios normales

  ## 4. Índices
  - Índices en user_id para user_roles
  - Índices en conversation_id y sender_id para messages
  - Índices compuestos para optimizar consultas
*/

-- Crear tabla de roles de usuario
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'professional', 'user')),
  is_approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);
CREATE INDEX IF NOT EXISTS idx_user_roles_approved ON user_roles(role, is_approved) WHERE role = 'professional';

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own role"
  ON user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON user_roles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all roles"
  ON user_roles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert roles"
  ON user_roles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Crear tabla de conversaciones
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  professional_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, professional_id)
);

CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_professional_id ON conversations(professional_id);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations"
  ON conversations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = professional_id);

CREATE POLICY "Users can create conversations with approved professionals"
  ON conversations FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = professional_id
      AND role = 'professional'
      AND is_approved = true
    )
  );

-- Crear tabla de mensajes
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(conversation_id, created_at DESC);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in own conversations"
  ON messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.user_id = auth.uid() OR conversations.professional_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages in own conversations"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = conversation_id
      AND (conversations.user_id = auth.uid() OR conversations.professional_id = auth.uid())
    )
  );

CREATE POLICY "Users can mark messages as read in own conversations"
  ON messages FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.user_id = auth.uid() OR conversations.professional_id = auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.user_id = auth.uid() OR conversations.professional_id = auth.uid())
    )
  );

-- Función para crear rol de usuario automáticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role, is_approved)
  VALUES (NEW.id, 'user', true);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear rol automáticamente al registrarse
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_roles_updated_at'
  ) THEN
    CREATE TRIGGER update_user_roles_updated_at
      BEFORE UPDATE ON user_roles
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_conversations_updated_at'
  ) THEN
    CREATE TRIGGER update_conversations_updated_at
      BEFORE UPDATE ON conversations
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Asignar rol de admin a juan@ejemplo.com si existe
DO $$
DECLARE
  juan_user_id uuid;
BEGIN
  SELECT id INTO juan_user_id
  FROM auth.users
  WHERE email = 'juan@ejemplo.com';
  
  IF juan_user_id IS NOT NULL THEN
    INSERT INTO user_roles (user_id, role, is_approved)
    VALUES (juan_user_id, 'admin', true)
    ON CONFLICT (user_id) 
    DO UPDATE SET role = 'admin', is_approved = true, updated_at = now();
  END IF;
END $$;
