"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Dumbbell } from "lucide-react"
import Link from "next/link"
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

  // Handle successful login by redirecting
  useEffect(() => {
    if (state?.success) {
      router.push("/")
    }
  }, [state, router])

  return (
    <div className="w-full max-w-md space-y-8 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl">
      <div className="space-y-4 text-center">
        <div className="flex justify-center">
          <div className="bg-blue-600 p-3 rounded-full">
            <Dumbbell className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">FitTrack</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">Inicia sesión en tu cuenta</p>
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

        <div className="text-center text-gray-600 dark:text-gray-400">
          ¿No tienes cuenta?{" "}
          <Link
            href="/auth/register"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline font-medium"
          >
            Regístrate
          </Link>
        </div>
      </form>
    </div>
  )
}
