"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Target } from "lucide-react"
import type { Slab } from "@/types/inventory"
import { batchOperationManager } from "@/lib/batch-operations"

interface BatchAllocationDialogProps {
  isOpen: boolean
  onClose: () => void
  selectedSlabs: Slab[]
  onComplete: () => void
}

export function BatchAllocationDialog({ isOpen, onClose, selectedSlabs, onComplete }: BatchAllocationDialogProps) {
  const [jobId, setJobId] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [customerName, setCustomerName] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const handleAllocate = async () => {
    if (!jobId.trim()) return

    setIsProcessing(true)

    try {
      const result = await batchOperationManager.executeBatchOperation({
        type: "allocation",
        title: `Allocate ${selectedSlabs.length} slabs to job ${jobId}`,
        items: selectedSlabs.map((s) => s.id),
        jobId: jobId.trim(),
      })

      if (result.success) {
        onComplete()
        onClose()
        resetForm()
      }
    } catch (error) {
      console.error("Batch allocation failed:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const resetForm = () => {
    setJobId("")
    setJobDescription("")
    setCustomerName("")
    setDueDate("")
  }

  const handleClose = () => {
    if (!isProcessing) {
      resetForm()
      onClose()
    }
  }

  const getTotalValue = () => {
    return selectedSlabs.reduce((sum, slab) => sum + (slab.cost || 0), 0)
  }

  const getMaterialSummary = () => {
    const materials = selectedSlabs.reduce(
      (acc, slab) => {
        acc[slab.material] = (acc[slab.material] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return Object.entries(materials).map(([material, count]) => ({ material, count }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Allocate {selectedSlabs.length} Slabs to Job
          </DialogTitle>
          <DialogDescription>
            Assign the selected slabs to a specific job. This will change their status to "Allocated".
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Job Details */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="job-id">Job ID *</Label>
              <Input
                id="job-id"
                placeholder="e.g., JOB-2024-001"
                value={jobId}
                onChange={(e) => setJobId(e.target.value)}
                disabled={isProcessing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer-name">Customer Name</Label>
              <Input
                id="customer-name"
                placeholder="Customer or project name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                disabled={isProcessing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="due-date">Due Date</Label>
              <Input
                id="due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                disabled={isProcessing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="job-description">Job Description</Label>
              <Textarea
                id="job-description"
                placeholder="Brief description of the job or project"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={3}
                disabled={isProcessing}
              />
            </div>
          </div>

          {/* Selected Slabs Summary */}
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-3">Selected Slabs Summary</h4>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Slabs:</span>
                  <Badge variant="secondary">{selectedSlabs.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Value:</span>
                  <span className="font-medium">${getTotalValue().toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div>
              <h5 className="font-medium mb-2">Materials Breakdown</h5>
              <div className="space-y-2">
                {getMaterialSummary().map(({ material, count }) => (
                  <div key={material} className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">{material}:</span>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h5 className="font-medium mb-2">Slab List</h5>
              <ScrollArea className="h-32 border rounded-md p-2">
                <div className="space-y-1">
                  {selectedSlabs.map((slab) => (
                    <div key={slab.id} className="text-xs text-gray-600 flex justify-between">
                      <span>{slab.serialNumber}</span>
                      <span>
                        {slab.material} {slab.color}
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button onClick={handleAllocate} disabled={!jobId.trim() || isProcessing}>
            {isProcessing ? "Allocating..." : `Allocate ${selectedSlabs.length} Slabs`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
