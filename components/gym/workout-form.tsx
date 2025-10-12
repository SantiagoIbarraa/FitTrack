"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Plus, Loader2, Edit } from "lucide-react"
import { createWorkout, updateWorkout } from "@/lib/gym-actions"
import { addExerciseToRoutine, updateExerciseInRoutine } from "@/lib/routine-actions"
import { useActionState } from "react"

interface Workout {
  id: string
  exercise_name: string
  weight_kg: number | null // Reverted to weight_kg to match database schema
  repetitions: number | null
  sets: number | null
  image_url: string | null
  created_at: string
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

  useEffect(() => {
    if (editWorkout) {
      setIsOpen(true)
    }
  }, [editWorkout])

  const handleSubmit = async (formData: FormData) => {
    if (editWorkout) {
      formData.append("id", editWorkout.id)
    }

    // Handle routine-specific exercise creation/update
    if (routineId) {
      const exerciseData = {
        exercise_name: formData.get("exercise_name")?.toString(),
        weight_kg: formData.get("weight_kg") ? Number.parseFloat(formData.get("weight_kg")?.toString() || "0") : null,
        repetitions: formData.get("repetitions")
          ? Number.parseInt(formData.get("repetitions")?.toString() || "0")
          : null,
        sets: formData.get("sets") ? Number.parseInt(formData.get("sets")?.toString() || "0") : null,
        image_url: formData.get("image_url")?.toString() || null,
      }

      console.log("[v0] Exercise data being sent:", exerciseData)
      console.log("[v0] Edit workout:", editWorkout)

      let result
      if (editWorkout) {
        console.log("[v0] Updating exercise with ID:", editWorkout.id)
        result = await updateExerciseInRoutine(editWorkout.id, exerciseData)
        console.log("[v0] Update result:", result)
      } else {
        result = await addExerciseToRoutine(routineId, exerciseData)
      }

      if (result?.success) {
        setIsOpen(false)
        if (editWorkout) {
          onEditComplete?.()
        } else {
          onWorkoutAdded?.()
        }
      }
    } else {
      const result = await formAction(formData)
      if (result?.success) {
        setIsOpen(false)
        if (editWorkout) {
          onEditComplete?.()
        } else {
          onWorkoutAdded?.()
        }
      }
    }
  }

  const handleCancel = () => {
    setIsOpen(false)
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
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">{state.error}</div>
          )}

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="exercise_name">Nombre del Ejercicio</Label>
              <Input
                id="exercise_name"
                name="exercise_name"
                placeholder="Ej: Press de banca, Sentadillas..."
                defaultValue={editWorkout?.exercise_name || ""}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image_url">URL de la Imagen (opcional)</Label>
              <Input
                id="image_url"
                name="image_url"
                type="url"
                placeholder="https://ejemplo.com/imagen-ejercicio.jpg"
                defaultValue={editWorkout?.image_url || ""}
              />
              <p className="text-xs text-gray-500">Agrega una URL de imagen para visualizar el ejercicio</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight_kg">Peso (kg)</Label>
                <Input
                  id="weight_kg"
                  name="weight_kg"
                  type="number"
                  step="0.5"
                  min="0"
                  placeholder="80"
                  defaultValue={editWorkout?.weight_kg ?? ""} // Using weight_kg to match database
                />
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
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
              <Loader2 className="h-4 w-4 mr-2 animate-spin hidden" />
              {editWorkout ? "Actualizar Ejercicio" : "Guardar Ejercicio"}
            </Button>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
