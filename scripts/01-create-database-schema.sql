-- PRegister Database Schema
-- Fitness tracking application with gym workouts, running sessions, and AI meal recommendations

-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- Tabla: entrenamientos de gimnasio
create table public.gym_workouts (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users(id) on delete cascade,
    exercise_name text not null,
    weight_kg numeric(5,2),
    repetitions integer,
    sets integer,
    created_at timestamp with time zone default now()
);

-- Tabla: sesiones de running
create table public.running_sessions (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users(id) on delete cascade,
    duration_minutes integer not null,
    distance_km numeric(5,2) not null,
    pace_min_km numeric(5,2),
    created_at timestamp with time zone default now()
);

-- Tabla: comidas registradas / recomendaciones IA
create table public.meals (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users(id) on delete cascade,
    meal_description text not null,
    ai_keywords text[],
    ai_suggested_diet text,
    created_at timestamp with time zone default now()
);

-- Activar Row Level Security (RLS)
alter table public.gym_workouts enable row level security;
alter table public.running_sessions enable row level security;
alter table public.meals enable row level security;

-- Políticas RLS para gym_workouts
create policy "Usuarios pueden ver sus propios entrenamientos"
on public.gym_workouts
for select using (auth.uid() = user_id);

create policy "Usuarios pueden insertar sus propios entrenamientos"
on public.gym_workouts
for insert with check (auth.uid() = user_id);

create policy "Usuarios pueden modificar sus propios entrenamientos"
on public.gym_workouts
for update using (auth.uid() = user_id);

create policy "Usuarios pueden eliminar sus propios entrenamientos"
on public.gym_workouts
for delete using (auth.uid() = user_id);

-- Políticas RLS para running_sessions
create policy "Usuarios pueden ver sus propias sesiones de running"
on public.running_sessions
for select using (auth.uid() = user_id);

create policy "Usuarios pueden insertar sus propias sesiones de running"
on public.running_sessions
for insert with check (auth.uid() = user_id);

create policy "Usuarios pueden modificar sus propias sesiones de running"
on public.running_sessions
for update using (auth.uid() = user_id);

create policy "Usuarios pueden eliminar sus propias sesiones de running"
on public.running_sessions
for delete using (auth.uid() = user_id);

-- Políticas RLS para meals
create policy "Usuarios pueden ver sus propias comidas"
on public.meals
for select using (auth.uid() = user_id);

create policy "Usuarios pueden insertar sus propias comidas"
on public.meals
for insert with check (auth.uid() = user_id);

create policy "Usuarios pueden modificar sus propias comidas"
on public.meals
for update using (auth.uid() = user_id);

create policy "Usuarios pueden eliminar sus propias comidas"
on public.meals
for delete using (auth.uid() = user_id);
