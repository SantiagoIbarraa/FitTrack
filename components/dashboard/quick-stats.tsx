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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 bg-gray-200 rounded animate-pulse" />
                <div>
                  <div className="h-8 w-12 bg-gray-200 rounded animate-pulse mb-1" />
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-2xl font-bold">{stats.totalWorkouts}</p>
              <p className="text-sm text-muted-foreground">Entrenamientos</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Timer className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-2xl font-bold">{stats.totalRuns}</p>
              <p className="text-sm text-muted-foreground">Sesiones Running</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-600" />
            <div>
              <p className="text-2xl font-bold">{stats.totalDistance.toFixed(1)}</p>
              <p className="text-sm text-muted-foreground">km Recorridos</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-orange-600" />
            <div>
              <p className="text-2xl font-bold">{stats.thisWeekWorkouts}</p>
              <p className="text-sm text-muted-foreground">Esta Semana</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
