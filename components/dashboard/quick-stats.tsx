"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Dumbbell, Timer, Target, TrendingUp } from "lucide-react"
import { useEffect, useState } from "react"

interface Stats {
  totalWorkouts: number
  totalRuns: number
  totalDistance: number
  thisWeekWorkouts: number
}

export default function QuickStats() {
  const [stats, setStats] = useState<Stats>({
    totalWorkouts: 0,
    totalRuns: 0,
    totalDistance: 0,
    thisWeekWorkouts: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("/api/stats")
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                 {[...Array(4)].map((_, i) => (
           <Card key={i} className="dark:bg-gray-800 dark:border-gray-700">
             <CardContent className="p-3 sm:p-4">
               <div className="flex items-center gap-2">
                 <div className="h-4 w-4 sm:h-5 sm:w-5 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
                 <div>
                   <div className="h-6 w-10 sm:h-8 sm:w-12 bg-gray-200 dark:bg-gray-600 rounded animate-pulse mb-1" />
                   <div className="h-3 w-16 sm:h-4 sm:w-20 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
                 </div>
               </div>
             </CardContent>
           </Card>
         ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
             <Card className="dark:bg-gray-800 dark:border-gray-700">
         <CardContent className="p-3 sm:p-4">
           <div className="flex items-center gap-2">
             <Dumbbell className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
             <div>
               <p className="text-xl sm:text-2xl font-bold dark:text-white">{stats.totalWorkouts}</p>
               <p className="text-xs sm:text-sm text-muted-foreground dark:text-gray-300">Entrenamientos</p>
             </div>
           </div>
         </CardContent>
       </Card>

       <Card className="dark:bg-gray-800 dark:border-gray-700">
         <CardContent className="p-3 sm:p-4">
           <div className="flex items-center gap-2">
             <Timer className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
             <div>
               <p className="text-xl sm:text-2xl font-bold dark:text-white">{stats.totalRuns}</p>
               <p className="text-xs sm:text-sm text-muted-foreground dark:text-gray-300">Sesiones Running</p>
             </div>
           </div>
         </CardContent>
       </Card>

       <Card className="dark:bg-gray-800 dark:border-gray-700">
         <CardContent className="p-3 sm:p-4">
           <div className="flex items-center gap-2">
             <Target className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 dark:text-purple-400" />
             <div>
               <p className="text-xl sm:text-2xl font-bold dark:text-white">{stats.totalDistance.toFixed(1)}</p>
               <p className="text-xs sm:text-sm text-muted-foreground dark:text-gray-300">km Recorridos</p>
             </div>
           </div>
         </CardContent>
       </Card>

       <Card className="dark:bg-gray-800 dark:border-gray-700">
         <CardContent className="p-3 sm:p-4">
           <div className="flex items-center gap-2">
             <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 dark:text-orange-400" />
             <div>
               <p className="text-xl sm:text-2xl font-bold dark:text-white">{stats.thisWeekWorkouts}</p>
               <p className="text-xs sm:text-sm text-muted-foreground dark:text-gray-300">Esta Semana</p>
             </div>
           </div>
         </CardContent>
       </Card>
    </div>
  )
}
