"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Dumbbell, Database } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { signUp } from "@/lib/auth-actions"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-orange-600 hover:bg-orange-700 text-white py-6 text-lg font-medium rounded-lg h-[60px]"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Creando cuenta...
        </>
      ) : (
        "Crear Cuenta"
      )}
    </Button>
  )
}

export default function RegisterForm() {
  const router = useRouter()
  const [state, formAction] = useActionState(signUp, null)

  // Handle successful registration by redirecting
  useEffect(() => {
    if (state?.success) {
      router.push("/")
    }
  }, [state, router])

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="space-y-4 text-center">
        <div className="flex justify-center">
          <div className="bg-orange-600 p-3 rounded-full">
            <Dumbbell className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-white">PRegister</h1>
        <p className="text-lg text-gray-400">Crea tu cuenta para comenzar</p>
      </div>

      <form action={formAction} className="space-y-6">
        {state?.error && (
          <div
            className={`border px-4 py-3 rounded-lg ${
              state.needsSetup
                ? "bg-yellow-500/10 border-yellow-500/50 text-yellow-400"
                : "bg-red-500/10 border-red-500/50 text-red-400"
            }`}
          >
            {state.needsSetup && (
              <div className="flex items-start gap-2">
                <Database className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium">{state.error}</div>
                  <div className="text-sm mt-1 text-yellow-300">
                    Ejecuta el script{" "}
                    <code className="bg-yellow-500/20 px-1 rounded">scripts/01-create-user-schema.sql</code> desde v0
                    para configurar la base de datos.
                  </div>
                </div>
              </div>
            )}
            {!state.needsSetup && state.error}
          </div>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-sm font-medium text-gray-300">
                Nombre *
              </Label>
              <Input
                id="firstName"
                name="firstName"
                type="text"
                placeholder="Juan"
                required
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-sm font-medium text-gray-300">
                Apellido *
              </Label>
              <Input
                id="lastName"
                name="lastName"
                type="text"
                placeholder="Pérez"
                required
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-300">
              Correo Electrónico *
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="juan@ejemplo.com"
              required
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-gray-300">
              Contraseña *
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Mínimo 6 caracteres"
              required
              minLength={6}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight" className="text-sm font-medium text-gray-300">
                Peso (kg) *
              </Label>
              <Input
                id="weight"
                name="weight"
                type="number"
                placeholder="70.5"
                required
                min="30"
                max="300"
                step="0.1"
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height" className="text-sm font-medium text-gray-300">
                Estatura (cm) *
              </Label>
              <Input
                id="height"
                name="height"
                type="number"
                placeholder="175"
                required
                min="100"
                max="250"
                step="0.1"
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
              />
            </div>
          </div>
        </div>

        <SubmitButton />

        <div className="text-center text-gray-400">
          ¿Ya tienes cuenta?{" "}
          <Link href="/auth/login" className="text-orange-400 hover:text-orange-300 hover:underline">
            Inicia sesión
          </Link>
        </div>
      </form>
    </div>
  )
}
