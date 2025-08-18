-- Enable RLS (Row Level Security)
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create users profile table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  weight DECIMAL(5,2) NOT NULL CHECK (weight > 0 AND weight <= 999.99),
  height DECIMAL(5,2) NOT NULL CHECK (height > 0 AND height <= 999.99),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create gym_workouts table
CREATE TABLE IF NOT EXISTS public.gym_workouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  exercise_name TEXT NOT NULL,
  weight DECIMAL(6,2) NOT NULL CHECK (weight >= 0),
  repetitions INTEGER NOT NULL CHECK (repetitions > 0),
  sets INTEGER NOT NULL CHECK (sets > 0),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create running_sessions table
CREATE TABLE IF NOT EXISTS public.running_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  duration INTEGER NOT NULL CHECK (duration > 0), -- in minutes
  distance DECIMAL(6,2) NOT NULL CHECK (distance > 0), -- in kilometers
  pace DECIMAL(5,2), -- in minutes per kilometer
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create routines table
CREATE TABLE IF NOT EXISTS public.routines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create routine_exercises table
CREATE TABLE IF NOT EXISTS public.routine_exercises (
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

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.running_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routine_exercises ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_profiles
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create RLS policies for gym_workouts
CREATE POLICY "Users can view own workouts" ON public.gym_workouts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workouts" ON public.gym_workouts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workouts" ON public.gym_workouts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workouts" ON public.gym_workouts
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for running_sessions
CREATE POLICY "Users can view own running sessions" ON public.running_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own running sessions" ON public.running_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own running sessions" ON public.running_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own running sessions" ON public.running_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for routines
CREATE POLICY "Users can view own routines" ON public.routines
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own routines" ON public.routines
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own routines" ON public.routines
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own routines" ON public.routines
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for routine_exercises
CREATE POLICY "Users can view own routine exercises" ON public.routine_exercises
  FOR SELECT USING (auth.uid() IN (
    SELECT user_id FROM public.routines WHERE id = routine_exercises.routine_id
  ));

CREATE POLICY "Users can insert own routine exercises" ON public.routine_exercises
  FOR INSERT WITH CHECK (auth.uid() IN (
    SELECT user_id FROM public.routines WHERE id = routine_exercises.routine_id
  ));

CREATE POLICY "Users can update own routine exercises" ON public.routine_exercises
  FOR UPDATE USING (auth.uid() IN (
    SELECT user_id FROM public.routines WHERE id = routine_exercises.routine_id
  ));

CREATE POLICY "Users can delete own routine exercises" ON public.routine_exercises
  FOR DELETE USING (auth.uid() IN (
    SELECT user_id FROM public.routines WHERE id = routine_exercises.routine_id
  ));

-- Create function to handle updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at on user_profiles
CREATE TRIGGER handle_updated_at_user_profiles
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
