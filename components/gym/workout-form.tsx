"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Plus, Loader2, Edit, Dumbbell } from "lucide-react"
import { createWorkout, updateWorkout } from "@/lib/gym-actions"
import { addExerciseToRoutine, updateExerciseInRoutine } from "@/lib/routine-actions"
import { useActionState } from "react"
import ExerciseSelectorModal from "./exercise-selector-modal"

interface Workout {
  id: string
  exercise_name: string
  weight_kg?: number | null // For gym_workouts table
  weight?: number | null // For routine_exercises table
  repetitions: number | null
  sets: number | null
  image_url: string | null
  created_at: string
}

interface GymExercise {
  id: string
  name: string
  category: string
  description: string | null
  image_url: string | null
}

interface WorkoutFormProps {
  onWorkoutAdded?: () => void
  editWorkout?: Workout | null
  onEditComplete?: () => void
  routineId?: string
}

export default function WorkoutForm({ onWorkoutAdded, editWorkout, onEditComplete, routineId }: WorkoutFormProps) {
  const [state, formAction] = useActionState(editWorkout ? updateWorkout : createWorkout, null)
  const [isOpen, setIsOpen] = useState(false)
  const [showExerciseModal, setShowExerciseModal] = useState(false)
  const [selectedExercise, setSelectedExercise] = useState<GymExercise | null>(null)
  const [customExerciseName, setCustomExerciseName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (editWorkout) {
      setIsOpen(true)
    }
  }, [editWorkout])

  const handleExerciseSelect = (exercise: GymExercise) => {
    if (exercise.id === "custom") {
      setSelectedExercise(null)
      setCustomExerciseName("")
    } else {
      setSelectedExercise(exercise)
      setCustomExerciseName("")
    }
  }

  const handleSubmit = async (formData: FormData) => {
    if (isSubmitting) {
      console.log("[v0] Already submitting, ignoring duplicate submission")
      return
    }

    setIsSubmitting(true)
    console.log("[v0] handleSubmit called, editWorkout:", editWorkout, "routineId:", routineId)

    const exerciseName = selectedExercise?.name || customExerciseName || editWorkout?.exercise_name

    if (!exerciseName) {
      console.log("[v0] No exercise name provided")
      setIsSubmitting(false)
      return
    }

    const imageUrl = selectedExercise?.image_url || formData.get("image_url")?.toString() || null

    const newFormData = new FormData()
    newFormData.append("exercise_name", exerciseName)
    newFormData.append("weight_kg", formData.get("weight_kg")?.toString() || "")
    newFormData.append("repetitions", formData.get("repetitions")?.toString() || "")
    newFormData.append("sets", formData.get("sets")?.toString() || "")
    newFormData.append("image_url", imageUrl || "")

    if (editWorkout) {
      newFormData.append("id", editWorkout.id)
    }

    if (routineId) {
      const weightValue = formData.get("weight_kg")?.toString()
      const repsValue = formData.get("repetitions")?.toString()
      const setsValue = formData.get("sets")?.toString()

      console.log("[v0] Form values - weight:", weightValue, "reps:", repsValue, "sets:", setsValue)

      if (!weightValue || weightValue.trim() === "") {
        alert("El peso es obligatorio para ejercicios en rutinas")
        setIsSubmitting(false)
        return
      }

      const exerciseData = {
        exercise_name: exerciseName,
        weight: Number.parseFloat(weightValue),
        repetitions: repsValue && repsValue.trim() !== "" ? Number.parseInt(repsValue) : null,
        sets: setsValue && setsValue.trim() !== "" ? Number.parseInt(setsValue) : null,
        image_url: imageUrl,
      }

      console.log("[v0] Submitting exercise data:", exerciseData)
      console.log("[v0] Is this an update?", !!editWorkout, "Exercise ID:", editWorkout?.id)

      let result
      if (editWorkout) {
        console.log("[v0] Calling updateExerciseInRoutine with ID:", editWorkout.id)
        result = await updateExerciseInRoutine(editWorkout.id, exerciseData)
      } else {
        console.log("[v0] Calling addExerciseToRoutine")
        result = await addExerciseToRoutine(routineId, exerciseData)
      }

      console.log("[v0] Result from routine action:", result)

      if (result?.success) {
        setIsOpen(false)
        setSelectedExercise(null)
        setCustomExerciseName("")
        setIsSubmitting(false)
        if (editWorkout) {
          onEditComplete?.()
        } else {
          onWorkoutAdded?.()
        }
      } else {
        console.error("[v0] Operation failed:", result?.error)
        alert(result?.error || "Error al guardar el ejercicio")
        setIsSubmitting(false)
      }
    } else {
      const result = await formAction(newFormData)
      if (result?.success) {
        setIsOpen(false)
        setSelectedExercise(null)
        setCustomExerciseName("")
        setIsSubmitting(false)
        if (editWorkout) {
          onEditComplete?.()
        } else {
          onWorkoutAdded?.()
        }
      } else {
        setIsSubmitting(false)
      }
    }
  }

  const handleCancel = () => {
    setIsOpen(false)
    setSelectedExercise(null)
    setCustomExerciseName("")
    if (editWorkout) {
      onEditComplete?.()
    }
  }

  if (!isOpen && !editWorkout) {
    return (
      <Button onClick={() => setIsOpen(true)} className="w-full bg-blue-600 hover:bg-blue-700">
        <Plus className="h-4 w-4 mr-2" />
        {routineId ? "Agregar Ejercicio a la Rutina" : "Agregar Ejercicio"}
      </Button>
    )
  }

  return (
    <>
      <ExerciseSelectorModal
        open={showExerciseModal}
        onOpenChange={setShowExerciseModal}
        onSelectExercise={handleExerciseSelect}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {editWorkout ? (
              <>
                <Edit className="h-5 w-5" />
                Editar Ejercicio
              </>
            ) : (
              <>
                <Plus className="h-5 w-5" />
                Nuevo Ejercicio
              </>
            )}
          </CardTitle>
          <CardDescription>
            {editWorkout
              ? "Modifica los datos de tu entrenamiento"
              : routineId
                ? "Agrega un ejercicio a esta rutina"
                : "Registra tu entrenamiento de gimnasio"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            {state?.error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                {state.error}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4">
              {!editWorkout && (
                <div className="space-y-2">
                  <Label>Ejercicio</Label>
                  {selectedExercise ? (
                    <div className="flex items-center gap-3 p-3 border rounded-lg bg-accent/50">
                      {selectedExercise.image_url ? (
                        <img
                          src={selectedExercise.image_url || "/placeholder.svg"}
                          alt={selectedExercise.name}
                          className="w-12 h-12 rounded object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded bg-muted flex items-center justify-center">
                          <Dumbbell className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="font-medium">{selectedExercise.name}</div>
                        <div className="text-xs text-muted-foreground">{selectedExercise.category}</div>
                      </div>
                      <Button type="button" variant="ghost" size="sm" onClick={() => setShowExerciseModal(true)}>
                        Cambiar
                      </Button>
                    </div>
                  ) : customExerciseName ? (
                    <div className="flex items-center gap-3 p-3 border rounded-lg bg-accent/50">
                      <div className="w-12 h-12 rounded bg-muted flex items-center justify-center">
                        <Dumbbell className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{customExerciseName}</div>
                        <div className="text-xs text-muted-foreground">Ejercicio personalizado</div>
                      </div>
                      <Button type="button" variant="ghost" size="sm" onClick={() => setShowExerciseModal(true)}>
                        Cambiar
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-auto py-4 bg-transparent"
                      onClick={() => setShowExerciseModal(true)}
                    >
                      <Dumbbell className="h-5 w-5 mr-2" />
                      Seleccionar ejercicio del catálogo
                    </Button>
                  )}

                  {!selectedExercise && (
                    <div className="space-y-2">
                      <Label htmlFor="custom_exercise_name">O escribe un ejercicio personalizado</Label>
                      <Input
                        id="custom_exercise_name"
                        name="custom_exercise_name"
                        placeholder="Ej: Press de banca, Sentadillas..."
                        value={customExerciseName}
                        onChange={(e) => setCustomExerciseName(e.target.value)}
                      />
                    </div>
                  )}
                </div>
              )}

              {editWorkout && (
                <div className="space-y-2">
                  <Label>Ejercicio</Label>
                  <Input value={editWorkout.exercise_name} disabled />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight_kg">Peso (kg) {routineId && <span className="text-red-500">*</span>}</Label>
                  <Input
                    id="weight_kg"
                    name="weight_kg"
                    type="number"
                    step="0.5"
                    min="0"
                    placeholder="Ej: 80"
                    defaultValue={editWorkout?.weight ?? editWorkout?.weight_kg ?? ""}
                    required={!!routineId}
                  />
                  {routineId && <p className="text-xs text-muted-foreground">Campo obligatorio</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="repetitions">Repeticiones</Label>
                  <Input
                    id="repetitions"
                    name="repetitions"
                    type="number"
                    min="1"
                    placeholder="12"
                    defaultValue={editWorkout?.repetitions ?? ""}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sets">Series</Label>
                <Input
                  id="sets"
                  name="sets"
                  type="number"
                  min="1"
                  placeholder="3"
                  defaultValue={editWorkout?.sets ?? ""}
                />
              </div>

              {!editWorkout && !selectedExercise && customExerciseName && (
                <div className="space-y-2">
                  <Label htmlFor="image_url">URL de la Imagen (opcional)</Label>
                  <Input
                    id="image_url"
                    name="image_url"
                    type="url"
                    placeholder="https://ejemplo.com/imagen-ejercicio.jpg"
                  />
                  <p className="text-xs text-gray-500">Solo para ejercicios personalizados</p>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editWorkout ? "Actualizar Ejercicio" : "Guardar Ejercicio"}
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  )
}
