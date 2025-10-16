"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { updateUserPreferences } from "@/lib/accessibility-actions"
import { useToast } from "@/hooks/use-toast"
import { Type, Zap, Palette, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

interface AccessibilitySettingsProps {
  initialPreferences: any
  isGuest?: boolean // Add isGuest prop to handle guest users
}

export function AccessibilitySettings({ initialPreferences, isGuest = false }: AccessibilitySettingsProps) {
  const [preferences, setPreferences] = useState(initialPreferences)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    if (isGuest) {
      const savedPreferences = localStorage.getItem("accessibility_preferences")
      if (savedPreferences) {
        try {
          const parsed = JSON.parse(savedPreferences)
          setPreferences(parsed)
          applyPreferences(parsed)
        } catch (e) {
          console.error("Error loading preferences:", e)
        }
      } else {
        // Apply initial preferences even if not saved
        applyPreferences(initialPreferences)
      }
    } else {
      // Apply preferences from database on mount
      applyPreferences(initialPreferences)
    }
  }, [isGuest, initialPreferences])

  const handleSave = async () => {
    setLoading(true)

    if (isGuest) {
      try {
        localStorage.setItem("accessibility_preferences", JSON.stringify(preferences))
        toast({
          title: "Éxito",
          description: "Preferencias guardadas localmente",
        })
        applyPreferences(preferences)
      } catch (e) {
        toast({
          title: "Error",
          description: "No se pudieron guardar las preferencias",
          variant: "destructive",
        })
      }
    } else {
      const result = await updateUserPreferences(preferences)

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Éxito",
          description: "Preferencias guardadas correctamente",
        })
        applyPreferences(preferences)
      }
    }
    setLoading(false)
  }

  const applyPreferences = (prefs = preferences) => {
    const root = document.documentElement

    root.setAttribute("data-color-blind-mode", prefs.color_blind_mode)

    console.log("[v0] Applying colorblind mode:", prefs.color_blind_mode)

    // Apply large text
    if (prefs.large_text) {
      root.classList.add("large-text")
    } else {
      root.classList.remove("large-text")
    }

    // Apply reduce motion
    if (prefs.reduce_motion) {
      root.classList.add("reduce-motion")
    } else {
      root.classList.remove("reduce-motion")
    }
  }

  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 md:grid-rows-2">
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <Sun className="h-5 w-5" />
            Tema
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">
            Cambia entre modo claro y oscuro
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={theme} onValueChange={setTheme}>
            <SelectTrigger className="bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600">
              <SelectValue placeholder="Seleccionar tema" />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
              <SelectItem value="light" className="dark:text-white dark:focus:bg-gray-700">
                <div className="flex items-center gap-2">
                  <Sun className="h-4 w-4" />
                  Claro
                </div>
              </SelectItem>
              <SelectItem value="dark" className="dark:text-white dark:focus:bg-gray-700">
                <div className="flex items-center gap-2">
                  <Moon className="h-4 w-4" />
                  Oscuro
                </div>
              </SelectItem>
              <SelectItem value="system" className="dark:text-white dark:focus:bg-gray-700">
                Sistema
              </SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <Palette className="h-5 w-5" />
            Modo de Daltonismo
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">
            Ajusta los colores para diferentes tipos de daltonismo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={preferences.color_blind_mode}
            onValueChange={(value) => setPreferences({ ...preferences, color_blind_mode: value })}
          >
            <SelectTrigger className="bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
              <SelectItem value="none" className="dark:text-white dark:focus:bg-gray-700">
                Sin ajustes
              </SelectItem>
              <SelectItem value="protanopia" className="dark:text-white dark:focus:bg-gray-700">
                Protanopía (dificultad con rojo)
              </SelectItem>
              <SelectItem value="deuteranopia" className="dark:text-white dark:focus:bg-gray-700">
                Deuteranopía (dificultad con verde)
              </SelectItem>
              <SelectItem value="tritanopia" className="dark:text-white dark:focus:bg-gray-700">
                Tritanopía (dificultad con azul)
              </SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      

      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <Type className="h-5 w-5" />
            Texto Grande
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">
            Aumenta el tamaño del texto en toda la aplicación
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Switch
              id="large-text"
              checked={preferences.large_text}
              onCheckedChange={(checked) => setPreferences({ ...preferences, large_text: checked })}
            />
            <Label htmlFor="large-text" className="text-gray-900 dark:text-white">
              Activar texto grande
            </Label>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <Zap className="h-5 w-5" />
            Reducir Movimiento
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">
            Minimiza animaciones y transiciones para reducir mareos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Switch
              id="reduce-motion"
              checked={preferences.reduce_motion}
              onCheckedChange={(checked) => setPreferences({ ...preferences, reduce_motion: checked })}
            />
            <Label htmlFor="reduce-motion" className="text-gray-900 dark:text-white">
              Reducir movimiento
            </Label>
          </div>
        </CardContent>
      </Card>

      

      <div className="md:col-span-2">
        <Button onClick={handleSave} disabled={loading} className="w-full">
          {loading ? "Guardando..." : "Guardar Preferencias"}
        </Button>
      </div>
    </div>
  )
}
