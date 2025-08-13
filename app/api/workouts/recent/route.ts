import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
<<<<<<< HEAD
  const supabase = await createClient()
=======
  const supabase = createClient()
>>>>>>> 3c2d00e9b5a67d4195bd151582ac6aaa2a4ff7ba
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
