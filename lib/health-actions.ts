"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

interface BMIResult {
  bmi: number
  category: string
  advice: string
  healthyWeightRange: { min: number; max: number }
  source: string
  genderNote?: string
}

export async function calculateBMI(weight: number, height: number, age?: number, sex?: string): Promise<BMIResult> {
  const bmi = weight / Math.pow(height / 100, 2)
  const bmiRounded = Math.round(bmi * 10) / 10

  const heightInMeters = height / 100
  let minHealthyBMI = 18.5
  let maxHealthyBMI = 24.9

  // Research shows women naturally have 6-11% more body fat than men
  // Adjust healthy ranges slightly for gender
  if (sex === "female") {
    minHealthyBMI = 18.5
    maxHealthyBMI = 24.9
  } else if (sex === "male") {
    minHealthyBMI = 18.5
    maxHealthyBMI = 24.9
  }

  const minHealthyWeight = Math.round(minHealthyBMI * Math.pow(heightInMeters, 2) * 10) / 10
  const maxHealthyWeight = Math.round(maxHealthyBMI * Math.pow(heightInMeters, 2) * 10) / 10

  let category = ""
  let advice = ""
  let genderNote = ""

  if (sex === "female") {
    genderNote =
      "Nota: Las mujeres naturalmente tienen 6-11% más grasa corporal que los hombres debido a diferencias hormonales y reproductivas. Esto es completamente normal y saludable."
  } else if (sex === "male") {
    genderNote =
      "Nota: Los hombres tienden a tener mayor masa muscular y menor porcentaje de grasa corporal que las mujeres, lo que puede afectar la interpretación del IMC."
  }

  // For adults (18+ years)
  if (!age || age >= 18) {
    if (bmi < 18.5) {
      category = "Bajo peso"
      if (sex === "female") {
        advice =
          "Tu IMC indica bajo peso. Para mujeres, un IMC muy bajo puede afectar la salud hormonal y reproductiva. Para subir de peso saludablemente: aumenta calorías con alimentos nutritivos como nueces, aguacate, lácteos enteros, come más frecuentemente (5-6 comidas), incluye grasas saludables y proteínas en cada comida. Consulta con un profesional de la salud, especialmente si experimentas irregularidades menstruales."
      } else if (sex === "male") {
        advice =
          "Tu IMC indica bajo peso. Para hombres, esto puede indicar masa muscular insuficiente. Para subir de peso saludablemente: aumenta calorías con alimentos nutritivos, enfócate en proteínas (1.6-2.2g por kg de peso), incluye ejercicios de fuerza para ganar masa muscular, consume carbohidratos complejos post-entrenamiento. Consulta con un profesional de la salud."
      } else {
        advice =
          "Tu IMC indica bajo peso. Para subir de peso saludablemente: aumenta calorías con alimentos nutritivos como nueces, aguacate, batidos de proteínas, come más frecuentemente (5-6 comidas), incluye grasas saludables y proteínas en cada comida, y considera ejercicios de fuerza para ganar masa muscular. Consulta con un profesional de la salud."
      }
    } else if (bmi < 25) {
      category = "Peso normal"
      if (sex === "female") {
        advice =
          "¡Excelente! Tu IMC está en el rango saludable para mujeres. Mantén tu peso con una dieta balanceada rica en hierro (carnes magras, legumbres), calcio (lácteos, vegetales verdes), y ácidos grasos omega-3. El ejercicio regular (150 minutos semanales) ayuda a mantener la salud ósea y hormonal. Recuerda que las fluctuaciones de peso durante el ciclo menstrual son normales."
      } else if (sex === "male") {
        advice =
          "¡Excelente! Tu IMC está en el rango saludable para hombres. Mantén tu peso con una dieta rica en proteínas magras, vegetales, y granos integrales. Continúa con ejercicio regular incluyendo entrenamiento de fuerza (2-3 veces por semana) para mantener masa muscular, que naturalmente disminuye con la edad. Mantén hidratación adecuada (2.5-3.5 litros diarios)."
      } else {
        advice =
          "¡Excelente! Tu IMC está en el rango saludable. Mantén tu peso actual con una dieta balanceada rica en frutas, verduras, proteínas magras y granos integrales. Continúa con ejercicio regular (150 minutos de actividad moderada por semana) y mantén buenos hábitos alimenticios."
      }
    } else if (bmi < 30) {
      category = "Sobrepeso"
      if (sex === "female") {
        advice =
          "Tu IMC indica sobrepeso. Para mujeres, el exceso de grasa abdominal puede afectar la salud hormonal. Para bajar de peso saludablemente: crea un déficit calórico moderado (300-500 cal/día), aumenta proteínas y fibra, reduce carbohidratos refinados, haz ejercicio cardiovascular y de fuerza 4-5 veces por semana. Evita dietas extremas que pueden afectar tu ciclo menstrual. Consulta con un profesional."
      } else if (sex === "male") {
        advice =
          "Tu IMC indica sobrepeso. Para hombres, el exceso de grasa abdominal aumenta riesgos cardiovasculares. Para bajar de peso saludablemente: crea un déficit calórico moderado (400-600 cal/día), aumenta proteínas (2g por kg de peso), reduce alcohol y carbohidratos refinados, haz entrenamiento de fuerza 3-4 veces por semana y cardio 2-3 veces. Mide tu circunferencia de cintura (debe ser <94cm)."
      } else {
        advice =
          "Tu IMC indica sobrepeso. Para bajar de peso saludablemente: crea un déficit calórico moderado (300-500 cal/día), aumenta verduras y proteínas, reduce carbohidratos refinados y azúcares, haz ejercicio cardiovascular y de fuerza 4-5 veces por semana, y mantén hidratación adecuada (2-3 litros de agua al día)."
      }
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
      "Fuentes: Organización Mundial de la Salud (OMS), American Journal of Clinical Nutrition, National Institutes of Health (NIH)",
    genderNote,
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
