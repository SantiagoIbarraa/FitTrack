"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function createRoutine(prevState: any, formData: FormData) {
  const name = formData.get("name")?.toString()
  const description = formData.get("description")?.toString() || ""

  if (!name) {
    return { error: "El nombre de la rutina es requerido" }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Usuario no autenticado" }
  }

  try {
    const { error } = await supabase.from("routines").insert({
      user_id: user.id,
      name,
      description,
    })

    if (error) {
      console.error("Database error:", error)
      return { error: "Error al crear la rutina" }
    }

    revalidatePath("/gym")
    return { success: true }
  } catch (error) {
    console.error("Error:", error)
    return { error: "Error al crear la rutina" }
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
