"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { History, Clock, User, Download, Eye, ArrowRight, Plus, Edit, Trash2, RefreshCw } from "lucide-react"
import { AuditService } from "@/lib/audit"
import type { AuditEntry, AuditSummary } from "@/types/audit"

interface SlabHistoryProps {
  slabId: string
  slabSerialNumber?: string
  compact?: boolean
}

export function SlabHistory({ slabId, slabSerialNumber, compact = false }: SlabHistoryProps) {
  const [history, setHistory] = useState<AuditEntry[]>([])
  const [summary, setSummary] = useState<AuditSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showAllEntries, setShowAllEntries] = useState(false)

  useEffect(() => {
    loadHistory()
  }, [slabId])

  const loadHistory = () => {
    setIsLoading(true)
    try {
      const entries = AuditService.getSlabHistory(slabId)
      const auditSummary = AuditService.getSlabAuditSummary(slabId)

      setHistory(entries)
      setSummary(auditSummary)
    } catch (error) {
      console.error("Failed to load slab history:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportHistory = () => {
    try {
      const csvData = AuditService.exportSlabAuditLog(slabId)
      const blob = new Blob([csvData], { type: "text/csv" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `slab-${slabSerialNumber || slabId}-history.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Failed to export history:", error)
    }
  }

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case "CREATE":
        return <Plus className="h-4 w-4 text-green-600" />
      case "UPDATE":
        return <Edit className="h-4 w-4 text-blue-600" />
      case "DELETE":
        return <Trash2 className="h-4 w-4 text-red-600" />
      case "STATUS_CHANGE":
        return <RefreshCw className="h-4 w-4 text-purple-600" />
      case "BULK_UPDATE":
        return <Edit className="h-4 w-4 text-orange-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case "CREATE":
        return "bg-green-100 text-green-800 border-green-300"
      case "UPDATE":
        return "bg-blue-100 text-blue-800 border-blue-300"
      case "DELETE":
        return "bg-red-100 text-red-800 border-red-300"
      case "STATUS_CHANGE":
        return "bg-purple-100 text-purple-800 border-purple-300"
      case "BULK_UPDATE":
        return "bg-orange-100 text-orange-800 border-orange-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const formatActionType = (actionType: string) => {
    return actionType
      .replace("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase())
  }

  if (isLoading) {
    return (
      <Card className={compact ? "h-64" : ""}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!summary || history.length === 0) {
    return (
      <Card className={compact ? "h-64" : ""}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No history available for this slab</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const displayEntries = compact && !showAllEntries ? history.slice(0, 5) : history

  if (compact) {
    return (
      <Card className="h-64">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <History className="h-4 w-4" />
              Recent Activity
            </CardTitle>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Complete History - {slabSerialNumber}</DialogTitle>
                  <DialogDescription>Full audit trail for this slab</DialogDescription>
                </DialogHeader>
                <SlabHistory slabId={slabId} slabSerialNumber={slabSerialNumber} compact={false} />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {displayEntries.map((entry, index) => (
              <div key={entry.id} className="flex items-start gap-2 text-sm">
                <div className="flex-shrink-0 mt-0.5">{getActionIcon(entry.actionType)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`text-xs ${getActionColor(entry.actionType)}`}>
                      {formatActionType(entry.actionType)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {entry.timestamp.toLocaleDateString()} {entry.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  {entry.changes.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {entry.changes.map((change) => change.displayName).join(", ")} updated
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
          {history.length > 5 && !showAllEntries && (
            <Button variant="ghost" size="sm" className="w-full mt-2" onClick={() => setShowAllEntries(true)}>
              Show all {history.length} entries
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Audit Summary
            </CardTitle>
            <Button variant="outline" size="sm" onClick={handleExportHistory}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-600">{summary.totalEntries}</div>
              <div className="text-sm text-muted-foreground">Total Entries</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{summary.statusChanges}</div>
              <div className="text-sm text-muted-foreground">Status Changes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{summary.fieldUpdates}</div>
              <div className="text-sm text-muted-foreground">Field Updates</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium">Last Modified</div>
              <div className="text-sm text-muted-foreground">{summary.lastModified.toLocaleDateString()}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Activity Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {history.map((entry, index) => (
              <div key={entry.id} className="relative">
                {index < history.length - 1 && <div className="absolute left-6 top-12 bottom-0 w-px bg-gray-200"></div>}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                    {getActionIcon(entry.actionType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className={getActionColor(entry.actionType)}>
                        {formatActionType(entry.actionType)}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {entry.timestamp.toLocaleDateString()} at {entry.timestamp.toLocaleTimeString()}
                      </span>
                      {entry.userName && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <User className="h-3 w-3" />
                          {entry.userName}
                        </div>
                      )}
                    </div>

                    {entry.metadata?.reason && <p className="text-sm text-gray-600 mb-2">{entry.metadata.reason}</p>}

                    {entry.changes.length > 0 && (
                      <div className="space-y-2">
                        {entry.changes.map((change, changeIndex) => (
                          <div key={changeIndex} className="flex items-center gap-2 text-sm bg-gray-50 p-2 rounded">
                            <span className="font-medium">{change.displayName}:</span>
                            <span className="text-gray-600">{change.oldValue}</span>
                            <ArrowRight className="h-3 w-3 text-gray-400" />
                            <span className="text-gray-900">{change.newValue}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {entry.metadata?.batchId && (
                      <div className="mt-2">
                        <Badge variant="outline" className="text-xs">
                          Batch: {entry.metadata.batchId.slice(0, 8)}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
