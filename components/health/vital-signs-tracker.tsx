"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Heart, Activity, AlertCircle, CheckCircle, AlertTriangle } from "lucide-react"
import { saveHealthMetric, getHealthMetrics } from "@/lib/health-actions"
import { Badge } from "@/components/ui/badge"
import { useActionState } from "react"

interface HealthMetric {
  id: string
  date: string
  weight: number | null
  heart_rate: number | null
  systolic_pressure: number | null
  diastolic_pressure: number | null
  heart_rate_status: string | null
  blood_pressure_status: string | null
  notes: string | null
}

export default function VitalSignsTracker() {
  const [state, formAction] = useActionState(saveHealthMetric, null)
  const [metrics, setMetrics] = useState<HealthMetric[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    loadMetrics()
  }, [])

  const loadMetrics = async () => {
    try {
      const result = await getHealthMetrics(10)
      if (result.data) {
        setMetrics(result.data)
      }
    } catch (error) {
      console.error("Error loading metrics:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (formData: FormData) => {
    const result = await formAction(formData)
    if (result?.success) {
      setShowForm(false)
      await loadMetrics()
    }
  }

  const getHeartRateStatus = (heartRate: number) => {
    if (heartRate < 40) return { status: "Muy baja", color: "text-red-600 dark:text-red-400", icon: AlertCircle }
    if (heartRate < 60)
      return { status: "Baja (atlético)", color: "text-blue-600 dark:text-blue-400", icon: CheckCircle }
    if (heartRate <= 100) return { status: "Normal", color: "text-green-600 dark:text-green-400", icon: CheckCircle }
    if (heartRate <= 120)
      return { status: "Elevada", color: "text-orange-600 dark:text-orange-400", icon: AlertTriangle }
    return { status: "Muy elevada", color: "text-red-600 dark:text-red-400", icon: AlertCircle }
  }

  const getBloodPressureStatus = (systolic: number, diastolic: number) => {
    if (systolic < 120 && diastolic < 80)
      return { status: "Normal", color: "text-green-600 dark:text-green-400", icon: CheckCircle }
    if (systolic < 130 && diastolic < 80)
      return { status: "Elevada", color: "text-yellow-600 dark:text-yellow-400", icon: AlertTriangle }
    if (systolic < 140 || diastolic < 90)
      return { status: "Hipertensión etapa 1", color: "text-orange-600 dark:text-orange-400", icon: AlertTriangle }
    if (systolic < 180 || diastolic < 120)
      return { status: "Hipertensión etapa 2", color: "text-red-600 dark:text-red-400", icon: AlertCircle }
    return { status: "Crisis hipertensiva", color: "text-red-700 dark:text-red-500", icon: AlertCircle }
  }

  if (loading) {
    return (
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardContent className="p-6">
          <div className="text-center text-gray-500 dark:text-gray-400">Cargando métricas...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Add New Metric Form */}
      {showForm ? (
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Registrar Signos Vitales</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              Anota tu frecuencia cardíaca y presión arterial
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={handleSubmit} className="space-y-4">
              {state?.error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded text-sm">
                  {state.error}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="heartRate" className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    Frecuencia Cardíaca (lpm)
                  </Label>
                  <Input
                    id="heartRate"
                    name="heartRate"
                    type="number"
                    min="30"
                    max="250"
                    placeholder="72"
                    className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">Normal: 60-100 lpm en reposo</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight" className="text-gray-700 dark:text-gray-300">
                    Peso (kg) - Opcional
                  </Label>
                  <Input
                    id="weight"
                    name="weight"
                    type="number"
                    step="0.1"
                    min="30"
                    max="300"
                    placeholder="70"
                    className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Presión Arterial (mmHg)
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Input
                      id="systolicPressure"
                      name="systolicPressure"
                      type="number"
                      min="60"
                      max="250"
                      placeholder="120 (sistólica)"
                      className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <Input
                      id="diastolicPressure"
                      name="diastolicPressure"
                      type="number"
                      min="40"
                      max="150"
                      placeholder="80 (diastólica)"
                      className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Normal: &lt;120/80 mmHg</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-gray-700 dark:text-gray-300">
                  Notas (opcional)
                </Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Ej: Después de ejercicio, en ayunas, etc."
                  className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                  rows={2}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                  Guardar Registro
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <Activity className="h-5 w-5" />
              Signos Vitales
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              Monitorea tu frecuencia cardíaca y presión arterial
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setShowForm(true)} className="w-full bg-blue-600 hover:bg-blue-700">
              <Heart className="h-4 w-4 mr-2" />
              Registrar Signos Vitales
            </Button>
          </CardContent>
        </Card>
      )}

      {/* History */}
      {metrics.length > 0 && (
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Historial de Registros</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">Últimas 10 mediciones</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.map((metric) => {
                const heartRateInfo = metric.heart_rate ? getHeartRateStatus(metric.heart_rate) : null
                const bpInfo =
                  metric.systolic_pressure && metric.diastolic_pressure
                    ? getBloodPressureStatus(metric.systolic_pressure, metric.diastolic_pressure)
                    : null

                return (
                  <div
                    key={metric.id}
                    className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(metric.date).toLocaleString("es-ES", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </div>
                      {metric.weight && (
                        <Badge variant="outline" className="text-xs">
                          {metric.weight} kg
                        </Badge>
                      )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      {metric.heart_rate && heartRateInfo && (
                        <div className="flex items-center gap-3">
                          <Heart className={`h-5 w-5 ${heartRateInfo.color}`} />
                          <div>
                            <div className="text-lg font-semibold text-gray-900 dark:text-white">
                              {metric.heart_rate} lpm
                            </div>
                            <div className={`text-sm flex items-center gap-1 ${heartRateInfo.color}`}>
                              <heartRateInfo.icon className="h-3 w-3" />
                              {heartRateInfo.status}
                            </div>
                          </div>
                        </div>
                      )}

                      {metric.systolic_pressure && metric.diastolic_pressure && bpInfo && (
                        <div className="flex items-center gap-3">
                          <Activity className={`h-5 w-5 ${bpInfo.color}`} />
                          <div>
                            <div className="text-lg font-semibold text-gray-900 dark:text-white">
                              {metric.systolic_pressure}/{metric.diastolic_pressure} mmHg
                            </div>
                            <div className={`text-sm flex items-center gap-1 ${bpInfo.color}`}>
                              <bpInfo.icon className="h-3 w-3" />
                              {bpInfo.status}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {metric.notes && (
                      <div className="mt-3 text-sm text-gray-600 dark:text-gray-400 italic border-t border-gray-200 dark:border-gray-600 pt-2">
                        {metric.notes}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reference Information */}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-blue-900 dark:text-blue-300 text-base">Valores de Referencia</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-1">Frecuencia Cardíaca en Reposo:</h4>
            <ul className="space-y-1 text-blue-800 dark:text-blue-400">
              <li>• Normal: 60-100 lpm</li>
              <li>• Atletas: 40-60 lpm</li>
              <li>• Elevada: &gt;100 lpm (consultar médico)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-1">Presión Arterial:</h4>
            <ul className="space-y-1 text-blue-800 dark:text-blue-400">
              <li>• Normal: &lt;120/80 mmHg</li>
              <li>• Elevada: 120-129/&lt;80 mmHg</li>
              <li>• Hipertensión etapa 1: 130-139/80-89 mmHg</li>
              <li>• Hipertensión etapa 2: ≥140/≥90 mmHg</li>
            </ul>
          </div>
          <p className="text-xs text-blue-700 dark:text-blue-400 pt-2 border-t border-blue-200 dark:border-blue-700">
            Fuente: American Heart Association - https://www.heart.org
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
