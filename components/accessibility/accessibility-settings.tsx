"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { updateUserPreferences } from "@/lib/accessibility-actions"
import { useToast } from "@/hooks/use-toast"
import { Eye, Type, Zap, Volume2, Palette } from "lucide-react"

interface AccessibilitySettingsProps {
  initialPreferences: any
}

export function AccessibilitySettings({ initialPreferences }: AccessibilitySettingsProps) {
  const [preferences, setPreferences] = useState(initialPreferences)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSave = async () => {
    setLoading(true)
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
      // Apply preferences to document
      applyPreferences()
    }
    setLoading(false)
  }

  const applyPreferences = () => {
    const root = document.documentElement

    // Apply color blind mode
    root.setAttribute("data-color-blind-mode", preferences.color_blind_mode)

    // Apply high contrast
    if (preferences.high_contrast) {
      root.classList.add("high-contrast")
    } else {
      root.classList.remove("high-contrast")
    }

    // Apply large text
    if (preferences.large_text) {
      root.classList.add("large-text")
    } else {
      root.classList.remove("large-text")
    }

    // Apply reduce motion
    if (preferences.reduce_motion) {
      root.classList.add("reduce-motion")
    } else {
      root.classList.remove("reduce-motion")
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Modo de Daltonismo
          </CardTitle>
          <CardDescription>Ajusta los colores para diferentes tipos de daltonismo</CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={preferences.color_blind_mode}
            onValueChange={(value) => setPreferences({ ...preferences, color_blind_mode: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sin ajustes</SelectItem>
              <SelectItem value="protanopia">Protanopía (rojo-verde)</SelectItem>
              <SelectItem value="deuteranopia">Deuteranopía (rojo-verde)</SelectItem>
              <SelectItem value="tritanopia">Tritanopía (azul-amarillo)</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Alto Contraste
          </CardTitle>
          <CardDescription>Aumenta el contraste entre texto y fondo para mejor legibilidad</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Switch
              id="high-contrast"
              checked={preferences.high_contrast}
              onCheckedChange={(checked) => setPreferences({ ...preferences, high_contrast: checked })}
            />
            <Label htmlFor="high-contrast">Activar alto contraste</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="h-5 w-5" />
            Texto Grande
          </CardTitle>
          <CardDescription>Aumenta el tamaño del texto en toda la aplicación</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Switch
              id="large-text"
              checked={preferences.large_text}
              onCheckedChange={(checked) => setPreferences({ ...preferences, large_text: checked })}
            />
            <Label htmlFor="large-text">Activar texto grande</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Reducir Movimiento
          </CardTitle>
          <CardDescription>Minimiza animaciones y transiciones para reducir mareos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Switch
              id="reduce-motion"
              checked={preferences.reduce_motion}
              onCheckedChange={(checked) => setPreferences({ ...preferences, reduce_motion: checked })}
            />
            <Label htmlFor="reduce-motion">Reducir movimiento</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            Optimizado para Lectores de Pantalla
          </CardTitle>
          <CardDescription>Mejora la experiencia con lectores de pantalla</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Switch
              id="screen-reader"
              checked={preferences.screen_reader_optimized}
              onCheckedChange={(checked) => setPreferences({ ...preferences, screen_reader_optimized: checked })}
            />
            <Label htmlFor="screen-reader">Optimizar para lectores de pantalla</Label>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={loading} className="w-full">
        {loading ? "Guardando..." : "Guardar Preferencias"}
      </Button>
    </div>
  )
}
