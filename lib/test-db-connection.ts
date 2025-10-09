"use server"

import { createClient } from "@/lib/supabase/server"

export async function testDatabaseConnection() {
  try {
    const supabase = await createClient()
    
    // Test user authentication
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError) {
      return { error: `Error de autenticación: ${userError.message}` }
    }
    
    if (!user) {
      return { error: "Usuario no autenticado" }
    }

    // Test routines table
    const { data: routines, error: routinesError } = await supabase
      .from("routines")
      .select("*")
      .limit(1)
    
    if (routinesError) {
      return { error: `Error en tabla routines: ${routinesError.message}` }
    }

    // Test routine_exercises table
    const { data: exercises, error: exercisesError } = await supabase
      .from("routine_exercises")
      .select("*")
      .limit(1)
    
    if (exercisesError) {
      return { error: `Error en tabla routine_exercises: ${exercisesError.message}` }
    }

    return { 
      success: true, 
      message: "Conexión exitosa",
      user: user.id,
      routinesCount: routines?.length || 0,
      exercisesCount: exercises?.length || 0
    }
  } catch (error) {
    return { error: `Error general: ${error}` }
  }
}
