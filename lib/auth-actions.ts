"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function signIn(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Datos del formulario faltantes" }
  }

  const email = formData.get("email")
  const password = formData.get("password")

  if (!email || !password) {
    return { error: "El correo y la contraseña son obligatorios" }
  }

  const supabase = createClient()

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.toString(),
      password: password.toString(),
    })

    if (error) {
      return { error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Error de inicio de sesión:", error)
    return { error: "Ocurrió un error inesperado. Inténtalo de nuevo." }
  }
}

export async function signUp(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Datos del formulario faltantes" }
  }

  const email = formData.get("email")
  const password = formData.get("password")
  const firstName = formData.get("firstName")
  const lastName = formData.get("lastName")
  const weight = formData.get("weight")
  const height = formData.get("height")

  // Validate required fields
  if (!email || !password || !firstName || !lastName || !weight || !height) {
    return { error: "Todos los campos son obligatorios" }
  }

  // Validate weight and height ranges
  const weightNum = Number.parseFloat(weight.toString())
  const heightNum = Number.parseFloat(height.toString())

  if (weightNum < 30 || weightNum > 300) {
    return { error: "El peso debe estar entre 30 y 300 kg" }
  }

  if (heightNum < 100 || heightNum > 250) {
    return { error: "La estatura debe estar entre 100 y 250 cm" }
  }

  if (password.toString().length < 6) {
    return { error: "La contraseña debe tener al menos 6 caracteres" }
  }

  const supabase = createClient()

  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.toString(),
      password: password.toString(),
      options: {
        data: {
          first_name: firstName.toString(),
          last_name: lastName.toString(),
        },
      },
    })

    if (authError) {
      return { error: authError.message }
    }

    if (authData.user) {
      const { error: profileError } = await supabase.from("user_profiles").insert({
        id: authData.user.id,
        first_name: firstName.toString(),
        last_name: lastName.toString(),
        email: email.toString(),
        weight: weightNum,
        height: heightNum,
      })

      if (profileError) {
        console.error("Error creating profile:", profileError)
        if (profileError.message?.includes("table") && profileError.message?.includes("user_profiles")) {
          return {
            error:
              "⚠️ Base de datos no configurada. Necesitas ejecutar el script SQL primero para crear las tablas necesarias.",
            needsSetup: true,
          }
        }
        return { error: "Error al crear el perfil de usuario" }
      }
    }

    return { success: true }
  } catch (error) {
    console.error("Error de registro:", error)
    return { error: "Ocurrió un error inesperado. Inténtalo de nuevo." }
  }
}

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect("/auth/login")
}
