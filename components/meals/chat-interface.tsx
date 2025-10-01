"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Send, MessageCircle, Utensils, Apple, Coffee, Calculator, User } from "lucide-react"
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
  creatina:
    "La creatina mejora el rendimiento en ejercicios de alta intensidad. Dosis: 3-5g diarios. Segura y efectiva para ganar fuerza y masa muscular.",
  cafeína:
    "La cafeína mejora el rendimiento y concentración. Consume 200-400mg al día (2-4 tazas de café). Evita después de las 2pm para no afectar el sueño.",
  "pre-entreno":
    "Pre-entreno ideal: carbohidratos complejos 2-3h antes (avena, plátano), proteína ligera, hidratación. Evita grasas pesadas que retrasan digestión.",
  "post-entreno":
    "Post-entreno: consume proteínas (20-40g) y carbohidratos (0.5-1g por kg) dentro de 2h. Ejemplos: batido de proteínas con plátano, pollo con arroz.",
  "comida trampa":
    "Comida trampa: 1 vez por semana está bien si sigues tu plan el resto del tiempo. Ayuda psicológicamente y puede impulsar el metabolismo.",
  "déficit calórico":
    "Para perder peso: déficit de 300-500 cal/día es sostenible. No bajes de 1200 cal (mujeres) o 1500 cal (hombres) sin supervisión médica.",
  "superávit calórico":
    "Para ganar masa: superávit de 200-500 cal/día. Enfócate en proteínas (2g/kg) y carbohidratos de calidad. Entrena con pesas 3-4 veces/semana.",
  macros:
    "Macronutrientes: Proteínas 1.6-2.2g/kg, Grasas 0.8-1g/kg, Carbohidratos el resto según objetivo. Ajusta según actividad y metas.",
  "conteo de calorías":
    "Para contar calorías: usa apps como MyFitnessPal, pesa alimentos al inicio, aprende porciones. Sé consistente pero no obsesivo.",
  "ayuno intermitente":
    "Ayuno 16/8 (16h ayuno, 8h comida) es popular. Beneficios: control de calorías, mejora metabólica. No apto para todos, consulta profesional.",
  "dieta flexible":
    "Dieta flexible (IIFYM): come lo que quieras dentro de tus macros. 80% alimentos nutritivos, 20% caprichos. Sostenible a largo plazo.",
  "meal prep":
    "Meal prep: prepara comidas para 3-5 días. Ahorra tiempo y dinero, facilita adherencia. Usa contenedores herméticos, congela si es necesario.",
  "batido de proteínas":
    "Batidos de proteínas: convenientes post-entreno. Whey (suero) se absorbe rápido, caseína lenta (antes de dormir). 20-40g por batido.",
  "alimentos procesados":
    "Limita procesados: altos en sodio, azúcares, grasas trans. Lee etiquetas, elige opciones con menos de 5 ingredientes reconocibles.",
  azúcar:
    "Reduce azúcar añadida: máximo 25g/día (mujeres), 36g/día (hombres). Lee etiquetas, evita bebidas azucaradas, elige frutas enteras.",
  "sal sodio":
    "Sodio: máximo 2300mg/día (1 cucharadita). Reduce procesados, no agregues sal extra, usa especias para dar sabor.",
  alcohol:
    "Alcohol: 7 cal/g (casi como grasa). Modera consumo: máximo 1 bebida/día (mujeres), 2 (hombres). Interfiere con recuperación muscular.",
  agua: "Hidratación: 2-3 litros/día base, más si haces ejercicio. Señales de buena hidratación: orina clara, sin sed constante.",
  "té verde":
    "Té verde: antioxidantes, acelera metabolismo ligeramente, mejora concentración. 2-3 tazas/día. Evita si eres sensible a cafeína.",
  café: "Café: mejora rendimiento, concentración, metabolismo. 2-4 tazas/día es seguro. Evita azúcar y cremas, tómalo negro o con leche.",
  frutas:
    "Frutas: ricas en vitaminas, fibra, antioxidantes. 2-4 porciones/día. Varía colores para diferentes nutrientes. Enteras mejor que jugos.",
  verduras:
    "Verduras: base de dieta saludable. Mínimo 3-5 porciones/día. Varía colores, incluye crucíferas (brócoli, coliflor), hojas verdes.",
  legumbres:
    "Legumbres: proteína vegetal, fibra, hierro. Incluye lentejas, garbanzos, frijoles. 2-3 veces/semana. Combina con cereales para proteína completa.",
  "frutos secos":
    "Frutos secos: grasas saludables, proteína, fibra. Porción: 30g (puñado pequeño). Almendras, nueces, pistachos. Cuidado con calorías.",
  semillas:
    "Semillas: omega-3, fibra, minerales. Chía, linaza, calabaza, girasol. Agrega a batidos, yogur, ensaladas. 1-2 cucharadas/día.",
  huevos:
    "Huevos: proteína completa, vitaminas, colina. 1-3 huevos/día es seguro para mayoría. Incluye la yema (nutrientes importantes).",
  pollo:
    "Pollo: proteína magra, versátil. Pechuga: 165 cal, 31g proteína por 100g. Cocina a la plancha, horno, evita frito.",
  pescado: "Pescado: proteína, omega-3. Salmón, atún, sardinas 2-3 veces/semana. Graso mejor que magro para omega-3.",
  "carne roja":
    "Carne roja: proteína, hierro, B12. Elige cortes magros, limita a 1-2 veces/semana. Combina con verduras, evita procesadas.",
  lácteos:
    "Lácteos: calcio, proteína, probióticos (yogur). Elige bajos en grasa si buscas perder peso. Yogur griego alto en proteína.",
  arroz:
    "Arroz: carbohidrato energético. Integral mejor que blanco (más fibra, nutrientes). Porción: 1/2-1 taza cocido según objetivo.",
  avena:
    "Avena: carbohidrato complejo, fibra soluble, reduce colesterol. Desayuno ideal: 40-60g con frutas, nueces. Mantiene saciedad.",
  quinoa:
    "Quinoa: proteína completa, fibra, minerales. Alternativa a arroz. 1/2-1 taza cocida. Versátil: ensaladas, bowls, guarnición.",
  batata:
    "Batata: carbohidrato complejo, vitamina A, fibra. Mejor que papa regular. Al horno, hervida. Excelente pre-entreno.",
  aguacate:
    "Aguacate: grasas saludables, fibra, potasio. 1/4-1/2 aguacate/día. Calorías altas pero muy nutritivo. Ideal para ensaladas, tostadas.",
  "aceite de oliva":
    "Aceite de oliva: grasas monoinsaturadas, antioxidantes. Extra virgen mejor. 1-2 cucharadas/día. Para cocinar a baja temperatura, ensaladas.",
  "chocolate negro":
    "Chocolate negro: antioxidantes, mejora humor. 70%+ cacao. 20-30g/día. Modera por calorías. Mejor que chocolate con leche.",
  miel: "Miel: azúcar natural, antioxidantes, antimicrobiano. Modera: 1 cucharada/día máximo. Mejor que azúcar refinada pero sigue siendo azúcar.",
  canela:
    "Canela: ayuda a controlar azúcar en sangre, antioxidantes. Agrega a café, avena, batidos. 1/2-1 cucharadita/día.",
  jengibre: "Jengibre: antiinflamatorio, ayuda digestión, náuseas. Té de jengibre, rallado en comidas. 1-2g/día.",
  cúrcuma:
    "Cúrcuma: potente antiinflamatorio, antioxidante. Combina con pimienta negra para mejor absorción. 1/2-1 cucharadita/día.",
  ajo: "Ajo: antibacteriano, reduce presión arterial, mejora inmunidad. 1-2 dientes/día. Crudo mejor que cocido para beneficios.",
}

