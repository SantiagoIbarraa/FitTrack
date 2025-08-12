"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, Calendar, Weight, RotateCcw, Hash, Edit } from "lucide-react"
import { deleteWorkout, getWorkouts } from "@/lib/gym-actions"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface Workout {
  id: string
  exercise_name: string
  weight_kg: number | null
  repetitions: number | null
  sets: number | null
  created_at: string
}

interface WorkoutListProps {
  refreshTrigger?: number
  onEditWorkout?: (workout: Workout) => void
}

export default function WorkoutList({ refreshTrigger, onEditWorkout }: WorkoutListProps) {
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)

  const loadWorkouts = async () => {
    try {
      const data = await getWorkouts()
      setWorkouts(data || [])
    } catch (error) {
      console.error("Error loading workouts:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadWorkouts()
  }, [refreshTrigger])

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este ejercicio?")) {
      const result = await deleteWorkout(id)
      if (result?.success) {
        loadWorkouts()
      }
    }
  }

  const handleEdit = (workout: Workout) => {
    onEditWorkout?.(workout)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">Cargando entrenamientos...</div>
        </CardContent>
      </Card>
    )
  }

  if (workouts.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <Weight className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No hay entrenamientos registrados</p>
            <p className="text-sm">Agrega tu primer ejercicio para comenzar</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Historial de Entrenamientos</h3>
      {workouts.map((workout) => (
        <Card key={workout.id}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-semibold text-lg">{workout.exercise_name}</h4>
                <div className="flex flex-wrap gap-2 mt-2">
                  {workout.weight_kg && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Weight className="h-3 w-3" />
                      {workout.weight_kg} kg
                    </Badge>
                  )}
                  {workout.repetitions && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <RotateCcw className="h-3 w-3" />
                      {workout.repetitions} reps
                    </Badge>
                  )}
                  {workout.sets && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Hash className="h-3 w-3" />
                      {workout.sets} series
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(workout.created_at), "PPP 'a las' HH:mm", { locale: es })}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(workout)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(workout.id)}
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
