import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AccessibilitySettings } from "@/components/accessibility/accessibility-settings"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { getUserPreferences } from "@/lib/accessibility-actions"

export default async function AccessibilityPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { preferences } = await getUserPreferences()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="outline"
            asChild
            className="dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700 bg-transparent"
          >
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al inicio
            </Link>
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Configuración de Accesibilidad</h1>
          <p className="text-lg text-gray-700 dark:text-gray-300">Personaliza la aplicación según tus necesidades</p>
        </div>

        <AccessibilitySettings initialPreferences={preferences} />
      </div>
    </div>
  )
}
