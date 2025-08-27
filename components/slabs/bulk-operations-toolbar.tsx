"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Separator } from "@/components/ui/separator"
import { Edit, Trash2, X, Download, Target } from "lucide-react"
import type { Slab } from "@/types/inventory"
import { SlabStatus } from "@/types/inventory"
import { getStatusColor } from "@/lib/utils/inventory"
import { BatchAllocationDialog } from "@/components/batch/batch-allocation-dialog"
import { BatchExportDialog } from "@/components/batch/batch-export-dialog"
import { batchOperationManager } from "@/lib/batch-operations"

interface BulkOperationsToolbarProps {
  selectedSlabs: Slab[]
  selectedIds: Set<string>
  onBulkUpdate: (ids: string[], updates: Partial<Slab>) => void
  onBulkDelete: (ids: string[]) => void
  onClearSelection: () => void
  allSlabs: Slab[]
}

export function BulkOperationsToolbar({
  selectedSlabs,
  selectedIds,
  onBulkUpdate,
  onBulkDelete,
  onClearSelection,
  allSlabs,
}: BulkOperationsToolbarProps) {
  const [showBulkEditDialog, setShowBulkEditDialog] = useState(false)
  const [showAllocationDialog, setShowAllocationDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [bulkUpdates, setBulkUpdates] = useState<Partial<Slab>>({})

  if (selectedIds.size === 0) return null

  const handleBulkStatusUpdate = async (status: SlabStatus) => {
    try {
      await batchOperationManager.executeBatchOperation({
        type: "status_update",
        title: `Update ${selectedIds.size} slabs to ${status}`,
        items: Array.from(selectedIds),
        updates: { status },
      })
      onClearSelection()
    } catch (error) {
      console.error("Bulk status update failed:", error)
    }
  }

  const handleBulkLocationUpdate = (location: string) => {
    if (location.trim()) {
      onBulkUpdate(Array.from(selectedIds), { location: location.trim() })
      onClearSelection()
    }
  }

  const handleBulkEdit = async () => {
    if (Object.keys(bulkUpdates).length > 0) {
      try {
        await batchOperationManager.executeBatchOperation({
          type: "bulk_edit",
          title: `Edit ${selectedIds.size} slabs`,
          items: Array.from(selectedIds),
          updates: bulkUpdates,
        })
        setBulkUpdates({})
        setShowBulkEditDialog(false)
        onClearSelection()
      } catch (error) {
        console.error("Bulk edit failed:", error)
      }
    }
  }

  const handleBulkDelete = () => {
    onBulkDelete(Array.from(selectedIds))
    onClearSelection()
  }

  const exportSelectedToCSV = () => {
    const headers = [
      "Serial Number",
      "Material",
      "Color",
      "Length",
      "Width",
      "Thickness",
      "Status",
      "Supplier",
      "Location",
      "Cost",
      "Received Date",
      "Slab Type",
    ]

    const csvContent = [
      headers.join(","),
      ...selectedSlabs.map((slab) =>
        [
          slab.serialNumber,
          slab.material,
          slab.color,
          slab.length,
          slab.width,
          slab.thickness,
          slab.status,
          slab.supplier,
          slab.location || "",
          slab.cost || "",
          slab.receivedDate ? new Date(slab.receivedDate).toLocaleDateString() : "",
          slab.slabType,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `selected-slabs-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const uniqueLocations = Array.from(new Set(allSlabs.map((slab) => slab.location).filter(Boolean)))

  return (
    <>
      <Card className="mb-4">
        <CardContent className="py-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="text-sm">
                {selectedIds.size} selected
              </Badge>
              <Button variant="ghost" size="sm" onClick={onClearSelection}>
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            </div>

            <Separator orientation="vertical" className="hidden sm:block h-6" />

            <div className="flex flex-wrap items-center gap-2">
              {/* Quick Status Updates */}
              <div className="flex items-center gap-1">
                <Label className="text-xs text-muted-foreground">Status:</Label>
                {Object.values(SlabStatus).map((status) => (
                  <Button
                    key={status}
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs bg-transparent"
                    onClick={() => handleBulkStatusUpdate(status)}
                  >
                    <div className={`w-2 h-2 rounded-full mr-1 ${getStatusColor(status).replace("bg-", "bg-")}`} />
                    {status}
                  </Button>
                ))}
              </div>

              <Separator orientation="vertical" className="h-6" />

              {/* Quick Location Update */}
              <Select onValueChange={handleBulkLocationUpdate}>
                <SelectTrigger className="w-32 h-7 text-xs">
                  <SelectValue placeholder="Set Location" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueLocations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                  <SelectItem value="Warehouse A">Warehouse A</SelectItem>
                  <SelectItem value="Warehouse B">Warehouse B</SelectItem>
                  <SelectItem value="Yard">Yard</SelectItem>
                  <SelectItem value="Shop Floor">Shop Floor</SelectItem>
                </SelectContent>
              </Select>

              <Separator orientation="vertical" className="h-6" />

              {/* Advanced Actions */}
              <Dialog open={showBulkEditDialog} onOpenChange={setShowBulkEditDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="h-7 bg-transparent">
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Bulk Edit {selectedIds.size} Slabs</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="bulk-status">Status</Label>
                      <Select
                        value={bulkUpdates.status || ""}
                        onValueChange={(value) => setBulkUpdates((prev) => ({ ...prev, status: value as SlabStatus }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(SlabStatus).map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bulk-location">Location</Label>
                      <Input
                        id="bulk-location"
                        value={bulkUpdates.location || ""}
                        onChange={(e) => setBulkUpdates((prev) => ({ ...prev, location: e.target.value }))}
                        placeholder="Enter location"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bulk-supplier">Supplier</Label>
                      <Input
                        id="bulk-supplier"
                        value={bulkUpdates.supplier || ""}
                        onChange={(e) => setBulkUpdates((prev) => ({ ...prev, supplier: e.target.value }))}
                        placeholder="Enter supplier"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bulk-notes">Notes (will append to existing)</Label>
                      <Input
                        id="bulk-notes"
                        value={bulkUpdates.notes || ""}
                        onChange={(e) => setBulkUpdates((prev) => ({ ...prev, notes: e.target.value }))}
                        placeholder="Add notes"
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowBulkEditDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleBulkEdit} disabled={Object.keys(bulkUpdates).length === 0}>
                        Update {selectedIds.size} Slabs
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Button
                variant="outline"
                size="sm"
                className="h-7 bg-transparent"
                onClick={() => setShowAllocationDialog(true)}
              >
                <Target className="h-3 w-3 mr-1" />
                Allocate
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="h-7 bg-transparent"
                onClick={() => setShowExportDialog(true)}
              >
                <Download className="h-3 w-3 mr-1" />
                Export
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-destructive hover:text-destructive bg-transparent"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete {selectedIds.size} Slabs</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete {selectedIds.size} selected slabs? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleBulkDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete {selectedIds.size} Slabs
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardContent>
      </Card>

      <BatchAllocationDialog
        isOpen={showAllocationDialog}
        onClose={() => setShowAllocationDialog(false)}
        selectedSlabs={selectedSlabs}
        onComplete={() => {
          onClearSelection()
          // Refresh data if needed
        }}
      />

      <BatchExportDialog
        isOpen={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        selectedSlabs={selectedSlabs}
        onComplete={() => {
          onClearSelection()
        }}
      />
    </>
  )
}
