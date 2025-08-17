/*
  # Agregar columna de imagen a routine_exercises

  1. Modificaciones a la tabla
    - Agregar columna `image_url` a la tabla `routine_exercises`
    - La columna es opcional (nullable) para mantener compatibilidad con datos existentes
  
  2. Verificación
    - Verificar que la columna se agregó correctamente
*/

-- Agregar columna image_url a la tabla routine_exercises
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'routine_exercises' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE public.routine_exercises ADD COLUMN image_url TEXT;
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
AND table_name = 'routine_exercises'
ORDER BY ordinal_position;