"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export function BackButton() {
  const router = useRouter()

  return (
    <Button
      variant="outline"
      onClick={() => router.back()}
      className="dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700 bg-transparent"
    >
      <ArrowLeft className="h-4 w-4 mr-2" />
      Volver
    </Button>
  )
}
