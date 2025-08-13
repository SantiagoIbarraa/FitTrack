"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateUserProfile(prevState: any, formData: FormData) {
  const firstName = formData.get("firstName")?.toString()
  const lastName = formData.get("lastName")?.toString()
  const weight = formData.get("weight")?.toString()
  const height = formData.get("height")?.toString()

  if (!firstName || !lastName || !weight || !height) {
    return { error: "Todos los campos son obligatorios" }
  }

  const weightNum = Number.parseFloat(weight)
  const heightNum = Number.parseFloat(height)

  if (weightNum < 30 || weightNum > 300) {
    return { error: "El peso debe estar entre 30 y 300 kg" }
  }

  if (heightNum < 100 || heightNum > 250) {
    return { error: "La estatura debe estar entre 100 y 250 cm" }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Usuario no autenticado" }
  }

  try {
    const { error } = await supabase.auth.updateUser({
      data: {
        first_name: firstName,
        last_name: lastName,
        full_name: `${firstName} ${lastName}`,
        weight: weightNum,
        height: heightNum,
      },
    })

    if (error) {
      console.error("Error updating user profile:", error)
      return { error: "Error al actualizar el perfil" }
    }

    revalidatePath("/")
    return { success: true, message: "Perfil actualizado correctamente" }
  } catch (error) {
    console.error("Error:", error)
    return { error: "Error al actualizar el perfil" }
  }
}

export async function getUserProfile() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const userMetadata = user.user_metadata
  return {
    id: user.id,
    email: user.email,
    firstName: userMetadata?.first_name || "",
    lastName: userMetadata?.last_name || "",
    fullName: userMetadata?.full_name || `${userMetadata?.first_name || ""} ${userMetadata?.last_name || ""}`.trim(),
    weight: userMetadata?.weight || null,
    height: userMetadata?.height || null,
  }
}
