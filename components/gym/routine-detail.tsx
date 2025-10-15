"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Edit, Trash2, Weight, RotateCcw, Hash, Calendar } from "lucide-react"
import { getRoutineExercises, deleteExerciseFromRoutine } from "@/lib/routine-actions"
import WorkoutForm from "./workout-form"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface Exercise {
  id: string
  exercise_name: string
  weight: number | null // Changed from weight_kg to weight
  repetitions: number | null
  sets: number | null
  image_url: string | null
  created_at: string
}

interface RoutineDetailProps {
  routineId: string
  routineName: string
  onBack: () => void
}

export default function RoutineDetail({ routineId, routineName, onBack }: RoutineDetailProps) {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const loadExercises = async () => {
    try {
      console.log("[v0] Loading exercises for routine:", routineId)
      const data = await getRoutineExercises(routineId)
      console.log("[v0] Exercises loaded:", data)
      setExercises(data || [])
    } catch (error) {
      console.error("Error loading exercises:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadExercises()
  }, [routineId, refreshTrigger])

  const handleDelete = async (exerciseId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este ejercicio de la rutina?")) {
      const result = await deleteExerciseFromRoutine(exerciseId)
      if (result?.success) {
        setRefreshTrigger((prev) => prev + 1)
      }
    }
  }

  const handleEdit = (exercise: Exercise) => {
    setEditingExercise(exercise)
    setShowAddForm(true)
  }

  const handleFormComplete = () => {
    setShowAddForm(false)
    setEditingExercise(null)
    setRefreshTrigger((prev) => prev + 1)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">Cargando ejercicios...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Rutinas
        </Button>
        <div>
          <h2 className="text-2xl font-bold">{routineName}</h2>
          <p className="text-gray-600">{exercises.length} ejercicios en esta rutina</p>
        </div>
      </div>

      {/* Add Exercise Form */}
      {showAddForm && (
        <WorkoutForm
          onWorkoutAdded={handleFormComplete}
          editWorkout={editingExercise}
          onEditComplete={handleFormComplete}
          routineId={routineId}
        />
      )}

      {/* Add Exercise Button */}
      {!showAddForm && (
        <Button onClick={() => setShowAddForm(true)} className="w-full bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Agregar Ejercicio a la Rutina
        </Button>
      )}

      {/* Exercises List */}
      {exercises.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-gray-500">
              <Weight className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No hay ejercicios en esta rutina</p>
              <p className="text-sm">Agrega ejercicios para comenzar a entrenar</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Ejercicios de la Rutina</h3>
          {exercises.map((exercise) => (
            <Card key={exercise.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex gap-4 flex-1">
                    {exercise.image_url && (
                      <div className="flex-shrink-0">
                        <img
                          src={exercise.image_url || "/placeholder.svg"}
                          alt={exercise.exercise_name}
                          className="w-16 h-16 object-cover rounded-lg border"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = "none"
                          }}
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{exercise.exercise_name}</h4>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {exercise.weight !== null && exercise.weight !== undefined && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Weight className="h-3 w-3" />
                            {exercise.weight} kg
                          </Badge>
                        )}
                        {exercise.repetitions && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <RotateCcw className="h-3 w-3" />
                            {exercise.repetitions} reps
                          </Badge>
                        )}
                        {exercise.sets && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Hash className="h-3 w-3" />
                            {exercise.sets} series
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(exercise.created_at), "PPP 'a las' HH:mm", { locale: es })}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(exercise)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(exercise.id)}
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
      )}
    </div>
  )
}
