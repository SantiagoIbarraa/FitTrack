"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { signIn } from "@/lib/auth-actions"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg font-medium rounded-lg h-[60px]"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Iniciando sesión...
        </>
      ) : (
        "Iniciar Sesión"
      )}
    </Button>
  )
}

export default function LoginForm() {
  const router = useRouter()
  const [state, formAction] = useActionState(signIn, null)

  useEffect(() => {
    if (state?.success) {
      router.push("/")
    }
  }, [state, router])

  return (
    <div className="w-full space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-300">Bienvenido de nuevo</h2>
        <p className="text-gray-600 dark:text-white">Continúa tu progreso</p>
      </div>

      <form action={formAction} className="space-y-6">
        {state?.error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
            {state.error}
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Correo Electrónico
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="juan@ejemplo.com"
              required
              className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Contraseña
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <SubmitButton />
      </form>
    </div>
  )
}
