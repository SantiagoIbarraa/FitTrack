"use client"

import { useState } from "react"
import { Dumbbell, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import WorkoutForm from "@/components/gym/workout-form"
import WorkoutList from "@/components/gym/workout-list"
import RoutineList from "@/components/gym/routine-list"
import RoutineForm from "@/components/gym/routine-form"
import RoutineDetail from "@/components/gym/routine-detail"
import ExerciseHistory from "@/components/gym/exercise-history"
import GymMetrics from "@/components/gym/gym-metrics"

interface Workout {
  id: string
  exercise_name: string
  weight_kg: number | null
  repetitions: number | null
  sets: number | null
  created_at: string
}

type ViewMode = "routines" | "individual" | "routine-detail" | "create-routine" | "history" | "metrics"

export default function GymPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>("routines") // Default to routines view
  const [selectedRoutine, setSelectedRoutine] = useState<{ id: string; name: string } | null>(null)

  const handleWorkoutAdded = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  const handleEditWorkout = (workout: Workout) => {
    setEditingWorkout(workout)
  }

  const handleEditComplete = () => {
    setEditingWorkout(null)
    setRefreshTrigger((prev) => prev + 1)
  }

  const handleViewRoutine = (routineId: string, routineName: string) => {
    setSelectedRoutine({ id: routineId, name: routineName })
    setViewMode("routine-detail")
  }

  const handleCreateRoutine = () => {
    setViewMode("create-routine")
  }

  const handleRoutineCreated = () => {
    setViewMode("routines")
    setRefreshTrigger((prev) => prev + 1)
  }

  const handleBackToRoutines = () => {
    setSelectedRoutine(null)
    setViewMode("routines")
    setRefreshTrigger((prev) => prev + 1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>
        </div>
        <div className="flex items-center gap-3 mb-2">
          <Dumbbell className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gimnasio</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-300">Organiza tus entrenamientos por rutinas o registra ejercicios individuales</p>
      </div>

      {/* Navigation tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setViewMode("routines")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            viewMode === "routines" || viewMode === "routine-detail" || viewMode === "create-routine"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
          }`}
        >
          Rutinas
        </button>
        <button
          onClick={() => setViewMode("individual")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            viewMode === "individual" ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
          }`}
        >
          Ejercicios Individuales
        </button>
        <button
          onClick={() => setViewMode("history")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            viewMode === "history" ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
          }`}
        >
          Historial
        </button>
        <button
          onClick={() => setViewMode("metrics")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            viewMode === "metrics" ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
          }`}
        >
          Métricas
        </button>
      </div>

      <div className="grid gap-6">
        {/* Conditional rendering based on view mode */}
        {viewMode === "routines" && (
          <RoutineList
            refreshTrigger={refreshTrigger}
            onViewRoutine={handleViewRoutine}
            onCreateRoutine={handleCreateRoutine}
          />
        )}

        {viewMode === "create-routine" && (
          <RoutineForm onRoutineCreated={handleRoutineCreated} onCancel={() => setViewMode("routines")} />
        )}

        {viewMode === "routine-detail" && selectedRoutine && (
          <RoutineDetail
            routineId={selectedRoutine.id}
            routineName={selectedRoutine.name}
            onBack={handleBackToRoutines}
          />
        )}

        {viewMode === "individual" && (
          <>
            <WorkoutForm
              onWorkoutAdded={handleWorkoutAdded}
              editWorkout={editingWorkout}
              onEditComplete={handleEditComplete}
            />
            <WorkoutList refreshTrigger={refreshTrigger} onEditWorkout={handleEditWorkout} />
          </>
        )}

        {viewMode === "history" && <ExerciseHistory />}
        {viewMode === "metrics" && <GymMetrics />}
      </div>
      </div>
    </div>
  )
}
