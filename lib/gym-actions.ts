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

<<<<<<< HEAD
  const supabase = await createClient()
=======
  const supabase = createClient()
>>>>>>> 3c2d00e9b5a67d4195bd151582ac6aaa2a4ff7ba
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Usuario no autenticado" }
  }

  try {
<<<<<<< HEAD
    const insertData = {
      user_id: user.id,
      exercise_name,
      weight_kg: weight_kg && weight_kg.trim() !== "" ? Number.parseFloat(weight_kg) : null,
      repetitions: repetitions && repetitions.trim() !== "" ? Number.parseInt(repetitions) : null,
      sets: sets && sets.trim() !== "" ? Number.parseInt(sets) : null,
    }

    const { error } = await supabase.from("gym_workouts").insert(insertData)
=======
    const { error } = await supabase.from("gym_workouts").insert({
      user_id: user.id,
      exercise_name,
      weight: weight_kg ? Number.parseFloat(weight_kg) : 0,
      repetitions: repetitions ? Number.parseInt(repetitions) : 0,
      sets: sets ? Number.parseInt(sets) : 0,
    })
>>>>>>> 3c2d00e9b5a67d4195bd151582ac6aaa2a4ff7ba

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

<<<<<<< HEAD
  const supabase = await createClient()
=======
  const supabase = createClient()
>>>>>>> 3c2d00e9b5a67d4195bd151582ac6aaa2a4ff7ba
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
<<<<<<< HEAD
        weight_kg: weight_kg && weight_kg.trim() !== "" ? Number.parseFloat(weight_kg) : null,
        repetitions: repetitions && repetitions.trim() !== "" ? Number.parseInt(repetitions) : null,
        sets: sets && sets.trim() !== "" ? Number.parseInt(sets) : null,
=======
        weight: weight_kg ? Number.parseFloat(weight_kg) : 0,
        repetitions: repetitions ? Number.parseInt(repetitions) : 0,
        sets: sets ? Number.parseInt(sets) : 0,
>>>>>>> 3c2d00e9b5a67d4195bd151582ac6aaa2a4ff7ba
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
<<<<<<< HEAD
  const supabase = await createClient()
=======
  const supabase = createClient()
>>>>>>> 3c2d00e9b5a67d4195bd151582ac6aaa2a4ff7ba
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
<<<<<<< HEAD
  const supabase = await createClient()
=======
  const supabase = createClient()
>>>>>>> 3c2d00e9b5a67d4195bd151582ac6aaa2a4ff7ba
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
