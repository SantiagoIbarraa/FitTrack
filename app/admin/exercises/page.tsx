"use client"

import { useState, useEffect } from "react"
import { isAdmin } from "@/lib/admin-actions"
import { ExerciseManagement } from "@/components/admin/exercise-management"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"

export default function AdminExercisesPage() {
  const [exercises, setExercises] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [admin, setAdmin] = useState(false)

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const isAdminResult = await isAdmin()
        setAdmin(isAdminResult)
      } catch (err: any) {
        setError(err.message)
      }
    }

    checkAdmin()
  }, [])

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const response = await fetch("/api/exercises")
        if (!response.ok) {
          throw new Error("Failed to fetch exercises")
        }
        const data = await response.json()
        setExercises(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (admin) {
      fetchExercises()
    }
  }, [admin])

  if (!admin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6 flex gap-4">
            <Button variant="outline" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al Inicio
              </Link>
            </Button>
          </div>

          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Acceso Denegado</h1>
            <p className="text-lg text-gray-700 dark:text-gray-300">
              No tienes permiso para acceder a esta página
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex gap-4">
          <Button variant="outline" asChild>
            <Link href="/admin">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Panel
            </Link>
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Gestión de Ejercicios</h1>
          <p className="text-lg text-gray-700 dark:text-gray-300">
            Administra los ejercicios disponibles para todos los usuarios
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error de Carga</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : (
          <ExerciseManagement initialExercises={exercises} />
        )}
      </div>
    </div>
  )
}
