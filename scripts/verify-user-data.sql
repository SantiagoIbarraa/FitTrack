-- Verification script for user data in Supabase Auth
-- Run this in your Supabase SQL editor to verify user metadata

-- Check if there are any users in the auth.users table
SELECT 
    id,
    email,
    user_metadata,
    created_at
FROM auth.users
ORDER BY created_at DESC;

-- Check specific user metadata fields
SELECT 
    id,
    email,
    user_metadata->>'first_name' as first_name,
    user_metadata->>'last_name' as last_name,
    user_metadata->>'full_name' as full_name,
    user_metadata->>'weight' as weight,
    user_metadata->>'height' as height,
    created_at
FROM auth.users
ORDER BY created_at DESC;

-- Count users with complete profile data
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN user_metadata->>'first_name' IS NOT NULL THEN 1 END) as users_with_first_name,
    COUNT(CASE WHEN user_metadata->>'last_name' IS NOT NULL THEN 1 END) as users_with_last_name,
    COUNT(CASE WHEN user_metadata->>'full_name' IS NOT NULL THEN 1 END) as users_with_full_name,
    COUNT(CASE WHEN user_metadata->>'weight' IS NOT NULL THEN 1 END) as users_with_weight,
    COUNT(CASE WHEN user_metadata->>'height' IS NOT NULL THEN 1 END) as users_with_height
FROM auth.users;
