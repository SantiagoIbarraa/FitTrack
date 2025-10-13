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

  const supabase = await createClient()

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toString(),
      password: password.toString(),
    })

    if (error) {
      return { error: error.message }
    }

    if (!data.session || !data.user) {
      return { error: "Error al establecer la sesión" }
    }
  } catch (error) {
    console.error("Error de inicio de sesión:", error)
    return { error: "Ocurrió un error inesperado. Inténtalo de nuevo." }
  }

  redirect("/")
}

export async function signUp(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Datos del formulario faltantes" }
  }

  const email = formData.get("email")
  const password = formData.get("password")
  const confirmPassword = formData.get("confirmPassword")
  const firstName = formData.get("firstName")
  const lastName = formData.get("lastName")
  const weight = formData.get("weight")
  const height = formData.get("height")
  const gender = formData.get("gender")

  // Validate required fields
  if (!email || !password || !confirmPassword || !firstName || !lastName || !weight || !height || !gender) {
    return { error: "Todos los campos son obligatorios" }
  }

  // Validating that the passwords match
  if (password.toString() !== confirmPassword.toString()) {
    return { error: "Las contraseñas no coinciden" }
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

  // Validating that the gender is valid
  const genderValue = gender.toString().toLowerCase()
  if (genderValue !== "masculino" && genderValue !== "femenino") {
    return { error: "Debes seleccionar un sexo válido" }
  }

  const supabase = await createClient()

  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.toString(),
      password: password.toString(),
      options: {
        data: {
          first_name: firstName.toString(),
          last_name: lastName.toString(),
          full_name: `${firstName.toString()} ${lastName.toString()}`,
          weight: weightNum,
          height: heightNum,
          gender: genderValue,
          email_confirmed: true, // Force email as confirmed
        },
      },
    })

    if (authError) {
      // Handle specific error codes
      if (authError.message.includes("User already registered") || authError.message.includes("user_already_exists")) {
        return { error: "Este correo electrónico ya está registrado. Por favor, inicia sesión o usa otro correo." }
      }

      if (authError.message.includes("Invalid email")) {
        return { error: "El correo electrónico no es válido" }
      }

      if (authError.message.includes("Password should be at least")) {
        return { error: "La contraseña debe tener al menos 6 caracteres" }
      }

      if (authError.message.includes("Email rate limit exceeded")) {
        return {
          error: "Has intentado registrarte demasiadas veces. Por favor, espera unos minutos e intenta de nuevo.",
        }
      }

      // Generic error message for other cases
      return { error: `Error al crear la cuenta: ${authError.message}` }
    }

    if (authData.user && !authData.session) {
      // If no session was created, it means email confirmation is required
      // But since we want to skip confirmation, we'll show a success message
      return { success: true, message: "Registro exitoso. Puedes iniciar sesión ahora." }
    }

    if (authData.user && authData.session) {
      // User is automatically signed in
      return { success: true }
    }

    return { success: true }
  } catch (error) {
    console.error("Error de registro:", error)
    return { error: "Ocurrió un error inesperado. Inténtalo de nuevo." }
  }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/auth/login")
}
