import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "AIzaSyDYVDyl_8rod_HvIKxgrUgLHMfMjPc5uNA")

export async function POST(request: Request) {
  try {
    const { image, userProfile, responseMode } = await request.json()

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    let systemPrompt = ""
    
    if (responseMode === "quick") {
      systemPrompt = `Eres un experto nutricionista de FitTrack. Proporciona un análisis NUTRICIONAL RÁPIDO y CONCISO de la imagen de comida.

Para respuesta RÁPIDA, incluye SOLO:
1. Alimentos identificados (lista breve)
2. Calorías aproximadas totales
3. Macronutrientes básicos (proteínas, carbohidratos, grasas) en números
4. Una recomendación corta (1-2 líneas máximo)

IMPORTANTE: Si en la imagen aparece una persona, analiza también el sexo biológico (masculino/femenino) basándote en características físicas visibles y menciónalo al final.

Mantén la respuesta en máximo 3-4 líneas. Sé directo y conciso.
Responde en español de forma natural.

Si la imagen no contiene comida o no es clara, indícalo brevemente.`
    } else {
      systemPrompt = `Eres un experto nutricionista y analista de alimentos de FitTrack. Tu tarea es analizar imágenes de comidas y proporcionar información nutricional DETALLADA y personalizada.

Cuando analices una imagen de comida, debes:
1. Identificar todos los alimentos visibles en la imagen
2. Estimar las porciones de cada alimento
3. Calcular aproximadamente las calorías totales
4. Desglosar macronutrientes (proteínas, carbohidratos, grasas) con detalles
5. Evaluar la calidad nutricional de la comida
6. Proporcionar recomendaciones personalizadas según el perfil del usuario
7. Sugerir mejoras o alternativas más saludables si es apropiado
8. Incluir información sobre vitaminas y minerales relevantes
9. Explicar el impacto en los objetivos del usuario

IMPORTANTE: Si en la imagen aparece una persona, analiza también el sexo biológico (masculino/femenino) basándote en características físicas visibles y menciónalo en una sección separada al final del análisis.

Formato de respuesta EXTENSA:
- Sé específico y detallado
- Usa lenguaje claro y motivador
- Incluye números aproximados (calorías, gramos de macros)
- Personaliza según el perfil del usuario (objetivos, IMC, etc.)
- Responde en español de forma natural
- Proporciona contexto educativo sobre los alimentos
- Incluye consejos prácticos de preparación o consumo

Si la imagen no contiene comida o no es clara, indícalo amablemente y pide una mejor imagen.`
    }

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

    console.log("carlos");
    

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

    // Agregar verificación de sexo si está disponible en el perfil
    let analysisWithSexCheck = text
    if (userProfile && userProfile.sex) {
      const userSex = userProfile.sex.toLowerCase()
      analysisWithSexCheck += `\n\n--- VERIFICACIÓN DE SEXO ---\n`
      analysisWithSexCheck += `Sexo registrado en tu perfil: ${userSex}\n`
      analysisWithSexCheck += `Si el análisis de la IA no coincide con tu sexo registrado, por favor verifica que la imagen sea clara y muestre tus características físicas.`
    }

    return NextResponse.json({ analysis: analysisWithSexCheck })
  } catch (error) {
    console.error("Error analyzing image:", error)
    return NextResponse.json({ error: "Error al analizar la imagen. Por favor intenta de nuevo." }, { status: 500 })
  }
}
