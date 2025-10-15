"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function createWorkout(data: {
  exercise_name: string
  weight_kg: number | null
  repetitions: number | null
  sets: number | null
  image_url: string | null
}) {
  console.log("[v0] createWorkout called with:", data)

  if (!data.exercise_name) {
    return { error: "El nombre del ejercicio es requerido" }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Usuario no autenticado" }
  }

  try {
    const insertData = {
      user_id: user.id,
      exercise_name: data.exercise_name,
      weight_kg: data.weight_kg,
      repetitions: data.repetitions,
      sets: data.sets,
      image_url: data.image_url,
    }

    console.log("[v0] Inserting workout:", insertData)

    const { error } = await supabase.from("gym_workouts").insert(insertData)

    if (error) {
      console.error("[v0] Database error:", error)
      return { error: "Error al guardar el ejercicio" }
    }

    console.log("[v0] Workout created successfully")
    revalidatePath("/gym")
    return { success: true }
  } catch (error) {
    console.error("[v0] Error:", error)
    return { error: "Error al guardar el ejercicio" }
  }
}

export async function updateWorkout(data: {
  id: string
  exercise_name: string
  weight_kg: number | null
  repetitions: number | null
  sets: number | null
  image_url: string | null
}) {
  console.log("[v0] updateWorkout called with:", data)

  if (!data.id || !data.exercise_name) {
    return { error: "ID y nombre del ejercicio son requeridos" }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Usuario no autenticado" }
  }

  try {
    const updateData = {
      exercise_name: data.exercise_name,
      weight_kg: data.weight_kg,
      repetitions: data.repetitions,
      sets: data.sets,
      image_url: data.image_url,
    }

    console.log("[v0] Updating workout:", updateData)

    const { error } = await supabase.from("gym_workouts").update(updateData).eq("id", data.id).eq("user_id", user.id)

    if (error) {
      console.error("[v0] Database error:", error)
      return { error: "Error al actualizar el ejercicio" }
    }

    console.log("[v0] Workout updated successfully")
    revalidatePath("/gym")
    return { success: true }
  } catch (error) {
    console.error("[v0] Error:", error)
    return { error: "Error al actualizar el ejercicio" }
  }
}

export async function getWorkouts() {
  const supabase = await createClient()
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
  const supabase = await createClient()
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
