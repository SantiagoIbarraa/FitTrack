# Instrucciones para Configurar la Base de Datos en Supabase

## Script SQL Principal a Ejecutar

Debes ejecutar el siguiente script en tu **Supabase SQL Editor** para agregar todas las funcionalidades de salud:

### Archivo: `scripts/10-add-health-metrics.sql`

Este script incluye:

1. **Campos adicionales en user_profiles:**
   - `profile_photo_url` - URL de la foto de perfil (opcional)
   - `date_of_birth` - Fecha de nacimiento para calcular edad
   - `sex` - Sexo (masculino/femenino/otro) para cálculos de IMC diferenciados

2. **Campos adicionales en user_stats:**
   - `heart_rate` - Frecuencia cardíaca en latidos por minuto
   - `systolic_pressure` - Presión arterial sistólica
   - `diastolic_pressure` - Presión arterial diastólica
   - `bmi` - Índice de Masa Corporal (calculado automáticamente)
   - `bmi_category` - Categoría de IMC (calculada automáticamente)

3. **Nueva tabla health_metrics:**
   - Tabla dedicada para historial detallado de métricas de salud
   - Incluye todos los campos anteriores más timestamps y notas
   - Políticas RLS configuradas para seguridad

4. **Funciones SQL automáticas:**
   - `calculate_bmi()` - Calcula IMC automáticamente
   - `get_bmi_category()` - Determina categoría según edad y sexo
   - `evaluate_heart_rate()` - Evalúa si la frecuencia cardíaca es normal
   - `evaluate_blood_pressure()` - Evalúa si la presión arterial es normal

5. **Triggers automáticos:**
   - Calcula IMC automáticamente al insertar/actualizar métricas
   - Evalúa estado de salud automáticamente
   - Determina categoría de IMC según edad y sexo

6. **Índices para rendimiento:**
   - Optimización de consultas por usuario y fecha

## Configuración de Storage para Fotos de Perfil

Además del script SQL, necesitas crear un bucket de almacenamiento en Supabase:

1. Ve a **Storage** en tu panel de Supabase
2. Crea un nuevo bucket llamado `avatars`
3. Configura el bucket como **público**
4. Configura las políticas de acceso:
   - **SELECT**: Permitir acceso público
   - **INSERT**: Solo usuarios autenticados
   - **UPDATE**: Solo el propietario
   - **DELETE**: Solo el propietario

## Orden de Ejecución

Si es la primera vez que configuras la base de datos, ejecuta los scripts en este orden:

1. `scripts/01-create-user-schema.sql` (si no lo has ejecutado)
2. `scripts/05-create-user-stats-table.sql` (si no lo has ejecutado)
3. **`scripts/10-add-health-metrics.sql`** ← NUEVO (ejecuta este ahora)

## Verificación

Después de ejecutar el script, verifica que:

1. Las tablas `user_profiles`, `user_stats` y `health_metrics` existan
2. Las funciones SQL estén creadas (revisa en Database > Functions)
3. Los triggers estén activos (revisa en Database > Triggers)
4. Las políticas RLS estén configuradas (revisa en Authentication > Policies)

## Fuentes de Referencia

Los cálculos y evaluaciones están basados en:

- **IMC**: Organización Mundial de la Salud (OMS)
  - https://www.who.int/es/news-room/fact-sheets/detail/obesity-and-overweight

- **Presión Arterial**: American Heart Association
  - https://www.heart.org/en/health-topics/high-blood-pressure/understanding-blood-pressure-readings

- **Frecuencia Cardíaca**: American Heart Association
  - https://www.heart.org/en/healthy-living/fitness/fitness-basics/target-heart-rates

## Soporte

Si encuentras algún error al ejecutar el script:

1. Verifica que las tablas `user_profiles` y `user_stats` existan
2. Asegúrate de tener permisos de administrador en Supabase
3. Revisa los mensajes de error en el SQL Editor
4. Si una columna ya existe, puedes comentar esa línea específica del script
