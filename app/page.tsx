import Link from "next/link"
import { Dumbbell, Timer, MessageCircle, LogOut, User, Settings } from "lucide-react"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Gym Section */}
                         <Card className="hover:shadow-lg transition-shadow dark:bg-gray-800 dark:border-gray-700">
               <CardHeader className="text-center">
                 <Dumbbell className="h-12 w-12 sm:h-16 sm:w-16 text-blue-600 dark:text-blue-400 mx-auto mb-3 sm:mb-4" />
                 <CardTitle className="text-xl sm:text-2xl dark:text-white">Gimnasio</CardTitle>
                 <CardDescription className="dark:text-gray-300">Registra tus entrenamientos, ejercicios y progreso en el gym</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full" size="lg">
                  <Link href="/gym">Ir al Gimnasio</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Running Section */}
                         <Card className="hover:shadow-lg transition-shadow dark:bg-gray-800 dark:border-gray-700">
               <CardHeader className="text-center">
                 <Timer className="h-12 w-12 sm:h-16 sm:w-16 text-green-600 dark:text-green-400 mx-auto mb-3 sm:mb-4" />
                 <CardTitle className="text-xl sm:text-2xl dark:text-white">Running</CardTitle>
                 <CardDescription className="dark:text-gray-300">Registra tus sesiones de running, distancia y tiempos</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full bg-transparent" size="lg" variant="outline">
                  <Link href="/running">Ir a Running</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Meals Section */}
                         <Card className="hover:shadow-lg transition-shadow dark:bg-gray-800 dark:border-gray-700 sm:col-span-2 lg:col-span-1">
               <CardHeader className="text-center">
                 <MessageCircle className="h-12 w-12 sm:h-16 sm:w-16 text-orange-600 dark:text-orange-400 mx-auto mb-3 sm:mb-4" />
                 <CardTitle className="text-xl sm:text-2xl dark:text-white">Comidas</CardTitle>
                 <CardDescription className="dark:text-gray-300">Chat con IA para consejos nutricionales y dietas personalizadas</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full bg-transparent" size="lg" variant="outline">
                  <Link href="/meals">Ir a Comidas</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

                 <div className="text-center">
           <p className="text-gray-600 dark:text-gray-300">Bienvenido a tu espacio personal de fitness</p>
         </div>
      </div>
    </div>
  )
}
