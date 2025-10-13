"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function ThemeStatus() {
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="text-xs text-muted-foreground">
      Tema: {theme === "system" ? "Sistema" : theme === "dark" ? "Oscuro" : "Claro"}
      {theme === "system" && (
        <span className="ml-1">
          (actual: {resolvedTheme === "dark" ? "Oscuro" : "Claro"})
        </span>
      )}
    </div>
  )
}
