"use client"

import React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Search,
  ShoppingCart,
  Package,
  Warehouse,
  Bookmark,
  CheckCircle,
  Scissors,
  ArrowRight,
  Clock,
} from "lucide-react"
import type { Slab } from "@/types/inventory"
import { WorkflowEngine, STATUS_METADATA } from "@/lib/workflow"

interface WorkflowDiagramProps {
  currentStatus: string
  onStatusChange?: (newStatus: string) => void
  slab?: Slab
  showTransitions?: boolean
  interactive?: boolean
}

const STATUS_ICONS = {
  WANTED: Search,
  ORDERED: ShoppingCart,
  RECEIVED: Package,
  STOCK: Warehouse,
  ALLOCATED: Bookmark,
  CONSUMED: CheckCircle,
  REMNANT: Scissors,
}

export function WorkflowDiagram({
  currentStatus,
  onStatusChange,
  slab,
  showTransitions = true,
  interactive = false,
}: WorkflowDiagramProps) {
  const steps = WorkflowEngine.getWorkflowSteps()
  const currentStepIndex = WorkflowEngine.getWorkflowStepIndex(currentStatus)
  const validNextStatuses = WorkflowEngine.getValidNextStatuses(currentStatus)

  const getStepState = (stepIndex: number) => {
    if (stepIndex < currentStepIndex) return "completed"
    if (stepIndex === currentStepIndex) return "current"
    return "pending"
  }

  const handleStatusTransition = (newStatus: string) => {
    if (onStatusChange && WorkflowEngine.isTransitionAllowed(currentStatus, newStatus)) {
      onStatusChange(newStatus)
    }
  }

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Slab Workflow</h3>
            <Badge className={STATUS_METADATA[currentStatus].color}>{STATUS_METADATA[currentStatus].label}</Badge>
          </div>

          {/* Visual Workflow Diagram */}
          <div className="relative">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const state = getStepState(index)
                const Icon = STATUS_ICONS[step.status]
                const isClickable = interactive && validNextStatuses.includes(step.status)

                return (
                  <React.Fragment key={step.status}>
                    {/* Step Node */}
                    <div className="flex flex-col items-center space-y-2">
                      <div
                        className={`
                          relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-200
                          ${
                            state === "completed"
                              ? "bg-green-100 border-green-500 text-green-700"
                              : state === "current"
                                ? "bg-blue-100 border-blue-500 text-blue-700 ring-4 ring-blue-100"
                                : "bg-gray-100 border-gray-300 text-gray-400"
                          }
                          ${isClickable ? "cursor-pointer hover:scale-110" : ""}
                        `}
                        onClick={() => isClickable && handleStatusTransition(step.status)}
                      >
                        <Icon className="w-5 h-5" />
                        {state === "current" && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                            <Clock className="w-2 h-2 text-white" />
                          </div>
                        )}
                      </div>

                      <div className="text-center">
                        <p
                          className={`text-xs font-medium ${
                            state === "completed"
                              ? "text-green-700"
                              : state === "current"
                                ? "text-blue-700"
                                : "text-gray-500"
                          }`}
                        >
                          {step.label}
                        </p>
                        <p className="text-xs text-gray-400 max-w-20 leading-tight">{step.description}</p>
                      </div>
                    </div>

                    {/* Connector Arrow */}
                    {index < steps.length - 1 && (
                      <div className="flex-1 flex items-center justify-center px-2">
                        <ArrowRight
                          className={`w-4 h-4 ${index < currentStepIndex ? "text-green-500" : "text-gray-300"}`}
                        />
                      </div>
                    )}
                  </React.Fragment>
                )
              })}
            </div>
          </div>

          {/* Current Status Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${STATUS_METADATA[currentStatus].color}`}>
                {React.createElement(STATUS_ICONS[currentStatus], { className: "w-5 h-5" })}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{STATUS_METADATA[currentStatus].label}</h4>
                <p className="text-sm text-gray-600 mt-1">{STATUS_METADATA[currentStatus].description}</p>
                {slab && (
                  <div className="mt-2 text-xs text-gray-500">
                    {currentStatus === "RECEIVED" && slab.receivedDate && (
                      <span>Received: {new Date(slab.receivedDate).toLocaleDateString()}</span>
                    )}
                    {currentStatus === "CONSUMED" && slab.consumedDate && (
                      <span>Consumed: {new Date(slab.consumedDate).toLocaleDateString()}</span>
                    )}
                    {currentStatus === "ALLOCATED" && slab.jobId && <span>Job: {slab.jobId}</span>}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Available Transitions */}
          {showTransitions && validNextStatuses.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-900">Available Actions</h4>
              <div className="flex flex-wrap gap-2">
                {validNextStatuses.map((status) => {
                  const metadata = STATUS_METADATA[status]
                  return (
                    <Button
                      key={status}
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusTransition(status)}
                      className="text-xs"
                      disabled={!interactive}
                    >
                      Move to {metadata.label}
                    </Button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
