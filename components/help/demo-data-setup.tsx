"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Database, Download, Trash2, AlertTriangle } from "lucide-react"
import { InventoryStorage } from "@/lib/storage"
import { useToast } from "@/hooks/use-toast"

interface DemoDataset {
  id: string
  name: string
  description: string
  slabCount: number
  features: string[]
  totalValue: string
}

const demoDatasets: DemoDataset[] = [
  {
    id: "comprehensive",
    name: "Comprehensive Stone Inventory",
    description: "Complete dataset with 1200 slabs, 8 months of jobs, realistic suppliers & materials",
    slabCount: 1200,
    totalValue: "$850k",
    features: ["30+ Materials", "15 Suppliers", "48 Jobs", "All Status Types", "8 Months History", "Realistic Pricing"],
  },
]

export function DemoDataSetup() {
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const { toast } = useToast()

  const handleLoadDemoData = async (dataset: DemoDataset) => {
    setIsLoading(true)
    setProgress(0)

    try {
      setProgress(20)

      // Clear existing data first
      InventoryStorage.clear()
      setProgress(40)

      // Load comprehensive demo data
      InventoryStorage.resetWithDemoData()
      setProgress(80)

      setProgress(100)

      toast({
        title: "Demo Data Loaded",
        description: `Successfully loaded comprehensive stone inventory dataset with ${dataset.slabCount} slabs worth ${dataset.totalValue}`,
      })

      // Refresh the page to show new data
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error) {
      console.error("Failed to load demo data:", error)
      toast({
        title: "Error Loading Demo Data",
        description: "Failed to load demo data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setProgress(0)
    }
  }

  const handleClearAllData = async () => {
    if (!confirm("Are you sure you want to clear all inventory data? This cannot be undone.")) {
      return
    }

    setIsLoading(true)
    try {
      InventoryStorage.clear()

      toast({
        title: "Data Cleared",
        description: "All inventory data has been cleared.",
      })

      // Refresh the page
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error) {
      console.error("Failed to clear data:", error)
      toast({
        title: "Error Clearing Data",
        description: "Failed to clear data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Demo Data Setup</h2>
        <p className="text-muted-foreground">
          Load comprehensive sample data to explore the stone inventory management system
        </p>
      </div>

      {isLoading && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 animate-spin" />
                <span className="font-medium">Loading comprehensive demo data...</span>
              </div>
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-muted-foreground">
                {progress < 40
                  ? "Clearing existing data..."
                  : progress < 80
                    ? "Generating stone inventory..."
                    : "Finalizing setup..."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Loading demo data will replace any existing inventory data. The comprehensive dataset includes realistic stone
          materials, suppliers, jobs, and 8 months of transaction history.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4">
        {demoDatasets.map((dataset) => (
          <Card key={dataset.id} className="relative">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{dataset.name}</CardTitle>
                  <CardDescription className="mt-1">{dataset.description}</CardDescription>
                </div>
                <div className="text-right">
                  <Badge variant="secondary" className="mb-1">
                    {dataset.slabCount} slabs
                  </Badge>
                  <div className="text-sm font-medium text-green-600">{dataset.totalValue} value</div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm mb-2">Includes:</h4>
                  <div className="grid grid-cols-2 gap-1">
                    {dataset.features.map((feature) => (
                      <Badge key={feature} variant="outline" className="text-xs justify-center">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button onClick={() => handleLoadDemoData(dataset)} disabled={isLoading} className="w-full gap-2">
                  <Download className="h-4 w-4" />
                  Load Comprehensive Dataset
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Clear All Data
          </CardTitle>
          <CardDescription>Remove all inventory data from the system. This action cannot be undone.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={handleClearAllData} disabled={isLoading} className="gap-2">
            <Trash2 className="h-4 w-4" />
            Clear All Data
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
