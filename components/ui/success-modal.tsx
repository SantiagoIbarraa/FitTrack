"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CheckCircle } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface SuccessModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  message: string
  icon?: LucideIcon
}

export default function SuccessModal({ open, onOpenChange, title, message, icon: Icon }: SuccessModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-3">
              {Icon ? (
                <Icon className="h-12 w-12 text-green-600 dark:text-green-400" />
              ) : (
                <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
              )}
            </div>
          </div>
          <DialogTitle className="text-center text-xl">{title}</DialogTitle>
          <DialogDescription className="text-center text-base">{message}</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
