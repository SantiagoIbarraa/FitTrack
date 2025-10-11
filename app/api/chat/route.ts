<<<<<<< HEAD
import { generateText, generateObject } from "ai"
import { google } from "@ai-sdk/google"
import { NextRequest, NextResponse } from "next/server"
=======
import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextResponse } from "next/server"
>>>>>>> 5e0a6947f356c7850320b506c7beffbc7fb36cd2
import { createClient } from "@/lib/supabase/server"
import { getExerciseHistory, getUniqueExercises } from "@/lib/exercise-history-actions"
import { z } from "zod"

<<<<<<< HEAD
// Schema para el análisis de imágenes
const foodAnalysisSchema = z.object({
  foodName: z.string().describe("Nombre del plato o comida"),
  calories: z.number().describe("Número estimado de calorías"),
  protein: z.number().describe("Gramos de proteína"),
  carbs: z.number().describe("Gramos de carbohidratos"),
  fats: z.number().describe("Gramos de grasas"),
  fiber: z.number().optional().describe("Gramos de fibra"),
  serving: z.string().describe("Descripción del tamaño de la porción"),
  ingredients: z.array(z.string()).describe("Lista de ingredientes visibles"),
  recommendations: z.string().describe("Breve recomendación nutricional"),
  confidence: z.enum(["alta", "media", "baja"]).describe("Nivel de confianza en el análisis")
})

export async function POST(request: NextRequest) {
=======
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

export async function POST(request: Request) {
>>>>>>> 5e0a6947f356c7850320b506c7beffbc7fb36cd2
  try {
    const body = await request.json()
    const { message, userProfile, image, type } = body

    // Verificar que la API key esté configurada
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      console.error("GOOGLE_GENERATIVE_AI_API_KEY no está configurada")
      return NextResponse.json({ 
        error: "API key no configurada. Por favor, crea un archivo .env.local con GOOGLE_GENERATIVE_AI_API_KEY=tu_clave_aqui" 
      }, { status: 500 })
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

<<<<<<< HEAD
    // Manejar análisis de imagen
    if (type === "image" && image) {
      return await handleImageAnalysis(image)
    }

    // Manejar chat de texto
    if (!message) {
      return NextResponse.json({ error: "No se proporcionó un mensaje" }, { status: 400 })
    }

    return await handleChatMessage(message, userProfile)
=======
    let exerciseData = ""
    try {
      const exercises = await getUniqueExercises()
      if (exercises.length > 0) {
        exerciseData = `\n\nTus ejercicios registrados: ${exercises.join(", ")}`

        const lastExercise = exercises[0]
        const history = await getExerciseHistory(lastExercise, 30)
        if (history.length > 0) {
          const latest = history[0]
          exerciseData += `\n\nÚltimo registro de ${lastExercise}: ${latest.weight_kg}kg x ${latest.repetitions} reps`
        }
      }
    } catch (error) {
      console.log("No se pudo obtener historial de ejercicios")
    }

    let bmr = 0
    let tdee = 0
    let proteinMin = 0
    let proteinMax = 0

    if (userProfile?.weight && userProfile?.height && userProfile?.age && userProfile?.sex) {
      if (userProfile.sex === "male") {
        bmr = 10 * userProfile.weight + 6.25 * userProfile.height - 5 * userProfile.age + 5
      } else {
        bmr = 10 * userProfile.weight + 6.25 * userProfile.height - 5 * userProfile.age - 161
      }
      tdee = Math.round(bmr * 1.55)
      proteinMin = Math.round(userProfile.weight * 1.6)
      proteinMax = Math.round(userProfile.weight * 2.2)
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" })

    const prompt = `Eres un asistente nutricional experto especializado en fitness y salud. Tu nombre es "Asistente Nutricional de PRegister".

INFORMACIÓN DEL USUARIO:
${userProfile?.weight ? `- Peso: ${userProfile.weight}kg` : ""}
${userProfile?.height ? `- Altura: ${userProfile.height}cm` : ""}
${userProfile?.age ? `- Edad: ${userProfile.age} años` : ""}
${userProfile?.sex ? `- Sexo: ${userProfile.sex === "male" ? "Masculino" : "Femenino"}` : ""}
${userProfile?.bmi ? `- IMC: ${userProfile.bmi} (${userProfile.bmiCategory})` : ""}
${bmr > 0 ? `- Metabolismo basal (BMR): ${Math.round(bmr)} cal/día` : ""}
${tdee > 0 ? `- TDEE (actividad moderada): ${tdee} cal/día` : ""}
${proteinMin > 0 ? `- Proteína recomendada: ${proteinMin}-${proteinMax}g/día` : ""}
${exerciseData}

PREGUNTA DEL USUARIO: ${message}

INSTRUCCIONES:
- Responde en español de forma clara, concisa y útil
- Usa formato markdown para mejor legibilidad (negritas, listas, etc.)
- Personaliza tu respuesta basándote en los datos del usuario
- Si el usuario no tiene datos completos, sugiere completar su perfil en la sección de Salud
- Proporciona información basada en evidencia científica
- Incluye ejemplos prácticos y cantidades específicas cuando sea relevante
- Si preguntan sobre su perfil o progreso, usa los datos proporcionados
- Mantén un tono motivador y profesional
- Si la pregunta no está relacionada con nutrición o fitness, redirige amablemente al tema

Responde a la pregunta del usuario ahora:`

    const result = await model.generateContent(prompt)
    const response = result.response
    const aiResponse = response.text()

    return NextResponse.json({ response: aiResponse })
>>>>>>> 5e0a6947f356c7850320b506c7beffbc7fb36cd2
  } catch (error) {
    console.error("Error processing request:", error)
    
    let errorMessage = "Error al procesar tu solicitud"
    
    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        errorMessage = "Error de configuración de API. Verifica tu clave de Gemini."
      } else if (error.message.includes("quota")) {
        errorMessage = "Límite de cuota excedido. Intenta más tarde."
      } else if (error.message.includes("network")) {
        errorMessage = "Error de conexión. Verifica tu internet."
      } else {
        errorMessage = `Error: ${error.message}`
      }
    }
    
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
<<<<<<< HEAD

async function handleImageAnalysis(image: string) {
  try {
    // Remove data URL prefix
    const base64Image = image.replace(/^data:image\/\w+;base64,/, "")

    const model = google("gemini-2.0-flash-exp")

    const prompt = `Analiza esta imagen de comida y proporciona la siguiente información en formato JSON:

{
  "foodName": "nombre del plato o comida",
  "calories": número estimado de calorías,
  "protein": gramos de proteína,
  "carbs": gramos de carbohidratos,
  "fats": gramos de grasas,
  "fiber": gramos de fibra (opcional),
  "serving": "descripción del tamaño de la porción (ej: '1 plato mediano', '200g')",
  "ingredients": ["lista", "de", "ingredientes", "visibles"],
  "recommendations": "breve recomendación nutricional o consejo sobre esta comida",
  "confidence": "alta/media/baja - tu nivel de confianza en el análisis"
}

Sé lo más preciso posible. Si no puedes identificar la comida claramente, indica baja confianza y proporciona tu mejor estimación.`

    const { object } = await generateObject({
      model,
      schema: foodAnalysisSchema,
      prompt,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image",
              image: `data:image/jpeg;base64,${base64Image}`
            }
          ]
        }
      ]
    })

    return NextResponse.json(object)
  } catch (error) {
    console.error("Error analyzing food image:", error)
    return NextResponse.json(
      { error: "Error al analizar la imagen. Por favor intenta de nuevo." },
      { status: 500 }
    )
  }
}

