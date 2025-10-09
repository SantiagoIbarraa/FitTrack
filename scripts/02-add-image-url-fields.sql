-- Add image_url field to gym_workouts table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'gym_workouts' 
        AND column_name = 'image_url'
    ) THEN
        ALTER TABLE public.gym_workouts ADD COLUMN image_url TEXT;
    END IF;
END $$;

-- Add image_url field to routine_exercises table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'routine_exercises' 
        AND column_name = 'image_url'
    ) THEN
        ALTER TABLE public.routine_exercises ADD COLUMN image_url TEXT;
    END IF;
END $$;
