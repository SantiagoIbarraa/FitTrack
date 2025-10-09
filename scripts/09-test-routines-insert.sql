-- Script de prueba para verificar la funcionalidad de rutinas
-- Ejecutar después de crear las tablas y políticas RLS

-- 1. Verificar que las tablas existen
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('routines', 'routine_exercises');

-- 2. Verificar la estructura de la tabla routines
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'routines'
ORDER BY ordinal_position;

-- 3. Verificar que RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('routines', 'routine_exercises');

-- 4. Verificar las políticas RLS
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

-- 5. Verificar que el usuario actual puede acceder a las tablas
-- (Ejecutar esto cuando estés autenticado)
SELECT 
    current_user,
    session_user,
    auth.uid() as current_auth_uid;

-- 6. Intentar una inserción de prueba (solo si estás autenticado)
-- INSERT INTO public.routines (user_id, name, description) 
-- VALUES (auth.uid(), 'Rutina de Prueba', 'Esta es una rutina de prueba');

-- 7. Verificar que la inserción funcionó
-- SELECT * FROM public.routines WHERE name = 'Rutina de Prueba';

-- 8. Limpiar la rutina de prueba
-- DELETE FROM public.routines WHERE name = 'Rutina de Prueba';
