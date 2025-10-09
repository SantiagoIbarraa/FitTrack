/*
  # Agregar columna de imagen a gym_workouts

  1. Modificaciones a la tabla
    - Agregar columna `image_url` a la tabla `gym_workouts`
    - La columna es opcional (nullable) para mantener compatibilidad con datos existentes
  
  2. Verificación
    - Verificar que la columna se agregó correctamente
*/

-- Agregar columna image_url a la tabla gym_workouts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gym_workouts' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE public.gym_workouts ADD COLUMN image_url TEXT;
  END IF;
END $$;

-- Verificar que la columna se agregó correctamente
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'gym_workouts'
ORDER BY ordinal_position;
