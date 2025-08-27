"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Info } from "lucide-react"
import type { SlabStatus, Slab } from "@/types/inventory"
import { WorkflowEngine, STATUS_METADATA } from "@/lib/workflow"

interface TransitionConfirmationProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (data: TransitionData) => void
  currentStatus: SlabStatus
  newStatus: SlabStatus
  slab: Slab
  isLoading?: boolean
}

export interface TransitionData {
  reason?: string
  jobId?: string
  receivedDate?: Date
  consumedDate?: Date
  notes?: string
}

export function TransitionConfirmation({
  isOpen,
  onClose,
  onConfirm,
  currentStatus,
  newStatus,
  slab,
  isLoading = false,
}: TransitionConfirmationProps) {
  const [formData, setFormData] = useState<TransitionData>({})
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  const currentMeta = STATUS_METADATA[currentStatus]
  const newMeta = STATUS_METADATA[newStatus]

  // Validate transition and get warnings
  const validation = WorkflowEngine.validateTransition(slab, newStatus, formData)

  const handleSubmit = () => {
    const errors: string[] = []

    // Required field validation
    if (newStatus === "RECEIVED" && !formData.receivedDate) {
      errors.push("Received date is required")
    }
    if (newStatus === "CONSUMED" && !formData.consumedDate) {
      errors.push("Consumed date is required")
    }
    if (newStatus === "ALLOCATED" && !formData.jobId && !slab.jobId) {
      errors.push("Job ID is recommended for allocation")
    }

    if (errors.length > 0) {
      setValidationErrors(errors)
      return
    }

    setValidationErrors([])
    onConfirm(formData)
  }

  const handleClose = () => {
    setFormData({})
    setValidationErrors([])
    onClose()
  }

  const requiresConfirmation = newMeta.requiresConfirmation || newMeta.isDestructive

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {requiresConfirmation && <AlertTriangle className="w-5 h-5 text-amber-500" />}
            Confirm Status Change
          </DialogTitle>
          <DialogDescription>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span>Change from</span>
                <Badge className={currentMeta.color}>{currentMeta.label}</Badge>
                <span>to</span>
                <Badge className={newMeta.color}>{newMeta.label}</Badge>
              </div>

              <p className="text-sm text-gray-600">{newMeta.description}</p>

              {/* Validation warnings */}
              {validation.warnings && validation.warnings.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded p-3">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-amber-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-800">Warnings:</p>
                      <ul className="text-sm text-amber-700 mt-1 space-y-1">
                        {validation.warnings.map((warning, index) => (
                          <li key={index}>• {warning}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Validation errors */}
              {validationErrors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded p-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-800">Required:</p>
                      <ul className="text-sm text-red-700 mt-1 space-y-1">
                        {validationErrors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status-specific fields */}
          {newStatus === "RECEIVED" && (
            <div className="space-y-2">
              <Label htmlFor="receivedDate">Received Date *</Label>
              <Input
                id="receivedDate"
                type="date"
                value={formData.receivedDate ? formData.receivedDate.toISOString().split("T")[0] : ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    receivedDate: e.target.value ? new Date(e.target.value) : undefined,
                  }))
                }
              />
            </div>
          )}

          {newStatus === "CONSUMED" && (
            <div className="space-y-2">
              <Label htmlFor="consumedDate">Consumed Date *</Label>
              <Input
                id="consumedDate"
                type="date"
                value={formData.consumedDate ? formData.consumedDate.toISOString().split("T")[0] : ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    consumedDate: e.target.value ? new Date(e.target.value) : undefined,
                  }))
                }
              />
            </div>
          )}

          {newStatus === "ALLOCATED" && (
            <div className="space-y-2">
              <Label htmlFor="jobId">Job ID</Label>
              <Input
                id="jobId"
                placeholder="Enter job identifier"
                value={formData.jobId || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    jobId: e.target.value,
                  }))
                }
              />
            </div>
          )}

          {/* Reason field */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Change</Label>
            <Textarea
              id="reason"
              placeholder="Optional: Explain why this status change is being made"
              value={formData.reason || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  reason: e.target.value,
                }))
              }
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !validation.isValid}
            variant={newMeta.isDestructive ? "destructive" : "default"}
          >
            {isLoading ? "Processing..." : `Change to ${newMeta.label}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
