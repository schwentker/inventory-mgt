"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Zap, Copy, FileText, CheckCircle, Clock, AlertTriangle, Package } from "lucide-react"
import type { Slab } from "@/types/inventory"
import { SlabStatus } from "@/types/inventory"
import { AddSlabDialog } from "./add-slab-dialog"

interface QuickActionsMenuProps {
  onAddSlab: (slab: Omit<Slab, "id">) => void
  onQuickUpdate?: (updates: Partial<Slab>) => void
  recentSlabs?: Slab[]
}

export function QuickActionsMenu({ onAddSlab, onQuickUpdate, recentSlabs = [] }: QuickActionsMenuProps) {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showQuickNoteDialog, setShowQuickNoteDialog] = useState(false)
  const [quickNote, setQuickNote] = useState("")

  const handleQuickStatusUpdate = (status: SlabStatus) => {
    if (onQuickUpdate) {
      onQuickUpdate({ status })
    }
  }

  const handleQuickClone = (slab: Slab) => {
    const { id, serialNumber, receivedDate, ...cloneData } = slab
    const newSerialNumber = `${serialNumber}-COPY-${Date.now().toString().slice(-4)}`
    onAddSlab({
      ...cloneData,
      serialNumber: newSerialNumber,
      status: SlabStatus.AVAILABLE,
      receivedDate: new Date(),
    })
  }

  const handleQuickNote = () => {
    if (quickNote.trim() && onQuickUpdate) {
      onQuickUpdate({
        notes: quickNote.trim(),
        lastModified: new Date(),
      })
      setQuickNote("")
      setShowQuickNoteDialog(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Quick Actions
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Slab
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Zap className="h-4 w-4 mr-2" />
              Quick Status Update
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => handleQuickStatusUpdate(SlabStatus.AVAILABLE)}>
                <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                Mark Available
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleQuickStatusUpdate(SlabStatus.RESERVED)}>
                <Clock className="h-4 w-4 mr-2 text-yellow-600" />
                Mark Reserved
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleQuickStatusUpdate(SlabStatus.SOLD)}>
                <Package className="h-4 w-4 mr-2 text-blue-600" />
                Mark Sold
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleQuickStatusUpdate(SlabStatus.DAMAGED)}>
                <AlertTriangle className="h-4 w-4 mr-2 text-red-600" />
                Mark Damaged
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuItem onClick={() => setShowQuickNoteDialog(true)}>
            <FileText className="h-4 w-4 mr-2" />
            Add Quick Note
          </DropdownMenuItem>

          {recentSlabs.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Copy className="h-4 w-4 mr-2" />
                  Clone Recent Slab
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {recentSlabs.slice(0, 5).map((slab) => (
                    <DropdownMenuItem key={slab.id} onClick={() => handleQuickClone(slab)}>
                      <div className="flex flex-col">
                        <span className="font-medium">{slab.serialNumber}</span>
                        <span className="text-xs text-muted-foreground">
                          {slab.material} - {slab.color}
                        </span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AddSlabDialog open={showAddDialog} onOpenChange={setShowAddDialog} onAddSlab={onAddSlab} />

      <Dialog open={showQuickNoteDialog} onOpenChange={setShowQuickNoteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Quick Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="quick-note">Note</Label>
              <Textarea
                id="quick-note"
                value={quickNote}
                onChange={(e) => setQuickNote(e.target.value)}
                placeholder="Enter a quick note..."
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowQuickNoteDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleQuickNote} disabled={!quickNote.trim()}>
                Add Note
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
