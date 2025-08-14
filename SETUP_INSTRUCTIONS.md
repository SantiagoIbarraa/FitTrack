# Instrucciones de Configuración de la Base de Datos

## Problema Actual
Estás experimentando un error al guardar ejercicios. Esto probablemente se debe a que la tabla `gym_workouts` no existe en tu base de datos de Supabase o no tiene la estructura correcta.

## Solución

### Paso 1: Acceder a Supabase
1. Ve a [supabase.com](https://supabase.com)
2. Inicia sesión en tu cuenta
3. Selecciona tu proyecto `pregister`

### Paso 2: Ejecutar el Esquema de la Base de Datos
1. En el panel de Supabase, ve a **SQL Editor**
2. Haz clic en **New Query**
3. Copia y pega el contenido del archivo `scripts/01-create-database-schema.sql`
4. Haz clic en **Run** para ejecutar el script

### Paso 3: Verificar la Estructura
1. En el panel de Supabase, ve a **Table Editor**
2. Deberías ver las siguientes tablas:
   - `gym_workouts`
   - `running_sessions`
   - `meals`

### Paso 4: Verificar las Políticas de Seguridad
1. En **Table Editor**, haz clic en la tabla `gym_workouts`
2. Ve a la pestaña **Policies**
3. Deberías ver 4 políticas de RLS:
   - "Usuarios pueden ver sus propios entrenamientos"
   - "Usuarios pueden insertar sus propios entrenamientos"
   - "Usuarios pueden modificar sus propios entrenamientos"
   - "Usuarios pueden eliminar sus propios entrenamientos"

### Paso 5: Probar la Aplicación
1. Regresa a tu aplicación
2. Intenta agregar un nuevo ejercicio
3. Verifica que no aparezcan errores en la consola del navegador

## Estructura Esperada de las Tablas

### Tabla `gym_workouts`
```sql
Column Name    | Data Type                    | Nullable | Default
---------------|------------------------------|----------|----------
id             | uuid                         | NOT NULL | uuid_generate_v4()
user_id        | uuid                         | NOT NULL | 
exercise_name  | text                         | NOT NULL | 
weight_kg      | numeric(5,2)                 | NULL     | 
repetitions    | integer                      | NULL     | 
sets           | integer                      | NULL     | 
created_at     | timestamp with time zone     | NOT NULL | now()
```

### Tabla `running_sessions`
```sql
Column Name      | Data Type                    | Nullable | Default
-----------------|------------------------------|----------|----------
id               | uuid                         | NOT NULL | uuid_generate_v4()
user_id          | uuid                         | NOT NULL | 
duration_minutes | integer                      | NOT NULL | 
distance_km      | numeric(5,2)                 | NOT NULL | 
pace_min_km      | numeric(5,2)                 | NULL     | 
created_at       | timestamp with time zone     | NOT NULL | now()
```

## Si el Problema Persiste

Si después de ejecutar el esquema sigues teniendo problemas:

1. **Verifica los logs**: Abre la consola del navegador (F12) y mira si hay errores específicos
2. **Verifica la autenticación**: Asegúrate de estar logueado en la aplicación
3. **Verifica la conexión**: Confirma que las credenciales de Supabase en `lib/supabase/server.ts` son correctas

## Problema del Nombre del Usuario

Si tu nombre no aparece correctamente en la aplicación:

1. **Verifica los datos del usuario**: Ejecuta el script `scripts/verify-user-data.sql` en el SQL Editor de Supabase
2. **Actualiza tu perfil**: Ve a la página de perfil (/profile) y actualiza tu información
3. **Verifica el registro**: Si te registraste antes de estos cambios, es posible que necesites actualizar tu perfil

## Comandos de Verificación

Puedes ejecutar estos comandos en el SQL Editor de Supabase para verificar:

```sql
-- Verificar si las tablas existen
SELECT 
    table_name,
    EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = t.table_name
    ) as table_exists
FROM (VALUES ('gym_workouts'), ('running_sessions'), ('meals')) as t(table_name);

-- Ver la estructura de la tabla gym_workouts
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'gym_workouts'
ORDER BY ordinal_position;

-- Ver la estructura de la tabla running_sessions
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'running_sessions'
ORDER BY ordinal_position;
```
