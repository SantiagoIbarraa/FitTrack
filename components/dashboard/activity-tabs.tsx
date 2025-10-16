"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Dumbbell, Footprints } from "lucide-react"
import { useEffect, useState } from "react"

interface Workout {
  id: string
  exercise_name: string
  weight: number
  repetitions: number
  sets: number
  created_at: string
}

interface Run {
  id: string
  distance_km: number
  duration_minutes: number
  pace_min_km: number
  created_at: string
}

export default function ActivityTabs() {
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [runs, setRuns] = useState<Run[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRecentActivity() {
      try {
        const [workoutsResponse, runsResponse] = await Promise.all([
          fetch("/api/workouts/recent"),
          fetch("/api/runs/recent"),
        ])

        if (workoutsResponse.ok) {
          const workoutsData = await workoutsResponse.json()
          setWorkouts(workoutsData.slice(0, 5))
        }

        if (runsResponse.ok) {
          const runsData = await runsResponse.json()
          setRuns(runsData.slice(0, 5))
        }
      } catch (error) {
        console.error("Error fetching recent activity:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecentActivity()
  }, [])

  if (loading) {
    return (
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-white">Actividad reciente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground dark:text-gray-300">Cargando...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="dark:text-white">Actividad reciente</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="running" className="w-full">
          <TabsList className="grid w-full grid-cols-2 dark:bg-gray-700">
            <TabsTrigger value="running" className="flex items-center gap-2">
              <Footprints className="h-4 w-4" />
              Running
            </TabsTrigger>
            <TabsTrigger value="gimnasio" className="flex items-center gap-2">
              <Dumbbell className="h-4 w-4" />
              Gimnasio
            </TabsTrigger>
          </TabsList>

          <TabsContent value="running" className="mt-4">
            <div className="space-y-3">
              {runs.length > 0 ? (
                runs.map((run) => (
                  <div
                    key={run.id}
                    className="flex items-center justify-between p-3 bg-muted dark:bg-gray-700 rounded-lg"
                  >
                    <div>
                      <p className="font-medium dark:text-white">{run.distance_km || 0} km</p>
                      <p className="text-sm text-muted-foreground dark:text-gray-300">
                        {new Date(run.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="secondary">{run.duration_minutes}min</Badge>
                      <Badge variant="outline">{run.pace_min_km?.toFixed(1)} min/km</Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground dark:text-gray-300 text-center py-8">
                  No hay sesiones de running recientes
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="gimnasio" className="mt-4">
            <div className="space-y-3">
              {workouts.length > 0 ? (
                workouts.map((workout) => (
                  <div
                    key={workout.id}
                    className="flex items-center justify-between p-3 bg-muted dark:bg-gray-700 rounded-lg"
                  >
                    <div>
                      <p className="font-medium dark:text-white">{workout.exercise_name}</p>
                      <p className="text-sm text-muted-foreground dark:text-gray-300">
                        {new Date(workout.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {workout.weight && <Badge variant="secondary">{workout.weight}kg</Badge>}
                      {workout.repetitions && workout.sets && (
                        <Badge variant="outline">
                          {workout.repetitions}x{workout.sets}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground dark:text-gray-300 text-center py-8">
                  No hay entrenamientos recientes
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
