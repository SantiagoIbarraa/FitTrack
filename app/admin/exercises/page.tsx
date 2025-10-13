import { redirect } from "next/navigation"
import { isAdmin } from "@/lib/admin-actions"
import { getGymExercises } from "@/lib/exercise-actions"
import { ExerciseManagement } from "@/components/admin/exercise-management"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default async function AdminExercisesPage() {
  let admin = false
  let exercises: any[] = []
  let connectionError = false

  try {
    admin = await isAdmin()

    if (!admin) {
      redirect("/")
    }

    exercises = await getGymExercises()
  } catch (error) {
    console.error("[v0] Error loading admin exercises page:", error)
    connectionError = true
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex gap-4">
          <Button variant="outline" asChild>
            <Link href="/admin">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Panel
            </Link>
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Gestión de Ejercicios</h1>
          <p className="text-lg text-gray-700 dark:text-gray-300">
            Administra los ejercicios disponibles para todos los usuarios
          </p>
        </div>

        {connectionError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error de Conexión</AlertTitle>
            <AlertDescription>
              No se pudo conectar a la base de datos de Supabase. Esto es normal en el entorno de vista previa de v0.
              <br />
              <br />
              Para usar esta funcionalidad:
              <ul className="list-disc list-inside mt-2">
                <li>Descarga el código y ejecútalo localmente</li>
                <li>O despliega el proyecto en Vercel</li>
                <li>Asegúrate de que tu instancia de Supabase esté accesible públicamente</li>
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {!connectionError && <ExerciseManagement exercises={exercises} />}
      </div>
    </div>
  )
}
