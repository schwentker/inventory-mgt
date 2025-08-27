"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { useState } from "react"
import type { Slab } from "@/types/inventory"
import { SlabDetailForm } from "./slab-detail-form"
import { AuditService } from "@/lib/audit"
import { InventoryRepository } from "@/lib/repository"

interface AddSlabDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddSlab: (slab: Slab) => void
}

export function AddSlabDialog({ open, onOpenChange, onAddSlab }: AddSlabDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSlabSave = async (slab: Slab) => {
    setIsSubmitting(true)
    try {
      const repository = new InventoryRepository()
      const result = await repository.saveSlab(slab)

      if (result.success && result.data) {
        AuditService.createSlabAudit(result.data, undefined, "System")

        onAddSlab(result.data)
        onOpenChange(false)
      } else {
        console.error("Failed to save slab:", result.error)
        alert("Failed to save slab. Please try again.")
      }
    } catch (error) {
      console.error("Error saving slab:", error)
      alert("An error occurred while saving. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <SlabDetailForm onSave={handleSlabSave} onCancel={handleCancel} mode="create" />
      </DialogContent>
    </Dialog>
  )
}
