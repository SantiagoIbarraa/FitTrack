"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dumbbell, TrendingUp, TrendingDown, Minus, Search, Calendar } from "lucide-react"
import { getWorkoutHistory, getWorkoutProgress, type WorkoutHistoryEntry } from "@/lib/history-actions"

export default function WorkoutHistory() {
  const [history, setHistory] = useState<WorkoutHistoryEntry[]>([])
  const [filteredHistory, setFilteredHistory] = useState<WorkoutHistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [timeFilter, setTimeFilter] = useState("all")
  const [selectedExercise, setSelectedExercise] = useState("")
  const [progress, setProgress] = useState<any>(null)

  useEffect(() => {
    loadHistory()
  }, [])

  useEffect(() => {
    filterHistory()
  }, [history, searchTerm, timeFilter, selectedExercise])

  const loadHistory = async () => {
    try {
      setLoading(true)
      const days = timeFilter === "all" ? undefined : Number.parseInt(timeFilter)
      const data = await getWorkoutHistory(selectedExercise || undefined, days)
      setHistory(data)
    } catch (error) {
      console.error("Error loading workout history:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterHistory = () => {
    let filtered = history

    if (searchTerm) {
      filtered = filtered.filter((entry) => entry.exercise_name.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    setFilteredHistory(filtered)
  }

  const loadProgress = async (exerciseName: string) => {
    try {
      const progressData = await getWorkoutProgress(exerciseName)
      setProgress(progressData)
    } catch (error) {
      console.error("Error loading progress:", error)
    }
  }

  const uniqueExercises = Array.from(new Set(history.map((entry) => entry.exercise_name)))

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getTrendIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="h-4 w-4 text-green-500" />
    if (value < 0) return <TrendingDown className="h-4 w-4 text-red-500" />
    return <Minus className="h-4 w-4 text-gray-500" />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Filtros de Historial
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Buscar ejercicio</label>
              <Input
                placeholder="Nombre del ejercicio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
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
            <div>
              <label className="text-sm font-medium mb-2 block">Ejercicio específico</label>
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
          </div>
          <Button onClick={loadHistory} className="w-full md:w-auto">
            Aplicar Filtros
          </Button>
        </CardContent>
      </Card>

      {/* Progress Card */}
      {progress && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Progreso: {progress.current?.exercise_name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2">
                  {getTrendIcon(progress.improvement.weight)}
                  <span className="text-2xl font-bold">{progress.current?.weight}kg</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {progress.improvement.weight !== 0 && (
                    <span className={progress.improvement.weight > 0 ? "text-green-500" : "text-red-500"}>
                      {progress.improvement.weight > 0 ? "+" : ""}
                      {progress.improvement.weight}kg
                    </span>
                  )}
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2">
                  {getTrendIcon(progress.improvement.reps)}
                  <span className="text-2xl font-bold">{progress.current?.reps}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {progress.improvement.reps !== 0 && (
                    <span className={progress.improvement.reps > 0 ? "text-green-500" : "text-red-500"}>
                      {progress.improvement.reps > 0 ? "+" : ""}
                      {progress.improvement.reps} reps
                    </span>
                  )}
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2">
                  {getTrendIcon(progress.improvement.sets)}
                  <span className="text-2xl font-bold">{progress.current?.sets}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {progress.improvement.sets !== 0 && (
                    <span className={progress.improvement.sets > 0 ? "text-green-500" : "text-red-500"}>
                      {progress.improvement.sets > 0 ? "+" : ""}
                      {progress.improvement.sets} sets
                    </span>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* History List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Historial de Entrenamientos ({filteredHistory.length} entradas)</h3>

        {filteredHistory.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Dumbbell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No hay entrenamientos registrados</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredHistory.map((entry) => (
              <Card key={entry.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Dumbbell className="h-4 w-4 text-blue-600" />
                        <h4 className="font-semibold">{entry.exercise_name}</h4>
                        <Button variant="ghost" size="sm" onClick={() => loadProgress(entry.exercise_name)}>
                          Ver Progreso
                        </Button>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant="secondary">{entry.weight}kg</Badge>
                        <Badge variant="secondary">{entry.reps} reps</Badge>
                        <Badge variant="secondary">{entry.sets} sets</Badge>
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
