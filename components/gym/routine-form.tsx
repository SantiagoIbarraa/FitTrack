"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Plus, Loader2 } from "lucide-react"
import { createRoutine } from "@/lib/routine-actions"

interface RoutineFormProps {
  onRoutineCreated?: () => void
  onCancel?: () => void
}

export default function RoutineForm({ onRoutineCreated, onCancel }: RoutineFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const formDataObj = new FormData()
      formDataObj.append("name", formData.name)
      formDataObj.append("description", formData.description)

      const result = await createRoutine(null, formDataObj)
      
      if (result?.success) {
        onRoutineCreated?.()
      } else if (result?.error) {
        setError(result.error)
      }
    } catch (err) {
      setError("Error inesperado al crear la rutina")
      console.error("Error creating routine:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
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
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">{error}</div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la Rutina</Label>
              <Input 
                id="name" 
                name="name" 
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Ej: Rutina de Pecho y Tríceps, Día de Piernas..." 
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción (opcional)</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe el enfoque de esta rutina..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creando...
                </>
              ) : (
                "Crear Rutina"
              )}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
