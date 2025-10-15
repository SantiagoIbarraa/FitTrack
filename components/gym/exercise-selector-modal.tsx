"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Dumbbell } from "lucide-react"
import { getGymExercises } from "@/lib/exercise-actions"

interface GymExercise {
  id: string
  name: string
  category: string
  description: string | null
  image_url: string | null
}

interface ExerciseSelectorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectExercise: (exercise: GymExercise) => void
}

const CATEGORIES = [
  { name: "Pecho", label: "Pecho" },
  { name: "Bíceps", label: "Bíceps" },
  { name: "Tríceps", label: "Tríceps" },
  { name: "Hombros", label: "Hombros" },
  { name: "Pierna", label: "Pierna" },
  { name: "Espalda", label: "Espalda" },
  { name: "Otros", label: "Otros" },
]

export default function ExerciseSelectorModal({ open, onOpenChange, onSelectExercise }: ExerciseSelectorModalProps) {
  const [exercises, setExercises] = useState<GymExercise[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("Pecho")

  useEffect(() => {
    const loadExercises = async () => {
      setLoading(true)
      const data = await getGymExercises()
      setExercises(data)
      setLoading(false)
    }
    if (open) {
      loadExercises()
    }
  }, [open])

  const filteredExercises = exercises.filter((exercise) =>
    exercise.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const displayedExercises = filteredExercises.filter((ex) => ex.category === selectedCategory)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw]  max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-2xl font-bold">Seleccionar Ejercicio</DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar ejercicio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="px-6 pb-4">
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((category) => (
              <Button
                key={category.name}
                variant={selectedCategory === category.name ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.name)}
                className="rounded-full"
              >
                {category.label}
              </Button>
            ))}
          </div>
        </div>

        <ScrollArea className="h-[calc(90vh-280px)] px-6 pb-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Cargando ejercicios...</div>
            </div>
          ) : displayedExercises.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Dumbbell className="h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No se encontraron ejercicios en esta categoría</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-4">
              {displayedExercises.map((exercise) => (
                <Button
                  key={exercise.id}
                  variant="outline"
                  className="h-32 flex flex-col items-center justify-center p-4 hover:bg-accent bg-transparent"
                  onClick={() => {
                    onSelectExercise(exercise)
                    onOpenChange(false)
                  }}
                >
                  {exercise.image_url ? (
                    <img
                      src={exercise.image_url || "/placeholder.svg"}
                      alt={exercise.name}
                      className="w-16 h-16 rounded object-cover mb-2"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded bg-muted flex items-center justify-center mb-2">
                      <Dumbbell className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="font-medium text-center text-sm line-clamp-2 overflow-hidden text-ellipsis w-full">
                    {exercise.name}
                  </div>
                </Button>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="px-6 pb-6 pt-2 border-t">
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => {
              onSelectExercise({
                id: "custom",
                name: "",
                category: "Otros",
                description: null,
                image_url: null,
              })
              onOpenChange(false)
            }}
          >
            + Agregar ejercicio personalizado
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
