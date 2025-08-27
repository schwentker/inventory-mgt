"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Edit, History, Workflow, Info } from "lucide-react"
import type { Slab } from "@/types/inventory"
import { getStatusColor, formatDimensions, formatCurrency, calculateSlabArea } from "@/lib/utils/inventory"
import { SlabDetailForm } from "./slab-detail-form"
import { WorkflowProgress } from "./workflow-progress"
import { WorkflowActions } from "./workflow-actions"
import { SlabHistory } from "./slab-history"
import { AuditService } from "@/lib/audit"
import { InventoryRepository } from "@/lib/repository"

interface SlabDetailDialogProps {
  slab: Slab
  open: boolean
  onOpenChange: (open: boolean) => void
  onSlabUpdate?: (updatedSlab: Slab) => void
}

export function SlabDetailDialog({ slab, open, onOpenChange, onSlabUpdate }: SlabDetailDialogProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [currentSlab, setCurrentSlab] = useState(slab)

  useState(() => {
    setCurrentSlab(slab)
  }, [slab])

  const handleSlabSave = async (updatedSlab: Slab) => {
    try {
      const repository = new InventoryRepository()
      const result = await repository.saveSlab(updatedSlab)

      if (result.success && result.data) {
        AuditService.updateSlabAudit(currentSlab, updatedSlab, "Manual update via detail form")

        setCurrentSlab(updatedSlab)
        setIsEditing(false)
        onSlabUpdate?.(updatedSlab)
      } else {
        console.error("Failed to save slab:", result.error)
        alert("Failed to save slab. Please try again.")
      }
    } catch (error) {
      console.error("Error saving slab:", error)
      alert("An error occurred while saving. Please try again.")
    }
  }

  const handleStatusChange = async (newStatus: any, additionalData?: Partial<Slab>, reason?: string) => {
    try {
      const updatedSlab: Slab = {
        ...currentSlab,
        ...additionalData,
        status: newStatus,
      }

      const repository = new InventoryRepository()
      const result = await repository.saveSlab(updatedSlab)

      if (result.success && result.data) {
        AuditService.statusChangeAudit(currentSlab, currentSlab.status, newStatus, reason)

        setCurrentSlab(updatedSlab)
        onSlabUpdate?.(updatedSlab)
      } else {
        console.error("Failed to update slab status:", result.error)
        alert("Failed to update status. Please try again.")
      }
    } catch (error) {
      console.error("Error updating slab status:", error)
      alert("An error occurred while updating status. Please try again.")
    }
  }

  const handleEditCancel = () => {
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <SlabDetailForm slab={currentSlab} onSave={handleSlabSave} onCancel={handleEditCancel} mode="edit" />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-3">
              {currentSlab.material} - {currentSlab.color}
              <Badge className={getStatusColor(currentSlab.status)}>{currentSlab.status}</Badge>
            </DialogTitle>
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </DialogHeader>

        <Tabs defaultValue="details" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details" className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              Details
            </TabsTrigger>
            <TabsTrigger value="workflow" className="flex items-center gap-2">
              <Workflow className="h-4 w-4" />
              Workflow
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              History
            </TabsTrigger>
            <TabsTrigger value="actions" className="flex items-center gap-2">
              Actions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium">Serial Number:</span>
                    <span>{currentSlab.serialNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Material:</span>
                    <span>{currentSlab.material}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Color:</span>
                    <span>{currentSlab.color}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Type:</span>
                    <Badge variant="outline">{currentSlab.slabType}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Supplier:</span>
                    <span>{currentSlab.supplier}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Dimensions & Cost</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium">Dimensions:</span>
                    <span className="text-sm">
                      {formatDimensions(currentSlab.length, currentSlab.width, currentSlab.thickness)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Area:</span>
                    <span>{calculateSlabArea(currentSlab.length, currentSlab.width).toFixed(2)} m²</span>
                  </div>
                  {currentSlab.cost && (
                    <div className="flex justify-between">
                      <span className="font-medium">Cost:</span>
                      <span className="font-bold">{formatCurrency(currentSlab.cost)}</span>
                    </div>
                  )}
                  {currentSlab.location && (
                    <div className="flex justify-between">
                      <span className="font-medium">Location:</span>
                      <span>{currentSlab.location}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {(currentSlab.receivedDate || currentSlab.consumedDate || currentSlab.jobId) && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Timeline & Job Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {currentSlab.receivedDate && (
                    <div className="flex justify-between">
                      <span className="font-medium">Received Date:</span>
                      <span>{new Date(currentSlab.receivedDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  {currentSlab.consumedDate && (
                    <div className="flex justify-between">
                      <span className="font-medium">Consumed Date:</span>
                      <span>{new Date(currentSlab.consumedDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  {currentSlab.jobId && (
                    <div className="flex justify-between">
                      <span className="font-medium">Job ID:</span>
                      <span>{currentSlab.jobId}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {currentSlab.notes && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{currentSlab.notes}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="workflow" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Workflow Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <WorkflowProgress currentStatus={currentSlab.status} showSteps={true} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Available Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <WorkflowActions slab={currentSlab} onStatusChange={handleStatusChange} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <SlabHistory slabId={currentSlab.id} slabSerialNumber={currentSlab.serialNumber} compact={false} />
          </TabsContent>

          <TabsContent value="actions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full bg-transparent" onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Slab Details
                </Button>
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => {
                    const csvData = AuditService.exportSlabAuditLog(currentSlab.id)
                    const blob = new Blob([csvData], { type: "text/csv" })
                    const url = URL.createObjectURL(blob)
                    const link = document.createElement("a")
                    link.href = url
                    link.download = `slab-${currentSlab.serialNumber}-history.csv`
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                    URL.revokeObjectURL(url)
                  }}
                >
                  <History className="h-4 w-4 mr-2" />
                  Export History
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
