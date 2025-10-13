"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function getGymExercises() {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from("gym_exercises")
      .select("*")
      .order("category", { ascending: true })
      .order("name", { ascending: true })

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

export async function createGymExercise(prevState: any, formData: FormData) {
  const name = formData.get("name")?.toString()
  const category = formData.get("category")?.toString()
  const description = formData.get("description")?.toString() || ""
  const image_url = formData.get("image_url")?.toString() || null

  if (!name || !category) {
    return { error: "El nombre y la categoría son requeridos" }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Usuario no autenticado" }
  }

  try {
    const { error } = await supabase.from("gym_exercises").insert({
      name,
      category,
      description,
      image_url,
    })

    if (error) {
      console.error("Database error:", error)
      return { error: "Error al crear el ejercicio" }
    }

    revalidatePath("/admin/exercises")
    return { success: true }
  } catch (error) {
    console.error("Error:", error)
    return { error: "Error al crear el ejercicio" }
  }
}

export async function updateGymExercise(exerciseId: string, formData: FormData) {
  const name = formData.get("name")?.toString()
  const category = formData.get("category")?.toString()
  const description = formData.get("description")?.toString() || ""
  const image_url = formData.get("image_url")?.toString() || null

  if (!name || !category) {
    return { error: "El nombre y la categoría son requeridos" }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Usuario no autenticado" }
  }

  try {
    const { error } = await supabase
      .from("gym_exercises")
      .update({
        name,
        category,
        description,
        image_url,
        updated_at: new Date().toISOString(),
      })
      .eq("id", exerciseId)

    if (error) {
      console.error("Database error:", error)
      return { error: "Error al actualizar el ejercicio" }
    }

    revalidatePath("/admin/exercises")
    return { success: true }
  } catch (error) {
    console.error("Error:", error)
    return { error: "Error al actualizar el ejercicio" }
  }
}

export async function deleteGymExercise(exerciseId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Usuario no autenticado" }
  }

  try {
    const { error } = await supabase.from("gym_exercises").delete().eq("id", exerciseId)

    if (error) {
      console.error("Database error:", error)
      return { error: "Error al eliminar el ejercicio" }
    }

    revalidatePath("/admin/exercises")
    return { success: true }
  } catch (error) {
    console.error("Error:", error)
    return { error: "Error al eliminar el ejercicio" }
  }
}
