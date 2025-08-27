"use client"

import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Circle, Clock } from "lucide-react"
import type { SlabStatus } from "@/types/inventory"
import { WorkflowEngine, STATUS_METADATA } from "@/lib/workflow"

interface WorkflowProgressProps {
  currentStatus: SlabStatus
  showSteps?: boolean
  compact?: boolean
}

export function WorkflowProgress({ currentStatus, showSteps = true, compact = false }: WorkflowProgressProps) {
  const progress = WorkflowEngine.getWorkflowProgress(currentStatus)
  const currentStepIndex = WorkflowEngine.getWorkflowStepIndex(currentStatus)
  const steps = WorkflowEngine.getWorkflowSteps()
  const statusMeta = STATUS_METADATA[currentStatus]

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <Badge className={`${statusMeta.color} border`}>{statusMeta.label}</Badge>
        <div className="flex-1">
          <Progress value={progress} className="h-2" />
        </div>
        <span className="text-sm text-muted-foreground">{progress}%</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Current Status Badge */}
      <div className="flex items-center justify-between">
        <Badge className={`${statusMeta.color} border text-sm px-3 py-1`}>{statusMeta.label}</Badge>
        <span className="text-sm text-muted-foreground">{progress}% Complete</span>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <Progress value={progress} className="h-3" />
        <p className="text-sm text-muted-foreground">{statusMeta.description}</p>
      </div>

      {/* Workflow Steps */}
      {showSteps && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">Workflow Steps</h4>
          <div className="space-y-2">
            {steps.map((step, index) => {
              const isCompleted = index < currentStepIndex
              const isCurrent = index === currentStepIndex
              const isPending = index > currentStepIndex

              return (
                <div key={step.status} className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : isCurrent ? (
                      <Clock className="h-5 w-5 text-blue-600" />
                    ) : (
                      <Circle className="h-5 w-5 text-gray-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium ${
                        isCompleted ? "text-green-900" : isCurrent ? "text-blue-900" : "text-gray-500"
                      }`}
                    >
                      {step.label}
                    </p>
                    <p
                      className={`text-xs ${
                        isCompleted ? "text-green-600" : isCurrent ? "text-blue-600" : "text-gray-400"
                      }`}
                    >
                      {step.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
