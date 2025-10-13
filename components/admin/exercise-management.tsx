"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Edit, Trash2, Dumbbell, Search, Upload, LinkIcon, X } from "lucide-react"
import { createGymExercise, updateGymExercise, deleteGymExercise, uploadExerciseImage } from "@/lib/exercise-actions"
import { useToast } from "@/hooks/use-toast"

interface Exercise {
  id: string
  name: string
  category: string
  description: string | null
  image_url: string | null
  created_at: string
}

interface ExerciseManagementProps {
  exercises: Exercise[]
}

const CATEGORIES = ["Pecho", "Bíceps", "Tríceps", "Hombros", "Pierna", "Espalda", "Otros"]

const CATEGORY_COLORS: Record<string, string> = {
  Pecho: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  Bíceps: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  Tríceps: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  Hombros: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  Pierna: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  Espalda: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
  Otros: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
}

export function ExerciseManagement({ exercises: initialExercises }: ExerciseManagementProps) {
  const [exercises, setExercises] = useState(initialExercises)
  const [showForm, setShowForm] = useState(false)
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [imageMethod, setImageMethod] = useState<"url" | "upload">("url")
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: "",
    category: "Pecho",
    description: "",
    image_url: "",
  })

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "El archivo debe ser una imagen",
        variant: "destructive",
      })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "El archivo no debe superar los 5MB",
        variant: "destructive",
      })
      return
    }

    setUploadingImage(true)

    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    const uploadFormData = new FormData()
    uploadFormData.append("file", file)

    const result = await uploadExerciseImage(uploadFormData)

    if (result?.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      })
      setImagePreview(null)
    } else if (result?.imageUrl) {
      setFormData({ ...formData, image_url: result.imageUrl })
      toast({
        title: "Éxito",
        description: "Imagen subida correctamente",
      })
    }

    setUploadingImage(false)
  }

  const handleClearImage = () => {
    setFormData({ ...formData, image_url: "" })
    setImagePreview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    console.log("[v0] Form data before submission:", formData)
    console.log("[v0] Image URL value:", formData.image_url)
    console.log("[v0] Image URL length:", formData.image_url?.length || 0)

    const formDataObj = new FormData()
    formDataObj.append("name", formData.name)
    formDataObj.append("category", formData.category)
    formDataObj.append("description", formData.description)
    formDataObj.append("image_url", formData.image_url)

    console.log("[v0] FormData contents:")
    for (const [key, value] of formDataObj.entries()) {
      console.log(`[v0]   ${key}:`, value)
    }

    let result
    if (editingExercise) {
      console.log("[v0] Updating exercise:", editingExercise.id)
      result = await updateGymExercise(editingExercise.id, formDataObj)
    } else {
      console.log("[v0] Creating new exercise")
      result = await createGymExercise(null, formDataObj)
    }

    console.log("[v0] Server action result:", result)

    if (result?.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      })
    } else {
      const savedImageUrl = result?.data?.image_url
      console.log("[v0] Saved image URL from server:", savedImageUrl)

      if (editingExercise) {
        setExercises(
          exercises.map((ex) =>
            ex.id === editingExercise.id
              ? {
                  ...ex,
                  name: formData.name,
                  category: formData.category,
                  description: formData.description,
                  image_url: formData.image_url,
                }
              : ex,
          ),
        )
        toast({
          title: "Éxito",
          description: savedImageUrl
            ? `Ejercicio actualizado. Imagen guardada: ${savedImageUrl.substring(0, 50)}...`
            : "Ejercicio actualizado correctamente.",
        })
      } else {
        const newExercise: Exercise = {
          id: result?.data?.id || crypto.randomUUID(),
          name: formData.name,
          category: formData.category,
          description: formData.description,
          image_url: formData.image_url,
          created_at: new Date().toISOString(),
        }
        setExercises([...exercises, newExercise])
        toast({
          title: "Éxito",
          description: savedImageUrl
            ? `Ejercicio creado. Imagen guardada: ${savedImageUrl.substring(0, 50)}...`
            : "Ejercicio creado correctamente.",
        })
      }

      setShowForm(false)
      setEditingExercise(null)
      setFormData({ name: "", category: "Pecho", description: "", image_url: "" })
      setImagePreview(null)
    }

    setLoading(false)
  }

  const handleEdit = (exercise: Exercise) => {
    setEditingExercise(exercise)
    setFormData({
      name: exercise.name,
      category: exercise.category,
      description: exercise.description || "",
      image_url: exercise.image_url || "",
    })
    if (exercise.image_url) {
      setImagePreview(exercise.image_url)
    }
    setShowForm(true)
  }

  const handleDelete = async (exerciseId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este ejercicio?")) {
      return
    }

    const result = await deleteGymExercise(exerciseId)

    if (result?.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Éxito",
        description: "Ejercicio eliminado",
      })
      setExercises(exercises.filter((e) => e.id !== exerciseId))
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingExercise(null)
    setFormData({ name: "", category: "Pecho", description: "", image_url: "" })
    setImagePreview(null)
  }

  const filteredExercises = exercises.filter((exercise) => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = filterCategory === "all" || exercise.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const exercisesByCategory = CATEGORIES.reduce(
    (acc, category) => {
      acc[category] = filteredExercises.filter((e) => e.category === category).length
      return acc
    },
    {} as Record<string, number>,
  )

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Ejercicios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{exercises.length}</div>
          </CardContent>
        </Card>
        {["Pecho", "Pierna", "Espalda"].map((cat) => (
          <Card key={cat}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{cat}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{exercisesByCategory[cat] || 0}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Form */}
      {showForm ? (
        <Card>
          <CardHeader>
            <CardTitle>{editingExercise ? "Editar Ejercicio" : "Nuevo Ejercicio"}</CardTitle>
            <CardDescription>
              {editingExercise ? "Modifica los datos del ejercicio" : "Agrega un nuevo ejercicio al catálogo"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre del Ejercicio</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej: Press de Banca"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoría</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción (opcional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe el ejercicio..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Imagen del Ejercicio (opcional)</Label>
                <Tabs value={imageMethod} onValueChange={(v) => setImageMethod(v as "url" | "upload")}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="url">
                      <LinkIcon className="h-4 w-4 mr-2" />
                      URL de Imagen
                    </TabsTrigger>
                    <TabsTrigger value="upload">
                      <Upload className="h-4 w-4 mr-2" />
                      Subir Imagen
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="url" className="space-y-2">
                    <Input
                      id="image_url"
                      type="url"
                      value={formData.image_url}
                      onChange={(e) => {
                        setFormData({ ...formData, image_url: e.target.value })
                        setImagePreview(e.target.value)
                      }}
                      placeholder="https://ejemplo.com/imagen.jpg"
                    />
                    <p className="text-sm text-muted-foreground">Ingresa la URL de una imagen externa</p>
                  </TabsContent>

                  <TabsContent value="upload" className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Input
                        id="image_file"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                        className="flex-1"
                      />
                      {formData.image_url && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={handleClearImage}
                          disabled={uploadingImage}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">Sube una imagen desde tu dispositivo (máx. 5MB)</p>
                    {uploadingImage && <p className="text-sm text-blue-600">Subiendo imagen...</p>}
                  </TabsContent>
                </Tabs>

                {imagePreview && (
                  <div className="mt-4">
                    <Label>Vista Previa</Label>
                    <div className="mt-2 relative w-32 h-32 border rounded-lg overflow-hidden">
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={() => {
                          toast({
                            title: "Error",
                            description: "No se pudo cargar la imagen",
                            variant: "destructive",
                          })
                          setImagePreview(null)
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={loading || uploadingImage} className="flex-1">
                  {loading ? "Guardando..." : editingExercise ? "Actualizar" : "Crear Ejercicio"}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel} disabled={loading || uploadingImage}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Button onClick={() => setShowForm(true)} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Agregar Nuevo Ejercicio
        </Button>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Ejercicios Disponibles</CardTitle>
          <CardDescription>Gestiona el catálogo de ejercicios del gimnasio</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar ejercicios..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrar por categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat} ({exercisesByCategory[cat] || 0})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {filteredExercises.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Dumbbell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No se encontraron ejercicios</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredExercises.map((exercise) => (
                <div
                  key={exercise.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-white dark:bg-gray-800"
                >
                  <div className="flex items-center gap-4 flex-1">
                    {exercise.image_url && (
                      <img
                        src={exercise.image_url || "/placeholder.svg"}
                        alt={exercise.name}
                        className="w-12 h-12 object-cover rounded"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = "none"
                        }}
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{exercise.name}</h4>
                        <Badge className={CATEGORY_COLORS[exercise.category]}>{exercise.category}</Badge>
                      </div>
                      {exercise.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">{exercise.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(exercise)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(exercise.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
