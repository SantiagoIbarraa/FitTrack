<<<<<<< HEAD
import { createBrowserClient } from "@supabase/ssr"

// Your Supabase configuration
const SUPABASE_URL = "https://fwmfqiajlxuboxkrdgyf.supabase.co"
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3bWZxaWFqbHh1Ym94a3JkZ3lmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMzM0NjgsImV4cCI6MjA3MDYwOTQ2OH0.0L3o22N43zhHoI5YiUqY8QTc1x5F95MbnFnTqNI-9e8"

// Check if Supabase is configured
export const isSupabaseConfigured = true

export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}
=======
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// Check if Supabase environment variables are available
export const isSupabaseConfigured =
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
  typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0

// Create a singleton instance of the Supabase client for Client Components
export const supabase = createClientComponentClient()
>>>>>>> 3c2d00e9b5a67d4195bd151582ac6aaa2a4ff7ba
