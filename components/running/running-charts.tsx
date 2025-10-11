"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, MapPin, Clock, Zap } from "lucide-react"
import { getRunningSessions } from "@/lib/running-actions"
import {
  LineChart as RechartsLineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface RunningSession {
  id: string
  duration_minutes: number
  distance_km: number
  pace_min_km: number | null
  created_at: string
}

export default function RunningCharts() {
  const [loading, setLoading] = useState(true)
  const [distanceData, setDistanceData] = useState<any[]>([])
  const [paceData, setPaceData] = useState<any[]>([])

  useEffect(() => {
    loadChartData()
  }, [])

  const loadChartData = async () => {
    try {
      const sessions = await getRunningSessions()

      if (!sessions || sessions.length === 0) {
        setLoading(false)
        return
      }

      const sortedSessions = [...sessions].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      )

      const distanceChartData = sortedSessions.map((session) => ({
        date: format(new Date(session.created_at), "dd/MM", { locale: es }),
        distance: session.distance_km,
        duration: session.duration_minutes,
        fullDate: format(new Date(session.created_at), "PPP", { locale: es }),
      }))

      const paceChartData = sortedSessions
        .filter((session) => session.pace_min_km !== null)
        .map((session) => ({
          date: format(new Date(session.created_at), "dd/MM", { locale: es }),
          pace: session.pace_min_km,
          fullDate: format(new Date(session.created_at), "PPP", { locale: es }),
        }))

      setDistanceData(distanceChartData)
      setPaceData(paceChartData)
    } catch (error) {
      console.error("Error loading running charts:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">Cargando gráficos...</div>
        </CardContent>
      </Card>
    )
  }

  if (distanceData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Progreso de Running
          </CardTitle>
          <CardDescription>Tus gráficos de progreso aparecerán aquí</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500">
            <p>No hay suficientes datos para mostrar gráficos</p>
            <p className="text-sm mt-2">Registra más sesiones de running para ver tu progreso</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Distance Progress Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-green-600" />
            Evolución de Distancia
          </CardTitle>
          <CardDescription>Progreso de tus distancias recorridas</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={distanceData}>
              <defs>
                <linearGradient id="colorDistance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16a34a" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} label={{ value: "km", angle: -90, position: "insideLeft" }} />
              <Tooltip
                contentStyle={{ backgroundColor: "white", border: "1px solid #ccc" }}
                labelFormatter={(label) => {
                  const point = distanceData.find((d) => d.date === label)
                  return point ? point.fullDate : label
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="distance"
                stroke="#16a34a"
                fillOpacity={1}
                fill="url(#colorDistance)"
                name="Distancia (km)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Duration Progress Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-purple-600" />
            Evolución de Duración
          </CardTitle>
          <CardDescription>Tiempo de tus sesiones de running</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsLineChart data={distanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} label={{ value: "min", angle: -90, position: "insideLeft" }} />
              <Tooltip
                contentStyle={{ backgroundColor: "white", border: "1px solid #ccc" }}
                labelFormatter={(label) => {
                  const point = distanceData.find((d) => d.date === label)
                  return point ? point.fullDate : label
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="duration"
                stroke="#9333ea"
                strokeWidth={2}
                name="Duración (min)"
                dot={{ fill: "#9333ea", r: 4 }}
              />
            </RechartsLineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Pace Progress Chart */}
      {paceData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-orange-600" />
              Evolución de Ritmo
            </CardTitle>
            <CardDescription>Mejora de tu ritmo promedio (menor es mejor)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsLineChart data={paceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis
                  tick={{ fontSize: 12 }}
                  label={{ value: "min/km", angle: -90, position: "insideLeft" }}
                  reversed
                />
                <Tooltip
                  contentStyle={{ backgroundColor: "white", border: "1px solid #ccc" }}
                  labelFormatter={(label) => {
                    const point = paceData.find((d) => d.date === label)
                    return point ? point.fullDate : label
                  }}
                  formatter={(value: any) => {
                    const minutes = Math.floor(value)
                    const seconds = Math.round((value - minutes) * 60)
                    return `${minutes}:${seconds.toString().padStart(2, "0")} min/km`
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="pace"
                  stroke="#ea580c"
                  strokeWidth={2}
                  name="Ritmo (min/km)"
                  dot={{ fill: "#ea580c", r: 4 }}
                />
              </RechartsLineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
