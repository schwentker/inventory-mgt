"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, ArrowRight, ArrowLeft, Lightbulb } from "lucide-react"

interface TooltipStep {
  id: string
  target: string
  title: string
  content: string
  position: "top" | "bottom" | "left" | "right"
  action?: "click" | "hover" | "none"
}

interface FeatureTour {
  id: string
  name: string
  description: string
  steps: TooltipStep[]
}

const featureTours: FeatureTour[] = [
  {
    id: "slab-management-basics",
    name: "Slab Management Basics",
    description: "Learn the fundamentals of managing your stone slab inventory",
    steps: [
      {
        id: "add-slab-button",
        target: '[data-tour="add-slab"]',
        title: "Add New Slabs",
        content:
          "Click here to add new slabs to your inventory. You can enter all the details like material, dimensions, and supplier information.",
        position: "bottom",
      },
      {
        id: "search-bar",
        target: '[data-tour="search"]',
        title: "Quick Search",
        content: "Use this search bar to quickly find slabs by serial number, material, color, or any other field.",
        position: "bottom",
      },
      {
        id: "filter-button",
        target: '[data-tour="filters"]',
        title: "Advanced Filtering",
        content: "Access advanced filters to narrow down your inventory by material, status, date ranges, and more.",
        position: "bottom",
      },
      {
        id: "table-view",
        target: '[data-tour="table"]',
        title: "Inventory Table",
        content:
          "This table shows all your slabs. You can sort by any column, select multiple items, and perform bulk operations.",
        position: "top",
      },
    ],
  },
  {
    id: "workflow-management",
    name: "Workflow Management",
    description: "Understand how to track slabs through your workflow",
    steps: [
      {
        id: "status-column",
        target: '[data-tour="status"]',
        title: "Status Tracking",
        content: "Each slab has a status that tracks its journey from Available → Reserved → In Production → Consumed.",
        position: "left",
      },
      {
        id: "workflow-actions",
        target: '[data-tour="workflow-actions"]',
        title: "Status Changes",
        content: "Click on a slab to see available status transitions. Only valid next steps are shown.",
        position: "top",
      },
      {
        id: "bulk-operations",
        target: '[data-tour="bulk-ops"]',
        title: "Bulk Operations",
        content: "Select multiple slabs to perform batch operations like status updates or location changes.",
        position: "bottom",
      },
    ],
  },
]

interface FeatureTooltipsProps {
  tourId?: string
  onComplete?: () => void
}

export function FeatureTooltips({ tourId, onComplete }: FeatureTooltipsProps) {
  const [activeTour, setActiveTour] = useState<FeatureTour | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (tourId) {
      const tour = featureTours.find((t) => t.id === tourId)
      if (tour) {
        setActiveTour(tour)
        setCurrentStep(0)
        setIsVisible(true)
      }
    }
  }, [tourId])

  const handleNext = () => {
    if (activeTour && currentStep < activeTour.steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    setIsVisible(false)
    setActiveTour(null)
    setCurrentStep(0)
    onComplete?.()
  }

  const handleSkip = () => {
    handleComplete()
  }

  if (!activeTour || !isVisible) {
    return null
  }

  const currentStepData = activeTour.steps[currentStep]

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Tooltip */}
      <div className="absolute pointer-events-auto">
        <Card className="w-80 shadow-lg border-2">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground">{activeTour.name}</h3>
                <h4 className="font-semibold">{currentStepData.title}</h4>
              </div>
              <Button variant="ghost" size="sm" onClick={handleSkip} className="h-6 w-6 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <p className="text-sm text-muted-foreground mb-4">{currentStepData.content}</p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {currentStep + 1} of {activeTour.steps.length}
                </Badge>
                <div className="flex gap-1">
                  {activeTour.steps.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full ${index === currentStep ? "bg-primary" : "bg-muted"}`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                {currentStep > 0 && (
                  <Button variant="outline" size="sm" onClick={handlePrevious} className="gap-1 bg-transparent">
                    <ArrowLeft className="h-3 w-3" />
                    Back
                  </Button>
                )}
                <Button size="sm" onClick={handleNext} className="gap-1">
                  {currentStep === activeTour.steps.length - 1 ? "Finish" : "Next"}
                  {currentStep < activeTour.steps.length - 1 && <ArrowRight className="h-3 w-3" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export function TourLauncher() {
  const [selectedTour, setSelectedTour] = useState<string | null>(null)

  return (
    <>
      <div className="flex gap-2">
        {featureTours.map((tour) => (
          <Button key={tour.id} variant="outline" size="sm" onClick={() => setSelectedTour(tour.id)} className="gap-2">
            <Lightbulb className="h-4 w-4" />
            {tour.name}
          </Button>
        ))}
      </div>

      <FeatureTooltips tourId={selectedTour || undefined} onComplete={() => setSelectedTour(null)} />
    </>
  )
}
