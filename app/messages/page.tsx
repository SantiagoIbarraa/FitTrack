"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, MessageCircle, Send, User } from "lucide-react"
import {
  getConversations,
  getMessages,
  sendMessage,
  markMessagesAsRead,
  getOrCreateConversation,
  type Conversation,
  type Message,
} from "@/lib/messaging-actions"
import { getApprovedProfessionals } from "@/lib/role-actions"
import { toast } from "sonner"
<<<<<<< HEAD
import FoodImageAnalyzer from "@/components/image-analyzer" // Asegúrate que la ruta sea correcta
=======
>>>>>>> 5e0a6947f356c7850320b506c7beffbc7fb36cd2

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [professionals, setProfessionals] = useState<any[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation)
    }
  }, [selectedConversation])

  const loadData = async () => {
    try {
      const [convs, profs] = await Promise.all([getConversations(), getApprovedProfessionals()])

      setConversations(convs)
      setProfessionals(profs)
    } catch (error) {
      console.error("Error loading data:", error)
      toast.error("Error al cargar datos")
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async (conversationId: string) => {
    try {
      const msgs = await getMessages(conversationId)
      setMessages(msgs)
      await markMessagesAsRead(conversationId)
    } catch (error) {
      console.error("Error loading messages:", error)
      toast.error("Error al cargar mensajes")
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    try {
      setSending(true)
      const result = await sendMessage(selectedConversation, newMessage)

      if (result.success) {
        setNewMessage("")
        await loadMessages(selectedConversation)
        await loadData()
      } else {
        toast.error(result.error || "Error al enviar mensaje")
      }
    } catch (error) {
      toast.error("Error al enviar mensaje")
    } finally {
      setSending(false)
    }
  }

  const handleStartConversation = async (professionalId: string) => {
    try {
      const conversationId = await getOrCreateConversation(professionalId)
      if (conversationId) {
        await loadData()
        setSelectedConversation(conversationId)
      } else {
        toast.error("Error al iniciar conversación")
      }
    } catch (error) {
      toast.error("Error al iniciar conversación")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-300">Cargando mensajes...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Link>
            </Button>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <MessageCircle className="h-10 w-10 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mensajes</h1>
              <p className="text-gray-600 dark:text-gray-300">Chatea con profesionales de salud y fitness</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="md:col-span-1 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600">
            <CardHeader>
              <CardTitle className="text-gray-800 dark:text-gray-100">Conversaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="conversations">
                <TabsList className="w-full grid grid-cols-2 mb-4">
                  <TabsTrigger value="conversations">Chats</TabsTrigger>
                  <TabsTrigger value="professionals">Nuevos</TabsTrigger>
                </TabsList>

                <TabsContent value="conversations">
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-2">
                      {conversations.length === 0 ? (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                          No tienes conversaciones activas
                        </p>
                      ) : (
                        conversations.map((conv) => (
                          <div
                            key={conv.id}
                            onClick={() => setSelectedConversation(conv.id)}
                            className={`p-3 rounded-lg cursor-pointer transition-colors ${
                              selectedConversation === conv.id
                                ? "bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700"
                                : "bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-medium text-gray-900 dark:text-white truncate">
                                {conv.other_user_name}
                              </p>
                              {conv.unread_count && conv.unread_count > 0 ? (
                                <Badge variant="default" className="bg-blue-600">
                                  {conv.unread_count}
                                </Badge>
                              ) : null}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 truncate">{conv.last_message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="professionals">
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-2">
                      {professionals.length === 0 ? (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                          No hay profesionales disponibles
                        </p>
                      ) : (
                        professionals.map((prof) => (
                          <div
                            key={prof.id}
                            className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8 bg-blue-600 text-white">
                                  <User className="h-4 w-4" />
                                </Avatar>
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-white">{prof.name}</p>
                                  <p className="text-xs text-gray-600 dark:text-gray-300">{prof.email}</p>
                                </div>
                              </div>
                              <Button size="sm" onClick={() => handleStartConversation(prof.id)}>
                                Chatear
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600">
            <CardHeader>
              <CardTitle className="text-gray-800 dark:text-gray-100">Chat</CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedConversation ? (
                <div className="flex flex-col items-center justify-center h-[500px] text-gray-500 dark:text-gray-400">
                  <MessageCircle className="h-16 w-16 mb-4 opacity-50" />
                  <p>Selecciona una conversación o inicia una nueva</p>
                </div>
              ) : (
                <div className="flex flex-col h-[500px]">
                  <ScrollArea className="flex-1 mb-4 pr-4">
                    <div className="space-y-4">
                      {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.sender_id ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`max-w-[70%] rounded-lg px-4 py-2 ${
                              msg.sender_id
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {new Date(msg.created_at).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          handleSendMessage()
                        }
                      }}
                      placeholder="Escribe tu mensaje..."
                      className="flex-1 bg-white dark:bg-gray-700"
                      disabled={sending}
                    />
                    <Button onClick={handleSendMessage} disabled={sending || !newMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
<<<<<<< HEAD

export async function POST(request: Request) {
  try {
    const { image, userProfile } = await request.json()

    if (!image) {
      return NextResponse.json({ error: "No se proporcionó una imagen" }, { status: 400 })
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY no está configurada")
      return NextResponse.json(
        {
          error: "Error de configuración del servidor. Contacta al administrador.",
        },
        { status: 500 }
      )
    }

    // ... resto del código
  } catch (error) {
    console.error("Error en el análisis:", error)
    return NextResponse.json(
      {
        error: "Error al procesar la imagen. Por favor intenta de nuevo.",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    )
  }
}
=======
>>>>>>> 5e0a6947f356c7850320b506c7beffbc7fb36cd2
