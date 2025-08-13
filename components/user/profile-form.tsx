"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { User, Loader2, Edit } from "lucide-react"
import { updateUserProfile, getUserProfile } from "@/lib/user-actions"
import { useActionState } from "react"

interface UserProfile {
  id: string
  email: string
  firstName: string
  lastName: string
  fullName: string
  weight: number | null
  height: number | null
}

export default function ProfileForm() {
  const [state, formAction] = useActionState(updateUserProfile, null)
  const [isOpen, setIsOpen] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const userProfile = await getUserProfile()
        setProfile(userProfile)
      } catch (error) {
        console.error("Error loading profile:", error)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  const handleSubmit = async (formData: FormData) => {
    const result = await formAction(formData)
    if (result?.success) {
      setIsOpen(false)
      // Reload profile data
      const userProfile = await getUserProfile()
      setProfile(userProfile)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">Cargando perfil...</div>
        </CardContent>
      </Card>
    )
  }

  if (!profile) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">No se pudo cargar el perfil</div>
        </CardContent>
      </Card>
    )
  }

  if (!isOpen) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Perfil de Usuario
          </CardTitle>
          <CardDescription>Información personal y medidas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">Nombre Completo</Label>
              <p className="text-lg font-semibold">{profile.fullName || "No especificado"}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Email</Label>
              <p className="text-lg">{profile.email}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Peso</Label>
                <p className="text-lg">{profile.weight ? `${profile.weight} kg` : "No especificado"}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Estatura</Label>
                <p className="text-lg">{profile.height ? `${profile.height} cm` : "No especificado"}</p>
              </div>
            </div>
            <Button onClick={() => setIsOpen(true)} className="w-full">
              <Edit className="h-4 w-4 mr-2" />
              Editar Perfil
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Edit className="h-5 w-5" />
          Editar Perfil
        </CardTitle>
        <CardDescription>Actualiza tu información personal</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          {state?.error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">{state.error}</div>
          )}

          {state?.success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded text-sm">{state.message}</div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Nombre</Label>
              <Input
                id="firstName"
                name="firstName"
                defaultValue={profile.firstName}
                placeholder="Tu nombre"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Apellido</Label>
              <Input
                id="lastName"
                name="lastName"
                defaultValue={profile.lastName}
                placeholder="Tu apellido"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight">Peso (kg)</Label>
              <Input
                id="weight"
                name="weight"
                type="number"
                step="0.1"
                min="30"
                max="300"
                defaultValue={profile.weight || ""}
                placeholder="70"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Estatura (cm)</Label>
              <Input
                id="height"
                name="height"
                type="number"
                step="0.1"
                min="100"
                max="250"
                defaultValue={profile.height || ""}
                placeholder="170"
                required
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1">
              <Loader2 className="h-4 w-4 mr-2 animate-spin hidden" />
              Guardar Cambios
            </Button>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
