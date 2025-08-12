import Link from "next/link"
import { Dumbbell, Timer, MessageCircle, LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import QuickStats from "@/components/dashboard/quick-stats"
import RecentActivity from "@/components/dashboard/recent-activity"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { signOut } from "@/lib/auth-actions"

export default async function Home() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/welcome")
  }

  // Get user profile data
  const { data: profile } = await supabase.from("user_profiles").select("*").eq("id", user.id).single()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header with user info and logout */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-center flex-1">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Dumbbell className="h-12 w-12 text-blue-600" />
              <h1 className="text-4xl font-bold text-gray-900">PRegister</h1>
            </div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Tu aplicación integral de seguimiento fitness</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="flex items-center gap-2 text-gray-700">
                <User className="h-5 w-5" />
                <span className="font-medium">
                  {profile ? `${profile.first_name} ${profile.last_name}` : user.email}
                </span>
              </div>
              {profile && (
                <div className="text-sm text-gray-500">
                  {profile.weight}kg • {profile.height}cm
                </div>
              )}
            </div>
            <form action={signOut}>
              <Button type="submit" variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Salir
              </Button>
            </form>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Resumen</h2>
          <QuickStats />
        </div>

        {/* Recent Activity */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Actividad Reciente</h2>
          <RecentActivity />
        </div>

        {/* Services Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Servicios</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Gym Section */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <Dumbbell className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <CardTitle className="text-2xl">Gimnasio</CardTitle>
                <CardDescription>Registra tus entrenamientos, ejercicios y progreso en el gym</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full" size="lg">
                  <Link href="/gym">Ir al Gimnasio</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Running Section */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <Timer className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <CardTitle className="text-2xl">Running</CardTitle>
                <CardDescription>Registra tus sesiones de running, distancia y tiempos</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full bg-transparent" size="lg" variant="outline">
                  <Link href="/running">Ir a Running</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Meals Section */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <MessageCircle className="h-16 w-16 text-orange-600 mx-auto mb-4" />
                <CardTitle className="text-2xl">Comidas</CardTitle>
                <CardDescription>Chat con IA para consejos nutricionales y dietas personalizadas</CardDescription>
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
          <p className="text-gray-600">Bienvenido a tu espacio personal de fitness</p>
        </div>
      </div>
    </div>
  )
}
