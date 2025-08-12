"use client"

import { useState } from "react"
import { MapPin } from "lucide-react"
import RunningForm from "@/components/running/running-form"
import RunningList from "@/components/running/running-list"
import RunningStats from "@/components/running/running-stats"

export default function RunningPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleSessionAdded = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <MapPin className="h-8 w-8 text-green-600" />
          <h1 className="text-3xl font-bold">Running</h1>
        </div>
        <p className="text-gray-600">Registra y analiza tus sesiones de carrera</p>
      </div>

      <div className="grid gap-6">
        <RunningForm onSessionAdded={handleSessionAdded} />
        <RunningStats refreshTrigger={refreshTrigger} />
        <RunningList refreshTrigger={refreshTrigger} />
      </div>
    </div>
  )
}
