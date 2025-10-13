-- Create gym_exercises table for admin-managed exercises
CREATE TABLE IF NOT EXISTS gym_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Pecho', 'Bíceps', 'Tríceps', 'Hombros', 'Pierna', 'Espalda', 'Otros')),
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster category queries
CREATE INDEX IF NOT EXISTS idx_gym_exercises_category ON gym_exercises(category);

-- Enable RLS
ALTER TABLE gym_exercises ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read exercises
CREATE POLICY "Anyone can view gym exercises"
  ON gym_exercises
  FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can insert, update, or delete exercises
CREATE POLICY "Only admins can manage gym exercises"
  ON gym_exercises
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Insert some default exercises
INSERT INTO gym_exercises (name, category, description) VALUES
  -- Pecho
  ('Press de Banca', 'Pecho', 'Ejercicio básico para pecho con barra'),
  ('Press Inclinado', 'Pecho', 'Press de banca en banco inclinado'),
  ('Aperturas con Mancuernas', 'Pecho', 'Aperturas para pecho'),
  ('Fondos en Paralelas', 'Pecho', 'Fondos para pecho y tríceps'),
  
  -- Bíceps
  ('Curl con Barra', 'Bíceps', 'Curl de bíceps con barra recta'),
  ('Curl con Mancuernas', 'Bíceps', 'Curl alternado con mancuernas'),
  ('Curl Martillo', 'Bíceps', 'Curl con agarre neutro'),
  ('Curl en Banco Scott', 'Bíceps', 'Curl concentrado en banco'),
  
  -- Tríceps
  ('Press Francés', 'Tríceps', 'Extensión de tríceps acostado'),
  ('Fondos para Tríceps', 'Tríceps', 'Fondos en banco'),
  ('Extensión en Polea', 'Tríceps', 'Extensión de tríceps en polea alta'),
  ('Patada de Tríceps', 'Tríceps', 'Extensión con mancuerna'),
  
  -- Hombros
  ('Press Militar', 'Hombros', 'Press de hombros con barra'),
  ('Elevaciones Laterales', 'Hombros', 'Elevaciones laterales con mancuernas'),
  ('Elevaciones Frontales', 'Hombros', 'Elevaciones frontales'),
  ('Pájaros', 'Hombros', 'Elevaciones posteriores'),
  
  -- Pierna
  ('Sentadilla', 'Pierna', 'Sentadilla con barra'),
  ('Prensa de Pierna', 'Pierna', 'Press de piernas en máquina'),
  ('Peso Muerto', 'Pierna', 'Peso muerto convencional'),
  ('Zancadas', 'Pierna', 'Zancadas con mancuernas'),
  ('Extensión de Cuádriceps', 'Pierna', 'Extensión en máquina'),
  ('Curl Femoral', 'Pierna', 'Curl de piernas acostado'),
  ('Elevación de Gemelos', 'Pierna', 'Elevación de pantorrillas'),
  
  -- Espalda
  ('Dominadas', 'Espalda', 'Dominadas con peso corporal'),
  ('Remo con Barra', 'Espalda', 'Remo inclinado con barra'),
  ('Remo con Mancuerna', 'Espalda', 'Remo a una mano'),
  ('Jalón al Pecho', 'Espalda', 'Jalón en polea alta'),
  ('Peso Muerto Rumano', 'Espalda', 'Peso muerto para espalda baja'),
  
  -- Otros
  ('Plancha', 'Otros', 'Plancha abdominal'),
  ('Abdominales', 'Otros', 'Crunch abdominal'),
  ('Cardio', 'Otros', 'Ejercicio cardiovascular');
