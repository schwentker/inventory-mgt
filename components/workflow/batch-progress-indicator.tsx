"use client"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle, Clock, X } from "lucide-react"

export interface BatchOperation {
  id: string
  type: "status_update" | "bulk_edit" | "allocation" | "export" | "import"
  title: string
  total: number
  completed: number
  failed: number
  status: "running" | "completed" | "failed" | "cancelled"
  startTime: Date
  endTime?: Date
  errors?: string[]
}

interface BatchProgressIndicatorProps {
  operations: BatchOperation[]
  onCancel?: (operationId: string) => void
  onDismiss?: (operationId: string) => void
}

export function BatchProgressIndicator({ operations, onCancel, onDismiss }: BatchProgressIndicatorProps) {
  if (operations.length === 0) return null

  const getStatusIcon = (status: BatchOperation["status"]) => {
    switch (status) {
      case "running":
        return <Clock className="w-4 h-4 text-blue-500" />
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "failed":
        return <AlertCircle className="w-4 h-4 text-red-500" />
      case "cancelled":
        return <X className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: BatchOperation["status"]) => {
    switch (status) {
      case "running":
        return "bg-blue-100 text-blue-800 border-blue-300"
      case "completed":
        return "bg-green-100 text-green-800 border-green-300"
      case "failed":
        return "bg-red-100 text-red-800 border-red-300"
      case "cancelled":
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const calculateProgress = (operation: BatchOperation) => {
    return operation.total > 0 ? (operation.completed / operation.total) * 100 : 0
  }

  const formatDuration = (operation: BatchOperation) => {
    const end = operation.endTime || new Date()
    const duration = Math.round((end.getTime() - operation.startTime.getTime()) / 1000)
    return `${duration}s`
  }

  return (
    <div className="fixed bottom-4 right-4 space-y-2 z-50 max-w-sm">
      {operations.map((operation) => (
        <Card key={operation.id} className="shadow-lg border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                {getStatusIcon(operation.status)}
                {operation.title}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(operation.status)} variant="outline">
                  {operation.status}
                </Badge>
                {onDismiss && operation.status !== "running" && (
                  <button onClick={() => onDismiss(operation.id)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {/* Progress Bar */}
              <div className="space-y-1">
                <Progress value={calculateProgress(operation)} className="h-2" />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>
                    {operation.completed} of {operation.total} completed
                  </span>
                  <span>{formatDuration(operation)}</span>
                </div>
              </div>

              {/* Status Details */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-4">
                  {operation.failed > 0 && <span className="text-red-600">{operation.failed} failed</span>}
                  {operation.status === "completed" && <span className="text-green-600">✓ Complete</span>}
                </div>

                {operation.status === "running" && onCancel && (
                  <button
                    onClick={() => onCancel(operation.id)}
                    className="text-red-600 hover:text-red-800 font-medium"
                  >
                    Cancel
                  </button>
                )}
              </div>

              {/* Error Messages */}
              {operation.errors && operation.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded p-2">
                  <p className="text-xs font-medium text-red-800 mb-1">Errors:</p>
                  <ul className="text-xs text-red-700 space-y-1">
                    {operation.errors.slice(0, 3).map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                    {operation.errors.length > 3 && <li>• ... and {operation.errors.length - 3} more</li>}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