const calculateBMIFromMessage = (weight: number, height: number): { bmi: number; category: string; advice: string } => {
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
  const messageIdCounter = useRef(0)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)

  // Initialize messages only on client side to avoid hydration mismatch
  useEffect(() => {
    setIsClient(true)
    loadUserProfile()
    setMessages([
      {
        id: (++messageIdCounter.current).toString(),
        content:
          "¡Hola! Soy tu asistente nutricional avanzado de PRegister. Puedo ayudarte con consejos sobre alimentación personalizados según tu perfil, calcular tu IMC, recetas saludables y planificación de comidas. Para calcular tu IMC, dime tu peso y altura (ej: 'peso 70kg altura 175cm'). ¿En qué puedo ayudarte hoy?",
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

  const generateResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase()

    // Check for BMI calculation request
    const bmiData = extractBMIData(userMessage)
    if (bmiData.weight && bmiData.height) {
      const result = calculateBMIFromMessage(bmiData.weight, bmiData.height)
      return `Tu IMC es ${result.bmi} (${result.category}). ${result.advice}`
    }

    if (lowerMessage.includes("mi perfil") || lowerMessage.includes("mis datos") || lowerMessage.includes("sobre mí")) {
      if (!userProfile || !userProfile.weight || !userProfile.height) {
        return "Aún no tienes tu perfil completo. Para darte recomendaciones personalizadas, completa tu peso, estatura, edad y sexo en tu perfil. Esto me permitirá calcular tu IMC, necesidades calóricas y darte consejos específicos para ti."
      }

      let response = `Según tu perfil:\n\n`
      response += `• Peso: ${userProfile.weight} kg\n`
      response += `• Estatura: ${userProfile.height} cm\n`
      if (userProfile.age) response += `• Edad: ${userProfile.age} años\n`
      if (userProfile.sex) response += `• Sexo: ${userProfile.sex}\n`
      if (userProfile.bmi) response += `• IMC: ${userProfile.bmi} (${userProfile.bmiCategory})\n\n`

      if (userProfile.bmi && userProfile.weight) {
        const heightInMeters = userProfile.height! / 100
        const minHealthyWeight = Math.round(18.5 * Math.pow(heightInMeters, 2) * 10) / 10
        const maxHealthyWeight = Math.round(24.9 * Math.pow(heightInMeters, 2) * 10) / 10

        response += `Tu rango de peso saludable es ${minHealthyWeight}-${maxHealthyWeight} kg.\n\n`

        // Personalized recommendations based on BMI
        if (userProfile.bmi < 18.5) {
          response += `Recomendaciones para ti: Necesitas aumentar de peso. Consume ${Math.round(userProfile.weight * 2.2)}g de proteína diaria, aumenta calorías con alimentos nutritivos, y come 5-6 veces al día.`
        } else if (userProfile.bmi < 25) {
          response += `Recomendaciones para ti: Tu peso es saludable. Mantén ${Math.round(userProfile.weight * 1.8)}g de proteína diaria, continúa con ejercicio regular y dieta balanceada.`
        } else {
          response += `Recomendaciones para ti: Para bajar de peso, consume ${Math.round(userProfile.weight * 1.8)}g de proteína diaria, crea un déficit de 300-500 calorías, y haz ejercicio 4-5 veces por semana.`
        }
      }

      return response
    }

    if (
      lowerMessage.includes("calorías") ||
      lowerMessage.includes("cuánto debo comer") ||
      lowerMessage.includes("cuántas calorías")
    ) {
      if (!userProfile || !userProfile.weight || !userProfile.height || !userProfile.age || !userProfile.sex) {
        return "Para calcular tus necesidades calóricas necesito tu peso, estatura, edad y sexo. Completa tu perfil para obtener recomendaciones personalizadas."
      }

      // Calculate BMR using Mifflin-St Jeor equation
      let bmr: number
      if (userProfile.sex === "masculino") {
        bmr = 10 * userProfile.weight + 6.25 * userProfile.height - 5 * userProfile.age + 5
      } else {
        bmr = 10 * userProfile.weight + 6.25 * userProfile.height - 5 * userProfile.age - 161
      }

      const sedentary = Math.round(bmr * 1.2)
      const light = Math.round(bmr * 1.375)
      const moderate = Math.round(bmr * 1.55)
      const active = Math.round(bmr * 1.725)

      let response = `Según tu perfil (${userProfile.weight}kg, ${userProfile.height}cm, ${userProfile.age} años, ${userProfile.sex}):\n\n`
      response += `Tu metabolismo basal (BMR) es ${Math.round(bmr)} calorías/día.\n\n`
      response += `Necesidades calóricas según actividad:\n`
      response += `• Sedentario (poco ejercicio): ${sedentary} cal/día\n`
      response += `• Ligero (1-3 días/semana): ${light} cal/día\n`
      response += `• Moderado (3-5 días/semana): ${moderate} cal/día\n`
      response += `• Activo (6-7 días/semana): ${active} cal/ día\n\n`

      if (userProfile.bmi && userProfile.bmi < 18.5) {
        response += `Para subir de peso: añade 300-500 calorías a tu nivel de actividad.`
      } else if (userProfile.bmi && userProfile.bmi >= 25) {
        response += `Para bajar de peso: resta 300-500 calorías a tu nivel de actividad.`
      } else {
        response += `Para mantener peso: consume las calorías de tu nivel de actividad.`
      }

      return response
    }

    if (lowerMessage.includes("cuánta proteína") || lowerMessage.includes("proteína necesito")) {
      if (!userProfile || !userProfile.weight) {
        return "Para calcular tus necesidades de proteína necesito tu peso. Completa tu perfil para obtener recomendaciones personalizadas. En general, se recomienda 1.6-2.2g de proteína por kg de peso corporal."
      }

      const minProtein = Math.round(userProfile.weight * 1.6)
      const maxProtein = Math.round(userProfile.weight * 2.2)

      let response = `Según tu peso (${userProfile.weight}kg), necesitas entre ${minProtein}-${maxProtein}g de proteína al día.\n\n`
      response += `Distribución recomendada:\n`
      response += `• Desayuno: ${Math.round(minProtein * 0.25)}-${Math.round(maxProtein * 0.25)}g\n`
      response += `• Almuerzo: ${Math.round(minProtein * 0.35)}-${Math.round(maxProtein * 0.35)}g\n`
      response += `• Cena: ${Math.round(minProtein * 0.3)}-${Math.round(maxProtein * 0.3)}g\n`
      response += `• Snacks: ${Math.round(minProtein * 0.1)}-${Math.round(maxProtein * 0.1)}g\n\n`
      response += `Fuentes de proteína: pollo (31g/100g), pescado (25g/100g), huevos (13g/2 huevos), yogur griego (10g/100g), legumbres (9g/100g cocidas).`

      return response
    }

    // Check for nutrition keywords (expanded list)
    for (const [keyword, response] of Object.entries(NUTRITION_KEYWORDS)) {
      if (lowerMessage.includes(keyword)) {
        if (userProfile && userProfile.weight && keyword === "proteína") {
          const minProtein = Math.round(userProfile.weight * 1.6)
          const maxProtein = Math.round(userProfile.weight * 2.2)
          return `${response}\n\nSegún tu peso (${userProfile.weight}kg), necesitas ${minProtein}-${maxProtein}g de proteína al día.`
        }
        return response
      }
    }

    // Enhanced specific responses
    if (
      lowerMessage.includes("subir de peso") ||
      lowerMessage.includes("ganar peso") ||
      lowerMessage.includes("engordar")
    ) {
      let response =
        "Para subir de peso saludablemente: 1) Aumenta calorías con alimentos nutritivos (nueces, aguacate, batidos), 2) Come 5-6 veces al día, 3) Incluye proteínas y grasas saludables en cada comida, 4) Bebe batidos calóricos entre comidas, 5) Haz ejercicios de fuerza para ganar masa muscular."

      if (userProfile && userProfile.weight) {
        const protein = Math.round(userProfile.weight * 2.2)
        const surplus = 300
        response += `\n\nSegún tu peso (${userProfile.weight}kg): consume ${protein}g de proteína diaria y añade ${surplus} calorías extra a tu dieta.`
      } else {
        response += " Dime tu peso y altura para calcular tu IMC y darte consejos más específicos."
      }

      return response
    }

    if (
      lowerMessage.includes("bajar de peso") ||
      lowerMessage.includes("adelgazar") ||
      lowerMessage.includes("perder peso")
    ) {
      let response =
        "Para bajar de peso saludablemente: 1) Crea un déficit calórico moderado (300-500 cal/día), 2) Aumenta proteínas y verduras, 3) Reduce carbohidratos refinados y azúcares, 4) Bebe mucha agua, 5) Haz ejercicio cardiovascular y de fuerza, 6) Duerme 7-8 horas."

      if (userProfile && userProfile.weight) {
        const protein = Math.round(userProfile.weight * 1.8)
        const deficit = 400
        response += `\n\nSegún tu peso (${userProfile.weight}kg): consume ${protein}g de proteína diaria y crea un déficit de ${deficit} calorías.`
      } else {
        response += " Dime tu peso y altura para calcular tu IMC y personalizar el plan."
      }

      return response
    }

    if (
      lowerMessage.includes("ganar masa") ||
      lowerMessage.includes("músculo") ||
      lowerMessage.includes("masa muscular")
    ) {
      let response =
        "Para ganar masa muscular: 1) Consume 1.6-2.2g de proteína por kg de peso corporal, 2) Mantén superávit calórico moderado (200-500 cal), 3) Incluye carbohidratos complejos post-entreno, 4) Entrena con pesas 3-4 veces por semana, 5) Descansa adecuadamente, 6) Mantén hidratación óptima."

      if (userProfile && userProfile.weight) {
        const minProtein = Math.round(userProfile.weight * 1.8)
        const maxProtein = Math.round(userProfile.weight * 2.2)
        response += `\n\nSegún tu peso (${userProfile.weight}kg): consume ${minProtein}-${maxProtein}g de proteína diaria y añade 300 calorías extra.`
      }

      return response
    }

    if (lowerMessage.includes("imc") || lowerMessage.includes("índice de masa corporal")) {
      if (userProfile && userProfile.bmi) {
        return `Tu IMC actual es ${userProfile.bmi} (${userProfile.bmiCategory}). ${userProfile.bmiCategory === "Peso normal" ? "¡Excelente! Mantén tus hábitos saludables." : "¿Te gustaría consejos específicos para tu situación?"}`
      }
      return "Para calcular tu IMC necesito tu peso y altura. Escribe algo como: 'peso 70kg altura 175cm' y te daré tu IMC con recomendaciones personalizadas."
    }

    if (lowerMessage.includes("receta") || lowerMessage.includes("cocinar") || lowerMessage.includes("preparar")) {
      return "Te sugiero recetas nutritivas y fáciles: 1) Pollo al horno con verduras y batata, 2) Salmón a la plancha con quinoa y brócoli, 3) Ensalada de garbanzos con aguacate, 4) Batido de proteínas con plátano y espinacas, 5) Avena nocturna con frutas y nueces. ¿Qué tipo de receta prefieres?"
    }

    if (lowerMessage.includes("plan") || lowerMessage.includes("dieta") || lowerMessage.includes("menú")) {
      if (userProfile && userProfile.weight && userProfile.height) {
        return `Con tu perfil actual puedo crear un plan personalizado. ¿Cuál es tu objetivo principal? 1) Bajar de peso, 2) Subir de peso, 3) Ganar músculo, 4) Mantener peso saludable. También dime tu nivel de actividad física y si tienes restricciones alimentarias.`
      }
      return "Para crear un plan alimentario personalizado necesito saber: 1) Tu objetivo (bajar/subir peso, ganar músculo), 2) Tu peso y altura para calcular IMC, 3) Nivel de actividad física, 4) Alergias o restricciones alimentarias. Con esta información puedo sugerirte un plan específico."
    }

    // Default response
    return "Entiendo tu consulta sobre nutrición. Puedo ayudarte con consejos específicos sobre alimentación, calcular tu IMC, sugerir recetas y crear planes personalizados. Para mejores recomendaciones, comparte tu peso, altura y objetivos. ¿Hay algo específico sobre lo que te gustaría saber más?"
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

    // Simulate AI response delay
    setTimeout(() => {
      const aiResponse: Message = {
        id: (++messageIdCounter.current).toString(),
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

  // Don't render anything until client-side hydration is complete
  if (!isClient) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="space-y-6">
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
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            Asistente Nutricional IA Personalizado
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Obtén consejos personalizados basados en tu perfil, calcula tu IMC y descubre recetas saludables
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

        {/* Quick Topics */}
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Temas populares:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              "Mi perfil",
              "Calorías",
              "Proteínas",
              "Carbohidratos",
              "IMC",
              "Recetas",
              "Meal prep",
              "Pre-entreno",
              "Post-entreno",
              "Batido de proteínas",
              "Déficit calórico",
              "Ganar músculo",
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
                    <p className="text-sm">Analizando y generando respuesta personalizada...</p>
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
                placeholder="Ej: 'mi perfil', 'cuántas calorías necesito', 'recetas para ganar músculo'..."
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
              <Calculator className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <h4 className="font-semibold text-gray-800 dark:text-gray-100">Cálculo Personalizado</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">IMC y calorías según tu perfil</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <Apple className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <h4 className="font-semibold text-gray-800 dark:text-gray-100">100+ Alimentos</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">Base de datos nutricional</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <Utensils className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <h4 className="font-semibold text-gray-800 dark:text-gray-100">Planes Personalizados</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">Según tus objetivos</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <Coffee className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <h4 className="font-semibold text-gray-800 dark:text-gray-100">Consejos Expertos</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">Basados en ciencia</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
