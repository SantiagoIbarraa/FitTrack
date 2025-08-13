"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Send, MessageCircle, Utensils, Apple, Coffee, Calculator } from "lucide-react"

interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
}

const NUTRITION_KEYWORDS = {
  proteína:
    "Excelente para el desarrollo muscular. Te recomiendo pollo, pescado, huevos, legumbres, quinoa y yogur griego. Consume 1.6-2.2g por kg de peso corporal.",
  carbohidratos:
    "Importantes para la energía. Opta por avena, arroz integral, quinoa, batatas, frutas y verduras. Evita azúcares refinados.",
  grasas:
    "Necesarias para las hormonas y absorción de vitaminas. Incluye aguacate, nueces, aceite de oliva, pescado graso y semillas.",
  desayuno:
    "Un buen desayuno podría incluir: avena con frutas y nueces, huevos revueltos con verduras, yogur griego con granola, o batido de proteínas con plátano.",
  almuerzo:
    "Para el almuerzo te sugiero: ensalada con pollo y aguacate, quinoa con verduras y salmón, arroz integral con legumbres, o wrap de pavo con verduras.",
  cena: "Una cena ligera: pescado con verduras al vapor, ensalada con proteína magra, sopa de lentejas, o pollo a la plancha con brócoli.",
  snack:
    "Snacks saludables: frutas con nueces, yogur griego, hummus con verduras, batido de proteínas, o puñado de almendras.",
  hidratación:
    "Mantente hidratado con 2-3 litros de agua al día. También puedes incluir té verde, infusiones y agua con limón.",
  vitaminas:
    "Obtén vitaminas de frutas y verduras variadas. Los colores diferentes aportan nutrientes únicos. Considera suplementos si es necesario.",
  fibra:
    "La fibra es clave para la digestión. Incluye verduras, frutas, legumbres, cereales integrales y semillas de chía.",
  calcio:
    "Importante para huesos fuertes. Encuentra calcio en lácteos, verduras de hoja verde, sardinas, almendras y tofu.",
  hierro:
    "Esencial para transportar oxígeno. Consume carnes rojas magras, espinacas, lentejas, quinoa y combina con vitamina C.",
  omega3:
    "Grasas antiinflamatorias. Encuentra omega-3 en salmón, sardinas, nueces, semillas de chía y aceite de linaza.",
  antioxidantes:
    "Protegen contra el daño celular. Consume bayas, té verde, chocolate negro, verduras coloridas y especias como cúrcuma.",
  prebióticos: "Alimentan las bacterias buenas. Incluye ajo, cebolla, plátanos verdes, avena y espárragos en tu dieta.",
  probióticos: "Bacterias beneficiosas para la digestión. Consume yogur, kéfir, chucrut, kimchi y otros fermentados.",
  metabolismo:
    "Para acelerar el metabolismo: come proteínas en cada comida, bebe té verde, haz ejercicio de fuerza y mantén horarios regulares.",
  energía:
    "Para más energía: consume carbohidratos complejos, mantén niveles estables de azúcar, hidrátate bien y duerme suficiente.",
  digestión:
    "Para mejor digestión: mastica bien, come despacio, incluye fibra, bebe agua entre comidas y evita comidas muy grandes.",
  inflamación:
    "Para reducir inflamación: consume omega-3, antioxidantes, evita azúcares refinados y alimentos procesados.",
  colesterol:
    "Para controlar colesterol: consume avena, nueces, pescado graso, evita grasas trans y aumenta fibra soluble.",
  diabetes:
    "Para controlar glucosa: elige carbohidratos complejos, incluye proteínas y fibra, evita azúcares simples y mantén horarios regulares.",
  hipertensión:
    "Para controlar presión: reduce sodio, aumenta potasio (plátanos, espinacas), consume ajo y mantén peso saludable.",
  anemia:
    "Para prevenir anemia: consume hierro con vitamina C, incluye carnes magras, espinacas, lentejas y evita té con comidas.",
  estreñimiento:
    "Para mejorar tránsito: aumenta fibra gradualmente, bebe más agua, incluye probióticos y haz ejercicio regular.",
  acidez:
    "Para reducir acidez: evita comidas picantes y grasosas, come porciones pequeñas, no te acuestes después de comer.",
  insomnio:
    "Para mejor sueño: evita cafeína tarde, consume magnesio (nueces, espinacas), cena ligero y mantén horarios regulares.",
  estrés:
    "Para manejar estrés: consume magnesio, omega-3, evita exceso de cafeína, incluye alimentos ricos en vitaminas B.",
  memoria:
    "Para mejorar memoria: consume omega-3, antioxidantes (arándanos), nueces, té verde y mantén glucosa estable.",
  piel: "Para piel saludable: consume vitamina C, E, zinc, omega-3, mantente hidratado y evita azúcares refinados.",
  cabello: "Para cabello fuerte: consume proteínas, hierro, zinc, biotina (huevos, nueces) y vitaminas del complejo B.",
  uñas: "Para uñas fuertes: consume proteínas, biotina, zinc, hierro y mantén buena hidratación.",
  huesos:
    "Para huesos fuertes: consume calcio, vitamina D, magnesio, haz ejercicio de resistencia y evita exceso de sodio.",
  articulaciones:
    "Para articulaciones sanas: consume omega-3, antioxidantes, colágeno, mantén peso saludable y haz ejercicio regular.",
  inmunidad: "Para fortalecer inmunidad: consume vitamina C, D, zinc, probióticos, duerme bien y maneja el estrés.",
  detox:
    "Para desintoxicar: bebe mucha agua, consume verduras crucíferas, té verde, limón, reduce procesados y alcohol.",
  ayuno:
    "Sobre ayuno intermitente: puede ayudar con peso y metabolismo, pero consulta profesional, mantén hidratación y nutrición adecuada.",
  suplementos:
    "Sobre suplementos: idealmente obtén nutrientes de alimentos, pero considera vitamina D, B12, omega-3 si es necesario.",
  vegetariano:
    "Dieta vegetariana: asegura proteínas completas, vitamina B12, hierro, zinc, omega-3 de fuentes vegetales.",
  vegano:
    "Dieta vegana: planifica bien proteínas, B12, hierro, calcio, omega-3, vitamina D y zinc de fuentes vegetales.",
  keto: "Dieta cetogénica: alta en grasas, muy baja en carbohidratos. Puede ayudar con peso pero requiere supervisión médica.",
  paleo:
    "Dieta paleo: enfoque en alimentos no procesados, carnes, pescados, verduras, frutas, nueces. Evita granos y lácteos.",
  mediterránea:
    "Dieta mediterránea: rica en aceite de oliva, pescado, verduras, frutas, granos integrales. Muy saludable y sostenible.",
}

