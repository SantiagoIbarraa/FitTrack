-- Modificar la función para agregar al historial también en actualizaciones
CREATE OR REPLACE FUNCTION add_to_exercise_history_on_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo agregar al historial si el peso cambió
  IF (TG_OP = 'UPDATE' AND (OLD.weight_kg IS DISTINCT FROM NEW.weight_kg OR 
                             OLD.repetitions IS DISTINCT FROM NEW.repetitions OR 
                             OLD.sets IS DISTINCT FROM NEW.sets)) OR
     (TG_OP = 'INSERT' AND (NEW.weight_kg IS NOT NULL OR NEW.repetitions IS NOT NULL)) THEN
    INSERT INTO exercise_history (
      user_id,
      exercise_name,
      weight_kg,
      repetitions,
      sets,
      created_at
    ) VALUES (
      NEW.user_id,
      NEW.exercise_name,
      NEW.weight_kg,
      NEW.repetitions,
      NEW.sets,
      NOW()
    );
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Eliminar trigger anterior si existe
DROP TRIGGER IF EXISTS auto_add_to_exercise_history ON gym_workouts;

-- Crear trigger para INSERT y UPDATE en gym_workouts
CREATE TRIGGER auto_add_to_exercise_history
  AFTER INSERT OR UPDATE ON gym_workouts
  FOR EACH ROW EXECUTE FUNCTION add_to_exercise_history_on_update();

-- Crear función similar para routine_exercises
CREATE OR REPLACE FUNCTION add_routine_exercise_to_history()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo agregar al historial si tiene datos de peso o repeticiones
  IF (TG_OP = 'UPDATE' AND (OLD.weight IS DISTINCT FROM NEW.weight OR 
                             OLD.repetitions IS DISTINCT FROM NEW.repetitions OR 
                             OLD.sets IS DISTINCT FROM NEW.sets)) OR
     (TG_OP = 'INSERT' AND (NEW.weight IS NOT NULL OR NEW.repetitions IS NOT NULL)) THEN
    INSERT INTO exercise_history (
      user_id,
      exercise_name,
      weight_kg,
      repetitions,
      sets,
      created_at
    ) VALUES (
      (SELECT user_id FROM routines WHERE id = NEW.routine_id),
      NEW.exercise_name,
      NEW.weight,
      NEW.repetitions,
      NEW.sets,
      NOW()
    );
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear trigger para INSERT y UPDATE en routine_exercises
CREATE TRIGGER auto_add_routine_exercise_to_history
  AFTER INSERT OR UPDATE ON routine_exercises
  FOR EACH ROW EXECUTE FUNCTION add_routine_exercise_to_history();
