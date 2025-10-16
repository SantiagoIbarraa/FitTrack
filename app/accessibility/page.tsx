import { createClient } from "@/lib/supabase/server"
import { AccessibilitySettings } from "@/components/accessibility/accessibility-settings"
import { BackButton } from "@/components/ui/back-button"
import { getUserPreferences } from "@/lib/accessibility-actions"

export default async function AccessibilityPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get preferences from database if user is logged in, otherwise use defaults
  let preferences = {
    color_blind_mode: "none",
    large_text: false,
    reduce_motion: false,
  }

  if (user) {
    const result = await getUserPreferences()
    if (result.preferences) {
      preferences = result.preferences
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <BackButton />
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Configuración de Accesibilidad</h1>
          <p className="text-lg text-gray-700 dark:text-gray-300">Personaliza la aplicación según tus necesidades</p>
          {!user && (
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
              Nota: Tus preferencias se guardarán localmente. Inicia sesión para sincronizarlas en todos tus
              dispositivos.
            </p>
          )}
        </div>

        <AccessibilitySettings initialPreferences={preferences} isGuest={!user} />
      </div>
    </div>
  )
}
