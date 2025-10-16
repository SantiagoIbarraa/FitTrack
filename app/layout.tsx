import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { ColorblindFilters } from "@/components/accessibility/colorblind-filters"

export const metadata: Metadata = {
  title: "FitTrack",
  description: "Track your fitness journey",
  generator: "v0.app",
  icons: {
    icon: "/logo-fittrack.png",
    shortcut: "/logo-fittrack.png",
    apple: "/logo-fittrack.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ColorblindFilters />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
