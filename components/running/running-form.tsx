"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Plus, Loader2, CheckCircle } from "lucide-react"
import { createRunningSession } from "@/lib/running-actions"

export default function RunningForm({ onSessionAdded }: { onSessionAdded?: () => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const formData = new FormData(e.currentTarget)

    console.log("[v0] Running form - submitting session")
    const result = await createRunningSession(null, formData)
    console.log("[v0] Running form - result:", result)

    setIsSubmitting(false)

    if (result?.success) {
      console.log("[v0] Running form - session saved successfully, closing form")
      setShowSuccess(true)

      // Close form and refresh after a short delay
      setTimeout(() => {
        setIsOpen(false)
        setShowSuccess(false)
        router.refresh()
        onSessionAdded?.()
      }, 800)
    } else if (result?.error) {
      console.log("[v0] Running form - error:", result.error)
      setError(result.error)
    }
  }

  if (!isOpen) {
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
        <CardTitle>Nueva Sesión de Running</CardTitle>
        <CardDescription>Registra tu sesión de carrera</CardDescription>
      </CardHeader>
      <CardContent>
        {showSuccess && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">¡Sesión registrada exitosamente!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded text-sm">
              {error}
            </div>
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
                  disabled={isSubmitting || showSuccess}
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
                  disabled={isSubmitting || showSuccess}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pace_min_km">Ritmo (min/km) - Opcional</Label>
              <Input
                id="pace_min_km"
                name="pace_min_km"
                type="number"
                min="0"
                step="0.1"
                placeholder="6.0"
                disabled={isSubmitting || showSuccess}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Se calculará automáticamente si no se especifica
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={isSubmitting || showSuccess}
            >
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {showSuccess ? "Guardado" : isSubmitting ? "Guardando..." : "Guardar Sesión"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting || showSuccess}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
