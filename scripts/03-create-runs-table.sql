-- Create runs table for running sessions
CREATE TABLE IF NOT EXISTS public.runs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  distance DECIMAL(6,2) NOT NULL, -- in km
  duration_minutes INTEGER NOT NULL, -- total time in minutes
  pace DECIMAL(4,2), -- minutes per km (calculated)
  calories_burned INTEGER,
  route_name TEXT,
  notes TEXT,
  weather TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.runs ENABLE ROW LEVEL SECURITY;

-- Policies for runs
CREATE POLICY "Users can view own runs" ON public.runs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own runs" ON public.runs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own runs" ON public.runs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own runs" ON public.runs
  FOR DELETE USING (auth.uid() = user_id);
