import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Usuario no autenticado" }, { status: 401 })
  }

  try {
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    const [workoutsResult, runsResult, thisWeekWorkoutsResult] = await Promise.all([
      supabase.from("gym_workouts").select("*", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("running_sessions").select("distance_km", { count: "exact" }).eq("user_id", user.id),
      supabase
        .from("gym_workouts")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", oneWeekAgo.toISOString()),
    ])

    const totalDistance = runsResult.data?.reduce((sum, run) => sum + (run.distance_km || 0), 0) || 0

    return NextResponse.json({
      totalWorkouts: workoutsResult.count || 0,
      totalRuns: runsResult.count || 0,
      totalDistance: totalDistance,
      thisWeekWorkouts: thisWeekWorkoutsResult.count || 0,
    })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json(
      {
        totalWorkouts: 0,
        totalRuns: 0,
        totalDistance: 0,
        thisWeekWorkouts: 0,
      },
      { status: 200 },
    )
  }
}
