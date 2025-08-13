-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workouts_updated_at BEFORE UPDATE ON public.workouts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_runs_updated_at BEFORE UPDATE ON public.runs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to calculate pace for runs
CREATE OR REPLACE FUNCTION calculate_pace()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.distance > 0 AND NEW.duration_minutes > 0 THEN
        NEW.pace = NEW.duration_minutes / NEW.distance;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically calculate pace
CREATE TRIGGER calculate_run_pace BEFORE INSERT OR UPDATE ON public.runs
    FOR EACH ROW EXECUTE FUNCTION calculate_pace();
