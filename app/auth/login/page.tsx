import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import LoginForm from "@/components/auth/login-form"

export default async function LoginPage() {
  // Check if user is already logged in
<<<<<<< HEAD
  const supabase = await createClient()
=======
  const supabase = createClient()
>>>>>>> 3c2d00e9b5a67d4195bd151582ac6aaa2a4ff7ba
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If user is logged in, redirect to home page
  if (session) {
    redirect("/")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 px-4 py-12 sm:px-6 lg:px-8">
      <LoginForm />
    </div>
  )
}
