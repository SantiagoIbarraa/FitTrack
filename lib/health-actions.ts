"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

interface BMIResult {
  bmi: number
  category: string
  advice: string
  healthyWeightRange: { min: number; max: number }
  source: string
}

export async function calculateBMI(weight: number, height: number, age?: number, sex?: string): Promise<BMIResult> {
  const bmi = weight / Math.pow(height / 100, 2)
  const bmiRounded = Math.round(bmi * 10) / 10

  // Calculate healthy weight range for this height
  const heightInMeters = height / 100
  const minHealthyWeight = Math.round(18.5 * Math.pow(heightInMeters, 2) * 10) / 10
  const maxHealthyWeight = Math.round(24.9 * Math.pow(heightInMeters, 2) * 10) / 10

  let category = ""
  let advice = ""

  // For adults (18+ years)
  if (!age || age >= 18) {
    if (bmi < 18.5) {
      category = "Bajo peso"
      advice =
        "Tu IMC indica bajo peso. Para subir de peso saludablemente: aumenta calorías con alimentos nutritivos como nueces, aguacate, batidos de proteínas, come más frecuentemente (5-6 comidas), incluye grasas saludables y proteínas en cada comida, y considera ejercicios de fuerza para ganar masa muscular. Consulta con un profesional de la salud."
    } else if (bmi < 25) {
      category = "Peso normal"
      advice =
        "¡Excelente! Tu IMC está en el rango saludable. Mantén tu peso actual con una dieta balanceada rica en frutas, verduras, proteínas magras y granos integrales. Continúa con ejercicio regular (150 minutos de actividad moderada por semana) y mantén buenos hábitos alimenticios."
    } else if (bmi < 30) {
      category = "Sobrepeso"
      advice =
        "Tu IMC indica sobrepeso. Para bajar de peso saludablemente: crea un déficit calórico moderado (300-500 cal/día), aumenta verduras y proteínas, reduce carbohidratos refinados y azúcares, haz ejercicio cardiovascular y de fuerza 4-5 veces por semana, y mantén hidratación adecuada (2-3 litros de agua al día)."
    } else if (bmi < 35) {
      category = "Obesidad grado I"
      advice =
        "Tu IMC indica obesidad grado I. Te recomiendo consultar con un profesional de la salud. Para empezar: enfócate en cambios graduales, aumenta verduras, reduce porciones, elimina bebidas azucaradas, camina diariamente (30-45 minutos), y considera apoyo profesional para un plan personalizado."
    } else if (bmi < 40) {
      category = "Obesidad grado II"
      advice =
        "Tu IMC indica obesidad grado II. Es importante consultar con un médico o nutricionista. Pueden ayudarte con un plan personalizado que incluya dieta, ejercicio y posiblemente tratamiento médico. Los cambios graduales y sostenibles son clave para el éxito a largo plazo."
    } else {
      category = "Obesidad grado III"
      advice =
        "Tu IMC indica obesidad grado III (mórbida). Es fundamental consultar con un equipo médico especializado. Pueden evaluar opciones de tratamiento que incluyan dieta supervisada, ejercicio adaptado, terapia conductual y posiblemente intervenciones médicas o quirúrgicas."
    }
  } else {
    // For children and adolescents (simplified - in reality should use percentile charts)
    if (bmi < 16) {
      category = "Bajo peso"
      advice =
        "Para niños y adolescentes, el IMC debe evaluarse con tablas de percentiles específicas por edad y sexo. Consulta con un pediatra para una evaluación precisa y recomendaciones personalizadas."
    } else if (bmi < 23) {
      category = "Peso normal"
      advice =
        "El peso parece estar en un rango saludable, pero para niños y adolescentes es importante usar tablas de percentiles. Consulta con un pediatra para una evaluación completa."
    } else if (bmi < 27) {
      category = "Sobrepeso"
      advice =
        "Puede indicar sobrepeso, pero en niños y adolescentes se debe evaluar con percentiles. Consulta con un pediatra para orientación sobre alimentación saludable y actividad física apropiada para la edad."
    } else {
      category = "Obesidad"
      advice =
        "Puede indicar obesidad, pero requiere evaluación con percentiles pediátricos. Es importante consultar con un pediatra para un plan de salud apropiado que incluya toda la familia."
    }
  }

  return {
    bmi: bmiRounded,
    category,
    advice,
    healthyWeightRange: {
      min: minHealthyWeight,
      max: maxHealthyWeight,
    },
    source:
      "Fuente: Organización Mundial de la Salud (OMS) - https://www.who.int/es/news-room/fact-sheets/detail/obesity-and-overweight",
  }
}

export async function saveHealthMetric(formData: FormData) {
  const weight = formData.get("weight")?.toString()
  const heartRate = formData.get("heartRate")?.toString()
  const systolicPressure = formData.get("systolicPressure")?.toString()
  const diastolicPressure = formData.get("diastolicPressure")?.toString()
  const notes = formData.get("notes")?.toString()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Usuario no autenticado" }
  }

  try {
    const insertData: any = {
      user_id: user.id,
      date: new Date().toISOString(),
    }

    if (weight) {
      insertData.weight = Number.parseFloat(weight)
    }

    if (heartRate) {
      insertData.heart_rate = Number.parseInt(heartRate)
    }

    if (systolicPressure) {
      insertData.systolic_pressure = Number.parseInt(systolicPressure)
    }

    if (diastolicPressure) {
      insertData.diastolic_pressure = Number.parseInt(diastolicPressure)
    }

    if (notes) {
      insertData.notes = notes
    }

    const { error } = await supabase.from("health_metrics").insert(insertData)

    if (error) {
      console.error("Error saving health metric:", error)
      return { error: "Error al guardar las métricas de salud" }
    }

    revalidatePath("/health")
    return { success: true, message: "Métricas guardadas correctamente" }
  } catch (error) {
    console.error("Error:", error)
    return { error: "Error al procesar las métricas" }
  }
}

export async function getHealthMetrics(limit = 30) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Usuario no autenticado", data: [] }
  }

  try {
    const { data, error } = await supabase
      .from("health_metrics")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Error fetching health metrics:", error)
      return { error: "Error al obtener las métricas", data: [] }
    }

    return { data: data || [], error: null }
  } catch (error) {
    console.error("Error:", error)
    return { error: "Error al procesar la solicitud", data: [] }
  }
}
