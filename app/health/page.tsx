"use client"

import { Suspense } from "react"
import BMICalculator from "@/components/health/bmi-calculator"
import VitalSignsTracker from "@/components/health/vital-signs-tracker"
import { Card, CardContent } from "@/components/ui/card"

export default function HealthPage() {
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Salud y Métricas</h1>
        <p className="text-gray-600 dark:text-gray-300">Monitorea tu IMC, frecuencia cardíaca y presión arterial</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Suspense
          fallback={
            <Card className="bg-white dark:bg-gray-800">
              <CardContent className="p-6">
                <div className="text-center text-gray-500">Cargando...</div>
              </CardContent>
            </Card>
          }
        >
          <BMICalculator />
        </Suspense>

        <div className="space-y-6">
          <Suspense
            fallback={
              <Card className="bg-white dark:bg-gray-800">
                <CardContent className="p-6">
                  <div className="text-center text-gray-500">Cargando...</div>
                </CardContent>
              </Card>
            }
          >
            <VitalSignsTracker />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
