"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Footprints, TrendingUp, Calendar, Timer, MapPin, Zap } from "lucide-react"
import { getRunningHistory, getRunningProgress, type RunningHistoryEntry } from "@/lib/history-actions"

export default function RunningHistory() {
  const [history, setHistory] = useState<RunningHistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [timeFilter, setTimeFilter] = useState("all")
  const [progress, setProgress] = useState<any>(null)

  useEffect(() => {
    loadHistory()
    loadProgress()
  }, [])

  useEffect(() => {
    loadHistory()
  }, [timeFilter])

  const loadHistory = async () => {
    try {
      setLoading(true)
      const days = timeFilter === "all" ? undefined : Number.parseInt(timeFilter)
      const data = await getRunningHistory(days)
      setHistory(data)
    } catch (error) {
      console.error("Error loading running history:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadProgress = async () => {
    try {
      const progressData = await getRunningProgress()
      setProgress(progressData)
    } catch (error) {
      console.error("Error loading running progress:", error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const formatPace = (pace: number) => {
    const minutes = Math.floor(pace)
    const seconds = Math.round((pace - minutes) * 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}/km`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Filtros de Historial
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Período</label>
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todo el historial</SelectItem>
                  <SelectItem value="7">Última semana</SelectItem>
                  <SelectItem value="30">Último mes</SelectItem>
                  <SelectItem value="90">Últimos 3 meses</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={loadProgress} variant="outline">
              Actualizar Estadísticas
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Progress Stats */}
      {progress && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{progress.totalDistance.toFixed(1)}km</p>
                  <p className="text-sm text-muted-foreground">Distancia Total</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Footprints className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{progress.totalSessions}</p>
                  <p className="text-sm text-muted-foreground">Sesiones Totales</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Timer className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">{formatPace(progress.averagePace)}</p>
                  <p className="text-sm text-muted-foreground">Ritmo Promedio</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">{formatPace(progress.bestPace)}</p>
                  <p className="text-sm text-muted-foreground">Mejor Ritmo</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Weekly Comparison */}
      {progress && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Comparación Semanal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Esta Semana</h4>
                <div className="space-y-2">
                  <p>
                    Sesiones: <span className="font-bold">{progress.thisWeek.length}</span>
                  </p>
                  <p>
                    Distancia:{" "}
                    <span className="font-bold">
                      {progress.thisWeek
                        .reduce((sum: number, entry: RunningHistoryEntry) => sum + entry.distance, 0)
                        .toFixed(1)}
                      km
                    </span>
                  </p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Semana Anterior</h4>
                <div className="space-y-2">
                  <p>
                    Sesiones: <span className="font-bold">{progress.lastWeek.length}</span>
                  </p>
                  <p>
                    Distancia:{" "}
                    <span className="font-bold">
                      {progress.lastWeek
                        .reduce((sum: number, entry: RunningHistoryEntry) => sum + entry.distance, 0)
                        .toFixed(1)}
                      km
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* History List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Historial de Running ({history.length} sesiones)</h3>

        {history.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Footprints className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No hay sesiones de running registradas</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {history.map((entry) => (
              <Card key={entry.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Footprints className="h-4 w-4 text-green-600" />
                        <h4 className="font-semibold">Sesión de Running</h4>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Timer className="h-3 w-3" />
                          {formatDuration(entry.duration)}
                        </Badge>
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {entry.distance}km
                        </Badge>
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Zap className="h-3 w-3" />
                          {formatPace(entry.pace)}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {formatDate(entry.created_at)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
