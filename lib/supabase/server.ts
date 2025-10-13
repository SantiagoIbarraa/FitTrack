import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

// Your Supabase configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://fwmfqiajlxuboxkrdgyf.supabase.co"
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3bWZxaWFqbHh1Ym94a3JkZ3lmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMzM0NjgsImV4cCI6MjA3MDYwOTQ2OH0.0L3o22N43zhHoI5YiUqY8QTc1x5F95MbnFnTqNI-9e8"

// Check if Supabase is configured
export const isSupabaseConfigured = true

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
}
