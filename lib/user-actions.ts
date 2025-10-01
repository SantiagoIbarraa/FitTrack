"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateUserProfile(prevState: any, formData: FormData) {
  const firstName = formData.get("firstName")?.toString()
  const lastName = formData.get("lastName")?.toString()
  const weight = formData.get("weight")?.toString()
  const height = formData.get("height")?.toString()
  const dateOfBirth = formData.get("dateOfBirth")?.toString()
  const sex = formData.get("sex")?.toString()
  const profilePhotoUrl = formData.get("profilePhotoUrl")?.toString()

  if (!firstName || !lastName || !weight || !height) {
    return { error: "Los campos nombre, apellido, peso y estatura son obligatorios" }
  }

  const weightNum = Number.parseFloat(weight)
  const heightNum = Number.parseFloat(height)

  if (weightNum < 30 || weightNum > 300) {
    return { error: "El peso debe estar entre 30 y 300 kg" }
  }

  if (heightNum < 100 || heightNum > 250) {
    return { error: "La estatura debe estar entre 100 y 250 cm" }
  }

  if (sex && !["masculino", "femenino", "otro"].includes(sex)) {
    return { error: "Sexo inválido" }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Usuario no autenticado" }
  }

  try {
    const updateData: any = {
      first_name: firstName,
      last_name: lastName,
      full_name: `${firstName} ${lastName}`,
      weight: weightNum,
      height: heightNum,
    }

    if (dateOfBirth) {
      updateData.date_of_birth = dateOfBirth
    }

    if (sex) {
      updateData.sex = sex
    }

    if (profilePhotoUrl) {
      updateData.profile_photo_url = profilePhotoUrl
    }

    const { error } = await supabase.auth.updateUser({
      data: updateData,
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
    dateOfBirth: userMetadata?.date_of_birth || null,
    sex: userMetadata?.sex || null,
    profilePhotoUrl: userMetadata?.profile_photo_url || null,
  }
}

export async function uploadProfilePhoto(formData: FormData) {
  const file = formData.get("file") as File

  if (!file) {
    return { error: "No se seleccionó ningún archivo" }
  }

  // Validate file type
  if (!file.type.startsWith("image/")) {
    return { error: "El archivo debe ser una imagen" }
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    return { error: "La imagen no debe superar 5MB" }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Usuario no autenticado" }
  }

  try {
    // Create unique filename
    const fileExt = file.name.split(".").pop()
    const fileName = `${user.id}-${Date.now()}.${fileExt}`
    const filePath = `profile-photos/${fileName}`

    // Upload to Supabase Storage
    const { data, error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
    })

    if (uploadError) {
      console.error("Error uploading photo:", uploadError)
      return { error: "Error al subir la foto" }
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(filePath)

    // Update user metadata with photo URL
    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        profile_photo_url: publicUrl,
      },
    })

    if (updateError) {
      console.error("Error updating user metadata:", updateError)
      return { error: "Error al actualizar el perfil" }
    }

    revalidatePath("/")
    return { success: true, photoUrl: publicUrl }
  } catch (error) {
    console.error("Error:", error)
    return { error: "Error al procesar la foto" }
  }
}
