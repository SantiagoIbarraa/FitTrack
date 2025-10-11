"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Shield, User, Search, CheckCircle, XCircle } from "lucide-react"
import { isAdmin, getAllUsers, updateUserRole, type UserRole } from "@/lib/role-actions"
import { toast } from "sonner"

interface UserWithRole {
  id: string
  email: string
  created_at: string
  role: UserRole
  is_approved: boolean
}

export default function AdminPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<UserWithRole[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserWithRole[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    checkAdminAndLoadUsers()
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredUsers(users)
    } else {
      const filtered = users.filter((user) => user.email.toLowerCase().includes(searchTerm.toLowerCase()))
      setFilteredUsers(filtered)
    }
  }, [searchTerm, users])

  const checkAdminAndLoadUsers = async () => {
    try {
      const adminCheck = await isAdmin()
      if (!adminCheck) {
        toast.error("No tienes permisos de administrador")
        router.push("/")
        return
      }

      const usersData = await getAllUsers()
      setUsers(usersData)
      setFilteredUsers(usersData)
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al cargar usuarios")
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      setUpdating(userId)
      const user = users.find((u) => u.id === userId)
      const isApproved = newRole === "professional" ? user?.is_approved || false : true

      const result = await updateUserRole(userId, newRole, isApproved)

      if (result.success) {
        toast.success("Rol actualizado exitosamente")
        await checkAdminAndLoadUsers()
      } else {
        toast.error(result.error || "Error al actualizar rol")
      }
    } catch (error) {
      toast.error("Error al actualizar rol")
    } finally {
      setUpdating(null)
    }
  }

  const handleApprovalToggle = async (userId: string, currentApproval: boolean) => {
    try {
      setUpdating(userId)
      const user = users.find((u) => u.id === userId)
      if (!user || user.role !== "professional") return

      const result = await updateUserRole(userId, "professional", !currentApproval)

      if (result.success) {
        toast.success(`Profesional ${!currentApproval ? "aprobado" : "desaprobado"} exitosamente`)
        await checkAdminAndLoadUsers()
      } else {
        toast.error(result.error || "Error al cambiar aprobación")
      }
    } catch (error) {
      toast.error("Error al cambiar aprobación")
    } finally {
      setUpdating(null)
    }
  }

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 border-red-300"
      case "professional":
        return "bg-blue-100 text-blue-800 border-blue-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case "admin":
        return "Administrador"
      case "professional":
        return "Profesional"
      default:
        return "Usuario"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-300">Cargando panel de administración...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Link>
            </Button>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-10 w-10 text-red-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Panel de Administración</h1>
              <p className="text-gray-600 dark:text-gray-300">Gestiona usuarios, roles y permisos</p>
            </div>
          </div>
        </div>

        <Card className="mb-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-gray-100">
              <Search className="h-5 w-5" />
              Buscar Usuarios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Buscar por email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-500"
            />
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-gray-100">
              <User className="h-5 w-5" />
              Usuarios ({filteredUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-medium text-gray-900 dark:text-white">{user.email}</p>
                      <Badge className={getRoleBadgeColor(user.role)}>{getRoleLabel(user.role)}</Badge>
                      {user.role === "professional" && (
                        <Badge variant={user.is_approved ? "default" : "secondary"}>
                          {user.is_approved ? "Aprobado" : "Pendiente"}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Registrado: {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Select
                      value={user.role}
                      onValueChange={(value) => handleRoleChange(user.id, value as UserRole)}
                      disabled={updating === user.id}
                    >
                      <SelectTrigger className="w-[160px] bg-white dark:bg-gray-800">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">Usuario</SelectItem>
                        <SelectItem value="professional">Profesional</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                      </SelectContent>
                    </Select>

                    {user.role === "professional" && (
                      <Button
                        variant={user.is_approved ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleApprovalToggle(user.id, user.is_approved)}
                        disabled={updating === user.id}
                      >
                        {user.is_approved ? (
                          <>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Aprobado
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 mr-1" />
                            Aprobar
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              {filteredUsers.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No se encontraron usuarios
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
