-- Verificar y crear las tablas de rutinas si no existen
-- Este script debe ejecutarse en Supabase SQL Editor

-- Verificar si la tabla routines existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'routines') THEN
        -- Crear tabla routines
        CREATE TABLE public.routines (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
        );
        
        RAISE NOTICE 'Tabla routines creada exitosamente';
    ELSE
        RAISE NOTICE 'Tabla routines ya existe';
    END IF;
END $$;

-- Verificar si la tabla routine_exercises existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'routine_exercises') THEN
        -- Crear tabla routine_exercises
        CREATE TABLE public.routine_exercises (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            routine_id UUID REFERENCES public.routines(id) ON DELETE CASCADE NOT NULL,
            exercise_name TEXT NOT NULL,
            weight DECIMAL(6,2) NOT NULL CHECK (weight >= 0),
            repetitions INTEGER NOT NULL CHECK (repetitions > 0),
            sets INTEGER NOT NULL CHECK (sets > 0),
            image_url TEXT,
            order_index INTEGER NOT NULL DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
        );
        
        RAISE NOTICE 'Tabla routine_exercises creada exitosamente';
    ELSE
        RAISE NOTICE 'Tabla routine_exercises ya existe';
    END IF;
END $$;

-- Habilitar RLS en las tablas
ALTER TABLE public.routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routine_exercises ENABLE ROW LEVEL SECURITY;

-- Crear políticas RLS para routines si no existen
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'routines' AND policyname = 'Users can view own routines') THEN
        CREATE POLICY "Users can view own routines" ON public.routines
            FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'routines' AND policyname = 'Users can insert own routines') THEN
        CREATE POLICY "Users can insert own routines" ON public.routines
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'routines' AND policyname = 'Users can update own routines') THEN
        CREATE POLICY "Users can update own routines" ON public.routines
            FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'routines' AND policyname = 'Users can delete own routines') THEN
        CREATE POLICY "Users can delete own routines" ON public.routines
            FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Crear políticas RLS para routine_exercises si no existen
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'routine_exercises' AND policyname = 'Users can view own routine exercises') THEN
        CREATE POLICY "Users can view own routine exercises" ON public.routine_exercises
            FOR SELECT USING (auth.uid() IN (
                SELECT user_id FROM public.routines WHERE id = routine_exercises.routine_id
            ));
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'routine_exercises' AND policyname = 'Users can insert own routine exercises') THEN
        CREATE POLICY "Users can insert own routine exercises" ON public.routine_exercises
            FOR INSERT WITH CHECK (auth.uid() IN (
                SELECT user_id FROM public.routines WHERE id = routine_exercises.routine_id
            ));
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'routine_exercises' AND policyname = 'Users can update own routine exercises') THEN
        CREATE POLICY "Users can update own routine exercises" ON public.routine_exercises
            FOR UPDATE USING (auth.uid() IN (
                SELECT user_id FROM public.routines WHERE id = routine_exercises.routine_id
            ));
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'routine_exercises' AND policyname = 'Users can delete own routine exercises') THEN
        CREATE POLICY "Users can delete own routine exercises" ON public.routine_exercises
            FOR DELETE USING (auth.uid() IN (
                SELECT user_id FROM public.routines WHERE id = routine_exercises.routine_id
            ));
    END IF;
END $$;

-- Verificar que las tablas existen y tienen la estructura correcta
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('routines', 'routine_exercises')
ORDER BY table_name, ordinal_position;

-- Verificar que las políticas RLS están activas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('routines', 'routine_exercises');
