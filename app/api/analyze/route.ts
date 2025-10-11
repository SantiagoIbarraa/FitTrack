import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "AIzaSyDYVDyl_8rod_HvIKxgrUgLHMfMjPc5uNA")

export async function POST(request: Request) {
  try {
    const { image, userProfile } = await request.json()

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    let systemPrompt = `Eres un experto nutricionista y analista de alimentos de PRegister. Tu tarea es analizar imágenes de comidas y proporcionar información nutricional detallada y personalizada.

Cuando analices una imagen de comida, debes:
1. Identificar todos los alimentos visibles en la imagen
2. Estimar las porciones de cada alimento
3. Calcular aproximadamente las calorías totales
4. Desglosar macronutrientes (proteínas, carbohidratos, grasas)
5. Evaluar la calidad nutricional de la comida
6. Proporcionar recomendaciones personalizadas según el perfil del usuario
7. Sugerir mejoras o alternativas más saludables si es apropiado

Formato de respuesta:
- Sé específico y detallado
- Usa lenguaje claro y motivador
- Incluye números aproximados (calorías, gramos de macros)
- Personaliza según el perfil del usuario (objetivos, IMC, etc.)
- Responde en español de forma natural

Si la imagen no contiene comida o no es clara, indícalo amablemente y pide una mejor imagen.`

    if (userProfile) {
      systemPrompt += `\n\nPerfil del usuario:`
      if (userProfile.weight) systemPrompt += `\n- Peso: ${userProfile.weight} kg`
      if (userProfile.height) systemPrompt += `\n- Estatura: ${userProfile.height} cm`
      if (userProfile.age) systemPrompt += `\n- Edad: ${userProfile.age} años`
      if (userProfile.sex) systemPrompt += `\n- Sexo: ${userProfile.sex}`
      if (userProfile.bmi) systemPrompt += `\n- IMC: ${userProfile.bmi} (${userProfile.bmiCategory})`

      if (userProfile.weight && userProfile.height && userProfile.age && userProfile.sex) {
        let bmr: number
        if (userProfile.sex === "male") {
          bmr = 10 * userProfile.weight + 6.25 * userProfile.height - 5 * userProfile.age + 5
        } else {
          bmr = 10 * userProfile.weight + 6.25 * userProfile.height - 5 * userProfile.age - 161
        }

        systemPrompt += `\n- Metabolismo basal (BMR): ${Math.round(bmr)} cal/día`
        systemPrompt += `\n\nUsa esta información para personalizar tus recomendaciones y evaluar si esta comida se ajusta a sus necesidades.`
      }
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Remove data URL prefix if present
    const base64Image = image.replace(/^data:image\/\w+;base64,/, "")

    

    const result = await model.generateContent([
      systemPrompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: "image/jpeg",
        },
      },
    ])

    const response = await result.response
    const text = response.text()

    return NextResponse.json({ analysis: text })
  } catch (error) {
    console.error("Error analyzing image:", error)
    return NextResponse.json({ error: "Error al analizar la imagen. Por favor intenta de nuevo." }, { status: 500 })
  }
}