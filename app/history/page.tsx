import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Dumbbell, Footprints, History } from "lucide-react"
import Link from "next/link"
import WorkoutHistory from "@/components/history/workout-history"
import RunningHistory from "@/components/history/running-history"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function HistoryPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/welcome")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <History className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                Historial de Entrenamientos
              </h1>
              <p className="text-gray-600 dark:text-gray-300">Revisa tu progreso y evolución a lo largo del tiempo</p>
            </div>
          </div>
        </div>

        {/* Tabs for different history types */}
        <Tabs defaultValue="workouts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="workouts" className="flex items-center gap-2">
              <Dumbbell className="h-4 w-4" />
              Ejercicios
            </TabsTrigger>
            <TabsTrigger value="running" className="flex items-center gap-2">
              <Footprints className="h-4 w-4" />
              Running
            </TabsTrigger>
          </TabsList>

          <TabsContent value="workouts">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Dumbbell className="h-5 w-5" />
                  Historial de Ejercicios
                </CardTitle>
                <CardDescription>Revisa la evolución de tus entrenamientos, pesos y repeticiones</CardDescription>
              </CardHeader>
              <CardContent>
                <WorkoutHistory />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="running">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Footprints className="h-5 w-5" />
                  Historial de Running
                </CardTitle>
                <CardDescription>Analiza tu progreso en distancia, tiempo y ritmo</CardDescription>
              </CardHeader>
              <CardContent>
                <RunningHistory />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
