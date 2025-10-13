import { redirect } from "next/navigation"
import { isAdmin } from "@/lib/admin-actions"
import { getGymExercises } from "@/lib/exercise-actions"
import { ExerciseManagement } from "@/components/admin/exercise-management"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function AdminExercisesPage() {
  const admin = await isAdmin()

  if (!admin) {
    redirect("/")
  }

  const exercises = await getGymExercises()

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

        <ExerciseManagement exercises={exercises} />
      </div>
    </div>
  )
}
