import ChatInterface from "@/components/meals/chat-interface"
import { MessageCircle } from "lucide-react"

export default function MealsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <MessageCircle className="h-10 w-10 text-orange-600" />
            <h1 className="text-3xl font-bold text-gray-900">Asistente Nutricional</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Obtén consejos personalizados sobre alimentación, recetas saludables y planificación de comidas
          </p>
        </div>

        <ChatInterface />
      </div>
    </div>
  )
}
