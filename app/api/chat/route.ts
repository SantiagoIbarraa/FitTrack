import { generateText, generateObject } from "ai"
import { google } from "@ai-sdk/google"
import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getExerciseHistory, getUniqueExercises } from "@/lib/exercise-history-actions"
import { getRunningHistory } from "@/lib/history-actions"
import { getWorkouts } from "@/lib/gym-actions"
import { z } from "zod"

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
  confidence: z.enum(["alta", "media", "baja"]).describe("Nivel de confianza en el análisis"),
})

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Chat API: Request received")

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY
    console.log("[v0] Chat API: API key exists?", !!apiKey)

    if (!apiKey) {
      console.error("[v0] Chat API: No API key found")
      return NextResponse.json(
        {
          error:
            "GOOGLE_GENERATIVE_AI_API_KEY no está configurada. Por favor, agrega la variable de entorno en la sección 'Vars' del sidebar.",
        },
        { status: 500 },
      )
    }

    const body = await request.json()
    console.log("[v0] Chat API: Request body parsed", {
      type: body.type,
      hasMessage: !!body.message,
      hasImage: !!body.image,
    })

    const { message, userProfile, image, type } = body

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.error("[v0] Chat API: User not authenticated")
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    console.log("[v0] Chat API: User authenticated:", user.id)

    // Manejar análisis de imagen
    if (type === "image" && image) {
      console.log("[v0] Chat API: Processing image analysis")
      return await handleImageAnalysis(image, apiKey)
    }

    // Manejar chat de texto
    if (!message) {
      console.error("[v0] Chat API: No message provided")
      return NextResponse.json({ error: "No se proporcionó un mensaje" }, { status: 400 })
    }

    console.log("[v0] Chat API: Processing chat message")
    return await handleChatMessage(message, userProfile, apiKey)
  } catch (error) {
    console.error("[v0] Chat API: Error in POST handler:", error)

    let errorMessage = "Error al procesar tu solicitud"

    if (error instanceof Error) {
      console.error("[v0] Chat API: Error details:", error.message, error.stack)
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

async function handleImageAnalysis(image: string, apiKey: string) {
  try {
    console.log("[v0] Image Analysis: Starting")
    // Remove data URL prefix
    const base64Image = image.replace(/^data:image\/\w+;base64,/, "")

    const model = google("gemini-2.5-flash", { apiKey })
    console.log("[v0] Image Analysis: Model created")

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

    console.log("[v0] Image Analysis: Calling generateObject")
    const { object } = await generateObject({
      model,
      schema: foodAnalysisSchema,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image",
              image: `data:image/jpeg;base64,${base64Image}`,
            },
          ],
        },
      ],
    })

    console.log("[v0] Image Analysis: Success")
    return NextResponse.json(object)
  } catch (error) {
    console.error("[v0] Image Analysis: Error:", error)
    if (error instanceof Error) {
      console.error("[v0] Image Analysis: Error details:", error.message, error.stack)
    }
    return NextResponse.json({ error: "Error al analizar la imagen. Por favor intenta de nuevo." }, { status: 500 })
  }
}

async function handleChatMessage(message: string, userProfile: any, apiKey: string) {
  console.log("[v0] Chat Message: Starting")

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
    console.log("[v0] Chat Message: No exercise history available")
  }

  let runningData = ""
  try {
    const runningSessions = await getRunningHistory(30)
    if (runningSessions.length > 0) {
      const totalDistance = runningSessions.reduce((sum, session) => sum + session.distance, 0)
      const avgPace = runningSessions.reduce((sum, session) => sum + session.pace, 0) / runningSessions.length
      const lastSession = runningSessions[0]

      runningData = `\n\nDATOS DE RUNNING (últimos 30 días):
- Total de sesiones: ${runningSessions.length}
- Distancia total: ${totalDistance.toFixed(2)}km
- Pace promedio: ${avgPace.toFixed(2)} min/km
- Última sesión: ${lastSession.distance}km en ${lastSession.duration} minutos (${lastSession.pace.toFixed(2)} min/km)`
    }
  } catch (error) {
    console.log("[v0] Chat Message: No running history available")
  }

  let gymData = ""
  try {
    const workouts = await getWorkouts()
    if (workouts.length > 0) {
      const recentWorkouts = workouts.slice(0, 5)
      gymData = `\n\nÚLTIMOS ENTRENAMIENTOS EN GIMNASIO:`
      recentWorkouts.forEach((workout: any) => {
        const date = new Date(workout.created_at).toLocaleDateString()
        gymData += `\n- ${workout.exercise_name}: ${workout.weight_kg || 0}kg x ${workout.repetitions || 0} reps x ${workout.sets || 0} sets (${date})`
      })
    }
  } catch (error) {
    console.log("[v0] Chat Message: No gym workouts available")
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

  console.log("[v0] Chat Message: Creating model")
  const model = google("gemini-2.5-flash", { apiKey })

  const prompt = `Eres un asistente nutricional experto especializado en fitness y salud. Tu nombre es "Asistente Nutricional de FitTrack".

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
${runningData}
${gymData}

PREGUNTA DEL USUARIO: ${message}

INSTRUCCIONES:
- Responde en español de forma clara, concisa y útil
- Usa formato markdown para mejor legibilidad (negritas, listas, etc.)
- Personaliza tu respuesta basándote en TODOS los datos del usuario (perfil, ejercicios, running, gym)
- Si el usuario pregunta sobre su progreso, analiza sus datos de ejercicios, running y gym
- Si el usuario no tiene datos completos, sugiere completar su perfil en la sección de Salud
- Proporciona información basada en evidencia científica
- Incluye ejemplos prácticos y cantidades específicas cuando sea relevante
- Si preguntan sobre su perfil o progreso, usa los datos proporcionados arriba
- Mantén un tono motivador y profesional
- Si la pregunta no está relacionada con nutrición o fitness, redirige amablemente al tema
- Puedes hacer recomendaciones nutricionales basadas en su actividad física reciente

Responde a la pregunta del usuario ahora:`

  console.log("[v0] Chat Message: Calling generateText")
  const { text } = await generateText({
    model,
    prompt,
  })

  console.log("[v0] Chat Message: Success, response length:", text.length)
  return NextResponse.json({ response: text })
}
