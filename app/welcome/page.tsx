import Link from "next/link"
import { Dumbbell, LogIn, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function WelcomePage() {
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 flex items-center justify-center px-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-orange-600 p-4 rounded-full">
              <Dumbbell className="h-16 w-16 text-white" />
            </div>
          </div>
          <h1 className="text-6xl font-bold text-white mb-4">FitTrack</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Tu aplicación integral de seguimiento fitness. Registra entrenamientos, sesiones de running y obtén consejos
            nutricionales personalizados.
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          {/* Login Card */}
          <Card className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-all">
            <CardHeader className="text-center">
              <LogIn className="h-12 w-12 text-blue-400 mx-auto mb-4" />
              <CardTitle className="text-2xl text-white">Iniciar Sesión</CardTitle>
              <CardDescription className="text-gray-400">
                ¿Ya tienes una cuenta? Inicia sesión para continuar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg" size="lg">
                <Link href="/auth/login">
                  <LogIn className="mr-2 h-5 w-5" />
                  Iniciar Sesión
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Register Card */}
          <Card className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-all">
            <CardHeader className="text-center">
              <UserPlus className="h-12 w-12 text-orange-400 mx-auto mb-4" />
              <CardTitle className="text-2xl text-white">Crear Cuenta</CardTitle>
              <CardDescription className="text-gray-400">¿Nuevo en FitTrack? Crea tu cuenta gratuita</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-orange-600 hover:bg-orange-700 text-white py-6 text-lg" size="lg">
                <Link href="/auth/register">
                  <UserPlus className="mr-2 h-5 w-5" />
                  Crear Cuenta
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="mt-16 grid md:grid-cols-3 gap-8 text-center">
          <div className="text-white">
            <Dumbbell className="h-8 w-8 text-blue-400 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Gimnasio</h3>
            <p className="text-gray-400 text-sm">Registra entrenamientos y rutinas personalizadas</p>
          </div>
          <div className="text-white">
            <div className="h-8 w-8 bg-green-400 rounded-full mx-auto mb-3 flex items-center justify-center">
              <span className="text-gray-900 font-bold text-sm">R</span>
            </div>
            <h3 className="font-semibold mb-2">Running</h3>
            <p className="text-gray-400 text-sm">Seguimiento de distancia, tiempo y progreso</p>
          </div>
          <div className="text-white">
            <div className="h-8 w-8 bg-orange-400 rounded-full mx-auto mb-3 flex items-center justify-center">
              <span className="text-gray-900 font-bold text-sm">IA</span>
            </div>
            <h3 className="font-semibold mb-2">Nutrición IA</h3>
            <p className="text-gray-400 text-sm">Consejos personalizados y cálculo de IMC</p>
          </div>
        </div>
      </div>
    </div>
  )
}
