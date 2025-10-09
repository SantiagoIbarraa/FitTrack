"use server"

import { createClient } from "@/lib/supabase/server"

export interface WorkoutHistoryEntry {
  id: string
  exercise_name: string
  weight: number
  reps: number
  sets: number
  created_at: string
}

export interface RunningHistoryEntry {
  id: string
  duration: number
  distance: number
  pace: number
  created_at: string
}

export async function getWorkoutHistory(exerciseName?: string, days?: number): Promise<WorkoutHistoryEntry[]> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Usuario no autenticado")
  }

  try {
    let query = supabase
      .from("workout_history")
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
      console.error("Error fetching workout history:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getWorkoutHistory:", error)
    return []
  }
}

export async function getRunningHistory(days?: number): Promise<RunningHistoryEntry[]> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Usuario no autenticado")
  }

  try {
    let query = supabase
      .from("running_history")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (days) {
      const dateLimit = new Date()
      dateLimit.setDate(dateLimit.getDate() - days)
      query = query.gte("created_at", dateLimit.toISOString())
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching running history:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getRunningHistory:", error)
    return []
  }
}

export async function getWorkoutProgress(exerciseName: string): Promise<{
  current: WorkoutHistoryEntry | null
  previous: WorkoutHistoryEntry | null
  improvement: {
    weight: number
    reps: number
    sets: number
  }
}> {
  const history = await getWorkoutHistory(exerciseName, 90)

  if (history.length === 0) {
    return {
      current: null,
      previous: null,
      improvement: { weight: 0, reps: 0, sets: 0 },
    }
  }

  const current = history[0]
  const previous = history[1] || null

  const improvement = {
    weight: previous ? current.weight - previous.weight : 0,
    reps: previous ? current.reps - previous.reps : 0,
    sets: previous ? current.sets - previous.sets : 0,
  }

  return { current, previous, improvement }
}

export async function getRunningProgress(): Promise<{
  totalDistance: number
  totalSessions: number
  averagePace: number
  bestPace: number
  thisWeek: RunningHistoryEntry[]
  lastWeek: RunningHistoryEntry[]
}> {
  const allHistory = await getRunningHistory()
  const thisWeekHistory = await getRunningHistory(7)
  const lastWeekHistory = await getRunningHistory(14)

  const lastWeekOnly = lastWeekHistory.filter((entry) => {
    const entryDate = new Date(entry.created_at)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const twoWeeksAgo = new Date()
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)
    return entryDate >= twoWeeksAgo && entryDate < weekAgo
  })

  const totalDistance = allHistory.reduce((sum, entry) => sum + entry.distance, 0)
  const totalSessions = allHistory.length
  const averagePace =
    allHistory.length > 0 ? allHistory.reduce((sum, entry) => sum + entry.pace, 0) / allHistory.length : 0
  const bestPace = allHistory.length > 0 ? Math.min(...allHistory.map((entry) => entry.pace)) : 0

  return {
    totalDistance,
    totalSessions,
    averagePace,
    bestPace,
    thisWeek: thisWeekHistory,
    lastWeek: lastWeekOnly,
  }
}
