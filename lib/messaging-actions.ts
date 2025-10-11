"use server"

import { createClient } from "@/lib/supabase/server"

export interface Conversation {
  id: string
  user_id: string
  professional_id: string
  created_at: string
  updated_at: string
  professional_name?: string
  user_name?: string
  last_message?: string
  unread_count?: number
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  is_read: boolean
  created_at: string
}

export async function getConversations(): Promise<Conversation[]> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return []

    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .or(`user_id.eq.${user.id},professional_id.eq.${user.id}`)
      .order("updated_at", { ascending: false })

    if (error) throw error

    const conversationsWithDetails = await Promise.all(
      (data || []).map(async (conv) => {
        const otherId = conv.user_id === user.id ? conv.professional_id : conv.user_id

        const { data: otherUser } = await supabase.auth.admin.getUserById(otherId)

        const { data: lastMessage } = await supabase
          .from("messages")
          .select("content, created_at")
          .eq("conversation_id", conv.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle()

        const { count: unreadCount } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("conversation_id", conv.id)
          .eq("is_read", false)
          .neq("sender_id", user.id)

        return {
          ...conv,
          other_user_name: otherUser?.user?.email || "Usuario",
          last_message: lastMessage?.content || "Sin mensajes",
          unread_count: unreadCount || 0,
        }
      })
    )

    return conversationsWithDetails
  } catch (error) {
    console.error("Error getting conversations:", error)
    return []
  }
}

export async function getOrCreateConversation(professionalId: string): Promise<string | null> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return null

    const { data: existing, error: existingError } = await supabase
      .from("conversations")
      .select("id")
      .eq("user_id", user.id)
      .eq("professional_id", professionalId)
      .maybeSingle()

    if (existingError) throw existingError

    if (existing) {
      return existing.id
    }

    const { data: newConv, error: newError } = await supabase
      .from("conversations")
      .insert({
        user_id: user.id,
        professional_id: professionalId,
      })
      .select("id")
      .single()

    if (newError) throw newError

    return newConv.id
  } catch (error) {
    console.error("Error creating conversation:", error)
    return null
  }
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })

    if (error) throw error

    return data || []
  } catch (error) {
    console.error("Error getting messages:", error)
    return []
  }
}

export async function sendMessage(
  conversationId: string,
  content: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "No autenticado" }
    }

    const { error: messageError } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content,
    })

    if (messageError) throw messageError

    const { error: updateError } = await supabase
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", conversationId)

    if (updateError) throw updateError

    return { success: true }
  } catch (error) {
    console.error("Error sending message:", error)
    return { success: false, error: "Error al enviar mensaje" }
  }
}

export async function markMessagesAsRead(conversationId: string): Promise<void> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("conversation_id", conversationId)
      .neq("sender_id", user.id)
      .eq("is_read", false)
  } catch (error) {
    console.error("Error marking messages as read:", error)
  }
}
