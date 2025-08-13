-- Verification script for gym_workouts table
-- Run this in your Supabase SQL editor to verify the table structure

-- Check if the table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'gym_workouts'
) as table_exists;

-- Show table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'gym_workouts'
ORDER BY ordinal_position;

-- Check RLS policies
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'gym_workouts';

-- Test insert (this will fail if RLS is working correctly without auth)
-- INSERT INTO public.gym_workouts (exercise_name, weight_kg, repetitions, sets) 
-- VALUES ('Test Exercise', 50, 10, 3);
