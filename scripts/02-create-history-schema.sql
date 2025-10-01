-- Create workout history table
CREATE TABLE IF NOT EXISTS workout_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  exercise_name TEXT NOT NULL,
  weight DECIMAL(5,2) NOT NULL CHECK (weight > 0),
  reps INTEGER NOT NULL CHECK (reps > 0),
  sets INTEGER NOT NULL CHECK (sets > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create running history table
CREATE TABLE IF NOT EXISTS running_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  duration INTEGER NOT NULL CHECK (duration > 0), -- in minutes
  distance DECIMAL(6,2) NOT NULL CHECK (distance > 0), -- in kilometers
  pace DECIMAL(4,2) NOT NULL CHECK (pace > 0), -- minutes per kilometer
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_workout_history_user_id ON workout_history(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_history_created_at ON workout_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_workout_history_exercise_name ON workout_history(exercise_name);
CREATE INDEX IF NOT EXISTS idx_workout_history_user_exercise ON workout_history(user_id, exercise_name);

CREATE INDEX IF NOT EXISTS idx_running_history_user_id ON running_history(user_id);
CREATE INDEX IF NOT EXISTS idx_running_history_created_at ON running_history(created_at DESC);

-- Enable RLS
ALTER TABLE workout_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE running_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for workout_history
CREATE POLICY "Users can view their own workout history" ON workout_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own workout history" ON workout_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workout history" ON workout_history
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workout history" ON workout_history
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for running_history
CREATE POLICY "Users can view their own running history" ON running_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own running history" ON running_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own running history" ON running_history
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own running history" ON running_history
  FOR DELETE USING (auth.uid() = user_id);

-- Create triggers to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_workout_history_updated_at 
  BEFORE UPDATE ON workout_history 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_running_history_updated_at 
  BEFORE UPDATE ON running_history 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