const calculateBMI = (weight: number, height: number): { bmi: number; category: string; advice: string } => {
  const bmi = weight / (height / 100) ** 2
  let category = ""
  let advice = ""

  if (bmi < 18.5) {
    category = "Bajo peso"
    advice =
      "Para subir de peso saludablemente: aumenta calorías con alimentos nutritivos como nueces, aguacate, batidos de proteínas, come más frecuentemente (5-6 comidas), incluye grasas saludables y proteínas en cada comida, y considera ejercicios de fuerza para ganar masa muscular."
  } else if (bmi < 25) {
    category = "Peso normal"
    advice =
      "¡Excelente! Mantén tu peso actual con una dieta balanceada rica en frutas, verduras, proteínas magras y granos integrales. Continúa con ejercicio regular y mantén buenos hábitos alimenticios."
  } else if (bmi < 30) {
    category = "Sobrepeso"
    advice =
      "Para bajar de peso saludablemente: crea un déficit calórico moderado (300-500 cal/día), aumenta verduras y proteínas, reduce carbohidratos refinados y azúcares, haz ejercicio cardiovascular y de fuerza, y mantén hidratación adecuada."
  } else {
    category = "Obesidad"
    advice =
      "Te recomiendo consultar con un profesional de la salud. Para empezar: enfócate en cambios graduales, aumenta verduras, reduce porciones, elimina bebidas azucaradas, camina diariamente y considera apoyo profesional para un plan personalizado."
  }

  return { bmi: Math.round(bmi * 10) / 10, category, advice }
}

