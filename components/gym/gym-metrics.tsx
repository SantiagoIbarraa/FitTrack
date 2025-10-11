"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Weight, RotateCcw, Calendar, Target, Flame } from "lucide-react"
import { getExerciseHistory, getUniqueExercises } from "@/lib/exercise-history-actions"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export default function GymMetrics() {
  const [loading, setLoading] = useState(true)
  const [totalWorkouts, setTotalWorkouts] = useState(0)
  const [totalWeight, setTotalWeight] = useState(0)
  const [totalReps, setTotalReps] = useState(0)
  const [uniqueExercises, setUniqueExercises] = useState(0)
  const [weeklyData, setWeeklyData] = useState<any[]>([])
  const [topExercises, setTopExercises] = useState<any[]>([])

  useEffect(() => {
    loadMetrics()
  }, [])

  const loadMetrics = async () => {
    try {
      const [history, exercises] = await Promise.all([getExerciseHistory(undefined, 30), getUniqueExercises()])

      setTotalWorkouts(history.length)
      setUniqueExercises(exercises.length)

      const totalW = history.reduce((sum, entry) => sum + (entry.weight_kg || 0), 0)
      const totalR = history.reduce((sum, entry) => sum + (entry.repetitions || 0), 0)
      setTotalWeight(totalW)
      setTotalReps(totalR)

      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - (6 - i))
        return date
      })

      const weeklyWorkouts = last7Days.map((date) => {
        const dayWorkouts = history.filter((entry) => {
          const entryDate = new Date(entry.created_at)
          return entryDate.toDateString() === date.toDateString()
        })

        return {
          date: format(date, "EEE", { locale: es }),
          workouts: dayWorkouts.length,
          fullDate: format(date, "PPP", { locale: es }),
        }
      })
      setWeeklyData(weeklyWorkouts)

      const exerciseCount: Record<string, number> = {}
      history.forEach((entry) => {
        exerciseCount[entry.exercise_name] = (exerciseCount[entry.exercise_name] || 0) + 1
      })

      const topExs = Object.entries(exerciseCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }))
      setTopExercises(topExs)
    } catch (error) {
      console.error("Error loading gym metrics:", error)
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
            <div className="text-xs text-gray-500 mt-1">Levantados</div>
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
                <div key={exercise.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="w-8 h-8 flex items-center justify-center">
                      {index + 1}
                    </Badge>
                    <span className="font-medium">{exercise.name}</span>
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
