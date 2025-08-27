"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, Eye } from "lucide-react"
import type { Slab } from "@/types/inventory"
import { getStatusColor, formatCurrency } from "@/lib/utils/inventory"

interface MobileSlabCardProps {
  slab: Slab
  isSelected: boolean
  onSelect: (checked: boolean) => void
  onView: () => void
  onEdit: () => void
  onDelete: () => void
}

export function MobileSlabCard({ slab, isSelected, onSelect, onView, onEdit, onDelete }: MobileSlabCardProps) {
  return (
    <Card className="mb-3">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <Checkbox checked={isSelected} onCheckedChange={onSelect} aria-label={`Select slab ${slab.serialNumber}`} />
            <div>
              <h3 className="font-semibold text-sm">{slab.serialNumber}</h3>
              <p className="text-xs text-muted-foreground">
                {slab.material} - {slab.color}
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onView}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-muted-foreground">Status:</span>
            <div className="mt-1">
              <Badge className={getStatusColor(slab.status)}>{slab.status}</Badge>
            </div>
          </div>
          <div>
            <span className="text-muted-foreground">Thickness:</span>
            <p className="font-medium">{slab.thickness}"</p>
          </div>
          <div>
            <span className="text-muted-foreground">Supplier:</span>
            <p className="font-medium">{slab.supplier}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Cost:</span>
            <p className="font-medium">{slab.cost ? formatCurrency(slab.cost) : "-"}</p>
          </div>
        </div>

        {slab.receivedDate && (
          <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
            Received: {new Date(slab.receivedDate).toLocaleDateString()}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
