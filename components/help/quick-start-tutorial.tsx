"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Play, ArrowRight, Database, Filter, BarChart3 } from "lucide-react"

interface TutorialStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  action: string
  completed: boolean
}

export function QuickStartTutorial() {
  const [currentStep, setCurrentStep] = useState(0)
  const [steps, setSteps] = useState<TutorialStep[]>([
    {
      id: "load-demo-data",
      title: "Load Demo Data",
      description: "Start with sample inventory data to explore the system",
      icon: <Database className="h-5 w-5" />,
      action: "Load sample slabs to get started",
      completed: false,
    },
    {
      id: "explore-inventory",
      title: "Explore Your Inventory",
      description: "Learn to navigate and search your stone slab inventory",
      icon: <Filter className="h-5 w-5" />,
      action: "View and filter your slabs",
      completed: false,
    },
    {
      id: "add-first-slab",
      title: "Add Your First Slab",
      description: "Create a new slab entry with all the required information",
      icon: <Play className="h-5 w-5" />,
      action: "Add a new slab to inventory",
      completed: false,
    },
    {
      id: "manage-workflow",
      title: "Manage Workflow",
      description: "Update slab status and track through your workflow",
      icon: <ArrowRight className="h-5 w-5" />,
      action: "Change slab status",
      completed: false,
    },
    {
      id: "view-reports",
      title: "View Reports",
      description: "Explore analytics and insights about your inventory",
      icon: <BarChart3 className="h-5 w-5" />,
      action: "Check inventory reports",
      completed: false,
    },
  ])

  const completedSteps = steps.filter((step) => step.completed).length
  const progressPercentage = (completedSteps / steps.length) * 100

  const markStepCompleted = (stepId: string) => {
    setSteps((prev) => prev.map((step) => (step.id === stepId ? { ...step, completed: true } : step)))
  }

  const handleStepAction = (step: TutorialStep) => {
    switch (step.id) {
      case "load-demo-data":
        // Navigate to demo data setup
        window.location.hash = "#demo-data"
        break
      case "explore-inventory":
        // Navigate to slabs page
        window.location.href = "/slabs"
        break
      case "add-first-slab":
        // Navigate to slabs page and trigger add dialog
        window.location.href = "/slabs?action=add"
        break
      case "manage-workflow":
        // Navigate to slabs page
        window.location.href = "/slabs"
        break
      case "view-reports":
        // Navigate to reports page
        window.location.href = "/reports"
        break
    }
    markStepCompleted(step.id)
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Quick Start Tutorial</h2>
        <p className="text-muted-foreground mb-4">
          Get up and running with your stone slab inventory management system
        </p>

        <div className="flex items-center justify-center gap-4 mb-6">
          <Progress value={progressPercentage} className="w-48" />
          <Badge variant={completedSteps === steps.length ? "default" : "secondary"}>
            {completedSteps} of {steps.length} completed
          </Badge>
        </div>
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => (
          <Card
            key={step.id}
            className={`transition-all ${
              step.completed ? "border-green-200 bg-green-50/50" : index === currentStep ? "border-primary" : ""
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${step.completed ? "bg-green-100 text-green-600" : "bg-muted"}`}>
                    {step.completed ? <CheckCircle className="h-5 w-5" /> : step.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {step.title}
                      {step.completed && (
                        <Badge variant="secondary" className="text-xs">
                          Completed
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>{step.description}</CardDescription>
                  </div>
                </div>

                <div className="text-right">
                  <Badge variant="outline" className="text-xs">
                    Step {index + 1}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{step.action}</p>

                {!step.completed && (
                  <Button onClick={() => handleStepAction(step)} size="sm" className="gap-2">
                    {step.id === "load-demo-data"
                      ? "Load Data"
                      : step.id === "explore-inventory"
                        ? "View Slabs"
                        : step.id === "add-first-slab"
                          ? "Add Slab"
                          : step.id === "manage-workflow"
                            ? "Manage Status"
                            : "View Reports"}
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {completedSteps === steps.length && (
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Tutorial Complete!</h3>
            <p className="text-muted-foreground mb-4">
              You've successfully completed the quick start tutorial. You're now ready to manage your stone slab
              inventory efficiently.
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => (window.location.href = "/slabs")}>Go to Inventory</Button>
              <Button variant="outline" onClick={() => (window.location.href = "/reports")}>
                View Reports
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
