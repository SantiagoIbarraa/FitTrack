"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calculator, Info, User } from "lucide-react"
import { getUserProfile } from "@/lib/user-actions"
import { calculateBMI } from "@/lib/health-actions"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface BMIResult {
  bmi: number
  category: string
  advice: string
  healthyWeightRange: { min: number; max: number }
  source: string
  genderNote?: string
}

export default function BMICalculator() {
  const [bmiResult, setBmiResult] = useState<BMIResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [userAge, setUserAge] = useState<number | null>(null)
  const [userSex, setUserSex] = useState<string | null>(null)

  useEffect(() => {
    const loadBMI = async () => {
      try {
        const profile = await getUserProfile()
        if (profile && profile.weight && profile.height) {
          let age: number | undefined
          if (profile.dateOfBirth) {
            const birthDate = new Date(profile.dateOfBirth)
            age = new Date().getFullYear() - birthDate.getFullYear()
            setUserAge(age)
          }

          setUserSex(profile.sex || null)

          const result = await calculateBMI(profile.weight, profile.height, age, profile.sex || undefined)
          setBmiResult(result)
        }
      } catch (error) {
        console.error("Error calculating BMI:", error)
      } finally {
        setLoading(false)
      }
    }

    loadBMI()
  }, [])

  if (loading) {
    return (
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardContent className="p-6">
          <div className="text-center text-gray-500 dark:text-gray-400">Calculando IMC...</div>
        </CardContent>
      </Card>
    )
  }

  if (!bmiResult) {
    return (
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <Calculator className="h-5 w-5" />
            Calculadora de IMC
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">
            Completa tu perfil con peso y estatura para calcular tu IMC
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Necesitas agregar tu peso y estatura en tu perfil para calcular el IMC
            </p>
            <Button className="bg-blue-600 hover:bg-blue-700">Ir a Perfil</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getCategoryColor = (category: string) => {
    if (category.includes("Bajo peso")) return "text-yellow-600 dark:text-yellow-400"
    if (category.includes("normal")) return "text-green-600 dark:text-green-400"
    if (category.includes("Sobrepeso")) return "text-orange-600 dark:text-orange-400"
    return "text-red-600 dark:text-red-400"
  }

  const getCategoryBadgeVariant = (category: string): "default" | "secondary" | "destructive" | "outline" => {
    if (category.includes("Bajo peso")) return "outline"
    if (category.includes("normal")) return "default"
    if (category.includes("Sobrepeso")) return "secondary"
    return "destructive"
  }

  const getBMIProgress = (bmi: number) => {
    // Map BMI to progress bar (0-100)
    // 15 = 0%, 25 = 50%, 35 = 100%
    if (bmi < 15) return 0
    if (bmi > 35) return 100
    return ((bmi - 15) / 20) * 100
  }

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
          <Calculator className="h-5 w-5" />
          Tu Índice de Masa Corporal (IMC)
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-300">
          Calculado según tu peso, estatura{userAge && ", edad"}
          {userSex && " y sexo"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* IMC Value */}
        <div className="text-center">
          <div className="text-5xl font-bold text-gray-900 dark:text-white mb-2">{bmiResult.bmi}</div>
          <Badge variant={getCategoryBadgeVariant(bmiResult.category)} className="text-sm px-3 py-1">
            {bmiResult.category}
          </Badge>
          {userSex && (
            <div className="flex items-center justify-center gap-1 mt-2 text-sm text-gray-600 dark:text-gray-400">
              <User className="h-4 w-4" />
              <span>{userSex === "male" ? "Hombre" : userSex === "female" ? "Mujer" : "No especificado"}</span>
            </div>
          )}
        </div>

        {/* IMC Scale */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
            <span>Bajo peso</span>
            <span>Normal</span>
            <span>Sobrepeso</span>
            <span>Obesidad</span>
          </div>
          <Progress value={getBMIProgress(bmiResult.bmi)} className="h-3" />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-500">
            <span>&lt;18.5</span>
            <span>18.5-24.9</span>
            <span>25-29.9</span>
            <span>≥30</span>
          </div>
        </div>

        {/* Healthy Weight Range */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">
                Rango de peso saludable para tu estatura
              </p>
              <p className="text-lg font-semibold text-blue-700 dark:text-blue-400">
                {bmiResult.healthyWeightRange.min} - {bmiResult.healthyWeightRange.max} kg
              </p>
            </div>
          </div>
        </div>

        {/* Gender Note */}
        {bmiResult.genderNote && (
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <User className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-purple-900 dark:text-purple-300">{bmiResult.genderNote}</p>
            </div>
          </div>
        )}

        {/* Advice */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Recomendaciones Personalizadas</h4>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{bmiResult.advice}</p>
        </div>

        {/* Source */}
        <div className="text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-600 pt-4">
          <p className="flex items-center gap-1">
            <Info className="h-3 w-3" />
            {bmiResult.source}
          </p>
          {userAge && userAge < 18 && (
            <p className="mt-2 text-yellow-600 dark:text-yellow-400">
              Nota: Para menores de 18 años, se recomienda usar tablas de percentiles específicas por edad y sexo.
              Consulta con un pediatra.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
