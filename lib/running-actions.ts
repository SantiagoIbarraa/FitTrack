"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function createRunningSession(prevState: any, formData: FormData) {
  const duration_minutes = formData.get("duration_minutes")?.toString()
  const distance_km = formData.get("distance_km")?.toString()
  const pace_min_km = formData.get("pace_min_km")?.toString()

  if (!duration_minutes || !distance_km) {
    return { error: "Duración y distancia son requeridos" }
  }

  const durationNum = Number.parseInt(duration_minutes)
  const distanceNum = Number.parseFloat(distance_km)

  if (durationNum <= 0 || distanceNum <= 0) {
    return { error: "Duración y distancia deben ser mayores a 0" }
  }

  // Calculate pace if not provided
  let calculatedPace: number | null = null
  if (pace_min_km && pace_min_km.trim() !== "") {
    calculatedPace = Number.parseFloat(pace_min_km)
  } else {
    calculatedPace = durationNum / distanceNum
  }

  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Usuario no autenticado" }
  }

  try {
    const { error } = await supabase.from("running_sessions").insert({
      user_id: user.id,
      duration: durationNum,
      distance: distanceNum,
      pace: calculatedPace,
    })

    if (error) {
      console.error("Database error:", error)
      return { error: "Error al guardar la sesión" }
    }

    revalidatePath("/running")
    return { success: true }
  } catch (error) {
    console.error("Error:", error)
    return { error: "Error al guardar la sesión" }
  }
}

export async function getRunningSessions() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  try {
    const { data, error } = await supabase
      .from("running_sessions")
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

export async function deleteRunningSession(sessionId: string) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Usuario no autenticado" }
  }

  try {
    const { error } = await supabase.from("running_sessions").delete().eq("id", sessionId).eq("user_id", user.id)

    if (error) {
      console.error("Database error:", error)
      return { error: "Error al eliminar la sesión" }
    }

    revalidatePath("/running")
    return { success: true }
  } catch (error) {
    console.error("Error:", error)
    return { error: "Error al eliminar la sesión" }
  }
}
