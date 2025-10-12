"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getActiveProfessionals, getMessages, sendMessage } from "@/lib/messaging-actions"
import { useToast } from "@/hooks/use-toast"
import { Send, MessageSquare } from "lucide-react"

interface Professional {
  id: string
  email: string
  full_name: string
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

export function MessagingInterface({ userId }: MessagingInterfaceProps) {
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadProfessionals()
  }, [])

  useEffect(() => {
    if (selectedProfessional) {
      loadMessages(selectedProfessional.id)
      const interval = setInterval(() => loadMessages(selectedProfessional.id), 5000)
      return () => clearInterval(interval)
    }
  }, [selectedProfessional])

  const loadProfessionals = async () => {
    const result = await getActiveProfessionals()
    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      })
    } else {
      setProfessionals(result.professionals || [])
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

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {/* Professionals List */}
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Profesionales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="space-y-2">
              {professionals.length === 0 ? (
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center py-8">
                  No hay profesionales disponibles
                </p>
              ) : (
                professionals.map((prof) => (
                  <button
                    key={prof.id}
                    onClick={() => setSelectedProfessional(prof)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      selectedProfessional?.id === prof.id
                        ? "bg-blue-100 dark:bg-blue-900/30"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <Avatar>
                      <AvatarFallback>{prof.full_name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="text-left flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">{prof.full_name}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{prof.email}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Chat Area */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>
            {selectedProfessional ? `Chat con ${selectedProfessional.full_name}` : "Selecciona un profesional"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedProfessional ? (
            <div className="space-y-4">
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender_id === userId ? "justify-end" : "justify-start"}`}>
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
                <p>Selecciona un profesional para comenzar a chatear</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
