"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Weight, RotateCcw, Calendar, Target, Flame, AlertCircle } from "lucide-react"
import { getExerciseHistory, getUniqueExercises } from "@/lib/exercise-history-actions"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { format, subDays, startOfDay } from "date-fns"
import { es } from "date-fns/locale"

export default function GymMetrics() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalWorkouts, setTotalWorkouts] = useState(0)
  const [totalWeight, setTotalWeight] = useState(0)
  const [totalReps, setTotalReps] = useState(0)
  const [uniqueExercises, setUniqueExercises] = useState(0)
  const [weeklyData, setWeeklyData] = useState<any[]>([])
  const [topExercises, setTopExercises] = useState<any[]>([])
  const [progressData, setProgressData] = useState<any[]>([])
  const [averageWorkoutsPerWeek, setAverageWorkoutsPerWeek] = useState(0)

  useEffect(() => {
    loadMetrics()
  }, [])

  const loadMetrics = async () => {
    setLoading(true)
    setError(null)

    try {
      const [history, exercises] = await Promise.all([getExerciseHistory(undefined, 30), getUniqueExercises()])

      console.log("[v0] Gym metrics - history entries:", history.length)
      console.log("[v0] Gym metrics - unique exercises:", exercises.length)

      if (history.length === 0) {
        setError("No hay datos de entrenamientos registrados en los últimos 30 días")
        setLoading(false)
        return
      }

      setTotalWorkouts(history.length)
      setUniqueExercises(exercises.length)

      const totalW = history.reduce(
        (sum, entry) => sum + (entry.weight_kg || 0) * (entry.sets || 1) * (entry.repetitions || 1),
        0,
      )
      const totalR = history.reduce((sum, entry) => sum + (entry.repetitions || 0) * (entry.sets || 1), 0)
      setTotalWeight(totalW)
      setTotalReps(totalR)

      const avgPerWeek = (history.length / 30) * 7
      setAverageWorkoutsPerWeek(avgPerWeek)

      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(new Date(), 6 - i)
        return startOfDay(date)
      })

      const weeklyWorkouts = last7Days.map((date) => {
        const dayWorkouts = history.filter((entry) => {
          const entryDate = startOfDay(new Date(entry.created_at))
          return entryDate.getTime() === date.getTime()
        })

        return {
          date: format(date, "EEE", { locale: es }),
          workouts: dayWorkouts.length,
          fullDate: format(date, "PPP", { locale: es }),
        }
      })
      setWeeklyData(weeklyWorkouts)

      const exerciseCount: Record<string, { count: number; totalWeight: number }> = {}
      history.forEach((entry) => {
        if (!exerciseCount[entry.exercise_name]) {
          exerciseCount[entry.exercise_name] = { count: 0, totalWeight: 0 }
        }
        exerciseCount[entry.exercise_name].count += 1
        exerciseCount[entry.exercise_name].totalWeight +=
          (entry.weight_kg || 0) * (entry.sets || 1) * (entry.repetitions || 1)
      })

      const topExs = Object.entries(exerciseCount)
        .sort(([, a], [, b]) => b.count - a.count)
        .slice(0, 5)
        .map(([name, data]) => ({
          name,
          count: data.count,
          totalWeight: data.totalWeight,
        }))
      setTopExercises(topExs)

      const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = subDays(new Date(), 29 - i)
        return startOfDay(date)
      })

      const progressByDay = last30Days.map((date) => {
        const dayWorkouts = history.filter((entry) => {
          const entryDate = startOfDay(new Date(entry.created_at))
          return entryDate.getTime() === date.getTime()
        })

        const totalDayWeight = dayWorkouts.reduce(
          (sum, entry) => sum + (entry.weight_kg || 0) * (entry.sets || 1) * (entry.repetitions || 1),
          0,
        )

        return {
          date: format(date, "dd/MM", { locale: es }),
          weight: totalDayWeight,
          workouts: dayWorkouts.length,
          fullDate: format(date, "PPP", { locale: es }),
        }
      })
      setProgressData(progressByDay)
    } catch (error) {
      console.error("[v0] Error loading gym metrics:", error)
      if (error instanceof Error && error.message === "MISSING_TABLE") {
        setError(
          "La tabla de historial de ejercicios no existe. Ejecuta el script SQL: scripts/03-create-exercise-history.sql",
        )
      } else {
        setError("Error al cargar las métricas. Por favor, intenta de nuevo.")
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">Cargando métricas...</div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-900 mb-1">No se pueden cargar las métricas</h3>
              <p className="text-sm text-yellow-700">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="h-6 w-6 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold">{totalWorkouts}</div>
            <div className="text-sm text-gray-600">Entrenamientos</div>
            <div className="text-xs text-gray-500 mt-1">Último mes</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Weight className="h-6 w-6 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold">{totalWeight.toFixed(0)}</div>
            <div className="text-sm text-gray-600">kg Totales</div>
            <div className="text-xs text-gray-500 mt-1">Volumen levantado</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <RotateCcw className="h-6 w-6 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold">{totalReps}</div>
            <div className="text-sm text-gray-600">Repeticiones</div>
            <div className="text-xs text-gray-500 mt-1">Totales</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Target className="h-6 w-6 mx-auto mb-2 text-orange-600" />
            <div className="text-2xl font-bold">{uniqueExercises}</div>
            <div className="text-sm text-gray-600">Ejercicios</div>
            <div className="text-xs text-gray-500 mt-1">Diferentes</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Flame className="h-8 w-8 text-orange-600" />
              <div>
                <div className="text-2xl font-bold text-blue-900">{averageWorkoutsPerWeek.toFixed(1)}</div>
                <div className="text-sm text-blue-700">Entrenamientos por semana (promedio)</div>
              </div>
            </div>
            <Badge variant="secondary" className="text-sm">
              {averageWorkoutsPerWeek >= 3 ? "¡Excelente!" : averageWorkoutsPerWeek >= 2 ? "Bien" : "Puedes mejorar"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Activity Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-600" />
            Actividad Semanal
          </CardTitle>
          <CardDescription>Entrenamientos por día en la última semana</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: "white", border: "1px solid #ccc" }}
                labelFormatter={(label) => {
                  const point = weeklyData.find((d) => d.date === label)
                  return point ? point.fullDate : label
                }}
              />
              <Bar dataKey="workouts" fill="#3b82f6" name="Entrenamientos" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Progreso de Volumen (30 días)
          </CardTitle>
          <CardDescription>Peso total levantado por día</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={progressData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: "white", border: "1px solid #ccc" }}
                labelFormatter={(label) => {
                  const point = progressData.find((d) => d.date === label)
                  return point ? point.fullDate : label
                }}
                formatter={(value: any) => [`${value.toFixed(0)} kg`, "Volumen"]}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#16a34a"
                strokeWidth={2}
                dot={{ fill: "#16a34a", r: 3 }}
                name="Peso (kg)"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Exercises */}
      {topExercises.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Ejercicios Más Frecuentes
            </CardTitle>
            <CardDescription>Tus ejercicios favoritos del último mes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topExercises.map((exercise, index) => (
                <div key={exercise.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="w-8 h-8 flex items-center justify-center font-bold">
                      {index + 1}
                    </Badge>
                    <div>
                      <span className="font-medium block">{exercise.name}</span>
                      <span className="text-xs text-gray-500">{exercise.totalWeight.toFixed(0)} kg totales</span>
                    </div>
                  </div>
                  <Badge variant="secondary">{exercise.count} veces</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
