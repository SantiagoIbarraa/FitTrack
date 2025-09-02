import Link from "next/link"
import { Dumbbell, Timer, MessageCircle, LogOut, User, Settings, Footprints, Utensils, BarChart3, Database } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import QuickStats from "@/components/dashboard/quick-stats"
import RecentActivity from "@/components/dashboard/recent-activity"
import ProfileForm from "@/components/user/profile-form"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { signOut } from "@/lib/auth-actions"

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/welcome")
  }

  // Get user data from user_metadata (stored during registration)
  const userMetadata = user.user_metadata
  const fullName = userMetadata?.full_name || `${userMetadata?.first_name || ''} ${userMetadata?.last_name || ''}`.trim() || user.email
  const weight = userMetadata?.weight
  const height = userMetadata?.height

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-4 sm:py-8">
        {/* Header with user info and logout */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 sm:mb-8">
          <div className="text-center sm:text-left flex-1">
            <div className="flex items-center justify-center sm:justify-start gap-2 sm:gap-3 mb-2 sm:mb-4">
                             <Dumbbell className="h-8 w-8 sm:h-12 sm:w-12 text-blue-600 dark:text-blue-400" />
               <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 dark:text-white">FitTrack</h1>
             </div>
             <p className="text-sm sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl">Tu aplicación integral de seguimiento fitness</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <div className="text-center sm:text-right">
                             <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                 <User className="h-4 w-4 sm:h-5 sm:w-5" />
                 <span className="font-medium text-sm sm:text-lg">{fullName}</span>
               </div>
               {weight && height && (
                 <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                   {weight}kg • {height}cm
                 </div>
               )}
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button variant="outline" size="sm" asChild>
                <Link href="/profile">
                  <Settings className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Perfil</span>
                </Link>
              </Button>
              <form action={signOut}>
                <Button type="submit" variant="outline" size="sm">
                  <LogOut className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Salir</span>
                </Button>
              </form>
            </div>
          </div>
        </div>

        {fullName && fullName !== user.email && (
          <div className="text-center mb-6 sm:mb-8">
                       <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">¡Bienvenido, {fullName}!</h2>
           <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">¿Listo para tu próximo entrenamiento?</p>
          </div>
        )}

        {/* Quick Stats */}
        <div className="mb-6 sm:mb-8">
                     <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">Resumen</h2>
          <QuickStats />
        </div>

        {/* Recent Activity */}
        <div className="mb-6 sm:mb-8">
                     <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">Actividad Reciente</h2>
          <RecentActivity />
        </div>

        {/* Services Grid */}
        <div className="mb-6 sm:mb-8">
                     <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">Servicios</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Link href="/gym" className="group">
              <Card className="h-full transition-all duration-200 hover:shadow-lg hover:scale-105 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                <CardHeader className="text-center">
                  <Dumbbell className="h-12 w-12 mx-auto mb-4 text-blue-600 group-hover:scale-110 transition-transform" />
                  <CardTitle className="text-gray-900 dark:text-white">Gimnasio</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-300">Rutinas y ejercicios personalizados</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/running" className="group">
              <Card className="h-full transition-all duration-200 hover:shadow-lg hover:scale-105 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                <CardHeader className="text-center">
                  <Footprints className="h-12 w-12 mx-auto mb-4 text-green-600 group-hover:scale-110 transition-transform" />
                  <CardTitle className="text-gray-900 dark:text-white">Running</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-300">Seguimiento de carreras y entrenamientos</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/meals" className="group">
              <Card className="h-full transition-all duration-200 hover:shadow-lg hover:scale-105 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                <CardHeader className="text-center">
                  <Utensils className="h-12 w-12 mx-auto mb-4 text-orange-600 group-hover:scale-110 transition-transform" />
                  <CardTitle className="text-gray-900 dark:text-white">Comidas</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-300">Asistente de nutrición con IA</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/profile" className="group">
              <Card className="h-full transition-all duration-200 hover:shadow-lg hover:scale-105 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                <CardHeader className="text-center">
                  <User className="h-12 w-12 mx-auto mb-4 text-purple-600 group-hover:scale-110 transition-transform" />
                  <CardTitle className="text-gray-900 dark:text-white">Perfil</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-300">Gestiona tu información personal</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/stats" className="group">
              <Card className="h-full transition-all duration-200 hover:shadow-lg hover:scale-105 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                <CardHeader className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-indigo-600 group-hover:scale-110 transition-transform" />
                  <CardTitle className="text-gray-900 dark:text-white">Estadísticas</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-300">Visualiza tu progreso</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/test-db" className="group">
              <Card className="h-full transition-all duration-200 hover:shadow-lg hover:scale-105 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                <CardHeader className="text-center">
                  <Database className="h-12 w-12 mx-auto mb-4 text-red-600 group-hover:scale-110 transition-transform" />
                  <CardTitle className="text-gray-900 dark:text-white">Test DB</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-300">Prueba la conexión a la base de datos</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </div>

                 <div className="text-center">
           <p className="text-gray-600 dark:text-gray-300">Bienvenido a tu espacio personal de fitness</p>
         </div>
      </div>
    </div>
  )
}
