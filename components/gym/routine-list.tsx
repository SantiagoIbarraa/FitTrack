"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, Calendar, Eye, Plus, Dumbbell } from "lucide-react"
import { getRoutines, deleteRoutine } from "@/lib/routine-actions"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface Routine {
  id: string
  name: string
  description: string
  exercises_count: number
  created_at: string
  last_used: string | null
}

interface RoutineListProps {
  refreshTrigger?: number
  onViewRoutine?: (routineId: string, routineName: string) => void
  onCreateRoutine?: () => void
}

export default function RoutineList({ refreshTrigger, onViewRoutine, onCreateRoutine }: RoutineListProps) {
  const [routines, setRoutines] = useState<Routine[]>([])
  const [loading, setLoading] = useState(true)

  const loadRoutines = async () => {
    try {
      const data = await getRoutines()
      setRoutines(data || [])
    } catch (error) {
      console.error("Error loading routines:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRoutines()
  }, [refreshTrigger])

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta rutina y todos sus ejercicios?")) {
      const result = await deleteRoutine(id)
      if (result?.success) {
        loadRoutines()
      }
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">Cargando rutinas...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Mis Rutinas</h3>
        <Button onClick={onCreateRoutine} className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" />
          Nueva Rutina
        </Button>
      </div>

      {routines.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-gray-500">
              <Dumbbell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No hay rutinas creadas</p>
              <p className="text-sm">Crea tu primera rutina para organizar tus entrenamientos</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {routines.map((routine) => (
            <Card key={routine.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">{routine.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">{routine.description}</p>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Dumbbell className="h-3 w-3" />
                        {routine.exercises_count} ejercicios
                      </Badge>
                      {routine.last_used && (
                        <Badge variant="outline" className="text-green-600">
                          Último uso: {format(new Date(routine.last_used), "dd/MM/yyyy", { locale: es })}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Calendar className="h-3 w-3" />
                      Creada: {format(new Date(routine.created_at), "PPP", { locale: es })}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewRoutine?.(routine.id, routine.name)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(routine.id)}
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
