"use server"

import { createClient } from "@/lib/supabase/server"

export async function getUserPreferences() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "No autenticado" }
  }

  const { data, error } = await supabase.from("user_preferences").select("*").eq("user_id", user.id).single()

  if (error && error.code !== "PGRST116") {
    return { error: error.message }
  }

  return {
    preferences: data || {
      color_blind_mode: "none",
      high_contrast: false,
      large_text: false,
      reduce_motion: false,
      screen_reader_optimized: false,
    },
  }
}

export async function updateUserPreferences(preferences: {
  color_blind_mode?: string
  high_contrast?: boolean
  large_text?: boolean
  reduce_motion?: boolean
  screen_reader_optimized?: boolean
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "No autenticado" }
  }

  const { error } = await supabase.from("user_preferences").upsert(
    {
      user_id: user.id,
      ...preferences,
    },
    {
      onConflict: "user_id",
    },
  )

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}
