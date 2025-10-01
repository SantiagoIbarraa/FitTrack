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
      duration_minutes: durationNum,
      distance_km: distanceNum,
      pace_min_km: calculatedPace,
    }

    const { error } = await supabase.from("running_sessions").insert(insertData)

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

export async function updateRunningSession(
  sessionId: string,
  data: { duration_minutes: number; distance_km: number; pace_min_km?: number | null }
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Usuario no autenticado" }
  }

  const durationNum = Number.parseInt(String(data.duration_minutes))
  const distanceNum = Number.parseFloat(String(data.distance_km))
  const paceProvided = data.pace_min_km

  if (!Number.isFinite(durationNum) || !Number.isFinite(distanceNum) || durationNum <= 0 || distanceNum <= 0) {
    return { error: "Duración y distancia deben ser mayores a 0" }
  }

  let paceToSave: number | null = null
  if (paceProvided !== undefined && paceProvided !== null && String(paceProvided).trim() !== "") {
    paceToSave = Number.parseFloat(String(paceProvided))
  } else {
    paceToSave = durationNum / distanceNum
  }

  try {
    const { error } = await supabase
      .from("running_sessions")
      .update({
        duration_minutes: durationNum,
        distance_km: distanceNum,
        pace_min_km: paceToSave,
      })
      .eq("id", sessionId)
      .eq("user_id", user.id)

    if (error) {
      console.error("Database error:", error)
      return { error: "Error al actualizar la sesión" }
    }

    revalidatePath("/running")
    return { success: true }
  } catch (error) {
    console.error("Error:", error)
    return { error: "Error al actualizar la sesión" }
  }
}

export async function getRunningSessions() {
  const supabase = await createClient()
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
  const supabase = await createClient()
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
