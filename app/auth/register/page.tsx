import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import RegisterForm from "@/components/auth/register-form"

export default async function RegisterPage() {
  // Check if user is already logged in
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If user is logged in, redirect to home page
  if (session) {
    redirect("/")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4 py-12 sm:px-6 lg:px-8">
      <RegisterForm />
    </div>
  )
}
