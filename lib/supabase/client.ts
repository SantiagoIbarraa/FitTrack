import { createBrowserClient } from "@supabase/ssr"

// Your Supabase configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://fwmfqiajlxuboxkrdgyf.supabase.co"
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3bWZxaWFqbHh1Ym94a3JkZ3lmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMzM0NjgsImV4cCI6MjA3MDYwOTQ2OH0.0L3o22N43zhHoI5YiUqY8QTc1x5F95MbnFnTqNI-9e8"

export const isSupabaseConfigured = true

export function createClient() {
  try {
    return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  } catch (error) {
    console.error("[v0] Error creating Supabase client:", error)
    // Return a mock client that won't crash the app
    return createBrowserClient("https://placeholder.supabase.co", "placeholder-key")
  }
}
