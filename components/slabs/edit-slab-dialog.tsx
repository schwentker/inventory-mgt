"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { useState } from "react"
import type { Slab } from "@/types/inventory"
import { SlabDetailForm } from "./slab-detail-form"
import { AuditService } from "@/lib/audit"
import { InventoryRepository } from "@/lib/repository"

interface EditSlabDialogProps {
  slab: Slab
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdateSlab: (updatedSlab: Slab) => void
}

export function EditSlabDialog({ slab, open, onOpenChange, onUpdateSlab }: EditSlabDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSlabSave = async (updatedSlab: Slab) => {
    setIsSubmitting(true)
    try {
      const repository = new InventoryRepository()
      const result = await repository.saveSlab(updatedSlab)

      if (result.success && result.data) {
        AuditService.updateSlabAudit(slab, result.data, "Manual update via edit dialog")

        onUpdateSlab(result.data)
        onOpenChange(false)
      } else {
        console.error("Failed to update slab:", result.error)
        alert("Failed to update slab. Please try again.")
      }
    } catch (error) {
      console.error("Error updating slab:", error)
      alert("An error occurred while updating. Please try again.")
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
        <SlabDetailForm slab={slab} onSave={handleSlabSave} onCancel={handleCancel} mode="edit" />
      </DialogContent>
    </Dialog>
  )
}
