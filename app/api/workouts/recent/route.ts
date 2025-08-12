import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Usuario no autenticado" }, { status: 401 })
  }

  try {
    const { data: workouts, error } = await supabase
      .from("gym_workouts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(3)

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json([], { status: 200 })
    }

    return NextResponse.json(workouts || [])
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json([], { status: 200 })
  }
}
