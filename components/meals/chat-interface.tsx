"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Send, Bot, Utensils, Apple, Coffee, Calculator, User, Zap, FileText } from "lucide-react"
import { getUserProfile } from "@/lib/user-actions"
import { calculateBMI } from "@/lib/health-actions"

interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
}

interface UserProfile {
  weight: number | null
  height: number | null
  dateOfBirth: string | null
  sex: string | null
  bmi?: number
  bmiCategory?: string
  age?: number
}

export default function ChatInterface() {
  const messageIdCounter = useRef(0)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [responseMode, setResponseMode] = useState<"quick" | "extended">("quick")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    setIsClient(true)
    loadUserProfile()
    setMessages([
      {
        id: (++messageIdCounter.current).toString(),
        content:
          "¡Hola! Soy tu asistente nutricional de FitTrack. Puedo ayudarte con consejos sobre alimentación, calcular tus necesidades calóricas, sugerir recetas y crear planes de comidas. Pregúntame sobre: calorías, proteínas, ganar músculo, perder peso, meal prep, recetas, suplementos, y mucho más. ¿En qué puedo ayudarte?",
        isUser: false,
        timestamp: new Date(),
      },
    ])
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
          // Normalizar sexo a 'male'/'female' si viene en español
          const normalizedSex = profile.sex
            ? (profile.sex.toLowerCase() === "masculino"
                ? "male"
                : profile.sex.toLowerCase() === "femenino"
                  ? "female"
                  : profile.sex.toLowerCase() === "male" || profile.sex.toLowerCase() === "female"
                    ? profile.sex.toLowerCase()
                    : undefined)
            : undefined
          const bmiResult = await calculateBMI(profile.weight, profile.height, age, normalizedSex)
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

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: (++messageIdCounter.current).toString(),
      content: inputValue,
      isUser: true,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    try {
      console.log("[v0] Chat Interface: Sending message to API")
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: inputValue,
          userProfile,
          responseMode,
        }),
      })

      console.log("[v0] Chat Interface: Response status:", response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("[v0] Chat Interface: Error response:", errorText)
        throw new Error(`Error del servidor (${response.status}): ${errorText}`)
      }

      let data
      try {
        const responseText = await response.text()
        console.log("[v0] Chat Interface: Response text length:", responseText.length)
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error("[v0] Chat Interface: JSON parse error:", parseError)
        throw new Error("La respuesta del servidor no es válida. Por favor intenta de nuevo.")
      }

      console.log("[v0] Chat Interface: Data parsed successfully", {
        hasError: !!data.error,
        hasResponse: !!data.response,
      })

      if (data.error) {
        throw new Error(data.error)
      }

      const aiResponse: Message = {
        id: (++messageIdCounter.current).toString(),
        content: data.response.replaceAll("**", ""),
        isUser: false,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiResponse])
      console.log("[v0] Chat Interface: Message added successfully")
    } catch (error) {
      console.error("[v0] Chat Interface: Error sending message:", error)
      const errorMessage: Message = {
        id: (++messageIdCounter.current).toString(),
        content: `❌ ${error instanceof Error ? error.message : "Lo siento, hubo un error al procesar tu mensaje. Por favor intenta de nuevo o verifica tu conexión."}\n\n💡 Si el error menciona "API key", asegúrate de que las variables GOOGLE_GENERATIVE_AI_API_KEY o GEMINI_API_KEY estén configuradas en la sección 'Vars' del sidebar de v0.`,
        isUser: false,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!isClient) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="space-y-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Bot className="h-6 w-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Asistente Nutricional</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Consejos personalizados basados en tu perfil, objetivos y progreso de entrenamiento
            </p>
          </div>
          <div className="text-center py-8">
            <div className="text-gray-500">Cargando chat nutricional...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Bot className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Asistente Nutricional</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Consejos personalizados basados en tu perfil, objetivos y progreso de entrenamiento
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

        {/* Response Mode Selector */}
        <div className="flex justify-center gap-2">
          <Button
            variant={responseMode === "quick" ? "default" : "outline"}
            size="sm"
            onClick={() => setResponseMode("quick")}
            className="flex items-center gap-2"
          >
            <Zap className="h-4 w-4" />
            Respuesta Rápida
          </Button>
          <Button
            variant={responseMode === "extended" ? "default" : "outline"}
            size="sm"
            onClick={() => setResponseMode("extended")}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Respuesta Extensa
          </Button>
        </div>

        {/* Quick Topics */}
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Temas populares:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              "Mi perfil",
              "Mis ejercicios",
              "Cuántas calorías necesito",
              "Ganar músculo",
              "Perder peso",
              "Pre entreno",
              "Post entreno",
              "Meal prep",
              "Recetas",
              "Suplementos",
              "Proteínas",
              "Carbohidratos",
            ].map((topic) => (
              <Badge
                key={topic}
                variant="outline"
                className="cursor-pointer transition-colors border-gray-300 dark:border-gray-500 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 bg-white dark:bg-gray-700"
                onClick={() => setInputValue(topic)}
              >
                {topic}
              </Badge>
            ))}
          </div>
        </div>

        {/* Chat Messages */}
        <Card className="mb-4 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-gray-100">
              <Bot className="h-5 w-5" />
              Chat Nutricional
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto mb-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.isUser
                        ? "bg-blue-500 text-white shadow-sm"
                        : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs opacity-60 mt-1">{message.timestamp.toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4 animate-pulse text-blue-600" />
                      <p className="text-sm">Analizando tu consulta...</p>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Pregunta sobre nutrición, calorías, proteínas, recetas..."
                className="flex-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-500 text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !inputValue.trim()}
                className="bg-blue-500 hover:bg-blue-600 text-white shadow-sm"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Nutrition Tips */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <Calculator className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <h4 className="font-semibold text-gray-800 dark:text-gray-100">Personalizado</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">Según tu perfil</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <Apple className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <h4 className="font-semibold text-gray-800 dark:text-gray-100">100+ Palabras Clave</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">Respuestas detalladas</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <Utensils className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <h4 className="font-semibold text-gray-800 dark:text-gray-100">Recetas y Planes</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">Meal prep incluido</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <Coffee className="h-8 w-8 text-orange-500 mx-auto mb-2" />
              <h4 className="font-semibold text-gray-800 dark:text-gray-100">Tu Progreso</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">Integrado con gym</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
