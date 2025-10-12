"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { getExerciseHistoryByName, getUniqueExerciseNames } from "@/lib/exercise-history-actions"
import { Loader2 } from "lucide-react"

interface ExerciseHistoryEntry {
  id: string
  exercise_name: string
  weight_kg: number | null
  repetitions: number | null
  sets: number | null
  created_at: string
}

export function ExerciseProgressTracker() {
  const [exerciseNames, setExerciseNames] = useState<string[]>([])
  const [selectedExercise, setSelectedExercise] = useState<string>("")
  const [history, setHistory] = useState<ExerciseHistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingHistory, setLoadingHistory] = useState(false)

  useEffect(() => {
    loadExerciseNames()
  }, [])

  useEffect(() => {
    if (selectedExercise) {
      loadExerciseHistory(selectedExercise)
    }
  }, [selectedExercise])

  async function loadExerciseNames() {
    setLoading(true)
    const { data, error } = await getUniqueExerciseNames()

    if (error) {
      console.error("[v0] Error loading exercise names:", error)
    } else if (data && data.length > 0) {
      setExerciseNames(data)
      setSelectedExercise(data[0])
    }

    setLoading(false)
  }

  async function loadExerciseHistory(exerciseName: string) {
    setLoadingHistory(true)
    const { data, error } = await getExerciseHistoryByName(exerciseName)

    if (error) {
      console.error("[v0] Error loading exercise history:", error)
    } else if (data) {
      setHistory(data)
    }

    setLoadingHistory(false)
  }

  const chartData = history
    .map((entry) => ({
      date: new Date(entry.created_at).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      }),
      peso: entry.weight_kg || 0,
      repeticiones: entry.repetitions || 0,
      series: entry.sets || 0,
    }))
    .reverse()

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (exerciseNames.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Progreso de Ejercicios</CardTitle>
          <CardDescription>
            No hay historial de ejercicios disponible. Comienza a registrar tus entrenamientos.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progreso de Ejercicios</CardTitle>
        <CardDescription>Visualiza tu progreso de peso, repeticiones y series a lo largo del tiempo</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <label htmlFor="exercise-select" className="text-sm font-medium">
            Ejercicio:
          </label>
          <Select value={selectedExercise} onValueChange={setSelectedExercise}>
            <SelectTrigger id="exercise-select" className="w-[250px]">
              <SelectValue placeholder="Selecciona un ejercicio" />
            </SelectTrigger>
            <SelectContent>
              {exerciseNames.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loadingHistory ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : history.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">No hay historial disponible para este ejercicio.</p>
        ) : (
          <>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="peso" stroke="hsl(var(--primary))" strokeWidth={2} name="Peso (kg)" />
                  <Line
                    type="monotone"
                    dataKey="repeticiones"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                    name="Repeticiones"
                  />
                  <Line type="monotone" dataKey="series" stroke="hsl(var(--chart-3))" strokeWidth={2} name="Series" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Historial Reciente</h4>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {history.slice(0, 10).map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between text-sm border-b pb-2">
                    <span className="text-muted-foreground">
                      {new Date(entry.created_at).toLocaleString("es-ES", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <div className="flex gap-4">
                      <span>{entry.weight_kg} kg</span>
                      <span>{entry.repetitions} reps</span>
                      <span>{entry.sets} series</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
