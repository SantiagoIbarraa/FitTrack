"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { User, Loader2, Edit, Camera, Shield } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateUserProfile, getUserProfile, uploadProfilePhoto } from "@/lib/user-actions"
import { getCurrentUserRole } from "@/lib/admin-actions"
import { useActionState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface UserProfile {
  id: string
  email: string
  firstName: string
  lastName: string
  fullName: string
  weight: number | null
  height: number | null
  dateOfBirth: string | null
  sex: string | null
  profilePhotoUrl: string | null
}

interface ProfileFormProps {
  onSuccess?: () => void
}

export default function ProfileForm({ onSuccess }: ProfileFormProps) {
  const [state, formAction] = useActionState(updateUserProfile, null)
  const [isOpen, setIsOpen] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [userRole, setUserRole] = useState<{ role: string; is_active: boolean; is_professional: boolean }>({
    role: "user",
    is_active: true,
    is_professional: false,
  })
  const [loading, setLoading] = useState(true)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const [userProfile, roleData] = await Promise.all([getUserProfile(), getCurrentUserRole()])
        setProfile(userProfile)
        setUserRole(roleData)
        if (userProfile?.profilePhotoUrl) {
          setPhotoPreview(userProfile.profilePhotoUrl)
        }
      } catch (error) {
        console.error("Error loading profile:", error)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  useEffect(() => {
    if (state?.success) {
      setIsOpen(false)
      getUserProfile().then((userProfile) => {
        if (userProfile) {
          setProfile(userProfile)
        }
      })
      onSuccess?.()
    }
  }, [state, onSuccess])

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    setUploadingPhoto(true)
    const formData = new FormData()
    formData.append("file", file)

    try {
      const result = await uploadProfilePhoto(formData)
      if (result.success && result.photoUrl) {
        setPhotoPreview(result.photoUrl)
        const userProfile = await getUserProfile()
        setProfile(userProfile)
      } else if (result.error) {
        alert(result.error)
        setPhotoPreview(profile?.profilePhotoUrl || null)
      }
    } catch (error) {
      console.error("Error uploading photo:", error)
      alert("Error al subir la foto")
      setPhotoPreview(profile?.profilePhotoUrl || null)
    } finally {
      setUploadingPhoto(false)
    }
  }

  const getRoleBadge = (role: string, isProfessional: boolean) => {
    if (role === "admin") {
      return (
        <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
          <Shield className="h-3 w-3 mr-1" />
          Administrador
        </Badge>
      )
    }
    if (isProfessional) {
      return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Profesional</Badge>
    }
    return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">Usuario</Badge>
  }

  if (loading) {
    return (
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardContent className="p-6">
          <div className="text-center text-gray-500 dark:text-gray-400">Cargando perfil...</div>
        </CardContent>
      </Card>
    )
  }

  if (!profile) {
    return (
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardContent className="p-6">
          <div className="text-center text-gray-500 dark:text-gray-400">No se pudo cargar el perfil</div>
        </CardContent>
      </Card>
    )
  }

  if (!isOpen) {
    return (
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <User className="h-5 w-5" />
            Perfil de Usuario
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">Información personal y medidas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-center mb-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile.profilePhotoUrl || undefined} alt={profile.fullName} />
                <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-2xl">
                  {profile.firstName?.[0]}
                  {profile.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nombre Completo</Label>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {profile.fullName || "No especificado"}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</Label>
              <p className="text-lg text-gray-900 dark:text-white">{profile.email}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Rol</Label>
              <div className="mt-1 flex items-center gap-2">
                {getRoleBadge(userRole.role, userRole.is_professional)}
                {userRole.is_professional && !userRole.is_active && (
                  <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                    Inactivo
                  </Badge>
                )}
              </div>
              {userRole.is_professional && userRole.is_active && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Tienes acceso al sistema de mensajería profesional
                </p>
              )}
              {!userRole.is_professional && userRole.role !== "admin" && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Contacta al administrador para solicitar acceso como profesional
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Peso</Label>
                <p className="text-lg text-gray-900 dark:text-white">
                  {profile.weight ? `${profile.weight} kg` : "No especificado"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Estatura</Label>
                <p className="text-lg text-gray-900 dark:text-white">
                  {profile.height ? `${profile.height} cm` : "No especificado"}
                </p>
              </div>
            </div>
            {profile.dateOfBirth && (
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Fecha de Nacimiento</Label>
                <p className="text-lg text-gray-900 dark:text-white">
                  {new Date(profile.dateOfBirth).toLocaleDateString()}
                </p>
              </div>
            )}
            {profile.sex && (
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sexo</Label>
                <p className="text-lg text-gray-900 dark:text-white capitalize">{profile.sex}</p>
              </div>
            )}

            <Button onClick={() => setIsOpen(true)} className="w-full bg-blue-600 hover:bg-blue-700">
              <Edit className="h-4 w-4 mr-2" />
              Editar Perfil
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
          <Edit className="h-5 w-5" />
          Editar Perfil
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-300">
          Actualiza tu información personal
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {state?.error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded text-sm">
              {state.error}
            </div>
          )}

          {state?.success && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded text-sm">
              {state.message}
            </div>
          )}

          <div className="flex flex-col items-center gap-3">
            <Avatar className="h-24 w-24">
              <AvatarImage src={photoPreview || undefined} alt="Profile" />
              <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-2xl">
                {profile.firstName?.[0]}
                {profile.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhoto}
              className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
            >
              {uploadingPhoto ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Subiendo...
                </>
              ) : (
                <>
                  <Camera className="h-4 w-4 mr-2" />
                  Cambiar Foto
                </>
              )}
            </Button>
            <p className="text-xs text-gray-500 dark:text-gray-400">Opcional - Máximo 5MB</p>
          </div>

          {photoPreview && photoPreview !== profile?.profilePhotoUrl && (
            <input type="hidden" name="profilePhotoUrl" value={photoPreview} />
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-gray-700 dark:text-gray-300">
                Nombre
              </Label>
              <Input
                id="firstName"
                name="firstName"
                defaultValue={profile.firstName}
                placeholder="Tu nombre"
                required
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-gray-700 dark:text-gray-300">
                Apellido
              </Label>
              <Input
                id="lastName"
                name="lastName"
                defaultValue={profile.lastName}
                placeholder="Tu apellido"
                required
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight" className="text-gray-700 dark:text-gray-300">
                Peso (kg)
              </Label>
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
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height" className="text-gray-700 dark:text-gray-300">
                Estatura (cm)
              </Label>
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
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth" className="text-gray-700 dark:text-gray-300">
                Fecha de Nacimiento
              </Label>
              <Input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                defaultValue={profile.dateOfBirth || ""}
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sex" className="text-gray-700 dark:text-gray-300">
                Sexo
              </Label>
              <Select name="sex" defaultValue={profile.sex || undefined}>
                <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="masculino">Masculino</SelectItem>
                  <SelectItem value="femenino">Femenino</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
              <Loader2 className="h-4 w-4 mr-2 animate-spin hidden" />
              Guardar Cambios
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
