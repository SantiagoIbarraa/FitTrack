"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  getAvailableContacts,
  getMessages,
  sendMessage,
  getUnreadMessagesByUser,
  markConversationAsRead,
} from "@/lib/messaging-actions"
import { useToast } from "@/hooks/use-toast"
import { Send, MessageSquare, Search } from "lucide-react"

interface Professional {
  id: string
  email: string
  full_name: string
  is_professional?: boolean
  profile_photo_url?: string
}

interface Message {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  read: boolean
  created_at: string
}

interface MessagingInterfaceProps {
  userId: string
}

function groupMessagesByDate(messages: Message[]) {
  const groups: { [key: string]: Message[] } = {}

  messages.forEach((message) => {
    const date = new Date(message.created_at)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    let dateKey: string

    if (date.toDateString() === today.toDateString()) {
      dateKey = "Hoy"
    } else if (date.toDateString() === yesterday.toDateString()) {
      dateKey = "Ayer"
    } else {
      dateKey = date.toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    }

    if (!groups[dateKey]) {
      groups[dateKey] = []
    }
    groups[dateKey].push(message)
  })

  return groups
}

export function MessagingInterface({ userId }: MessagingInterfaceProps) {
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [userFilter, setUserFilter] = useState<"all" | "professionals" | "non-professionals">("all")
  const [unreadCounts, setUnreadCounts] = useState<{ [key: string]: number }>({})
  const { toast } = useToast()

  useEffect(() => {
    loadProfessionals()
    loadUnreadCounts()
  }, [])

  useEffect(() => {
    if (selectedProfessional) {
      loadMessages(selectedProfessional.id)
      const interval = setInterval(() => loadMessages(selectedProfessional.id), 5000)
      return () => clearInterval(interval)
    }
  }, [selectedProfessional])

  useEffect(() => {
    const interval = setInterval(() => {
      loadUnreadCounts()
    }, 10000) // Refresh every 10 seconds
    return () => clearInterval(interval)
  }, [])

  const loadProfessionals = async () => {
    console.log("[v0] Loading professionals...")
    const result = await getAvailableContacts()
    console.log("[v0] getAvailableContacts result:", result)

    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      })
    } else {
      console.log("[v0] Setting professionals:", result.professionals)
      setProfessionals(result.professionals || [])
    }
  }

  const loadUnreadCounts = async () => {
    const result = await getUnreadMessagesByUser()
    if (!result.error) {
      setUnreadCounts(result.unreadCounts)
    }
  }

  const loadMessages = async (professionalId: string) => {
    const result = await getMessages(professionalId)
    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      })
    } else {
      setMessages(result.messages || [])
      await markConversationAsRead(professionalId)
      // Refresh unread counts after marking as read
      loadUnreadCounts()
    }
  }

  const handleSendMessage = async () => {
    if (!selectedProfessional || !newMessage.trim()) return

    setLoading(true)
    const result = await sendMessage(selectedProfessional.id, newMessage)

    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      })
    } else {
      setNewMessage("")
      loadMessages(selectedProfessional.id)
    }
    setLoading(false)
  }

  const filteredProfessionals = professionals
    .filter((prof) => {
      const matchesSearch =
        prof.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prof.email.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesFilter =
        userFilter === "all" ||
        (userFilter === "professionals" && prof.is_professional) ||
        (userFilter === "non-professionals" && !prof.is_professional)

      return matchesSearch && matchesFilter
    })
    .sort((a, b) => {
      // Sort by unread count (descending), then alphabetically
      const unreadA = unreadCounts[a.id] || 0
      const unreadB = unreadCounts[b.id] || 0
      if (unreadB !== unreadA) {
        return unreadB - unreadA
      }
      return a.full_name.localeCompare(b.full_name)
    })

  const groupedMessages = groupMessagesByDate(messages)

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {/* Professionals List */}
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Usuarios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button
                variant={userFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setUserFilter("all")}
                className="flex-1"
              >
                Todos
              </Button>
              <Button
                variant={userFilter === "professionals" ? "default" : "outline"}
                size="sm"
                onClick={() => setUserFilter("professionals")}
                className="flex-1"
              >
                Profesionales
              </Button>
              <Button
                variant={userFilter === "non-professionals" ? "default" : "outline"}
                size="sm"
                onClick={() => setUserFilter("non-professionals")}
                className="flex-1"
              >
                Usuarios
              </Button>
            </div>
          </div>

          <ScrollArea className="h-[450px]">
            <div className="space-y-2">
              {filteredProfessionals.length === 0 ? (
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center py-8">
                  {searchTerm || userFilter !== "all" ? "No se encontraron usuarios" : "No hay usuarios disponibles"}
                </p>
              ) : (
                filteredProfessionals.map((prof) => {
                  const unreadCount = unreadCounts[prof.id] || 0
                  return (
                    <button
                      key={prof.id}
                      onClick={() => setSelectedProfessional(prof)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors relative ${
                        selectedProfessional?.id === prof.id
                          ? "bg-blue-100 dark:bg-blue-900/30"
                          : "hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      {unreadCount > 0 && (
                        <div className="absolute top-2 left-2 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                      )}
                      <Avatar>
                        {prof.profile_photo_url && (
                          <AvatarImage src={prof.profile_photo_url || "/placeholder.svg"} alt={prof.full_name} />
                        )}
                        <AvatarFallback>{prof.full_name.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="text-left flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {unreadCount > 0 && <div className="w-2 h-2 bg-green-500 rounded-full" />}
                          <p className="font-medium text-gray-900 dark:text-white truncate">{prof.full_name}</p>
                          {prof.is_professional && (
                            <span className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                              Pro
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{prof.email}</p>
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Chat Area */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>
            {selectedProfessional ? `Chat con ${selectedProfessional.full_name}` : "Selecciona un usuario"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedProfessional ? (
            <div className="space-y-4">
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {Object.entries(groupedMessages).map(([dateLabel, dateMessages]) => (
                    <div key={dateLabel}>
                      <div className="flex items-center justify-center my-4">
                        <div className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full">
                          <p className="text-xs font-medium text-gray-600 dark:text-gray-300">{dateLabel}</p>
                        </div>
                      </div>
                      {dateMessages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex mb-3 ${msg.sender_id === userId ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              msg.sender_id === userId
                                ? "bg-blue-600 text-white"
                                : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
                            }`}
                          >
                            <p className="text-sm">{msg.content}</p>
                            <p className="text-xs mt-1 opacity-70">
                              {new Date(msg.created_at).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="flex gap-2">
                <Input
                  placeholder="Escribe un mensaje..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  disabled={loading}
                />
                <Button onClick={handleSendMessage} disabled={loading || !newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="h-[500px] flex items-center justify-center text-gray-600 dark:text-gray-400">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Selecciona un usuario para comenzar a chatear</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
