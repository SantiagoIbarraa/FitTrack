"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { updateUserRole } from "@/lib/admin-actions"
import { useToast } from "@/hooks/use-toast"
import { Users, Shield, MessageSquare, Search } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info } from "lucide-react"

interface User {
  id: string
  email: string
  full_name: string
  role: string
  is_active: boolean
  is_professional: boolean
  created_at: string
}

interface AdminDashboardProps {
  users: User[]
}

export function AdminDashboard({ users: initialUsers }: AdminDashboardProps) {
  const [users, setUsers] = useState(initialUsers)
  const [loading, setLoading] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  const handleRoleChange = async (userId: string, role: string) => {
    setLoading(userId)
    const user = users.find((u) => u.id === userId)
    if (!user) return

    const result = await updateUserRole(userId, role, user.is_active, user.is_professional)

    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Éxito",
        description: "Rol actualizado correctamente",
      })
      setUsers(users.map((u) => (u.id === userId ? { ...u, role } : u)))
    }
    setLoading(null)
  }

  const handleActiveChange = async (userId: string, isActive: boolean) => {
    setLoading(userId)
    const user = users.find((u) => u.id === userId)
    if (!user) return

    const result = await updateUserRole(userId, user.role, isActive, user.is_professional)

    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Éxito",
        description: `Usuario ${isActive ? "activado" : "desactivado"} correctamente`,
      })
      setUsers(users.map((u) => (u.id === userId ? { ...u, is_active: isActive } : u)))
    }
    setLoading(null)
  }

  const handleProfessionalChange = async (userId: string, isProfessional: boolean) => {
    setLoading(userId)
    const user = users.find((u) => u.id === userId)
    if (!user) return

    const result = await updateUserRole(userId, user.role, user.is_active, isProfessional)

    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Éxito",
        description: `Usuario ${isProfessional ? "marcado como" : "removido de"} profesional`,
      })
      setUsers(users.map((u) => (u.id === userId ? { ...u, is_professional: isProfessional } : u)))
    }
    setLoading(null)
  }

  const stats = {
    total: users.length,
    professionals: users.filter((u) => u.is_professional && u.is_active).length,
    admins: users.filter((u) => u.role === "admin").length,
  }

  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase()
    return user.full_name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query)
  })

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Solo los usuarios marcados como <strong>Profesional</strong> y con estado <strong>Activo</strong> aparecerán
          en el sistema de mensajería. Usa el switch "Profesional" para controlar quién puede recibir mensajes.
        </AlertDescription>
      </Alert>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profesionales en Mensajería</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.professionals}</div>
            <p className="text-xs text-muted-foreground mt-1">Visibles para usuarios</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administradores</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.admins}</div>
          </CardContent>
        </Card>
      </div>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Usuarios</CardTitle>
          <CardDescription>
            Administra roles y permisos de los usuarios. Activa el switch "Profesional" para que aparezcan en
            mensajería.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar por nombre o email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            {searchQuery && (
              <p className="text-sm text-muted-foreground mt-2">
                Mostrando {filteredUsers.length} de {users.length} usuarios
              </p>
            )}
          </div>

          <div className="space-y-4">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No se encontraron usuarios que coincidan con "{searchQuery}"
              </div>
            ) : (
              filteredUsers.map((user) => {
                const isVisibleInMessaging = user.is_professional && user.is_active

                return (
                  <div
                    key={user.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border rounded-lg bg-white dark:bg-gray-800"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="font-medium text-gray-900 dark:text-white truncate">{user.full_name}</p>
                        <Badge variant={user.role === "admin" ? "default" : "outline"}>
                          {user.role === "admin" ? "Admin" : "Usuario"}
                        </Badge>
                        {isVisibleInMessaging && (
                          <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                            <MessageSquare className="h-3 w-3 mr-1" />
                            Visible en mensajería
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{user.email}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        Registrado: {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
                      <div className="w-full sm:w-32">
                        <Select
                          value={user.role}
                          onValueChange={(value) => handleRoleChange(user.id, value)}
                          disabled={loading === user.id}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">Usuario</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`professional-${user.id}`}
                          checked={user.is_professional}
                          onCheckedChange={(checked) => handleProfessionalChange(user.id, checked)}
                          disabled={loading === user.id}
                        />
                        <Label htmlFor={`professional-${user.id}`} className="text-sm whitespace-nowrap">
                          Profesional
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`active-${user.id}`}
                          checked={user.is_active}
                          onCheckedChange={(checked) => handleActiveChange(user.id, checked)}
                          disabled={loading === user.id}
                        />
                        <Label htmlFor={`active-${user.id}`} className="text-sm">
                          {user.is_active ? "Activo" : "Inactivo"}
                        </Label>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
