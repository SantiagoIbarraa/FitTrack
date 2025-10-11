"use client"

import { useState } from "react"
import { MapPin, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import RunningForm from "@/components/running/running-form"
import RunningList from "@/components/running/running-list"
import RunningStats from "@/components/running/running-stats"
import RunningCharts from "@/components/running/running-charts"

export default function RunningPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [viewMode, setViewMode] = useState<"sessions" | "charts">("sessions")

  const handleSessionAdded = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  return (
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
          <MapPin className="h-8 w-8 text-green-600" />
          <h1 className="text-3xl font-bold">Running</h1>
        </div>
        <p className="text-gray-600">Registra y analiza tus sesiones de carrera</p>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setViewMode("sessions")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            viewMode === "sessions" ? "bg-green-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Sesiones
        </button>
        <button
          onClick={() => setViewMode("charts")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            viewMode === "charts" ? "bg-green-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Gráficos
        </button>
      </div>

      <div className="grid gap-6">
        {viewMode === "sessions" && (
          <>
            <RunningForm onSessionAdded={handleSessionAdded} />
            <RunningStats refreshTrigger={refreshTrigger} />
            <RunningList refreshTrigger={refreshTrigger} />
          </>
        )}

        {viewMode === "charts" && <RunningCharts />}
      </div>
    </div>
  )
}
