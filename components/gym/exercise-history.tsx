"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Weight, RotateCcw, TrendingUp, TrendingDown, Minus, Search, LineChart } from "lucide-react"
import {
  getExerciseHistory,
  getExerciseProgress,
  getUniqueExercises,
  type ExerciseHistoryEntry,
} from "@/lib/exercise-history-actions"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

export default function ExerciseHistory() {
  const [history, setHistory] = useState<ExerciseHistoryEntry[]>([])
  const [uniqueExercises, setUniqueExercises] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedExercise, setSelectedExercise] = useState<string>("all")
  const [selectedDays, setSelectedDays] = useState<string>("30")
  const [searchTerm, setSearchTerm] = useState("")
  const [progress, setProgress] = useState<any>(null)
  const [missingTable, setMissingTable] = useState(false)
  const [chartData, setChartData] = useState<any[]>([])

  const loadHistory = async () => {
    setLoading(true)
    setMissingTable(false)
    try {
      const days = selectedDays === "all" ? undefined : Number.parseInt(selectedDays)
      const exerciseName = selectedExercise === "all" ? undefined : selectedExercise

      const [historyData, exercisesData] = await Promise.all([
        getExerciseHistory(exerciseName, days),
        getUniqueExercises(),
      ])

      setHistory(historyData)
      setUniqueExercises(exercisesData)

      // Obtener progreso si hay un ejercicio seleccionado
      if (selectedExercise !== "all") {
        const progressData = await getExerciseProgress(selectedExercise)
        setProgress(progressData)

        const exerciseHistory = historyData.filter((e) => e.exercise_name === selectedExercise)
        const chartPoints = exerciseHistory.reverse().map((entry, index) => ({
          date: format(new Date(entry.created_at), "dd/MM", { locale: es }),
          peso: entry.weight_kg || 0,
          reps: entry.repetitions || 0,
          fullDate: format(new Date(entry.created_at), "PPP", { locale: es }),
        }))
        setChartData(chartPoints)
      } else {
        setProgress(null)
        setChartData([])
      }
    } catch (error) {
      if (error instanceof Error && error.message === "MISSING_TABLE") {
        setMissingTable(true)
      } else {
        console.error("Error loading history:", error)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadHistory()
  }, [selectedExercise, selectedDays])

  const filteredHistory = history.filter((entry) =>
    entry.exercise_name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "improving":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "declining":
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Minus className="h-4 w-4 text-gray-600" />
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">Cargando historial...</div>
        </CardContent>
      </Card>
    )
  }

  if (missingTable) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="text-yellow-600 mb-4">
              <Calendar className="h-12 w-12 mx-auto mb-2" />
              <h3 className="text-lg font-semibold">Tabla de historial no encontrada</h3>
            </div>
            <p className="text-yellow-700 mb-4">
              Para usar el historial de ejercicios, necesitas ejecutar el script SQL en tu base de datos Supabase.
            </p>
            <div className="bg-yellow-100 p-4 rounded-lg text-left">
              <p className="font-mono text-sm text-yellow-800">
                Ejecuta el script: <strong>scripts/03-create-exercise-history.sql</strong>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Historial de Ejercicios
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar ejercicio</label>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Ejercicio específico</label>
              <Select value={selectedExercise} onValueChange={setSelectedExercise}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los ejercicios" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los ejercicios</SelectItem>
                  {uniqueExercises.map((exercise) => (
                    <SelectItem key={exercise} value={exercise}>
                      {exercise}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Período</label>
              <Select value={selectedDays} onValueChange={setSelectedDays}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Última semana</SelectItem>
                  <SelectItem value="30">Último mes</SelectItem>
                  <SelectItem value="90">Últimos 3 meses</SelectItem>
                  <SelectItem value="all">Todo el tiempo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {progress && progress.current && chartData.length > 0 && (
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <LineChart className="h-5 w-5" />
                  Progreso: {selectedExercise}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Weight className="h-3 w-3" />
                        {progress.current.weight_kg}kg
                        {progress.improvement.weight !== 0 && (
                          <span
                            className={
                              progress.improvement.weight > 0
                                ? "text-green-600 font-semibold"
                                : "text-red-600 font-semibold"
                            }
                          >
                            ({progress.improvement.weight > 0 ? "+" : ""}
                            {progress.improvement.weight}kg)
                          </span>
                        )}
                      </span>
                      <span className="flex items-center gap-1">
                        <RotateCcw className="h-3 w-3" />
                        {progress.current.repetitions} reps
                        {progress.improvement.reps !== 0 && (
                          <span
                            className={
                              progress.improvement.reps > 0
                                ? "text-green-600 font-semibold"
                                : "text-red-600 font-semibold"
                            }
                          >
                            ({progress.improvement.reps > 0 ? "+" : ""}
                            {progress.improvement.reps})
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(progress.trend)}
                    <span className="text-sm font-medium capitalize">
                      {progress.trend === "improving"
                        ? "Mejorando"
                        : progress.trend === "declining"
                          ? "Bajando"
                          : "Estable"}
                    </span>
                  </div>
                </div>

                {/* Weight Progress Chart */}
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="text-sm font-semibold mb-3 text-gray-700">Evolución del Peso</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <RechartsLineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "white", border: "1px solid #ccc" }}
                        labelFormatter={(label) => {
                          const point = chartData.find((d) => d.date === label)
                          return point ? point.fullDate : label
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="peso"
                        stroke="#2563eb"
                        strokeWidth={2}
                        name="Peso (kg)"
                        dot={{ fill: "#2563eb", r: 4 }}
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>

                {/* Reps Progress Chart */}
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="text-sm font-semibold mb-3 text-gray-700">Evolución de Repeticiones</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <RechartsLineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "white", border: "1px solid #ccc" }}
                        labelFormatter={(label) => {
                          const point = chartData.find((d) => d.date === label)
                          return point ? point.fullDate : label
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="reps"
                        stroke="#16a34a"
                        strokeWidth={2}
                        name="Repeticiones"
                        dot={{ fill: "#16a34a", r: 4 }}
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {filteredHistory.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No hay historial de ejercicios</p>
              <p className="text-sm">Los ejercicios se guardarán automáticamente en el historial</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Historial ({filteredHistory.length} entradas)</h3>
          {filteredHistory.map((entry, index) => {
            // Find previous entry for the same exercise to show changes
            const previousEntry = filteredHistory.slice(index + 1).find((e) => e.exercise_name === entry.exercise_name)

            const weightChange =
              previousEntry && entry.weight_kg && previousEntry.weight_kg
                ? entry.weight_kg - previousEntry.weight_kg
                : null

            const repsChange =
              previousEntry && entry.repetitions && previousEntry.repetitions
                ? entry.repetitions - previousEntry.repetitions
                : null

            return (
              <Card key={entry.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{entry.exercise_name}</h4>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {entry.weight_kg && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Weight className="h-3 w-3" />
                            {entry.weight_kg} kg
                            {weightChange !== null && weightChange !== 0 && (
                              <span className={weightChange > 0 ? "text-green-600 ml-1" : "text-red-600 ml-1"}>
                                ({weightChange > 0 ? "+" : ""}
                                {weightChange}kg)
                              </span>
                            )}
                          </Badge>
                        )}
                        {entry.repetitions && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <RotateCcw className="h-3 w-3" />
                            {entry.repetitions} reps
                            {repsChange !== null && repsChange !== 0 && (
                              <span className={repsChange > 0 ? "text-green-600 ml-1" : "text-red-600 ml-1"}>
                                ({repsChange > 0 ? "+" : ""}
                                {repsChange})
                              </span>
                            )}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(entry.created_at), "PPP 'a las' HH:mm", { locale: es })}
                      </div>
                      {entry.notes && <p className="text-sm text-gray-600 mt-2">{entry.notes}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
