-- Crear tabla de historial de ejercicios
CREATE TABLE IF NOT EXISTS exercise_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  exercise_name TEXT NOT NULL,
  weight_kg DECIMAL(6,2), -- Peso en kilogramos
  repetitions INTEGER, -- Número de repeticiones
  sets INTEGER, -- Número de series
  notes TEXT, -- Notas adicionales
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_exercise_history_user_id ON exercise_history(user_id);
CREATE INDEX IF NOT EXISTS idx_exercise_history_created_at ON exercise_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_exercise_history_exercise_name ON exercise_history(exercise_name);
CREATE INDEX IF NOT EXISTS idx_exercise_history_user_exercise ON exercise_history(user_id, exercise_name);

-- Habilitar RLS (Row Level Security)
ALTER TABLE exercise_history ENABLE ROW LEVEL SECURITY;

-- Crear políticas RLS para exercise_history
CREATE POLICY "Users can view their own exercise history" ON exercise_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own exercise history" ON exercise_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own exercise history" ON exercise_history
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own exercise history" ON exercise_history
  FOR DELETE USING (auth.uid() = user_id);

-- Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear trigger para actualizar updated_at
CREATE TRIGGER update_exercise_history_updated_at 
  BEFORE UPDATE ON exercise_history 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para agregar entrada al historial automáticamente
CREATE OR REPLACE FUNCTION add_to_exercise_history()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo agregar al historial si tiene datos de peso o repeticiones
  IF NEW.weight_kg IS NOT NULL OR NEW.repetitions IS NOT NULL THEN
    INSERT INTO exercise_history (
      user_id,
      exercise_name,
      weight_kg,
      repetitions,
      sets,
      created_at
    ) VALUES (
      NEW.user_id,
      NEW.exercise_name,
      NEW.weight_kg,
      NEW.repetitions,
      NEW.sets,
      NEW.created_at
    );
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear trigger para agregar automáticamente al historial cuando se crea un workout
CREATE TRIGGER auto_add_to_exercise_history
  AFTER INSERT ON gym_workouts
  FOR EACH ROW EXECUTE FUNCTION add_to_exercise_history();
