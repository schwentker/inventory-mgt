"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { AlertTriangle, ArrowRight } from "lucide-react"
import { type Slab, SlabStatus } from "@/types/inventory"
import { WorkflowEngine, STATUS_METADATA } from "@/lib/workflow"

interface WorkflowActionsProps {
  slab: Slab
  onStatusChange: (newStatus: SlabStatus, additionalData?: Partial<Slab>, reason?: string) => void
  disabled?: boolean
}

export function WorkflowActions({ slab, onStatusChange, disabled = false }: WorkflowActionsProps) {
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    targetStatus: SlabStatus
    requiresData: boolean
  }>({ isOpen: false, targetStatus: SlabStatus.WANTED, requiresData: false })

  const [transitionReason, setTransitionReason] = useState("")
  const [additionalData, setAdditionalData] = useState<Partial<Slab>>({})

  const validNextStatuses = WorkflowEngine.getValidNextStatuses(slab.status)

  const handleStatusTransition = (targetStatus: SlabStatus) => {
    const statusMeta = STATUS_METADATA[targetStatus]
    const requiresData = targetStatus === SlabStatus.RECEIVED || targetStatus === SlabStatus.CONSUMED

    if (statusMeta.requiresConfirmation || requiresData) {
      setConfirmDialog({
        isOpen: true,
        targetStatus,
        requiresData,
      })
      setTransitionReason("")
      setAdditionalData({})
    } else {
      executeTransition(targetStatus)
    }
  }

  const executeTransition = (targetStatus: SlabStatus) => {
    try {
      const validation = WorkflowEngine.validateTransition(slab, targetStatus, additionalData)

      if (!validation.isValid) {
        alert(validation.error)
        return
      }

      onStatusChange(targetStatus, additionalData, transitionReason || undefined)
      setConfirmDialog({ isOpen: false, targetStatus: SlabStatus.WANTED, requiresData: false })
    } catch (error) {
      console.error("Transition failed:", error)
      alert("Failed to update status. Please try again.")
    }
  }

  const formatDate = (date: Date | undefined): string => {
    if (!date) return ""
    return new Date(date).toISOString().split("T")[0]
  }

  const parseDate = (dateString: string): Date | undefined => {
    if (!dateString) return undefined
    return new Date(dateString)
  }

  if (validNextStatuses.length === 0) {
    return (
      <div className="text-center py-4">
        <Badge variant="outline" className="mb-2">
          Terminal Status
        </Badge>
        <p className="text-sm text-muted-foreground">No further status transitions available</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-900">Available Actions</h4>
        <div className="space-y-2">
          {validNextStatuses.map((status) => {
            const statusMeta = STATUS_METADATA[status]
            return (
              <Button
                key={status}
                variant={statusMeta.isDestructive ? "destructive" : "outline"}
                size="sm"
                onClick={() => handleStatusTransition(status)}
                disabled={disabled}
                className="w-full justify-between"
              >
                <span>Move to {statusMeta.label}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            )
          })}
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.isOpen}
        onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, isOpen: open }))}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {STATUS_METADATA[confirmDialog.targetStatus].isDestructive && (
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              )}
              Confirm Status Change
            </DialogTitle>
            <DialogDescription>
              Change slab status from{" "}
              <Badge variant="outline" className="mx-1">
                {STATUS_METADATA[slab.status].label}
              </Badge>
              to{" "}
              <Badge variant="outline" className="mx-1">
                {STATUS_METADATA[confirmDialog.targetStatus].label}
              </Badge>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Additional Data Fields */}
            {confirmDialog.requiresData && (
              <div className="space-y-3">
                {confirmDialog.targetStatus === SlabStatus.RECEIVED && (
                  <div className="space-y-2">
                    <Label htmlFor="receivedDate">Received Date *</Label>
                    <Input
                      id="receivedDate"
                      type="date"
                      value={formatDate(additionalData.receivedDate)}
                      onChange={(e) =>
                        setAdditionalData((prev) => ({
                          ...prev,
                          receivedDate: parseDate(e.target.value),
                        }))
                      }
                    />
                  </div>
                )}

                {confirmDialog.targetStatus === SlabStatus.CONSUMED && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="consumedDate">Consumed Date *</Label>
                      <Input
                        id="consumedDate"
                        type="date"
                        value={formatDate(additionalData.consumedDate)}
                        onChange={(e) =>
                          setAdditionalData((prev) => ({
                            ...prev,
                            consumedDate: parseDate(e.target.value),
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="jobId">Job ID</Label>
                      <Input
                        id="jobId"
                        value={additionalData.jobId || ""}
                        onChange={(e) =>
                          setAdditionalData((prev) => ({
                            ...prev,
                            jobId: e.target.value,
                          }))
                        }
                        placeholder="Optional job reference"
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Reason Field */}
            <div className="space-y-2">
              <Label htmlFor="reason">
                Reason {STATUS_METADATA[confirmDialog.targetStatus].isDestructive ? "*" : "(Optional)"}
              </Label>
              <Textarea
                id="reason"
                value={transitionReason}
                onChange={(e) => setTransitionReason(e.target.value)}
                placeholder="Enter reason for status change..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}>
              Cancel
            </Button>
            <Button
              variant={STATUS_METADATA[confirmDialog.targetStatus].isDestructive ? "destructive" : "default"}
              onClick={() => executeTransition(confirmDialog.targetStatus)}
            >
              Confirm Change
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
