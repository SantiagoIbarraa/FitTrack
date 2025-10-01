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

    const nextOrderIndex = maxOrderData && maxOrderData.length > 0 ? maxOrderData[0].order_index + 1 : 0;

    const insertData: any = {
      routine_id: routineId,
      exercise_name: exerciseData.exercise_name,
      image_url: exerciseData.image_url || null,
      order_index: nextOrderIndex,
    };

    // Manejar peso
    if (exerciseData.weight_kg !== undefined && exerciseData.weight_kg !== '') {
      insertData.weight = parseFloat(exerciseData.weight_kg);
    } else {
      insertData.weight = null;
    }

    // Manejar repeticiones
    if (exerciseData.repetitions !== undefined && exerciseData.repetitions !== '') {
      insertData.repetitions = parseInt(exerciseData.repetitions);
    } else {
      insertData.repetitions = null;
    }

    // Manejar series
    if (exerciseData.sets !== undefined && exerciseData.sets !== '') {
      insertData.sets = parseInt(exerciseData.sets);
    } else {
      insertData.sets = null;
    }

    const { error } = await supabase
      .from("routine_exercises")
      .insert(insertData)

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
    const updateData: any = {
      exercise_name: exerciseData.exercise_name,
      image_url: exerciseData.image_url || null,
    };

    // Solo actualizar peso si se proporciona un valor
    if (exerciseData.weight_kg !== undefined && exerciseData.weight_kg !== '') {
      updateData.weight = parseFloat(exerciseData.weight_kg);
    } else {
      updateData.weight = null;
    }

    // Solo actualizar repeticiones si se proporciona un valor
    if (exerciseData.repetitions !== undefined && exerciseData.repetitions !== '') {
      updateData.repetitions = parseInt(exerciseData.repetitions);
    } else {
      updateData.repetitions = null;
    }

    // Solo actualizar series si se proporciona un valor
    if (exerciseData.sets !== undefined && exerciseData.sets !== '') {
      updateData.sets = parseInt(exerciseData.sets);
    } else {
      updateData.sets = null;
    }

    const { error } = await supabase
      .from("routine_exercises")
      .update(updateData)
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
