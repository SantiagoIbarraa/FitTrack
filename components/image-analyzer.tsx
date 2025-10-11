"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Camera, Upload, X, Sparkles, User, Loader2 } from "lucide-react"
import { getUserProfile } from "@/lib/user-actions"
import { calculateBMI } from "@/lib/health-actions"

interface UserProfile {
  weight: number | null
  height: number | null
  dateOfBirth: string | null
  sex: string | null
  bmi?: number
  bmiCategory?: string
  age?: number
}

export default function ImageAnalyzer() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadUserProfile()
  }, [])

  const loadUserProfile = async () => {
    try {
      const profile = await getUserProfile()
      if (profile) {
        let age: number | undefined
        let bmi: number | undefined
        let bmiCategory: string | undefined

        if (profile.dateOfBirth) {
          const birthDate = new Date(profile.dateOfBirth)
          age = new Date().getFullYear() - birthDate.getFullYear()
        }

        if (profile.weight && profile.height) {
          const bmiResult = await calculateBMI(profile.weight, profile.height, age, profile.sex || undefined)
          bmi = bmiResult.bmi
          bmiCategory = bmiResult.category
        }

        setUserProfile({
          weight: profile.weight,
          height: profile.height,
          dateOfBirth: profile.dateOfBirth,
          sex: profile.sex,
          bmi,
          bmiCategory,
          age,
        })
      }
    } catch (error) {
      console.error("Error loading user profile:", error)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setSelectedImage(reader.result as string)
        setAnalysis(null)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAnalyze = async () => {
    if (!selectedImage) return

    setIsAnalyzing(true)
    setAnalysis(null)

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: selectedImage,
          userProfile,
        }),
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      setAnalysis(data.analysis)
    } catch (error) {
      console.error("Error analyzing image:", error)
      setAnalysis("Lo siento, hubo un error al analizar la imagen. Por favor intenta de nuevo o verifica tu conexión.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleClear = () => {
    setSelectedImage(null)
    setAnalysis(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
    if (cameraInputRef.current) cameraInputRef.current.value = ""
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="h-6 w-6 text-purple-600" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Análisis Nutricional con IA</h2>
        </div>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Toma una foto de tu comida y obtén un análisis nutricional detallado al instante
        </p>
        {userProfile && userProfile.weight && userProfile.bmi && (
          <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg px-4 py-2 text-sm">
            <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-blue-900 dark:text-blue-300">
              Tu perfil: {userProfile.weight}kg, IMC {userProfile.bmi} ({userProfile.bmiCategory})
            </span>
          </div>
        )}
      </div>

      {/* Upload Section */}
      <Card className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-gray-100">
            <Camera className="h-5 w-5" />
            Captura o Sube tu Comida
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!selectedImage ? (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Button
                  onClick={() => cameraInputRef.current?.click()}
                  className="h-32 bg-blue-500 hover:bg-blue-600 text-white flex flex-col gap-2"
                  size="lg"
                >
                  <Camera className="h-8 w-8" />
                  <span>Tomar Foto</span>
                </Button>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="h-32 border-2 border-dashed border-gray-300 dark:border-gray-500 hover:border-blue-500 dark:hover:border-blue-400 flex flex-col gap-2"
                  size="lg"
                >
                  <Upload className="h-8 w-8" />
                  <span>Subir Imagen</span>
                </Button>
              </div>
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                className="hidden"
              />
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
              <p className="text-sm text-center text-gray-500 dark:text-gray-400">
                Formatos soportados: JPG, PNG, WEBP
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={selectedImage || "/placeholder.svg"}
                  alt="Comida seleccionada"
                  className="w-full h-auto rounded-lg border-2 border-gray-200 dark:border-gray-600"
                />
                <Button onClick={handleClear} variant="destructive" size="sm" className="absolute top-2 right-2">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                size="lg"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Analizando con IA...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Analizar Comida
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysis && (
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-gray-100">
              <Sparkles className="h-5 w-5 text-purple-600" />
              Análisis Nutricional
              <Badge variant="secondary" className="ml-2">
                <Sparkles className="h-3 w-3 mr-1" />
                Gemini AI
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-200">{analysis}</div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips Section */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600 shadow-sm">
          <CardContent className="p-4 text-center">
            <Camera className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-1">Foto Clara</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">Asegúrate de que la comida esté bien iluminada</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600 shadow-sm">
          <CardContent className="p-4 text-center">
            <Sparkles className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-1">IA Avanzada</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">Análisis personalizado según tu perfil</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600 shadow-sm">
          <CardContent className="p-4 text-center">
            <User className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-1">Personalizado</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">Recomendaciones según tus objetivos</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
