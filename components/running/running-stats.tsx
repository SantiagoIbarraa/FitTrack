"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Clock, MapPin, Zap, Calendar } from "lucide-react"
import { getRunningSessions } from "@/lib/running-actions"

interface RunningSession {
  id: string
  duration_minutes: number
  distance_km: number
  pace_min_km: number | null
  created_at: string
}

interface Stats {
  totalSessions: number
  totalDistance: number
  totalTime: number
  averagePace: number | null
  bestPace: number | null
  longestRun: number
}

export default function RunningStats({ refreshTrigger }: { refreshTrigger?: number }) {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  const calculateStats = (sessions: RunningSession[]): Stats => {
    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        totalDistance: 0,
        totalTime: 0,
        averagePace: null,
        bestPace: null,
        longestRun: 0,
      }
    }

    const totalDistance = sessions.reduce((sum, session) => sum + session.distance_km, 0)
    const totalTime = sessions.reduce((sum, session) => sum + session.duration_minutes, 0)
    const longestRun = Math.max(...sessions.map((session) => session.distance_km))

    const sessionsWithPace = sessions.filter((session) => session.pace_min_km !== null)
    const averagePace =
      sessionsWithPace.length > 0
        ? sessionsWithPace.reduce((sum, session) => sum + (session.pace_min_km || 0), 0) / sessionsWithPace.length
        : null

    const bestPace =
      sessionsWithPace.length > 0
        ? Math.min(...sessionsWithPace.map((session) => session.pace_min_km || Number.POSITIVE_INFINITY))
        : null

    return {
      totalSessions: sessions.length,
      totalDistance,
      totalTime,
      averagePace,
      bestPace,
      longestRun,
    }
  }

  const loadStats = async () => {
    try {
      const sessions = await getRunningSessions()
      const calculatedStats = calculateStats(sessions || [])
      setStats(calculatedStats)
    } catch (error) {
      console.error("Error loading running stats:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
  }, [refreshTrigger])

  const formatPace = (pace: number | null) => {
    if (!pace) return "N/A"
    const minutes = Math.floor(pace)
    const seconds = Math.round((pace - minutes) * 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">Cargando estadísticas...</div>
        </CardContent>
      </Card>
    )
  }

  if (!stats || stats.totalSessions === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Estadísticas de Running
          </CardTitle>
          <CardDescription>Tus métricas de rendimiento aparecerán aquí</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500">
            <p>No hay datos suficientes para mostrar estadísticas</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Estadísticas de Running
        </CardTitle>
        <CardDescription>Resumen de tu rendimiento</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Sesiones</span>
            </div>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {stats.totalSessions}
            </Badge>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <MapPin className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Distancia Total</span>
            </div>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {stats.totalDistance.toFixed(1)} km
            </Badge>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">Tiempo Total</span>
            </div>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {formatTime(stats.totalTime)}
            </Badge>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Zap className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium">Ritmo Promedio</span>
            </div>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {formatPace(stats.averagePace)} min/km
            </Badge>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Zap className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium">Mejor Ritmo</span>
            </div>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {formatPace(stats.bestPace)} min/km
            </Badge>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <MapPin className="h-4 w-4 text-indigo-600" />
              <span className="text-sm font-medium">Carrera Más Larga</span>
            </div>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {stats.longestRun.toFixed(1)} km
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
