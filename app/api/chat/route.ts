import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getExerciseHistory, getUniqueExercises } from "@/lib/exercise-history-actions"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

export async function POST(request: Request) {
  try {
    const { message, userProfile } = await request.json()

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

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
  } catch (error) {
    console.error("Error processing message:", error)
    return NextResponse.json({ error: "Error al procesar tu mensaje" }, { status: 500 })
  }
}
