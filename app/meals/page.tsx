import ChatInterface from "@/components/meals/chat-interface"
import { MessageCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function MealsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Link>
            </Button>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <MessageCircle className="h-10 w-10 text-orange-600" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Asistente Nutricional</h1>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Obtén consejos personalizados sobre alimentación, recetas saludables y planificación de comidas
            </p>
          </div>
        </div>

        <ChatInterface />
      </div>
    </div>
  )
}
