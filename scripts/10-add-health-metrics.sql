-- Script para agregar métricas de salud avanzadas
-- Ejecuta este script en tu Supabase SQL Editor

-- 1. Agregar campos a user_profiles para datos básicos adicionales
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS profile_photo_url TEXT,
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS sex VARCHAR(10) CHECK (sex IN ('masculino', 'femenino', 'otro'));

-- 2. Agregar campos a user_stats para métricas de salud
ALTER TABLE public.user_stats
ADD COLUMN IF NOT EXISTS heart_rate INTEGER CHECK (heart_rate > 0 AND heart_rate < 300),
ADD COLUMN IF NOT EXISTS systolic_pressure INTEGER CHECK (systolic_pressure > 0 AND systolic_pressure < 300),
ADD COLUMN IF NOT EXISTS diastolic_pressure INTEGER CHECK (diastolic_pressure > 0 AND diastolic_pressure < 200),
ADD COLUMN IF NOT EXISTS bmi DECIMAL(4,2),
ADD COLUMN IF NOT EXISTS bmi_category VARCHAR(50);

-- 3. Crear tabla para historial de métricas de salud (más detallado que user_stats)
CREATE TABLE IF NOT EXISTS public.health_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  weight DECIMAL(5,2),
  heart_rate INTEGER CHECK (heart_rate > 0 AND heart_rate < 300),
  systolic_pressure INTEGER CHECK (systolic_pressure > 0 AND systolic_pressure < 300),
  diastolic_pressure INTEGER CHECK (diastolic_pressure > 0 AND diastolic_pressure < 200),
  bmi DECIMAL(4,2),
  bmi_category VARCHAR(50),
  heart_rate_status VARCHAR(20),
  blood_pressure_status VARCHAR(20),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Habilitar RLS en health_metrics
ALTER TABLE public.health_metrics ENABLE ROW LEVEL SECURITY;

-- 5. Crear políticas RLS para health_metrics
CREATE POLICY "Users can view own health metrics" ON public.health_metrics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own health metrics" ON public.health_metrics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own health metrics" ON public.health_metrics
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own health metrics" ON public.health_metrics
  FOR DELETE USING (auth.uid() = user_id);

