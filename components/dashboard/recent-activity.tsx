"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dumbbell, Timer } from "lucide-react"
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
  distance: number
  duration: number
  pace: number
  created_at: string
}

export default function RecentActivity() {
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
          setWorkouts(workoutsData.slice(0, 3)) // Show only 3 most recent
        }

        if (runsResponse.ok) {
          const runsData = await runsResponse.json()
          setRuns(runsData.slice(0, 3)) // Show only 3 most recent
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
      <div className="grid md:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-6 w-40 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <div className="h-5 w-24 bg-gray-200 rounded animate-pulse mb-1" />
                      <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                    </div>
                    <div className="flex gap-2">
                      <div className="h-6 w-12 bg-gray-200 rounded animate-pulse" />
                      <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Recent Workouts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-blue-600" />
            Entrenamientos Recientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {workouts.length > 0 ? (
              workouts.map((workout) => (
                <div key={workout.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">{workout.exercise_name}</p>
                    <p className="text-sm text-muted-foreground">{new Date(workout.created_at).toLocaleDateString()}</p>
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
              <p className="text-muted-foreground text-center py-4">No hay entrenamientos recientes</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Runs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5 text-green-600" />
            Sesiones de Running
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {runs.length > 0 ? (
              runs.map((run) => (
                <div key={run.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">{run.distance}km</p>
                    <p className="text-sm text-muted-foreground">{new Date(run.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="secondary">{run.duration}min</Badge>
                    <Badge variant="outline">{run.pace?.toFixed(1)} min/km</Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">No hay sesiones de running recientes</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
