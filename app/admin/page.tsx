import { redirect } from "next/navigation"
import { isAdmin, getAllUsers } from "@/lib/admin-actions"
import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Dumbbell } from "lucide-react"

export default async function AdminPage() {
  const admin = await isAdmin()

  if (!admin) {
    redirect("/")
  }

  const { users, error } = await getAllUsers()

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex gap-4">
          <Button variant="outline" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al inicio
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/exercises">
              <Dumbbell className="h-4 w-4 mr-2" />
              Gestionar Ejercicios
            </Link>
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Panel de Administración</h1>
          <p className="text-lg text-gray-700 dark:text-gray-300">Gestiona usuarios y profesionales del sistema</p>
        </div>

        {error ? (
          <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
            {error}
          </div>
        ) : (
          <AdminDashboard users={users || []} />
        )}
      </div>
    </div>
  )
}