const extractBMIData = (message: string): { weight?: number; height?: number } => {
  const weightMatch = message.match(/peso\s*:?\s*(\d+(?:\.\d+)?)\s*kg?/i) || message.match(/(\d+(?:\.\d+)?)\s*kg/i)
  const heightMatch =
    message.match(/altura\s*:?\s*(\d+(?:\.\d+)?)\s*(?:cm|metros?|m)?/i) ||
    message.match(/mido\s*(\d+(?:\.\d+)?)/i) ||
    message.match(/(\d+(?:\.\d+)?)\s*(?:cm|metros?)/i)

  const weight = weightMatch ? Number.parseFloat(weightMatch[1]) : undefined
  let height = heightMatch ? Number.parseFloat(heightMatch[1]) : undefined

  // Convert meters to cm if needed
  if (height && height < 3) {
    height = height * 100
  }

  return { weight, height }
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "¡Hola! Soy tu asistente nutricional avanzado de PRegister. Puedo ayudarte con consejos sobre alimentación, calcular tu IMC, recetas saludables y planificación de comidas. Para calcular tu IMC, dime tu peso y altura (ej: 'peso 70kg altura 175cm'). ¿En qué puedo ayudarte hoy?",
      isUser: false,
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const generateResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase()

    // Check for BMI calculation request
    const bmiData = extractBMIData(userMessage)
    if (bmiData.weight && bmiData.height) {
      const result = calculateBMI(bmiData.weight, bmiData.height)
      return `Tu IMC es ${result.bmi} (${result.category}). ${result.advice}`
    }

    // Check for nutrition keywords (expanded list)
    for (const [keyword, response] of Object.entries(NUTRITION_KEYWORDS)) {
      if (lowerMessage.includes(keyword)) {
        return response
      }
    }

    // Enhanced specific responses
    if (
      lowerMessage.includes("subir de peso") ||
      lowerMessage.includes("ganar peso") ||
      lowerMessage.includes("engordar")
    ) {
      return "Para subir de peso saludablemente: 1) Aumenta calorías con alimentos nutritivos (nueces, aguacate, batidos), 2) Come 5-6 veces al día, 3) Incluye proteínas y grasas saludables en cada comida, 4) Bebe batidos calóricos entre comidas, 5) Haz ejercicios de fuerza para ganar masa muscular. Dime tu peso y altura para calcular tu IMC y darte consejos más específicos."
    }

    if (
      lowerMessage.includes("bajar de peso") ||
      lowerMessage.includes("adelgazar") ||
      lowerMessage.includes("perder peso")
    ) {
      return "Para bajar de peso saludablemente: 1) Crea un déficit calórico moderado (300-500 cal/día), 2) Aumenta proteínas y verduras, 3) Reduce carbohidratos refinados y azúcares, 4) Bebe mucha agua, 5) Haz ejercicio cardiovascular y de fuerza, 6) Duerme 7-8 horas. Dime tu peso y altura para calcular tu IMC y personalizar el plan."
    }

    if (
      lowerMessage.includes("ganar masa") ||
      lowerMessage.includes("músculo") ||
      lowerMessage.includes("masa muscular")
    ) {
      return "Para ganar masa muscular: 1) Consume 1.6-2.2g de proteína por kg de peso corporal, 2) Mantén superávit calórico moderado (200-500 cal), 3) Incluye carbohidratos complejos post-entreno, 4) Entrena con pesas 3-4 veces por semana, 5) Descansa adecuadamente, 6) Mantén hidratación óptima."
    }

    if (lowerMessage.includes("imc") || lowerMessage.includes("índice de masa corporal")) {
      return "Para calcular tu IMC necesito tu peso y altura. Escribe algo como: 'peso 70kg altura 175cm' y te daré tu IMC con recomendaciones personalizadas según tu categoría."
    }

    if (lowerMessage.includes("receta") || lowerMessage.includes("cocinar") || lowerMessage.includes("preparar")) {
      return "Te sugiero recetas nutritivas y fáciles: 1) Pollo al horno con verduras y batata, 2) Salmón a la plancha con quinoa y brócoli, 3) Ensalada de garbanzos con aguacate, 4) Batido de proteínas con plátano y espinacas, 5) Avena nocturna con frutas y nueces. ¿Qué tipo de receta prefieres?"
    }

    if (lowerMessage.includes("plan") || lowerMessage.includes("dieta") || lowerMessage.includes("menú")) {
      return "Para crear un plan alimentario personalizado necesito saber: 1) Tu objetivo (bajar/subir peso, ganar músculo), 2) Tu peso y altura para calcular IMC, 3) Nivel de actividad física, 4) Alergias o restricciones alimentarias. Con esta información puedo sugerirte un plan específico."
    }

    // Default response
    return "Entiendo tu consulta sobre nutrición. Puedo ayudarte con consejos específicos sobre alimentación, calcular tu IMC, sugerir recetas y crear planes personalizados. Para mejores recomendaciones, comparte tu peso, altura y objetivos. ¿Hay algo específico sobre lo que te gustaría saber más?"
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    // Simulate AI response delay
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: generateResponse(inputValue),
        isUser: false,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiResponse])
      setIsLoading(false)
    }, 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Quick Suggestions */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Utensils className="h-5 w-5" />
          Temas populares
        </h3>
        <div className="flex flex-wrap gap-2">
          {[
            "Calcular IMC",
            "Subir de peso",
            "Bajar de peso",
            "Ganar músculo",
            "Plan alimentario",
            "Recetas saludables",
            "Metabolismo",
            "Antioxidantes",
            "Omega-3",
            "Digestión",
            "Energía",
            "Inmunidad",
          ].map((topic) => (
            <Badge
              key={topic}
              variant="outline"
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
              onClick={() => setInputValue(topic)}
            >
              {topic}
            </Badge>
          ))}
        </div>
      </div>

      {/* Chat Messages */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Chat Nutricional Avanzado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto mb-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.isUser ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">{message.timestamp.toLocaleTimeString()}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted text-muted-foreground px-4 py-2 rounded-lg">
                  <p className="text-sm">Analizando y generando respuesta...</p>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ej: 'peso 70kg altura 175cm', 'cómo subir de peso', 'recetas para ganar músculo'..."
              className="flex-1"
            />
            <Button onClick={handleSendMessage} disabled={isLoading || !inputValue.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Nutrition Tips */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Calculator className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <h4 className="font-semibold">Cálculo IMC</h4>
            <p className="text-sm text-muted-foreground">Dime peso y altura</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Apple className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <h4 className="font-semibold">Antioxidantes</h4>
            <p className="text-sm text-muted-foreground">Frutas y verduras coloridas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Utensils className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <h4 className="font-semibold">Proteínas</h4>
            <p className="text-sm text-muted-foreground">1.6-2.2g por kg de peso</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Coffee className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <h4 className="font-semibold">Hidratación</h4>
            <p className="text-sm text-muted-foreground">2-3 litros de agua al día</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
