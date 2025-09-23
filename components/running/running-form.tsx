"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Plus, Loader2 } from "lucide-react"
import { createRunningSession, updateRunningSession } from "@/lib/running-actions"
import { useActionState } from "react"

interface EditSession {
  id: string
  duration_minutes: number
  distance_km: number
  pace_min_km: number | null
}

export default function RunningForm({ onSessionAdded, editSession, onEditComplete }: { onSessionAdded?: () => void; editSession?: EditSession | null; onEditComplete?: () => void }) {
  const [state, formAction] = useActionState(createRunningSession, null)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (editSession) {
      setIsOpen(true)
    }
  }, [editSession])

  const handleSubmit = async (formData: FormData) => {
    if (editSession) {
      const duration = Number.parseInt(formData.get("duration_minutes")?.toString() || "0")
      const distance = Number.parseFloat(formData.get("distance_km")?.toString() || "0")
      const paceStr = formData.get("pace_min_km")?.toString()
      const pace = paceStr && paceStr.trim() !== "" ? Number.parseFloat(paceStr) : null

      const result = await updateRunningSession(editSession.id, {
        duration_minutes: duration,
        distance_km: distance,
        pace_min_km: pace,
      })

      if (result?.success) {
        setIsOpen(false)
        onEditComplete?.()
      }
      return
    }

    const result: any = await formAction(formData)
    if (result?.success) {
      setIsOpen(false)
      onSessionAdded?.()
    }
  }

  if (!isOpen && !editSession) {
    return (
      <Button onClick={() => setIsOpen(true)} className="w-full bg-green-600 hover:bg-green-700">
        <Plus className="h-4 w-4 mr-2" />
        Registrar Sesión de Running
      </Button>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{editSession ? "Editar Sesión de Running" : "Nueva Sesión de Running"}</CardTitle>
        <CardDescription>{editSession ? "Modifica los datos de tu sesión" : "Registra tu sesión de carrera"}</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          {state?.error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">{state.error}</div>
          )}

          <div className="grid grid-cols-1 gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration_minutes">Duración (minutos)</Label>
                <Input
                  id="duration_minutes"
                  name="duration_minutes"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="30"
                  required
                  defaultValue={editSession?.duration_minutes ?? ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="distance_km">Distancia (km)</Label>
                <Input
                  id="distance_km"
                  name="distance_km"
                  type="number"
                  min="0.1"
                  step="0.1"
                  placeholder="5.0"
                  required
                  defaultValue={editSession?.distance_km ?? ""}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pace_min_km">Ritmo (min/km) - Opcional</Label>
              <Input id="pace_min_km" name="pace_min_km" type="number" min="0" step="0.1" placeholder="6.0" defaultValue={editSession?.pace_min_km ?? ""} />
              <p className="text-xs text-gray-500">Se calculará automáticamente si no se especifica</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
              <Loader2 className="h-4 w-4 mr-2 animate-spin hidden" />
              {editSession ? "Actualizar Sesión" : "Guardar Sesión"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
