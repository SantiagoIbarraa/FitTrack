"use server"

import { createClient } from "@/lib/supabase/server"

export async function sendMessage(receiverId: string, content: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "No autenticado" }
  }

  // Create or update conversation
  const { error: convError } = await supabase.from("conversations").upsert(
    {
      user1_id: user.id < receiverId ? user.id : receiverId,
      user2_id: user.id < receiverId ? receiverId : user.id,
      last_message_at: new Date().toISOString(),
    },
    {
      onConflict: "user1_id,user2_id",
    },
  )

  if (convError) {
    console.error("Error creating conversation:", convError)
  }

  // Send message
  const { error } = await supabase.from("messages").insert({
    sender_id: user.id,
    receiver_id: receiverId,
    content,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function getMessages(otherUserId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "No autenticado" }
  }

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .or(
      `and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`,
    )
    .order("created_at", { ascending: true })

  if (error) {
    return { error: error.message }
  }

  return { messages: data }
}

export async function getConversations() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "No autenticado" }
  }

  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
    .order("last_message_at", { ascending: false })

  if (error) {
    return { error: error.message }
  }

  return { conversations: data }
}

export async function markMessageAsRead(messageId: string) {
  const supabase = await createClient()

  const { error } = await supabase.from("messages").update({ read: true }).eq("id", messageId)

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function getAllActiveUsers() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "No autenticado" }
  }

  const { data: activeUsers, error } = await supabase.rpc("get_users_for_messaging")

  if (error) {
    console.error("Error fetching active users:", error)
    return { error: error.message }
  }

  if (!activeUsers || activeUsers.length === 0) {
    return { users: [] }
  }

  const users = activeUsers.map((u: any) => ({
    id: u.id,
    email: u.email || `usuario-${u.id.substring(0, 8)}`,
    full_name: u.full_name || "Usuario",
    profile_photo_url: u.profile_photo_url || null,
    is_professional: u.is_professional || false,
    role: u.role || "user",
  }))

  return { users }
}

export async function getAvailableContacts() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "No autenticado" }
  }

  const result = await getAllActiveUsers()

  if (result.error) {
    return { error: result.error }
  }

  // Return all active users (already filtered to exclude current user)
  return { professionals: result.users || [] }
}

export async function getActiveProfessionals() {
  const supabase = await createClient()

  const { data: professionalRoles, error } = await supabase
    .from("user_roles")
    .select("user_id")
    .eq("is_professional", true)
    .eq("is_active", true)

  if (error) {
    console.error("Error fetching professionals:", error)
    return { error: error.message }
  }

  if (!professionalRoles || professionalRoles.length === 0) {
    return { professionals: [] }
  }

  // Try to get user details from the function first
  const { data: allUsers, error: rpcError } = await supabase.rpc("get_all_users_with_roles")

  if (allUsers) {
    // Filter to only professionals
    const professionals = allUsers
      .filter((user: any) => user.is_professional && user.is_active)
      .map((user: any) => ({
        id: user.id,
        email: `${user.first_name} ${user.last_name}`.trim() || `Profesional ${user.id.substring(0, 8)}...`,
        full_name: `${user.first_name} ${user.last_name}`.trim() || "Profesional",
      }))

    return { professionals }
  }

  // Fallback: return limited info
  const professionals = professionalRoles.map((role) => ({
    id: role.user_id,
    email: `Profesional ${role.user_id.substring(0, 8)}...`,
    full_name: "Profesional",
  }))

  return { professionals }
}

export async function getUnreadMessageCount() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { count: 0 }
  }

  const { count, error } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("receiver_id", user.id)
    .eq("read", false)

  if (error) {
    console.error("Error fetching unread count:", error)
    return { count: 0 }
  }

  return { count: count || 0 }
}

export async function getUnreadMessagesByUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { unreadCounts: {} }
  }

  const { data, error } = await supabase
    .from("messages")
    .select("sender_id")
    .eq("receiver_id", user.id)
    .eq("read", false)

  if (error) {
    console.error("Error fetching unread messages by user:", error)
    return { unreadCounts: {} }
  }

  // Count unread messages per sender
  const unreadCounts: { [key: string]: number } = {}
  data?.forEach((msg) => {
    unreadCounts[msg.sender_id] = (unreadCounts[msg.sender_id] || 0) + 1
  })

  return { unreadCounts }
}

export async function markConversationAsRead(otherUserId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "No autenticado" }
  }

  const { error } = await supabase
    .from("messages")
    .update({ read: true })
    .eq("receiver_id", user.id)
    .eq("sender_id", otherUserId)
    .eq("read", false)

  if (error) {
    console.error("Error marking conversation as read:", error)
    return { error: error.message }
  }

  return { success: true }
}
