"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function createWorkout(prevState: any, formData: FormData) {
  const exercise_name = formData.get("exercise_name")?.toString()
  const weight_kg = formData.get("weight_kg")?.toString()
  const repetitions = formData.get("repetitions")?.toString()
  const sets = formData.get("sets")?.toString()

  if (!exercise_name) {
    return { error: "El nombre del ejercicio es requerido" }
  }

  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Usuario no autenticado" }
  }

  try {
    const { error } = await supabase.from("gym_workouts").insert({
      user_id: user.id,
      exercise_name,
      weight: weight_kg ? Number.parseFloat(weight_kg) : 0,
      repetitions: repetitions ? Number.parseInt(repetitions) : 0,
      sets: sets ? Number.parseInt(sets) : 0,
    })

    if (error) {
      console.error("Database error:", error)
      return { error: "Error al guardar el ejercicio" }
    }

    revalidatePath("/gym")
    return { success: true }
  } catch (error) {
    console.error("Error:", error)
    return { error: "Error al guardar el ejercicio" }
  }
}

export async function updateWorkout(prevState: any, formData: FormData) {
  const id = formData.get("id")?.toString()
  const exercise_name = formData.get("exercise_name")?.toString()
  const weight_kg = formData.get("weight_kg")?.toString()
  const repetitions = formData.get("repetitions")?.toString()
  const sets = formData.get("sets")?.toString()

  if (!id || !exercise_name) {
    return { error: "ID y nombre del ejercicio son requeridos" }
  }

  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Usuario no autenticado" }
  }

  try {
    const { error } = await supabase
      .from("gym_workouts")
      .update({
        exercise_name,
        weight: weight_kg ? Number.parseFloat(weight_kg) : 0,
        repetitions: repetitions ? Number.parseInt(repetitions) : 0,
        sets: sets ? Number.parseInt(sets) : 0,
      })
      .eq("id", id)
      .eq("user_id", user.id)

    if (error) {
      console.error("Database error:", error)
      return { error: "Error al actualizar el ejercicio" }
    }

    revalidatePath("/gym")
    return { success: true }
  } catch (error) {
    console.error("Error:", error)
    return { error: "Error al actualizar el ejercicio" }
  }
}

export async function getWorkouts() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  try {
    const { data, error } = await supabase
      .from("gym_workouts")
      .select("*")
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

export async function deleteWorkout(workoutId: string) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Usuario no autenticado" }
  }

  try {
    const { error } = await supabase.from("gym_workouts").delete().eq("id", workoutId).eq("user_id", user.id)

    if (error) {
      console.error("Database error:", error)
      return { error: "Error al eliminar el ejercicio" }
    }

    revalidatePath("/gym")
    return { success: true }
  } catch (error) {
    console.error("Error:", error)
    return { error: "Error al eliminar el ejercicio" }
  }
}
