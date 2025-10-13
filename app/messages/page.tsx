import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { MessagingInterface } from "@/components/messaging/messaging-interface"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function MessagesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="outline" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al inicio
            </Link>
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Mensajes</h1>
          <p className="text-lg text-gray-700 dark:text-gray-300">Comunícate con otros usuarios de FitTrack</p>
        </div>

        <MessagingInterface userId={user.id} />
      </div>
    </div>
  )
}