async function handleChatMessage(message: string, userProfile: any) {
  let exerciseData = ""
  try {
    const exercises = await getUniqueExercises()
    if (exercises.length > 0) {
      exerciseData = `\n\nTus ejercicios registrados: ${exercises.join(", ")}`

      const lastExercise = exercises[0]
      const history = await getExerciseHistory(lastExercise, 30)
      if (history.length > 0) {
        const latest = history[0]
        exerciseData += `\n\nÚltimo registro de ${lastExercise}: ${latest.weight_kg}kg x ${latest.repetitions} reps`
      }
    }
  } catch (error) {
    console.log("No se pudo obtener historial de ejercicios")
  }

  let bmr = 0
  let tdee = 0
  let proteinMin = 0
  let proteinMax = 0

  if (userProfile?.weight && userProfile?.height && userProfile?.age && userProfile?.sex) {
    if (userProfile.sex === "male") {
      bmr = 10 * userProfile.weight + 6.25 * userProfile.height - 5 * userProfile.age + 5
    } else {
      bmr = 10 * userProfile.weight + 6.25 * userProfile.height - 5 * userProfile.age - 161
    }
    tdee = Math.round(bmr * 1.55)
    proteinMin = Math.round(userProfile.weight * 1.6)
    proteinMax = Math.round(userProfile.weight * 2.2)
  }

  const model = google("gemini-2.5-flash")

  const prompt = `Eres un asistente nutricional experto especializado en fitness y salud. Tu nombre es "Asistente Nutricional de PRegister".

INFORMACIÓN DEL USUARIO:
${userProfile?.weight ? `- Peso: ${userProfile.weight}kg` : ""}
${userProfile?.height ? `- Altura: ${userProfile.height}cm` : ""}
${userProfile?.age ? `- Edad: ${userProfile.age} años` : ""}
${userProfile?.sex ? `- Sexo: ${userProfile.sex === "male" ? "Masculino" : "Femenino"}` : ""}
${userProfile?.bmi ? `- IMC: ${userProfile.bmi} (${userProfile.bmiCategory})` : ""}
${bmr > 0 ? `- Metabolismo basal (BMR): ${Math.round(bmr)} cal/día` : ""}
${tdee > 0 ? `- TDEE (actividad moderada): ${tdee} cal/día` : ""}
${proteinMin > 0 ? `- Proteína recomendada: ${proteinMin}-${proteinMax}g/día` : ""}
${exerciseData}

PREGUNTA DEL USUARIO: ${message}

INSTRUCCIONES:
- Responde en español de forma clara, concisa y útil
- Usa formato markdown para mejor legibilidad (negritas, listas, etc.)
- Personaliza tu respuesta basándote en los datos del usuario
- Si el usuario no tiene datos completos, sugiere completar su perfil en la sección de Salud
- Proporciona información basada en evidencia científica
- Incluye ejemplos prácticos y cantidades específicas cuando sea relevante
- Si preguntan sobre su perfil o progreso, usa los datos proporcionados
- Mantén un tono motivador y profesional
- Si la pregunta no está relacionada con nutrición o fitness, redirige amablemente al tema

Responde a la pregunta del usuario ahora:`

  const { text } = await generateText({
    model,
    prompt,
  })

  return NextResponse.json({ response: text })
}
=======
>>>>>>> 5e0a6947f356c7850320b506c7beffbc7fb36cd2
