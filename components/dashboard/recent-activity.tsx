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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                 {[...Array(2)].map((_, i) => (
           <Card key={i} className="dark:bg-gray-800 dark:border-gray-700">
             <CardHeader>
               <div className="h-5 w-32 sm:w-40 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
             </CardHeader>
             <CardContent>
               <div className="space-y-3">
                 {[...Array(3)].map((_, j) => (
                   <div key={j} className="flex items-center justify-between p-3 bg-muted dark:bg-gray-700 rounded-lg">
                     <div>
                       <div className="h-4 w-20 sm:w-24 bg-gray-200 dark:bg-gray-600 rounded animate-pulse mb-1" />
                       <div className="h-3 w-12 sm:w-16 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
                     </div>
                     <div className="flex gap-2">
                       <div className="h-5 w-10 sm:w-12 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
                       <div className="h-5 w-12 sm:w-16 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
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
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
      {/* Recent Workouts */}
             <Card className="dark:bg-gray-800 dark:border-gray-700">
         <CardHeader>
           <CardTitle className="flex items-center gap-2 dark:text-white">
             <Dumbbell className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
             <span className="text-lg sm:text-xl">Entrenamientos Recientes</span>
           </CardTitle>
         </CardHeader>
         <CardContent>
           <div className="space-y-3">
             {workouts.length > 0 ? (
               workouts.map((workout) => (
                 <div key={workout.id} className="flex items-center justify-between p-3 bg-muted dark:bg-gray-700 rounded-lg">
                   <div>
                     <p className="font-medium dark:text-white text-sm sm:text-base">{workout.exercise_name}</p>
                     <p className="text-xs sm:text-sm text-muted-foreground dark:text-gray-300">{new Date(workout.created_at).toLocaleDateString()}</p>
                   </div>
                   <div className="flex gap-1 sm:gap-2">
                     {workout.weight && <Badge variant="secondary" className="text-xs">{workout.weight}kg</Badge>}
                     {workout.repetitions && workout.sets && (
                       <Badge variant="outline" className="text-xs">
                         {workout.repetitions}x{workout.sets}
                       </Badge>
                     )}
                   </div>
                 </div>
               ))
             ) : (
               <p className="text-muted-foreground dark:text-gray-300 text-center py-4 text-sm">No hay entrenamientos recientes</p>
             )}
           </div>
         </CardContent>
       </Card>

      {/* Recent Runs */}
             <Card className="dark:bg-gray-800 dark:border-gray-700">
         <CardHeader>
           <CardTitle className="flex items-center gap-2 dark:text-white">
             <Timer className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
             <span className="text-lg sm:text-xl">Sesiones de Running</span>
           </CardTitle>
         </CardHeader>
         <CardContent>
           <div className="space-y-3">
             {runs.length > 0 ? (
               runs.map((run) => (
                 <div key={run.id} className="flex items-center justify-between p-3 bg-muted dark:bg-gray-700 rounded-lg">
                   <div>
                     <p className="font-medium dark:text-white text-sm sm:text-base">{run.distance}km</p>
                     <p className="text-xs sm:text-sm text-muted-foreground dark:text-gray-300">{new Date(run.created_at).toLocaleDateString()}</p>
                   </div>
                   <div className="flex gap-1 sm:gap-2">
                     <Badge variant="secondary" className="text-xs">{run.duration}min</Badge>
                     <Badge variant="outline" className="text-xs">{run.pace?.toFixed(1)} min/km</Badge>
                   </div>
                 </div>
               ))
             ) : (
               <p className="text-muted-foreground dark:text-gray-300 text-center py-4 text-sm">No hay sesiones de running recientes</p>
             )}
           </div>
         </CardContent>
       </Card>
    </div>
  )
}
