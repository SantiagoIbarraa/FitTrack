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
      console.error("[v0] Database error:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("[v0] Error fetching gym exercises:", error)
    return []
  }
}

export async function createGymExercise(prevState: any, formData: FormData) {
  const name = formData.get("name")?.toString()
  const category = formData.get("category")?.toString()
  const description = formData.get("description")?.toString() || ""
  const image_url = formData.get("image_url")?.toString() || null

  console.log("[v0] Creating exercise with data:", {
    name,
    category,
    description,
    image_url,
    hasImageUrl: !!image_url,
    imageUrlLength: image_url?.length || 0,
  })

  if (!name || !category) {
    return { error: "El nombre y la categoría son requeridos" }
  }

  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError) {
      console.error("[v0] Auth error:", userError)
      return { error: "Error de conexión con la base de datos" }
    }

    if (!user) {
      return { error: "Usuario no autenticado" }
    }

    const insertData = {
      name,
      category,
      description,
      image_url,
    }

    console.log("[v0] Inserting data to database:", insertData)

    const ejercicio = {
      name: "Ejercicio base de datos codigo",
      category: "Otros",
    }

const { data, error } = await supabase.from("gym_exercises").insert(ejercicio).select()
    if (error) {

      console.error("[v0] Database error:", error)
      return { error: "Error al crear el ejercicio" }
    }

    console.log("[v0] Exercise created successfully:", data)
    console.log("[v0] Saved image_url:", data?.[0]?.image_url)

    revalidatePath("/admin/exercises")
    return { success: true, data: data?.[0] }
  } catch (error) {
    console.error("[v0] Error creating exercise:", error)
    return { error: "Error de conexión con la base de datos" }
  }
}

export async function updateGymExercise(exerciseId: string, formData: FormData) {
  const name = formData.get("name")?.toString()
  const category = formData.get("category")?.toString()
  const description = formData.get("description")?.toString() || ""
  const image_url = formData.get("image_url")?.toString() || null

  console.log("[v0] Updating exercise with data:", {
    exerciseId,
    name,
    category,
    description,
    image_url,
    hasImageUrl: !!image_url,
    imageUrlLength: image_url?.length || 0,
  })

  if (!name || !category) {
    return { error: "El nombre y la categoría son requeridos" }
  }

  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError) {
      console.error("[v0] Auth error:", userError)
      return { error: "Error de conexión con la base de datos" }
    }

    if (!user) {
      return { error: "Usuario no autenticado" }
    }

    const updateData = {
      name,
      category,
      description,
      image_url,
      updated_at: new Date().toISOString(),
    }

    console.log("[v0] Updating database with:", updateData)

    const { data, error } = await supabase.from("gym_exercises").update(updateData).eq("id", exerciseId).select().single()

    if (error) {
      console.error("[v0] Database error:", error)
      return { error: "Error al actualizar el ejercicio" }
    }

    console.log("[v0] Exercise updated successfully:", data)
    console.log("[v0] Saved image_url:", data?.[0]?.image_url)

    const { data: verifyData, error: verifyError } = await supabase
      .from("gym_exercises")
      .select("*")
      .eq("id", exerciseId)
      .single()

    if (!verifyError) {
      console.log("[v0] Verification - Exercise in database:", verifyData)
      console.log("[v0] Verification - image_url in database:", verifyData?.image_url)
    }

    revalidatePath("/admin/exercises")
    return { success: true, data: data?.[0] }
  } catch (error) {
    console.error("[v0] Error updating exercise:", error)
    return { error: "Error de conexión con la base de datos" }
  }
}

export async function deleteGymExercise(exerciseId: string) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError) {
      console.error("[v0] Auth error:", userError)
      return { error: "Error de conexión con la base de datos" }
    }

    if (!user) {
      return { error: "Usuario no autenticado" }
    }

    const { error } = await supabase.from("gym_exercises").delete().eq("id", exerciseId)

    if (error) {
      console.error("[v0] Database error:", error)
      return { error: "Error al eliminar el ejercicio" }
    }

    revalidatePath("/admin/exercises")
    return { success: true }
  } catch (error) {
    console.error("[v0] Error deleting exercise:", error)
    return { error: "Error de conexión con la base de datos" }
  }
}

export async function uploadExerciseImage(formData: FormData) {
  const file = formData.get("file") as File

  if (!file) {
    return { error: "No se proporcionó ningún archivo" }
  }

  if (!file.type.startsWith("image/")) {
    return { error: "El archivo debe ser una imagen" }
  }

  if (file.size > 5 * 1024 * 1024) {
    return { error: "El archivo no debe superar los 5MB" }
  }

  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError) {
      console.error("[v0] Auth error:", userError)
      return { error: "Error de conexión con la base de datos" }
    }

    if (!user) {
      return { error: "Usuario no autenticado" }
    }

    const fileExt = file.name.split(".").pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = fileName

    const { data, error: uploadError } = await supabase.storage.from("exercise-images").upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (uploadError) {
      console.error("[v0] Error uploading image:", uploadError)
      return {
        error: "Error al subir la imagen. Asegúrate de que el bucket 'exercise-images' existe en Supabase Storage.",
      }
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("exercise-images").getPublicUrl(filePath)

    return { success: true, imageUrl: publicUrl }
  } catch (error) {
    console.error("[v0] Error uploading image:", error)
    return { error: "Error de conexión con la base de datos" }
  }
}
