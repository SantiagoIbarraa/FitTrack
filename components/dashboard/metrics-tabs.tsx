"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dumbbell, Footprints, Timer, Target, TrendingUp, Calendar } from "lucide-react"
import { useEffect, useState } from "react"

interface Stats {
  totalWorkouts: number
  totalRuns: number
  totalDistance: number
  thisWeekWorkouts: number
  thisWeekRuns: number
  thisWeekDistance: number
  avgPace: number
  totalDuration: number
}

export default function MetricsTabs() {
  const [stats, setStats] = useState<Stats>({
    totalWorkouts: 0,
    totalRuns: 0,
    totalDistance: 0,
    thisWeekWorkouts: 0,
    thisWeekRuns: 0,
    thisWeekDistance: 0,
    avgPace: 0,
    totalDuration: 0,
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
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-white">Métrica</CardTitle>
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
        <CardTitle className="dark:text-white">Métrica</CardTitle>
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
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-muted dark:bg-gray-700 rounded-lg">
                <Timer className="h-8 w-8 text-green-600 dark:text-green-400" />
                <div>
                  <p className="text-2xl font-bold dark:text-white">{stats.totalRuns}</p>
                  <p className="text-sm text-muted-foreground dark:text-gray-300">Total Sesiones</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-muted dark:bg-gray-700 rounded-lg">
                <Target className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="text-2xl font-bold dark:text-white">{stats.totalDistance.toFixed(1)}</p>
                  <p className="text-sm text-muted-foreground dark:text-gray-300">km Totales</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-muted dark:bg-gray-700 rounded-lg">
                <TrendingUp className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                <div>
                  <p className="text-2xl font-bold dark:text-white">{stats.avgPace?.toFixed(1) || 0}</p>
                  <p className="text-sm text-muted-foreground dark:text-gray-300">min/km Promedio</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-muted dark:bg-gray-700 rounded-lg">
                <Calendar className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                <div>
                  <p className="text-2xl font-bold dark:text-white">{stats.thisWeekRuns || 0}</p>
                  <p className="text-sm text-muted-foreground dark:text-gray-300">Esta Semana</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="gimnasio" className="mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-muted dark:bg-gray-700 rounded-lg">
                <Dumbbell className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="text-2xl font-bold dark:text-white">{stats.totalWorkouts}</p>
                  <p className="text-sm text-muted-foreground dark:text-gray-300">Total Entrenamientos</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-muted dark:bg-gray-700 rounded-lg">
                <TrendingUp className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                <div>
                  <p className="text-2xl font-bold dark:text-white">{stats.thisWeekWorkouts}</p>
                  <p className="text-sm text-muted-foreground dark:text-gray-300">Esta Semana</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-muted dark:bg-gray-700 rounded-lg col-span-2">
                <Timer className="h-8 w-8 text-green-600 dark:text-green-400" />
                <div>
                  <p className="text-2xl font-bold dark:text-white">{stats.totalDuration || 0}</p>
                  <p className="text-sm text-muted-foreground dark:text-gray-300">Minutos Totales</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
