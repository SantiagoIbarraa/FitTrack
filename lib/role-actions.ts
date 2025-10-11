"use server"

import { createClient } from "@/lib/supabase/server"

export type UserRole = "admin" | "professional" | "user"

export interface UserRoleData {
  id: string
  user_id: string
  role: UserRole
  is_approved: boolean
  created_at: string
  updated_at: string
  email?: string
  name?: string
}

export async function getUserRole(userId?: string): Promise<UserRoleData | null> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return null

    const targetUserId = userId || user.id

    const { data, error } = await supabase
      .from("user_roles")
      .select("*")
      .eq("user_id", targetUserId)
      .maybeSingle()

    if (error) throw error

    return data
  } catch (error) {
    console.error("Error getting user role:", error)
    return null
  }
}

export async function isAdmin(): Promise<boolean> {
  const role = await getUserRole()
  return role?.role === "admin"
}

export async function isProfessional(): Promise<boolean> {
  const role = await getUserRole()
  return role?.role === "professional" && role?.is_approved === true
}

export async function getAllUsers(): Promise<any[]> {
  try {
    const supabase = await createClient()
    const admin = await isAdmin()

    if (!admin) {
      throw new Error("No tienes permisos de administrador")
    }

    const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers()

    if (usersError) throw usersError

    const { data: rolesData, error: rolesError } = await supabase.from("user_roles").select("*")

    if (rolesError) throw rolesError

    const usersWithRoles = usersData.users.map((user) => {
      const role = rolesData.find((r) => r.user_id === user.id)
      return {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        role: role?.role || "user",
        is_approved: role?.is_approved || false,
      }
    })

    return usersWithRoles
  } catch (error) {
    console.error("Error getting all users:", error)
    throw error
  }
}

export async function updateUserRole(
  userId: string,
  role: UserRole,
  isApproved: boolean = false
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const admin = await isAdmin()

    if (!admin) {
      return { success: false, error: "No tienes permisos de administrador" }
    }

    const { error } = await supabase
      .from("user_roles")
      .update({
        role,
        is_approved: role === "professional" ? isApproved : true,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error("Error updating user role:", error)
    return { success: false, error: "Error al actualizar rol" }
  }
}

export async function getApprovedProfessionals(): Promise<any[]> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "professional")
      .eq("is_approved", true)

    if (error) throw error

    const professionalIds = data.map((p) => p.user_id)

    if (professionalIds.length === 0) return []

    const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers()

    if (usersError) throw usersError

    const professionals = usersData.users
      .filter((user) => professionalIds.includes(user.id))
      .map((user) => ({
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || user.email,
      }))

    return professionals
  } catch (error) {
    console.error("Error getting approved professionals:", error)
    return []
  }
}
