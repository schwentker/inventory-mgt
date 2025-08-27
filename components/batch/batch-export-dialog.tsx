"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Download, FileText, Database, Tag } from "lucide-react"
import type { Slab } from "@/types/inventory"
import { batchOperationManager } from "@/lib/batch-operations"

interface BatchExportDialogProps {
  isOpen: boolean
  onClose: () => void
  selectedSlabs: Slab[]
  onComplete: () => void
}

export function BatchExportDialog({ isOpen, onClose, selectedSlabs, onComplete }: BatchExportDialogProps) {
  const [exportFormat, setExportFormat] = useState<"csv" | "json" | "labels">("csv")
  const [includeImages, setIncludeImages] = useState(false)
  const [includeHistory, setIncludeHistory] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleExport = async () => {
    setIsProcessing(true)

    try {
      const result = await batchOperationManager.executeBatchOperation({
        type: "export",
        title: `Export ${selectedSlabs.length} slabs as ${exportFormat.toUpperCase()}`,
        items: selectedSlabs.map((s) => s.id),
        exportFormat,
      })

      if (result.success && result.results) {
        // Create and download the export file
        let content: string
        let filename: string
        let mimeType: string

        switch (exportFormat) {
          case "csv":
            const headers = [
              "Serial Number",
              "Material",
              "Color",
              "Length",
              "Width",
              "Thickness",
              "Status",
              "Supplier",
              "Location",
              "Cost",
              "Received Date",
              "Slab Type",
            ]
            content = [headers.join(","), ...result.results].join("\n")
            filename = `slabs-export-${new Date().toISOString().split("T")[0]}.csv`
            mimeType = "text/csv"
            break

          case "json":
            content = JSON.stringify(
              {
                exportDate: new Date().toISOString(),
                totalSlabs: selectedSlabs.length,
                slabs: selectedSlabs,
                includeImages,
                includeHistory,
              },
              null,
              2,
            )
            filename = `slabs-export-${new Date().toISOString().split("T")[0]}.json`
            mimeType = "application/json"
            break

          case "labels":
            content = result.results.join("\n")
            filename = `slab-labels-${new Date().toISOString().split("T")[0]}.txt`
            mimeType = "text/plain"
            break

          default:
            throw new Error("Unknown export format")
        }

        // Download the file
        const blob = new Blob([content], { type: mimeType })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = filename
        a.click()
        window.URL.revokeObjectURL(url)

        onComplete()
        onClose()
      }
    } catch (error) {
      console.error("Batch export failed:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const getFormatDescription = (format: string) => {
    switch (format) {
      case "csv":
        return "Comma-separated values file for spreadsheet applications"
      case "json":
        return "JSON format with complete slab data for system integration"
      case "labels":
        return "Printable labels with slab information for physical identification"
      default:
        return ""
    }
  }

  const getFormatIcon = (format: string) => {
    switch (format) {
      case "csv":
        return <FileText className="w-4 h-4" />
      case "json":
        return <Database className="w-4 h-4" />
      case "labels":
        return <Tag className="w-4 h-4" />
      default:
        return <Download className="w-4 h-4" />
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export {selectedSlabs.length} Slabs
          </DialogTitle>
          <DialogDescription>Choose the export format and options for the selected slabs.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Export Format Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Export Format</Label>
            <RadioGroup value={exportFormat} onValueChange={(value) => setExportFormat(value as any)}>
              {(["csv", "json", "labels"] as const).map((format) => (
                <div key={format} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <RadioGroupItem value={format} id={format} className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor={format} className="flex items-center gap-2 font-medium cursor-pointer">
                      {getFormatIcon(format)}
                      {format.toUpperCase()}
                    </Label>
                    <p className="text-xs text-gray-500 mt-1">{getFormatDescription(format)}</p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Export Options */}
          {(exportFormat === "json" || exportFormat === "labels") && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Additional Options</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-images"
                    checked={includeImages}
                    onCheckedChange={(checked) => setIncludeImages(checked as boolean)}
                  />
                  <Label htmlFor="include-images" className="text-sm cursor-pointer">
                    Include slab images (if available)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-history"
                    checked={includeHistory}
                    onCheckedChange={(checked) => setIncludeHistory(checked as boolean)}
                  />
                  <Label htmlFor="include-history" className="text-sm cursor-pointer">
                    Include status change history
                  </Label>
                </div>
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Slabs to export:</span>
              <Badge variant="secondary">{selectedSlabs.length}</Badge>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isProcessing}>
            {isProcessing ? "Exporting..." : `Export ${exportFormat.toUpperCase()}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
