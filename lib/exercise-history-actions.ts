"use server"

import { createClient } from "@/lib/supabase/server"

export interface ExerciseHistoryEntry {
  id: string
  exercise_name: string
  weight_kg: number | null
  repetitions: number | null
  sets: number | null
  notes: string | null
  created_at: string
}

export async function getExerciseHistory(exerciseName?: string, days?: number): Promise<ExerciseHistoryEntry[]> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  try {
    let query = supabase
      .from("exercise_history")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (exerciseName) {
      query = query.eq("exercise_name", exerciseName)
    }

    if (days) {
      const dateLimit = new Date()
      dateLimit.setDate(dateLimit.getDate() - days)
      query = query.gte("created_at", dateLimit.toISOString())
    }

    const { data, error } = await query

    if (error) {
      if (error.message.includes("Could not find the table") || error.message.includes("exercise_history")) {
        console.error(
          "Exercise history table not found. Please run the SQL script: scripts/03-create-exercise-history.sql",
        )
        throw new Error("MISSING_TABLE")
      }
      console.error("Error fetching exercise history:", error)
      return []
    }

    return data || []
  } catch (error) {
    if (error instanceof Error && error.message === "MISSING_TABLE") {
      throw error
    }
    console.error("Error in getExerciseHistory:", error)
    return []
  }
}

export async function getExerciseProgress(exerciseName: string) {
  const history = await getExerciseHistory(exerciseName, 90)

  if (history.length === 0) {
    return {
      current: null,
      previous: null,
      improvement: { weight: 0, reps: 0, sets: 0 },
      trend: "stable" as const,
    }
  }

  const current = history[0]
  const previous = history[1] || null

  const improvement = {
    weight: previous && current.weight_kg && previous.weight_kg ? current.weight_kg - previous.weight_kg : 0,
    reps: previous && current.repetitions && previous.repetitions ? current.repetitions - previous.repetitions : 0,
    sets: previous && current.sets && previous.sets ? current.sets - previous.sets : 0,
  }

  let trend: "improving" | "declining" | "stable" = "stable"
  if (improvement.weight > 0 || improvement.reps > 0) {
    trend = "improving"
  } else if (improvement.weight < 0 || improvement.reps < 0) {
    trend = "declining"
  }

  return { current, previous, improvement, trend }
}

export async function getUniqueExercises(): Promise<string[]> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  try {
    const { data, error } = await supabase
      .from("exercise_history")
      .select("exercise_name")
      .eq("user_id", user.id)
      .order("exercise_name")

    if (error) {
      if (error.message.includes("Could not find the table") || error.message.includes("exercise_history")) {
        console.error(
          "Exercise history table not found. Please run the SQL script: scripts/03-create-exercise-history.sql",
        )
        throw new Error("MISSING_TABLE")
      }
      console.error("Error fetching unique exercises:", error)
      return []
    }

    // Obtener nombres únicos
    const uniqueNames = [...new Set(data?.map((item) => item.exercise_name) || [])]
    return uniqueNames
  } catch (error) {
    if (error instanceof Error && error.message === "MISSING_TABLE") {
      throw error
    }
    console.error("Error in getUniqueExercises:", error)
    return []
  }
}
