"use client"

import { useEffect, useState } from "react"
import { Dumbbell, Footprints, Utensils, MessageSquare, TrendingUp, Heart, Bot } from "lucide-react"

const services = [
  {
    icon: Dumbbell,
    title: "Gimnasio",
    description:
      "Crea y sigue rutinas personalizadas de entrenamiento. Registra tus ejercicios, series y repeticiones con facilidad.",
    color: "text-blue-600",
  },
  {
    icon: Footprints,
    title: "Running",
    description: "Monitorea tus carreras con precisión. Distancia, tiempo, ritmo y calorías quemadas en cada sesión.",
    color: "text-blue-500",
  },
  {
    icon: Bot,
    title: "Asistente FitTrack",
    description: "Chat con IA y análisis de comidas",
    color: "text-purple-600",
  },
  {
    icon: MessageSquare,
    title: "Mensajería",
    description: "Comunícate directamente con entrenadores y nutricionistas profesionales para guía personalizada.",
    color: "text-blue-400",
  },
  {
    icon: TrendingUp,
    title: "Progreso",
    description:
      "Visualiza tu evolución con gráficos detallados. Métricas de peso, fuerza y resistencia en tiempo real.",
    color: "text-blue-800",
  },
  {
    icon: Heart,
    title: "Bienestar",
    description: "Seguimiento integral de tu salud. Combina ejercicio, nutrición y descanso para resultados óptimos.",
    color: "text-blue-500",
  },
]

export function ServicesCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % services.length)
        setIsAnimating(false)
      }, 500)
    }, 6000)

    return () => clearInterval(interval)
  }, [])

  const currentService = services[currentIndex]
  const Icon = currentService.icon

  return (
    <div className="flex flex-col items-center justify-center h-full px-6">
      <div
        className={`transition-all duration-500 ${
          isAnimating ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
        }`}
      >
        <div className="flex justify-center mb-6">
          <div className="bg-blue-100 backdrop-blur-sm p-6 rounded-2xl border border-blue-200">
            <Icon className={`h-16 w-16 ${currentService.color}`} strokeWidth={1.5} />
          </div>
        </div>

        <h3 className="text-3xl font-bold text-blue-900 dark:text-blue-300 mb-4 text-center">{currentService.title}</h3>

        <p className="text-lg text-gray-700 dark:text-white text-center max-w-md leading-relaxed">{currentService.description}</p>
      </div>

      <div className="flex gap-2 mt-8">
        {services.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setIsAnimating(true)
              setTimeout(() => {
                setCurrentIndex(index)
                setIsAnimating(false)
              }, 500)
            }}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentIndex ? "w-8 bg-blue-600" : "w-2 bg-blue-300 hover:bg-blue-400"
            }`}
            aria-label={`Ir a ${services[index].title}`}
          />
        ))}
      </div>
    </div>
  )
}
