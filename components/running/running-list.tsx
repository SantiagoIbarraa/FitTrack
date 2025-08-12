"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, Calendar, Clock, MapPin, Zap } from "lucide-react"
import { deleteRunningSession, getRunningSessions } from "@/lib/running-actions"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface RunningSession {
  id: string
  duration_minutes: number
  distance_km: number
  pace_min_km: number | null
  created_at: string
}

export default function RunningList({ refreshTrigger }: { refreshTrigger?: number }) {
  const [sessions, setSessions] = useState<RunningSession[]>([])
  const [loading, setLoading] = useState(true)

  const loadSessions = async () => {
    try {
      const data = await getRunningSessions()
      setSessions(data || [])
    } catch (error) {
      console.error("Error loading running sessions:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSessions()
  }, [refreshTrigger])

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta sesión?")) {
      const result = await deleteRunningSession(id)
      if (result?.success) {
        loadSessions()
      }
    }
  }

  const formatPace = (pace: number | null) => {
    if (!pace) return null
    const minutes = Math.floor(pace)
    const seconds = Math.round((pace - minutes) * 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">Cargando sesiones...</div>
        </CardContent>
      </Card>
    )
  }

  if (sessions.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No hay sesiones de running registradas</p>
            <p className="text-sm">Registra tu primera carrera para comenzar</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Historial de Running</h3>
      {sessions.map((session) => (
        <Card key={session.id}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {session.duration_minutes} min
                  </Badge>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {session.distance_km} km
                  </Badge>
                  {session.pace_min_km && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      {formatPace(session.pace_min_km)} min/km
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(session.created_at), "PPP 'a las' HH:mm", { locale: es })}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(session.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
