"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Plus, Loader2 } from "lucide-react"
import { createRoutine } from "@/lib/routine-actions"
import { useActionState } from "react"

interface RoutineFormProps {
  onRoutineCreated?: () => void
  onCancel?: () => void
}

export default function RoutineForm({ onRoutineCreated, onCancel }: RoutineFormProps) {
  const [state, formAction] = useActionState(createRoutine, null)

  const handleSubmit = async (formData: FormData) => {
    const result = await formAction(formData)
    if (result?.success) {
      onRoutineCreated?.()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Nueva Rutina
        </CardTitle>
        <CardDescription>Crea una rutina para organizar tus ejercicios</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          {state?.error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">{state.error}</div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la Rutina</Label>
              <Input id="name" name="name" placeholder="Ej: Rutina de Pecho y Tríceps, Día de Piernas..." required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción (opcional)</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe el enfoque de esta rutina..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
              <Loader2 className="h-4 w-4 mr-2 animate-spin hidden" />
              Crear Rutina
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
