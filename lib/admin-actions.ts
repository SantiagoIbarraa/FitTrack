"use server"

import { createClient } from "@/lib/supabase/server"

export async function isAdmin() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError) {
      console.error("[v0] Error getting user:", userError)
      return false
    }

    if (!user) {
      return false
    }

    const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", user.id).maybeSingle()

    if (error) {
      console.error("[v0] Error checking admin role:", error)
      return false
    }

    if (!data) {
      return false
    }

    return data.role === "admin"
  } catch (error) {
    console.error("[v0] Exception in isAdmin:", error)
    return false
  }
}

export async function getAllUsers() {
  const supabase = await createClient()

  if (!(await isAdmin())) {
    return { error: "No autorizado" }
  }

  // Try to call the database function first
  const { data: users, error: rpcError } = await supabase.rpc("get_all_users_with_roles")

  // If the function exists and works, return the results
  if (!rpcError && users) {
    return { users: users || [] }
  }

  console.log("[v0] Function get_all_users_with_roles not found, using fallback approach")

  const { data: userRoles, error: rolesError } = await supabase
    .from("user_roles")
    .select("*")
    .order("created_at", { ascending: false })

  if (rolesError) {
    console.error("[v0] Error fetching user roles:", rolesError)
    return { error: rolesError.message }
  }

  const usersWithLimitedInfo = (userRoles || []).map((userRole) => ({
    id: userRole.user_id,
    email: `Usuario ${userRole.user_id.substring(0, 8)}...`,
    full_name: "Ejecuta el script SQL para ver detalles",
    role: userRole.role,
    is_active: userRole.is_active,
    is_professional: userRole.is_professional || false,
    created_at: userRole.created_at,
  }))

  return {
    users: usersWithLimitedInfo,
    warning:
      "⚠️ Modo limitado: Solo se muestran usuarios con roles asignados. Ejecuta el script 'scripts/19-add-is-professional-field.sql' en tu base de datos para ver todos los usuarios registrados con sus detalles completos.",
  }
}

export async function updateUserRole(userId: string, role: string, isActive: boolean, isProfessional: boolean) {
  const supabase = await createClient()

  if (!(await isAdmin())) {
    return { error: "No autorizado" }
  }

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  const { error } = await supabase.from("user_roles").upsert(
    {
      user_id: userId,
      role,
      is_active: isActive,
      is_professional: isProfessional,
      approved_by: currentUser?.id,
      approved_at: new Date().toISOString(),
    },
    {
      onConflict: "user_id",
    },
  )

  if (error) {
    console.error("[v0] Error updating user role:", error)
    return { error: error.message }
  }

  return { success: true }
}

export async function getCurrentUserRole() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { role: "user", is_active: true, is_professional: false }
  }

  const { data, error } = await supabase
    .from("user_roles")
    .select("role, is_active, is_professional")
    .eq("user_id", user.id)
    .maybeSingle()

  if (error || !data) {
    return { role: "user", is_active: true, is_professional: false }
  }

  return {
    role: data.role,
    is_active: data.is_active,
    is_professional: data.is_professional || false,
  }
}

// These are no longer needed with the simplified system