-- 6. Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_health_metrics_user_date ON public.health_metrics(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_user_stats_user_date ON public.user_stats(user_id, date DESC);

-- 7. Crear función para calcular IMC automáticamente
CREATE OR REPLACE FUNCTION calculate_bmi(weight_kg DECIMAL, height_cm DECIMAL)
RETURNS DECIMAL AS $$
BEGIN
  IF weight_kg IS NULL OR height_cm IS NULL OR height_cm = 0 THEN
    RETURN NULL;
  END IF;
  RETURN ROUND((weight_kg / POWER(height_cm / 100, 2))::DECIMAL, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 8. Crear función para determinar categoría de IMC según edad y sexo
CREATE OR REPLACE FUNCTION get_bmi_category(
  bmi_value DECIMAL,
  age INTEGER,
  sex_value VARCHAR
)
RETURNS VARCHAR AS $$
DECLARE
  category VARCHAR(50);
BEGIN
  IF bmi_value IS NULL THEN
    RETURN NULL;
  END IF;

  -- Para adultos (18+ años)
  IF age >= 18 THEN
    IF bmi_value < 18.5 THEN
      category := 'Bajo peso';
    ELSIF bmi_value < 25 THEN
      category := 'Peso normal';
    ELSIF bmi_value < 30 THEN
      category := 'Sobrepeso';
    ELSIF bmi_value < 35 THEN
      category := 'Obesidad grado I';
    ELSIF bmi_value < 40 THEN
      category := 'Obesidad grado II';
    ELSE
      category := 'Obesidad grado III';
    END IF;
  -- Para adolescentes y niños (usar percentiles, simplificado aquí)
  ELSE
    IF bmi_value < 16 THEN
      category := 'Bajo peso';
    ELSIF bmi_value < 23 THEN
      category := 'Peso normal';
    ELSIF bmi_value < 27 THEN
      category := 'Sobrepeso';
    ELSE
      category := 'Obesidad';
    END IF;
  END IF;

  RETURN category;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 9. Crear función para evaluar frecuencia cardíaca
CREATE OR REPLACE FUNCTION evaluate_heart_rate(
  heart_rate_value INTEGER,
  age INTEGER
)
RETURNS VARCHAR AS $$
DECLARE
  max_hr INTEGER;
  resting_hr_low INTEGER := 60;
  resting_hr_high INTEGER := 100;
BEGIN
  IF heart_rate_value IS NULL THEN
    RETURN NULL;
  END IF;

  -- Frecuencia cardíaca en reposo
  IF heart_rate_value < 40 THEN
    RETURN 'Muy baja';
  ELSIF heart_rate_value < resting_hr_low THEN
    RETURN 'Baja (atlético)';
  ELSIF heart_rate_value <= resting_hr_high THEN
    RETURN 'Normal';
  ELSIF heart_rate_value <= 120 THEN
    RETURN 'Elevada';
  ELSE
    RETURN 'Muy elevada';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 10. Crear función para evaluar presión arterial
CREATE OR REPLACE FUNCTION evaluate_blood_pressure(
  systolic INTEGER,
  diastolic INTEGER
)
RETURNS VARCHAR AS $$
BEGIN
  IF systolic IS NULL OR diastolic IS NULL THEN
    RETURN NULL;
  END IF;

  -- Según American Heart Association
  IF systolic < 120 AND diastolic < 80 THEN
    RETURN 'Normal';
  ELSIF systolic < 130 AND diastolic < 80 THEN
    RETURN 'Elevada';
  ELSIF systolic < 140 OR diastolic < 90 THEN
    RETURN 'Hipertensión etapa 1';
  ELSIF systolic < 180 OR diastolic < 120 THEN
    RETURN 'Hipertensión etapa 2';
  ELSE
    RETURN 'Crisis hipertensiva';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 11. Crear trigger para calcular IMC automáticamente en health_metrics
CREATE OR REPLACE FUNCTION auto_calculate_health_metrics()
RETURNS TRIGGER AS $$
DECLARE
  user_height DECIMAL;
  user_dob DATE;
  user_sex VARCHAR;
  user_age INTEGER;
BEGIN
  -- Obtener datos del usuario desde user_metadata
  SELECT 
    (raw_user_meta_data->>'height')::DECIMAL,
    (raw_user_meta_data->>'date_of_birth')::DATE,
    (raw_user_meta_data->>'sex')::VARCHAR
  INTO user_height, user_dob, user_sex
  FROM auth.users
  WHERE id = NEW.user_id;

  -- Calcular edad si existe fecha de nacimiento
  IF user_dob IS NOT NULL THEN
    user_age := EXTRACT(YEAR FROM AGE(user_dob));
  END IF;

  -- Calcular IMC si hay peso y altura
  IF NEW.weight IS NOT NULL AND user_height IS NOT NULL THEN
    NEW.bmi := calculate_bmi(NEW.weight, user_height);
    
    -- Determinar categoría de IMC
    IF user_age IS NOT NULL THEN
      NEW.bmi_category := get_bmi_category(NEW.bmi, user_age, user_sex);
    END IF;
  END IF;

  -- Evaluar frecuencia cardíaca
  IF NEW.heart_rate IS NOT NULL AND user_age IS NOT NULL THEN
    NEW.heart_rate_status := evaluate_heart_rate(NEW.heart_rate, user_age);
  END IF;

  -- Evaluar presión arterial
  IF NEW.systolic_pressure IS NOT NULL AND NEW.diastolic_pressure IS NOT NULL THEN
    NEW.blood_pressure_status := evaluate_blood_pressure(NEW.systolic_pressure, NEW.diastolic_pressure);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_calculate_health_metrics
  BEFORE INSERT OR UPDATE ON public.health_metrics
  FOR EACH ROW
  EXECUTE FUNCTION auto_calculate_health_metrics();

-- 12. Comentarios para documentación
COMMENT ON TABLE public.health_metrics IS 'Tabla para almacenar métricas de salud detalladas con timestamps';
COMMENT ON COLUMN public.health_metrics.heart_rate IS 'Frecuencia cardíaca en latidos por minuto';
COMMENT ON COLUMN public.health_metrics.systolic_pressure IS 'Presión arterial sistólica (máxima)';
COMMENT ON COLUMN public.health_metrics.diastolic_pressure IS 'Presión arterial diastólica (mínima)';
COMMENT ON COLUMN public.health_metrics.bmi IS 'Índice de Masa Corporal calculado automáticamente';
COMMENT ON COLUMN public.health_metrics.heart_rate_status IS 'Evaluación automática del estado de la frecuencia cardíaca';
COMMENT ON COLUMN public.health_metrics.blood_pressure_status IS 'Evaluación automática del estado de la presión arterial';

-- Fuentes de referencia para los cálculos:
-- IMC: Organización Mundial de la Salud (OMS) - https://www.who.int/es/news-room/fact-sheets/detail/obesity-and-overweight
-- Presión Arterial: American Heart Association - https://www.heart.org/en/health-topics/high-blood-pressure/understanding-blood-pressure-readings
-- Frecuencia Cardíaca: American Heart Association - https://www.heart.org/en/healthy-living/fitness/fitness-basics/target-heart-rates
