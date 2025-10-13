-- Fix RLS policies for conversations table to allow upsert operations

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can update conversations" ON public.conversations;

-- Recreate INSERT policy
CREATE POLICY "Users can create conversations" ON public.conversations
  FOR INSERT WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Add UPDATE policy to allow upsert operations
CREATE POLICY "Users can update conversations" ON public.conversations
  FOR UPDATE USING (auth.uid() = user1_id OR auth.uid() = user2_id)
  WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);
