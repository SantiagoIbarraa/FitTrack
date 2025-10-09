"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function createRoutine(prevState: any, formData: FormData) {
  console.log("createRoutine called with:", { prevState, formData })
  
  const name = formData.get("name")?.toString()
  const description = formData.get("description")?.toString() || ""

  console.log("Form data parsed:", { name, description })

  if (!name) {
    console.log("Validation failed: name is required")
    return { error: "El nombre de la rutina es requerido" }
  }

  try {
    const supabase = await createClient()
    console.log("Supabase client created successfully")
    
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser()

    if (userError) {
      console.error("User auth error:", userError)
      return { error: `Error de autenticación: ${userError.message}` }
    }

    if (!user) {
      console.log("No authenticated user found")
      return { error: "Usuario no autenticado" }
    }

    console.log("User authenticated:", { userId: user.id, email: user.email })

    // Verificar que la tabla routines existe
    const { data: tableCheck, error: tableError } = await supabase
      .from("routines")
      .select("id")
      .limit(1)

    if (tableError) {
      console.error("Table check error:", tableError)
      return { error: `Error al verificar tabla: ${tableError.message}` }
    }

    console.log("Table check successful, inserting routine...")

    const { data: insertData, error: insertError } = await supabase
      .from("routines")
      .insert({
        user_id: user.id,
        name,
        description,
      })
      .select()

    if (insertError) {
      console.error("Database insert error:", insertError)
      return { error: `Error al crear la rutina: ${insertError.message}` }
    }

    console.log("Routine created successfully:", insertData)

    revalidatePath("/gym")
    return { success: true, data: insertData }
  } catch (error) {
    console.error("Unexpected error in createRoutine:", error)
    return { error: `Error inesperado: ${error instanceof Error ? error.message : String(error)}` }
  }
}

export async function getRoutines() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  try {
    const { data, error } = await supabase
      .from("routines")
      .select(`
        *,
        routine_exercises(count)
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Database error:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error:", error)
    return []
  }
}

export async function deleteRoutine(routineId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Usuario no autenticado" }
  }

  try {
    const { error } = await supabase.from("routines").delete().eq("id", routineId).eq("user_id", user.id)

    if (error) {
      console.error("Database error:", error)
      return { error: "Error al eliminar la rutina" }
    }

    revalidatePath("/gym")
    return { success: true }
  } catch (error) {
    console.error("Error:", error)
    return { error: "Error al eliminar la rutina" }
  }
}

export async function getRoutineExercises(routineId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  try {
    const { data, error } = await supabase
      .from("routine_exercises")
      .select("*")
      .eq("routine_id", routineId)
      .order("order_index", { ascending: true })

    if (error) {
      console.error("Database error:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error:", error)
    return []
  }
}

export async function addExerciseToRoutine(routineId: string, exerciseData: any) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Usuario no autenticado" }
  }

  try {
    // Get the current max order_index for this routine
    const { data: maxOrderData } = await supabase
      .from("routine_exercises")
      .select("order_index")
      .eq("routine_id", routineId)
      .order("order_index", { ascending: false })
      .limit(1)

    const nextOrderIndex = maxOrderData && maxOrderData.length > 0 ? maxOrderData[0].order_index + 1 : 0

    const { error } = await supabase.from("routine_exercises").insert({
      routine_id: routineId,
      exercise_name: exerciseData.exercise_name,
      weight: exerciseData.weight_kg || 0,
      repetitions: exerciseData.repetitions || 0,
      sets: exerciseData.sets || 0,
      image_url: exerciseData.image_url || null,
      order_index: nextOrderIndex,
    })

    if (error) {
      console.error("Database error:", error)
      return { error: "Error al agregar ejercicio a la rutina" }
    }

    revalidatePath("/gym")
    return { success: true }
  } catch (error) {
    console.error("Error:", error)
    return { error: "Error al agregar ejercicio a la rutina" }
  }
}

export async function updateExerciseInRoutine(exerciseId: string, exerciseData: any) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Usuario no autenticado" }
  }

  try {
    const { error } = await supabase
      .from("routine_exercises")
      .update({
        exercise_name: exerciseData.exercise_name,
        weight: exerciseData.weight_kg || 0,
        repetitions: exerciseData.repetitions || 0,
        sets: exerciseData.sets || 0,
        image_url: exerciseData.image_url || null,
      })
      .eq("id", exerciseId)

    if (error) {
      console.error("Database error:", error)
      return { error: "Error al actualizar ejercicio" }
    }

    revalidatePath("/gym")
    return { success: true }
  } catch (error) {
    console.error("Error:", error)
    return { error: "Error al actualizar ejercicio" }
  }
}

export async function deleteExerciseFromRoutine(exerciseId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Usuario no autenticado" }
  }

  try {
    const { error } = await supabase.from("routine_exercises").delete().eq("id", exerciseId)

    if (error) {
      console.error("Database error:", error)
      return { error: "Error al eliminar ejercicio" }
    }

    revalidatePath("/gym")
    return { success: true }
  } catch (error) {
    console.error("Error:", error)
    return { error: "Error al eliminar ejercicio" }
  }
}
