import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import LoginForm from "@/components/auth/login-form"

export default async function LoginPage() {
  try {
    const supabase = await createClient()
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    // If there's an error getting the session, clear it and continue to login
    if (error) {
      console.log("[v0] Session error on login page:", error.message)
      // Clear the invalid session
      await supabase.auth.signOut()
    }

    // If user is logged in and session is valid, redirect to home page
    if (session && !error) {
      redirect("/")
    }
  } catch (error) {
    // If any error occurs, just continue to show the login form
    console.log("[v0] Error checking session:", error)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4 py-12 sm:px-6 lg:px-8">
      <LoginForm />
    </div>
  )
}
