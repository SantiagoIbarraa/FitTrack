"use client"

import { useState } from "react"
import { Dumbbell, Accessibility } from "lucide-react"
import { ServicesCarousel } from "@/components/services-carousel"
import LoginForm from "@/components/auth/login-form"
import RegisterForm from "@/components/auth/register-form"

export default function WelcomePage() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("register")

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-blue-100 dark:from-gray-900 dark:via-blue-950 dark:to-gray-800 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/15 dark:bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-300/10 dark:bg-blue-400/5 rounded-full blur-3xl" />
      </div>

      <div className="lg:absolute lg:top-6 lg:left-6 lg:right-6 z-20 flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-2 rounded-lg shadow-lg">
            <Dumbbell className="h-6 w-6 text-white" strokeWidth={2} />
          </div>
          <h1 className="text-2xl font-bold text-blue-900 dark:text-white">FitTrack</h1>
        </div>

        <button
          onClick={() => (window.location.href = "/accessibility")}
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-2 rounded-lg border border-blue-200 dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors shadow-md"
          aria-label="Configuración de accesibilidad"
        >
          <Accessibility className="h-6 w-6 text-blue-600 dark:text-blue-300" />
        </button>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 pt-24 lg:pt-0">
        <div className="w-full max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Center Column - Services Carousel (now takes more space) */}
            <div className="min-h-[480px] md:min-h-[500px] flex items-center justify-center">
              <div className="w-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-3xl border-2 border-blue-200 dark:border-blue-400 p-6 sm:p-8 lg:p-10 shadow-2xl">
                <ServicesCarousel />
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-3xl border-2 border-blue-200 dark:border-blue-400 shadow-2xl overflow-hidden">
                {/* Tab Headers */}
                <div className="flex border-b border-blue-200 dark:border-blue-400">
                  <button
                    onClick={() => setActiveTab("register")}
                    className={`flex-1 py-4 px-6 text-center font-semibold transition-all duration-200 ${
                      activeTab === "register"
                        ? "bg-blue-600 text-white"
                        : "bg-white dark:bg-gray-800 text-gray-600 dark:text-white hover:bg-blue-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    Registrarse
                  </button>
                  <button
                    onClick={() => setActiveTab("login")}
                    className={`flex-1 py-4 px-6 text-center font-semibold transition-all duration-200 ${
                      activeTab === "login"
                        ? "bg-blue-600 text-white"
                        : "bg-white dark:bg-gray-800 text-gray-600 dark:text-white hover:bg-blue-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    Iniciar Sesión
                  </button>
                </div>

                {/* Tab Content */}
                <div className="p-8">{activeTab === "register" ? <RegisterForm /> : <LoginForm />}</div>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-white">
                  Únete a miles de usuarios que ya transformaron su vida
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
