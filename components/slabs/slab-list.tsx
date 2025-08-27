"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, Eye } from "lucide-react"
import type { Slab } from "@/types/inventory"
import { getStatusColor, formatDimensions, formatCurrency } from "@/lib/utils/inventory"
import { SlabDetailDialog } from "./slab-detail-dialog"
import { EditSlabDialog } from "./edit-slab-dialog"
import { useState } from "react"

interface SlabListProps {
  slabs: Slab[]
  onUpdateSlab: (id: string, updates: Partial<Slab>) => void
  onDeleteSlab: (id: string) => void
}

export function SlabList({ slabs, onUpdateSlab, onDeleteSlab }: SlabListProps) {
  const [selectedSlab, setSelectedSlab] = useState<Slab | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)

  const handleViewSlab = (slab: Slab) => {
    setSelectedSlab(slab)
    setShowDetailDialog(true)
  }

  const handleEditSlab = (slab: Slab) => {
    setSelectedSlab(slab)
    setShowEditDialog(true)
  }

  const handleUpdateSlab = (updates: Partial<Slab>) => {
    if (selectedSlab) {
      onUpdateSlab(selectedSlab.id, updates)
      setShowEditDialog(false)
      setSelectedSlab(null)
    }
  }

  if (slabs.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">No slabs found matching your criteria</p>
            <p className="text-sm text-muted-foreground">Try adjusting your filters or add a new slab</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {slabs.map((slab) => (
          <Card key={slab.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{slab.material}</CardTitle>
                  <p className="text-sm text-muted-foreground">{slab.color}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleViewSlab(slab)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleEditSlab(slab)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDeleteSlab(slab.id)} className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Serial:</span>
                <span className="text-sm">{slab.serialNumber}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Dimensions:</span>
                <span className="text-sm">{formatDimensions(slab.length, slab.width, slab.thickness)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Supplier:</span>
                <span className="text-sm">{slab.supplier}</span>
              </div>

              {slab.cost && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Cost:</span>
                  <span className="text-sm font-bold">{formatCurrency(slab.cost)}</span>
                </div>
              )}

              {slab.location && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Location:</span>
                  <span className="text-sm">{slab.location}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <Badge className={getStatusColor(slab.status)}>{slab.status}</Badge>
                <Badge variant="outline">{slab.slabType}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedSlab && (
        <>
          <SlabDetailDialog slab={selectedSlab} open={showDetailDialog} onOpenChange={setShowDetailDialog} />
          <EditSlabDialog
            slab={selectedSlab}
            open={showEditDialog}
            onOpenChange={setShowEditDialog}
            onUpdateSlab={handleUpdateSlab}
          />
        </>
      )}
    </>
  )
}
