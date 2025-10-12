import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getExerciseHistory, getUniqueExercises } from "@/lib/exercise-history-actions"

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

    // Obtener datos de ejercicios del usuario
    let exerciseData = ""
    try {
      const exercises = await getUniqueExercises()
      if (exercises.length > 0) {
        exerciseData = `\n\nTus ejercicios registrados: ${exercises.join(", ")}`

        // Obtener el último ejercicio para mostrar progreso
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

    const response = generateKeywordResponse(message.toLowerCase(), userProfile, exerciseData)

    return NextResponse.json({ response })
  } catch (error) {
    console.error("Error processing message:", error)
    return NextResponse.json({ error: "Error al procesar tu mensaje" }, { status: 500 })
  }
}

function generateKeywordResponse(message: string, userProfile: any, exerciseData: string): string {
  // Calcular BMR y necesidades calóricas
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
    tdee = Math.round(bmr * 1.55) // Factor de actividad moderada
    proteinMin = Math.round(userProfile.weight * 1.6)
    proteinMax = Math.round(userProfile.weight * 2.2)
  }

  // PALABRAS CLAVE SOBRE PERFIL Y MÉTRICAS
  if (message.includes("mi perfil") || message.includes("mis datos") || message.includes("mi información")) {
    if (!userProfile?.weight) {
      return "No tienes un perfil completo aún. Ve a la sección de Salud para completar tu peso, altura, edad y sexo. Esto me permitirá darte recomendaciones personalizadas."
    }
    let response = `📊 **Tu Perfil Nutricional:**\n\n`
    response += `• Peso: ${userProfile.weight} kg\n`
    response += `• Altura: ${userProfile.height} cm\n`
    response += `• Edad: ${userProfile.age} años\n`
    response += `• Sexo: ${userProfile.sex === "male" ? "Masculino" : "Femenino"}\n`
    response += `• IMC: ${userProfile.bmi} (${userProfile.bmiCategory})\n\n`
    response += `💪 **Tus Necesidades:**\n`
    response += `• Metabolismo basal: ${Math.round(bmr)} cal/día\n`
    response += `• Calorías totales (actividad moderada): ${tdee} cal/día\n`
    response += `• Proteína recomendada: ${proteinMin}-${proteinMax}g/día\n`
    if (exerciseData) {
      response += exerciseData
    }
    return response
  }

  // PALABRAS CLAVE SOBRE CALORÍAS
  if (
    message.includes("caloría") ||
    message.includes("caloria") ||
    message.includes("cuántas calorías") ||
    message.includes("cuantas calorias") ||
    message.includes("necesito comer")
  ) {
    if (!bmr) {
      return "Para calcular tus necesidades calóricas, necesito que completes tu perfil con peso, altura, edad y sexo. Ve a la sección de Salud."
    }
    let response = `🔥 **Tus Necesidades Calóricas:**\n\n`
    response += `Tu metabolismo basal (BMR) es de **${Math.round(bmr)} calorías/día**. Esto es lo que tu cuerpo quema en reposo.\n\n`
    response += `Según tu nivel de actividad:\n`
    response += `• Sedentario: ${Math.round(bmr * 1.2)} cal/día\n`
    response += `• Ligera actividad: ${Math.round(bmr * 1.375)} cal/día\n`
    response += `• Actividad moderada: ${Math.round(bmr * 1.55)} cal/día\n`
    response += `• Muy activo: ${Math.round(bmr * 1.725)} cal/día\n`
    response += `• Extremadamente activo: ${Math.round(bmr * 1.9)} cal/día\n\n`
    response += `💡 **Recomendación:** Para mantener tu peso actual con actividad moderada, consume alrededor de **${tdee} calorías/día**.`
    return response
  }

  // PALABRAS CLAVE SOBRE PROTEÍNA
  if (
    message.includes("proteína") ||
    message.includes("proteina") ||
    message.includes("cuánta proteína") ||
    message.includes("cuanta proteina") ||
    message.includes("proteínas") ||
    message.includes("proteinas")
  ) {
    if (!userProfile?.weight) {
      return "Para calcular tus necesidades de proteína, necesito saber tu peso. Completa tu perfil en la sección de Salud."
    }
    let response = `🥩 **Necesidades de Proteína:**\n\n`
    response += `Para una persona de ${userProfile.weight}kg que entrena regularmente:\n\n`
    response += `• Mínimo recomendado: **${proteinMin}g/día** (1.6g por kg)\n`
    response += `• Óptimo para ganar músculo: **${proteinMax}g/día** (2.2g por kg)\n\n`
    response += `📋 **Fuentes de proteína (por 100g):**\n`
    response += `• Pechuga de pollo: 31g\n`
    response += `• Atún: 30g\n`
    response += `• Huevos: 13g (2 huevos grandes)\n`
    response += `• Carne magra: 26g\n`
    response += `• Yogur griego: 10g\n`
    response += `• Lentejas: 9g\n`
    response += `• Quinoa: 4g\n\n`
    response += `💡 **Tip:** Distribuye tu proteína en 4-5 comidas al día para mejor absorción.`
    return response
  }

  // PALABRAS CLAVE SOBRE GANAR MÚSCULO
  if (
    message.includes("ganar músculo") ||
    message.includes("ganar musculo") ||
    message.includes("aumentar masa") ||
    message.includes("hipertrofia") ||
    message.includes("volumen")
  ) {
    let response = `💪 **Plan para Ganar Músculo:**\n\n`
    if (bmr) {
      const surplus = Math.round(tdee + 300)
      response += `🔥 **Calorías:** ${surplus} cal/día (superávit de 300 cal)\n\n`
    }
    response += `🥗 **Macronutrientes:**\n`
    if (userProfile?.weight) {
      response += `• Proteína: ${proteinMax}g/día (2.2g/kg)\n`
      response += `• Carbohidratos: ${Math.round(userProfile.weight * 4)}g/día\n`
      response += `• Grasas: ${Math.round(userProfile.weight * 1)}g/día\n\n`
    }
    response += `⏰ **Timing de nutrientes:**\n`
    response += `• Pre-entreno (1-2h antes): Carbos + proteína moderada\n`
    response += `• Post-entreno (30min después): Proteína + carbos rápidos\n\n`
    response += `🍽️ **Ejemplo de comida post-entreno:**\n`
    response += `• 2 scoops de proteína whey (50g proteína)\n`
    response += `• 1 banana + avena (40g carbos)\n`
    response += `• O: Pechuga de pollo + arroz blanco\n\n`
    response += `💊 **Suplementos útiles:**\n`
    response += `• Creatina monohidrato: 5g/día\n`
    response += `• Proteína whey: para alcanzar tu meta diaria\n`
    response += `• Multivitamínico: para cubrir micronutrientes`
    if (exerciseData) {
      response += `\n\n${exerciseData}\n\n💡 Asegúrate de aumentar progresivamente los pesos en tus ejercicios.`
    }
    return response
  }

  // PALABRAS CLAVE SOBRE PERDER PESO/GRASA
  if (
    message.includes("bajar de peso") ||
    message.includes("perder peso") ||
    message.includes("adelgazar") ||
    message.includes("quemar grasa") ||
    message.includes("déficit") ||
    message.includes("deficit")
  ) {
    let response = `🔥 **Plan para Perder Grasa:**\n\n`
    if (bmr) {
      const deficit = Math.round(tdee - 500)
      response += `📊 **Calorías:** ${deficit} cal/día (déficit de 500 cal)\n`
      response += `Esto te permitirá perder aproximadamente 0.5kg por semana de forma saludable.\n\n`
    }
    response += `🥗 **Macronutrientes:**\n`
    if (userProfile?.weight) {
      response += `• Proteína: ${proteinMax}g/día (mantener músculo)\n`
      response += `• Carbohidratos: ${Math.round(userProfile.weight * 2)}g/día\n`
      response += `• Grasas: ${Math.round(userProfile.weight * 0.8)}g/día\n\n`
    }
    response += `✅ **Estrategias efectivas:**\n`
    response += `• Prioriza proteína en cada comida (saciedad)\n`
    response += `• Come vegetales en abundancia (fibra, volumen)\n`
    response += `• Bebe 2-3L de agua al día\n`
    response += `• Duerme 7-8 horas (recuperación hormonal)\n`
    response += `• Cardio 3-4x semana (150-200 min total)\n\n`
    response += `🚫 **Evita:**\n`
    response += `• Déficits extremos (>1000 cal)\n`
    response += `• Eliminar grupos alimenticios completos\n`
    response += `• Pesarte todos los días (usa promedio semanal)\n\n`
    response += `💡 **Tip:** Mantén el entrenamiento de fuerza para preservar músculo durante el déficit.`
    return response
  }

  // PALABRAS CLAVE SOBRE PRE Y POST ENTRENO
  if (
    message.includes("pre entreno") ||
    message.includes("pre-entreno") ||
    message.includes("antes de entrenar") ||
    message.includes("antes del gym")
  ) {
    return `⚡ **Nutrición Pre-Entreno:**\n\n🕐 **1-2 horas antes:**\n• Carbohidratos complejos: avena, arroz integral, batata\n• Proteína magra: pollo, pescado, claras de huevo\n• Ejemplo: 100g arroz + 150g pechuga de pollo\n\n🕐 **30-45 minutos antes:**\n• Carbohidratos simples: banana, manzana, dátiles\n• Proteína de rápida absorción: whey protein\n• Ejemplo: 1 banana + 1 scoop de proteína\n\n☕ **Opcional:**\n• Cafeína: 200-400mg (1-2 tazas de café)\n• Mejora rendimiento y enfoque\n\n💡 **Tip:** Evita grasas y fibra excesiva antes de entrenar (digestión lenta).`
  }

  if (
    message.includes("post entreno") ||
    message.includes("post-entreno") ||
    message.includes("después de entrenar") ||
    message.includes("después del gym")
  ) {
    return `🍗 **Nutrición Post-Entreno:**\n\n⏰ **Ventana anabólica (30-60 min):**\n• Proteína: 25-40g para síntesis muscular\n• Carbohidratos: 0.5-1g por kg de peso corporal\n• Ratio ideal: 3:1 o 4:1 (carbos:proteína)\n\n🥤 **Opciones líquidas (absorción rápida):**\n• Batido: 2 scoops whey + 1 banana + avena\n• Leche chocolatada + proteína\n\n🍽️ **Opciones sólidas:**\n• Pechuga de pollo + arroz blanco + vegetales\n• Atún + pasta + ensalada\n• Huevos + pan integral + aguacate\n\n💊 **Suplementos útiles:**\n• Creatina: 5g (mejora recuperación)\n• BCAAs: si entrenas en ayunas\n\n💡 **Importante:** La comida post-entreno es crucial para recuperación y crecimiento muscular.`
  }

  // PALABRAS CLAVE SOBRE SUPLEMENTOS
  if (
    message.includes("suplemento") ||
    message.includes("suplementos") ||
    message.includes("creatina") ||
    message.includes("proteína whey") ||
    message.includes("bcaa")
  ) {
    return `💊 **Guía de Suplementos:**\n\n✅ **Esenciales (respaldados por ciencia):**\n\n1. **Proteína Whey**\n   • Cuándo: Post-entreno o para alcanzar meta diaria\n   • Dosis: 25-30g por toma\n   • Beneficio: Síntesis muscular, recuperación\n\n2. **Creatina Monohidrato**\n   • Cuándo: Cualquier hora del día\n   • Dosis: 5g/día (sin fase de carga necesaria)\n   • Beneficio: +5-15% fuerza, +1-2kg masa muscular\n\n3. **Cafeína**\n   • Cuándo: 30-60 min pre-entreno\n   • Dosis: 200-400mg (3-6mg/kg)\n   • Beneficio: +3-5% rendimiento, enfoque\n\n⚠️ **Opcionales (menos evidencia):**\n• BCAAs: útil solo si entrenas en ayunas\n• Beta-alanina: mejora resistencia muscular\n• Multivitamínico: si tu dieta es deficiente\n\n🚫 **Innecesarios:**\n• Quemadores de grasa (efecto mínimo)\n• Glutamina (cuerpo produce suficiente)\n• Testosterona boosters naturales (no funcionan)\n\n💡 **Recuerda:** Los suplementos son el 5-10% del resultado. Prioriza dieta y entrenamiento.`
  }

  // PALABRAS CLAVE SOBRE MEAL PREP
  if (
    message.includes("meal prep") ||
    message.includes("preparar comidas") ||
    message.includes("batch cooking") ||
    message.includes("cocinar para la semana")
  ) {
    return `🍱 **Guía de Meal Prep:**\n\n📅 **Plan Semanal (5 días):**\n\n🥩 **Proteínas:**\n• 1.5kg pechuga de pollo (hornear con especias)\n• 1kg carne molida magra (preparar con tomate)\n• 20 huevos duros\n• 500g pescado (salmón o tilapia)\n\n🍚 **Carbohidratos:**\n• 1kg arroz integral o blanco\n• 1kg batata o papa\n• 500g avena\n• Pan integral\n\n🥦 **Vegetales:**\n• Brócoli, espinaca, zanahoria\n• Pimientos, cebolla, tomate\n• Lechuga, pepino (preparar fresco)\n\n🥑 **Grasas:**\n• Aguacate (comprar para 2-3 días)\n• Aceite de oliva\n• Frutos secos (almendras, nueces)\n\n📦 **Método de preparación:**\n1. Domingo: cocina proteínas y carbos\n2. Divide en 10-15 contenedores\n3. Refrigera 3 días, congela el resto\n4. Miércoles: descongela para jueves-viernes\n\n💡 **Tip:** Usa especias diferentes para variar sabores (curry, paprika, limón, ajo).`
  }

  // PALABRAS CLAVE SOBRE RECETAS
  if (
    message.includes("receta") ||
    message.includes("recetas") ||
    message.includes("cómo cocinar") ||
    message.includes("como cocinar") ||
    message.includes("preparar")
  ) {
    return `👨‍🍳 **Recetas Fitness Rápidas:**\n\n🍳 **Desayuno Proteico (5 min):**\n• 3 huevos revueltos\n• 2 rebanadas pan integral\n• 1 aguacate\n• Tomate cherry\n**Macros:** 35g proteína, 40g carbos, 25g grasas\n\n🥗 **Ensalada Power (10 min):**\n• 200g pechuga de pollo a la plancha\n• Mix de lechugas\n• Quinoa cocida (1/2 taza)\n• Aguacate, tomate, pepino\n• Aderezo: aceite oliva + limón\n**Macros:** 45g proteína, 35g carbos, 20g grasas\n\n🍝 **Pasta Fitness (15 min):**\n• 100g pasta integral\n• 150g carne molida magra\n• Salsa de tomate casera\n• Vegetales salteados\n• Queso parmesano (10g)\n**Macros:** 40g proteína, 60g carbos, 15g grasas\n\n🥤 **Batido Post-Entreno:**\n• 2 scoops proteína whey\n• 1 banana\n• 50g avena\n• 300ml leche o agua\n• Hielo\n**Macros:** 50g proteína, 55g carbos, 8g grasas\n\n💡 **Tip:** Prepara las proteínas en batch y solo cocina carbos y vegetales frescos cada día.`
  }

  // PALABRAS CLAVE SOBRE HIDRATACIÓN
  if (
    message.includes("agua") ||
    message.includes("hidratación") ||
    message.includes("hidratacion") ||
    message.includes("cuánta agua") ||
    message.includes("cuanta agua")
  ) {
    let response = `💧 **Guía de Hidratación:**\n\n`
    if (userProfile?.weight) {
      const waterMin = Math.round(userProfile.weight * 30)
      const waterMax = Math.round(userProfile.weight * 40)
      response += `📊 **Tu necesidad:** ${waterMin}-${waterMax}ml/día\n`
      response += `(Basado en 30-40ml por kg de peso corporal)\n\n`
    }
    response += `💪 **Durante entrenamiento:**\n`
    response += `• Antes: 500ml (2 horas antes)\n`
    response += `• Durante: 200-300ml cada 15-20 min\n`
    response += `• Después: 150% del peso perdido en sudor\n\n`
    response += `🚰 **Tips para beber más agua:**\n`
    response += `• Lleva botella contigo siempre\n`
    response += `• Bebe 1 vaso al despertar\n`
    response += `• 1 vaso antes de cada comida\n`
    response += `• Infusiones y té cuentan\n\n`
    response += `⚠️ **Señales de deshidratación:**\n`
    response += `• Orina oscura\n`
    response += `• Fatiga y dolor de cabeza\n`
    response += `• Rendimiento reducido\n`
    response += `• Calambres musculares\n\n`
    response += `💡 **Importante:** En días de entrenamiento intenso o calor, aumenta 500-1000ml adicionales.`
    return response
  }

  // PALABRAS CLAVE SOBRE CARBOHIDRATOS
  if (
    message.includes("carbohidrato") ||
    message.includes("carbohidratos") ||
    message.includes("carbos") ||
    message.includes("azúcar") ||
    message.includes("azucar")
  ) {
    return `🍚 **Guía de Carbohidratos:**\n\n✅ **Carbohidratos complejos (preferir):**\n• Arroz integral, quinoa, avena\n• Batata, papa, yuca\n• Pan integral, pasta integral\n• Legumbres (lentejas, garbanzos)\n**Beneficio:** Energía sostenida, fibra, saciedad\n\n⚡ **Carbohidratos simples (timing específico):**\n• Frutas (banana, manzana, berries)\n• Miel, dátiles\n• Arroz blanco, pan blanco\n**Cuándo:** Pre/post entreno para energía rápida\n\n📊 **Cantidad recomendada:**\n• Sedentario: 2-3g/kg peso corporal\n• Activo: 4-6g/kg\n• Muy activo: 6-8g/kg\n\n🕐 **Timing óptimo:**\n• Mañana: Mayor cantidad (energía para el día)\n• Pre-entreno: Carbos complejos\n• Post-entreno: Carbos simples + complejos\n• Noche: Reducir cantidad (menor actividad)\n\n🚫 **Mitos sobre carbos:**\n• ❌ "Los carbos engordan" → Las calorías totales importan\n• ❌ "No comer carbos de noche" → El timing es menos importante que el total diario\n• ❌ "Carbos son malos" → Son esenciales para rendimiento y energía\n\n💡 **Tip:** Ajusta carbos según tu nivel de actividad del día.`
  }

  // PALABRAS CLAVE SOBRE GRASAS
  if (
    message.includes("grasa") ||
    message.includes("grasas") ||
    message.includes("lípido") ||
    message.includes("lipidos") ||
    message.includes("omega")
  ) {
    return `🥑 **Guía de Grasas Saludables:**\n\n✅ **Grasas saludables (priorizar):**\n\n🥜 **Monoinsaturadas:**\n• Aguacate (15g por 100g)\n• Aceite de oliva (14g por cucharada)\n• Almendras, nueces, pistachos\n• Aceitunas\n**Beneficio:** Salud cardiovascular, antiinflamatorio\n\n🐟 **Poliinsaturadas (Omega-3):**\n• Salmón, atún, sardinas\n• Semillas de chía, linaza\n• Nueces\n**Beneficio:** Salud cerebral, reducción inflamación\n\n🥥 **Saturadas (moderación):**\n• Aceite de coco\n• Carne roja magra\n• Lácteos enteros\n• Huevos\n**Cantidad:** <10% de calorías totales\n\n🚫 **Grasas trans (evitar):**\n• Alimentos procesados\n• Frituras comerciales\n• Margarina\n• Bollería industrial\n\n📊 **Cantidad recomendada:**\n• 0.8-1g por kg de peso corporal\n• 20-35% de calorías totales\n\n💡 **Funciones importantes:**\n• Producción hormonal (testosterona)\n• Absorción vitaminas A, D, E, K\n• Saciedad y control apetito\n• Salud cerebral y articular\n\n⚠️ **Importante:** Las grasas tienen 9 cal/g (vs 4 cal/g de proteína/carbos), controla porciones.`
  }

  // PALABRAS CLAVE SOBRE AYUNO INTERMITENTE
  if (
    message.includes("ayuno") ||
    message.includes("ayuno intermitente") ||
    message.includes("16/8") ||
    message.includes("intermittent fasting")
  ) {
    return `⏰ **Ayuno Intermitente:**\n\n📋 **Protocolos comunes:**\n\n1. **16/8 (más popular)**\n   • 16 horas ayuno, 8 horas alimentación\n   • Ejemplo: Comer de 12pm a 8pm\n   • Ideal para principiantes\n\n2. **18/6**\n   • 18 horas ayuno, 6 horas alimentación\n   • Ejemplo: Comer de 2pm a 8pm\n   • Para más experiencia\n\n3. **20/4 (Warrior Diet)**\n   • 20 horas ayuno, 4 horas alimentación\n   • Solo para avanzados\n\n✅ **Beneficios potenciales:**\n• Simplifica planificación de comidas\n• Puede ayudar con déficit calórico\n• Mejora sensibilidad insulina\n• Autofagia celular\n\n⚠️ **Consideraciones:**\n• NO es mágico para perder grasa\n• Las calorías totales siguen importando\n• Puede afectar rendimiento deportivo\n• No apto para todos (embarazo, diabetes, etc.)\n\n💪 **Ayuno + Entrenamiento:**\n• Cardio en ayunas: OK para algunos\n• Pesas en ayunas: puede reducir rendimiento\n• Recomendado: entrenar en ventana de alimentación\n\n🥤 **Durante el ayuno puedes:**\n• Agua (ilimitada)\n• Café negro\n• Té sin azúcar\n• Agua con limón\n\n🚫 **Rompe el ayuno:**\n• Cualquier caloría\n• Leche en café\n• Edulcorantes (algunos)\n• Suplementos con calorías\n\n💡 **Tip:** Empieza gradual (12/12, luego 14/10, luego 16/8). Escucha a tu cuerpo.`
  }

  // PALABRAS CLAVE SOBRE DIETAS ESPECÍFICAS
  if (message.includes("keto") || message.includes("cetogénica") || message.includes("cetogenica")) {
    return `🥓 **Dieta Cetogénica (Keto):**\n\n📊 **Distribución de macros:**\n• Grasas: 70-75% (130-165g)\n• Proteína: 20-25% (100-125g)\n• Carbohidratos: 5-10% (20-50g)\n\n✅ **Alimentos permitidos:**\n• Carnes, pescados, huevos\n• Aguacate, aceite de oliva, coco\n• Quesos, mantequilla\n• Vegetales bajos en carbos (brócoli, espinaca)\n• Frutos secos (moderación)\n\n🚫 **Alimentos prohibidos:**\n• Pan, pasta, arroz, cereales\n• Azúcar, dulces, refrescos\n• Frutas (excepto berries en moderación)\n• Legumbres\n• Tubérculos (papa, batata)\n\n⚡ **Proceso de cetosis:**\n• Días 1-3: Adaptación, "keto flu"\n• Días 4-7: Entrando en cetosis\n• Semana 2+: Cetosis completa\n\n✅ **Beneficios:**\n• Pérdida de peso rápida inicial\n• Control apetito (saciedad)\n• Estabilidad energética\n• Claridad mental\n\n⚠️ **Desventajas:**\n• Difícil de mantener largo plazo\n• Reduce rendimiento deportivo intenso\n• Keto flu inicial (fatiga, dolor cabeza)\n• Restricción social\n\n💡 **Recomendación:** Útil para pérdida de peso a corto plazo, pero no superior a dieta balanceada con déficit calórico.`
  }

  if (
    message.includes("vegetarian") ||
    message.includes("vegetariana") ||
    message.includes("vegana") ||
    message.includes("vegan")
  ) {
    return `🌱 **Dieta Vegetariana/Vegana Fitness:**\n\n🥗 **Fuentes de proteína vegetal:**\n\n**Alto contenido (por 100g):**\n• Seitán: 25g\n• Tempeh: 19g\n• Tofu firme: 17g\n• Lentejas: 9g\n• Garbanzos: 9g\n• Quinoa: 4g\n• Edamame: 11g\n\n**Proteína en polvo:**\n• Proteína de guisante\n• Proteína de arroz\n• Proteína de soja\n• Mezclas veganas\n\n💊 **Suplementos importantes:**\n• Vitamina B12 (esencial)\n• Vitamina D3 (si poca exposición solar)\n• Omega-3 (algas DHA/EPA)\n• Hierro (si deficiente)\n• Zinc (considerar)\n• Creatina (veganos tienen niveles más bajos)\n\n🍽️ **Ejemplo de día completo:**\n\n**Desayuno:**\n• Avena + proteína vegana + banana + mantequilla de maní\n\n**Almuerzo:**\n• Bowl de quinoa + garbanzos + aguacate + vegetales\n\n**Merienda:**\n• Hummus + vegetales + nueces\n\n**Cena:**\n• Tofu salteado + arroz integral + brócoli\n\n**Post-entreno:**\n• Batido de proteína vegana + frutas\n\n✅ **Combinaciones proteicas:**\n• Arroz + frijoles\n• Pan integral + mantequilla de maní\n• Hummus + pan pita\n• Lentejas + arroz\n\n💡 **Tip:** Combina diferentes fuentes vegetales para obtener todos los aminoácidos esenciales.`
  }

  // PALABRAS CLAVE SOBRE VITAMINAS Y MINERALES
  if (
    message.includes("vitamina") ||
    message.includes("vitaminas") ||
    message.includes("mineral") ||
    message.includes("minerales") ||
    message.includes("micronutriente")
  ) {
    return `💊 **Vitaminas y Minerales Esenciales:**\n\n🔴 **Vitaminas importantes para fitness:**\n\n**Vitamina D:**\n• Función: Salud ósea, inmunidad, testosterona\n• Fuentes: Sol (15-20 min/día), pescado graso, huevos\n• Suplemento: 2000-4000 IU/día si deficiente\n\n**Vitamina C:**\n• Función: Antioxidante, recuperación, inmunidad\n• Fuentes: Cítricos, kiwi, pimientos, brócoli\n• Cantidad: 75-90mg/día (más si entrenas intenso)\n\n**Vitaminas B (B6, B12, Folato):**\n• Función: Metabolismo energético, producción glóbulos rojos\n• Fuentes: Carnes, huevos, lácteos, legumbres\n• B12: Suplementar si eres vegano\n\n**Vitamina E:**\n• Función: Antioxidante, protección celular\n• Fuentes: Frutos secos, semillas, aceite oliva\n\n⚪ **Minerales clave:**\n\n**Magnesio:**\n• Función: Contracción muscular, sueño, energía\n• Fuentes: Espinaca, almendras, aguacate, chocolate negro\n• Cantidad: 400-420mg/día (hombres), 310-320mg (mujeres)\n\n**Zinc:**\n• Función: Testosterona, inmunidad, recuperación\n• Fuentes: Carne roja, mariscos, semillas de calabaza\n• Cantidad: 11mg/día (hombres), 8mg (mujeres)\n\n**Hierro:**\n• Función: Transporte oxígeno, energía\n• Fuentes: Carne roja, espinaca, lentejas\n• Cantidad: 8mg/día (hombres), 18mg (mujeres)\n\n**Calcio:**\n• Función: Salud ósea, contracción muscular\n• Fuentes: Lácteos, sardinas, brócoli, almendras\n• Cantidad: 1000-1200mg/día\n\n**Potasio:**\n• Función: Hidratación, prevención calambres\n• Fuentes: Banana, batata, aguacate, espinaca\n• Cantidad: 3500-4700mg/día\n\n💡 **Recomendación:** Prioriza alimentos enteros. Suplementa solo si hay deficiencia confirmada.`
  }

  // PALABRAS CLAVE SOBRE ALCOHOL
  if (
    message.includes("alcohol") ||
    message.includes("cerveza") ||
    message.includes("vino") ||
    message.includes("tomar")
  ) {
    return `🍺 **Alcohol y Fitness:**\n\n⚠️ **Efectos negativos del alcohol:**\n\n**En el rendimiento:**\n• Reduce síntesis de proteína muscular (-30%)\n• Deshidratación (diurético)\n• Disminuye recuperación muscular\n• Afecta calidad del sueño\n• Reduce testosterona temporalmente\n• Aumenta cortisol (hormona del estrés)\n\n**En la composición corporal:**\n• 7 calorías por gramo (casi como grasa)\n• Prioriza metabolismo del alcohol (detiene quema de grasa)\n• Aumenta apetito y malas decisiones alimentarias\n• Reduce inhibiciones (comes más)\n\n📊 **Contenido calórico:**\n• Cerveza (355ml): 150 cal\n• Vino tinto (150ml): 125 cal\n• Vodka/Ron (45ml): 97 cal\n• Margarita: 300+ cal\n• Piña colada: 500+ cal\n\n💡 **Si vas a beber (minimizar daño):**\n\n**Antes:**\n• Come proteína y grasas (ralentiza absorción)\n• Hidrátate bien\n• No bebas con estómago vacío\n\n**Durante:**\n• Alterna cada bebida con agua\n• Evita bebidas azucaradas/mixtas\n• Limita cantidad (2-3 bebidas máximo)\n• Elige opciones bajas en calorías\n\n**Después:**\n• Bebe mucha agua antes de dormir\n• Come algo con proteína\n• Toma electrolitos\n\n**Al día siguiente:**\n• Hidrátate abundantemente\n• Come comida nutritiva\n• Entrenamiento ligero o descanso\n\n⏰ **Timing:**\n• Evita alcohol 48h antes de competencia\n• Evita alcohol 24h después de entreno intenso\n• Si bebes, hazlo en días de descanso\n\n💡 **Recomendación:** Si tu objetivo es serio (competir, transformación), minimiza o elimina el alcohol. Si es social ocasional, aplica estrategias de daño reducido.`
  }

  // PALABRAS CLAVE SOBRE SUEÑO
  if (
    message.includes("sueño") ||
    message.includes("dormir") ||
    message.includes("descanso") ||
    message.includes("recuperación")
  ) {
    return `😴 **Sueño y Recuperación:**\n\n⏰ **Cantidad óptima:**\n• Adultos: 7-9 horas/noche\n• Atletas: 8-10 horas/noche\n• Adolescentes: 8-10 horas/noche\n\n💪 **Importancia para fitness:**\n\n**Recuperación muscular:**\n• 70% de hormona de crecimiento se libera durante sueño profundo\n• Síntesis de proteína muscular aumenta\n• Reparación de tejidos dañados\n\n**Rendimiento:**\n• Falta de sueño reduce fuerza (-10-30%)\n• Disminuye resistencia cardiovascular\n• Aumenta percepción de esfuerzo\n• Reduce tiempo de reacción\n\n**Composición corporal:**\n• Poco sueño aumenta cortisol (catabolismo)\n• Reduce testosterona y hormona de crecimiento\n• Aumenta grelina (hormona del hambre)\n• Reduce leptina (hormona de saciedad)\n• Resultado: Más hambre, menos músculo, más grasa\n\n✅ **Mejora tu sueño:**\n\n**Rutina nocturna:**\n• Acuéstate y levántate a la misma hora\n• Apaga pantallas 1-2h antes (luz azul)\n• Temperatura fresca (18-20°C)\n• Oscuridad total (cortinas blackout)\n• Ruido blanco si es necesario\n\n**Evita:**\n• Cafeína después de 2pm\n• Comidas pesadas 3h antes de dormir\n• Alcohol (afecta calidad del sueño)\n• Ejercicio intenso 3h antes de dormir\n\n**Ayuda:**\n• Magnesio: 400mg antes de dormir\n• Melatonina: 0.5-5mg (si necesario)\n• Té de manzanilla o valeriana\n• Lectura o meditación\n\n📊 **Fases del sueño:**\n• Fase 1-2: Sueño ligero (25%)\n• Fase 3-4: Sueño profundo (25%) → Recuperación física\n• REM: Sueño paradójico (25%) → Recuperación mental\n\n💡 **Tip:** Si no puedes dormir 8h, prioriza calidad sobre cantidad. 7h de sueño profundo > 9h de sueño interrumpido.`
  }

  // PALABRAS CLAVE SOBRE ESTRÉS
  if (
    message.includes("estrés") ||
    message.includes("estres") ||
    message.includes("ansiedad") ||
    message.includes("cortisol")
  ) {
    return `😰 **Manejo del Estrés:**\n\n⚠️ **Efectos del estrés crónico:**\n\n**Hormonales:**\n• Aumenta cortisol (hormona del estrés)\n• Reduce testosterona\n• Afecta hormona de crecimiento\n• Desregula insulina\n\n**En el cuerpo:**\n• Catabolismo muscular (pérdida de músculo)\n• Acumulación de grasa abdominal\n• Retención de líquidos\n• Sistema inmune debilitado\n• Inflamación crónica\n\n**En el rendimiento:**\n• Fatiga constante\n• Recuperación lenta\n• Menor motivación\n• Sobreentrenamiento\n• Lesiones frecuentes\n\n✅ **Estrategias para reducir estrés:**\n\n**Ejercicio:**\n• Cardio moderado: 30 min/día\n• Yoga o Pilates: 2-3x/semana\n• Caminatas en naturaleza\n• ⚠️ Evita sobreentrenamiento\n\n**Nutrición:**\n• Omega-3 (antiinflamatorio)\n• Magnesio (relajación muscular)\n• Vitamina C (reduce cortisol)\n• Té verde (L-teanina)\n• Evita exceso de cafeína\n\n**Técnicas de relajación:**\n• Meditación: 10-20 min/día\n• Respiración profunda (4-7-8)\n• Mindfulness\n• Journaling\n• Música relajante\n\n**Estilo de vida:**\n• Sueño adecuado (7-9h)\n• Tiempo en naturaleza\n• Conexión social\n• Hobbies y diversión\n• Límites en trabajo\n\n**Suplementos útiles:**\n• Ashwagandha: 300-600mg/día\n• Rhodiola rosea: 200-600mg/día\n• Magnesio: 400mg/día\n• L-teanina: 200mg/día\n\n💡 **Importante:** El estrés crónico puede sabotear completamente tus resultados. Prioriza el manejo del estrés tanto como la dieta y el entrenamiento.`
  }

  // PALABRAS CLAVE SOBRE PROGRESO Y MÉTRICAS
  if (
    message.includes("mi progreso") ||
    message.includes("mis ejercicios") ||
    message.includes("mis pesos") ||
    message.includes("mi historial") ||
    message.includes("cómo voy") ||
    message.includes("como voy")
  ) {
    if (!exerciseData || exerciseData.trim() === "") {
      return "Aún no tienes ejercicios registrados en tu historial. Empieza a registrar tus entrenamientos en la sección de Gimnasio para que pueda darte información sobre tu progreso."
    }
    return `📊 **Tu Progreso de Entrenamiento:**\n\n${exerciseData}\n\n💪 **Análisis:**\nEstás registrando tus entrenamientos, ¡excelente! Para ver tu progreso completo:\n\n1. Ve a la sección de **Historial** para ver gráficos de evolución\n2. Compara tus pesos y repeticiones a lo largo del tiempo\n3. Identifica ejercicios donde has mejorado más\n\n✅ **Consejos para progresar:**\n• Aumenta peso cuando puedas hacer 12+ reps con buena forma\n• Incrementa 2.5-5kg en ejercicios compuestos\n• Incrementa 1-2.5kg en ejercicios de aislamiento\n• Registra cada entrenamiento para ver tendencias\n• Descansa 48-72h entre grupos musculares\n\n💡 **Tip:** La progresión constante (aunque sea pequeña) es la clave para ganar músculo y fuerza.`
  }

  // RESPUESTA POR DEFECTO CON SUGERENCIAS
  return `🤔 No entendí tu pregunta específica, pero puedo ayudarte con:\n\n📊 **Información personalizada:**\n• "Mi perfil" - Ver tus datos y necesidades\n• "Mis ejercicios" - Ver tu progreso en el gym\n• "Cuántas calorías necesito"\n• "Cuánta proteína necesito"\n\n💪 **Objetivos:**\n• "Ganar músculo" / "Aumentar masa"\n• "Perder peso" / "Quemar grasa"\n• "Mantener peso"\n\n🍽️ **Nutrición:**\n• "Pre entreno" / "Post entreno"\n• "Meal prep" / "Recetas"\n• "Suplementos"\n• "Carbohidratos" / "Proteínas" / "Grasas"\n\n🥗 **Dietas específicas:**\n• "Keto" / "Ayuno intermitente"\n• "Vegetariana" / "Vegana"\n\n💊 **Salud:**\n• "Vitaminas" / "Minerales"\n• "Hidratación" / "Agua"\n• "Sueño" / "Descanso"\n• "Estrés"\n\n🍺 **Lifestyle:**\n• "Alcohol"\n\n💡 **Tip:** Sé específico en tu pregunta para obtener mejor respuesta. Por ejemplo: "¿Cuánta proteína necesito para ganar músculo?"`
}
