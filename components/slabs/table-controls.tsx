"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Settings, Download, Printer, Eye, EyeOff, FileSpreadsheet, FileText, ImageIcon, RotateCcw } from "lucide-react"
import type { Slab } from "@/types/inventory"
import { formatCurrency } from "@/lib/utils/inventory"

interface TableColumn {
  key: keyof Slab | "actions"
  label: string
  visible: boolean
  required?: boolean
}

interface TableControlsProps {
  columns: TableColumn[]
  onColumnsChange: (columns: TableColumn[]) => void
  slabs: Slab[]
  filteredSlabs: Slab[]
  onPrintView: () => void
  className?: string
}

export function TableControls({
  columns,
  onColumnsChange,
  slabs,
  filteredSlabs,
  onPrintView,
  className,
}: TableControlsProps) {
  const [showColumnDialog, setShowColumnDialog] = useState(false)

  const visibleColumns = columns.filter((col) => col.visible)
  const hiddenColumns = columns.filter((col) => !col.visible && !col.required)

  const toggleColumn = (key: keyof Slab | "actions") => {
    const newColumns = columns.map((col) =>
      col.key === key && !col.required ? { ...col, visible: !col.visible } : col,
    )
    onColumnsChange(newColumns)
  }

  const resetColumns = () => {
    const defaultColumns = columns.map((col) => ({ ...col, visible: true }))
    onColumnsChange(defaultColumns)
  }

  const exportToCSV = (data: Slab[], filename: string) => {
    const visibleColumnKeys = visibleColumns.filter((col) => col.key !== "actions").map((col) => col.key)
    const headers = visibleColumns.filter((col) => col.key !== "actions").map((col) => col.label)

    const csvContent = [
      headers.join(","),
      ...data.map((slab) =>
        visibleColumnKeys
          .map((key) => {
            const value = slab[key as keyof Slab]
            if (value === null || value === undefined) return ""
            if (key === "cost" && typeof value === "number") return value.toString()
            if (key === "receivedDate" && value instanceof Date) return value.toLocaleDateString()
            if (typeof value === "string" && value.includes(",")) return `"${value}"`
            return String(value)
          })
          .join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", filename)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportToJSON = (data: Slab[], filename: string) => {
    const visibleColumnKeys = visibleColumns.filter((col) => col.key !== "actions").map((col) => col.key)
    const exportData = data.map((slab) => {
      const filtered: any = {}
      visibleColumnKeys.forEach((key) => {
        filtered[key] = slab[key as keyof Slab]
      })
      return filtered
    })

    const jsonContent = JSON.stringify(exportData, null, 2)
    const blob = new Blob([jsonContent], { type: "application/json" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", filename)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const generatePrintableHTML = (data: Slab[]) => {
    const visibleColumnKeys = visibleColumns.filter((col) => col.key !== "actions")
    const headers = visibleColumnKeys.map((col) => col.label)

    const tableRows = data
      .map(
        (slab) => `
        <tr>
          ${visibleColumnKeys
            .map((col) => {
              const value = slab[col.key as keyof Slab]
              let displayValue = ""
              if (value === null || value === undefined) displayValue = "-"
              else if (col.key === "cost" && typeof value === "number") displayValue = formatCurrency(value)
              else if (col.key === "receivedDate" && value instanceof Date) displayValue = value.toLocaleDateString()
              else displayValue = String(value)
              return `<td style="padding: 8px; border: 1px solid #ddd;">${displayValue}</td>`
            })
            .join("")}
        </tr>
      `,
      )
      .join("")

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Slab Inventory Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: #f5f5f5; padding: 12px 8px; border: 1px solid #ddd; font-weight: bold; text-align: left; }
            td { padding: 8px; border: 1px solid #ddd; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .summary { margin-bottom: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 5px; }
            .print-date { color: #666; font-size: 12px; margin-top: 20px; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>Slab Inventory Report</h1>
          <div class="summary">
            <p><strong>Total Slabs:</strong> ${data.length}</p>
            <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Visible Columns:</strong> ${headers.join(", ")}</p>
          </div>
          <table>
            <thead>
              <tr>
                ${headers.map((header) => `<th>${header}</th>`).join("")}
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
          <div class="print-date">
            Report generated on ${new Date().toLocaleString()}
          </div>
        </body>
      </html>
    `
  }

  const handlePrintView = () => {
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(generatePrintableHTML(filteredSlabs))
      printWindow.document.close()
      printWindow.focus()
      setTimeout(() => {
        printWindow.print()
      }, 250)
    }
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Column Visibility */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <Settings className="h-4 w-4" />
            Columns
            {hiddenColumns.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {hiddenColumns.length} hidden
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64" align="end">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Column Visibility</h4>
              <Button variant="ghost" size="sm" onClick={resetColumns}>
                <RotateCcw className="h-3 w-3 mr-1" />
                Reset
              </Button>
            </div>
            <Separator />
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {columns.map((column) => (
                <div key={column.key} className="flex items-center space-x-2">
                  <Checkbox
                    id={`column-${column.key}`}
                    checked={column.visible}
                    onCheckedChange={() => toggleColumn(column.key)}
                    disabled={column.required}
                  />
                  <Label
                    htmlFor={`column-${column.key}`}
                    className={`text-sm flex-1 cursor-pointer ${column.required ? "text-muted-foreground" : ""}`}
                  >
                    {column.label}
                    {column.required && <span className="text-xs ml-1">(required)</span>}
                  </Label>
                  {column.visible ? (
                    <Eye className="h-3 w-3 text-green-600" />
                  ) : (
                    <EyeOff className="h-3 w-3 text-muted-foreground" />
                  )}
                </div>
              ))}
            </div>
            <Separator />
            <div className="text-xs text-muted-foreground">
              Showing {visibleColumns.length - 1} of {columns.length - 1} columns
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Export Options */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56" align="end">
          <div className="space-y-2">
            <h4 className="font-medium mb-2">Export Options</h4>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={() => exportToCSV(filteredSlabs, `slab-inventory-${new Date().toISOString().split("T")[0]}.csv`)}
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Export as CSV
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={() =>
                exportToJSON(filteredSlabs, `slab-inventory-${new Date().toISOString().split("T")[0]}.json`)
              }
            >
              <FileText className="h-4 w-4 mr-2" />
              Export as JSON
            </Button>
            <Separator />
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={() => exportToCSV(slabs, `all-slabs-${new Date().toISOString().split("T")[0]}.csv`)}
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Export All (CSV)
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={() => exportToJSON(slabs, `all-slabs-${new Date().toISOString().split("T")[0]}.json`)}
            >
              <FileText className="h-4 w-4 mr-2" />
              Export All (JSON)
            </Button>
            <Separator />
            <div className="text-xs text-muted-foreground px-2 py-1">
              Filtered: {filteredSlabs.length} / {slabs.length} slabs
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Print View */}
      <Button variant="outline" size="sm" className="gap-2 bg-transparent" onClick={handlePrintView}>
        <Printer className="h-4 w-4" />
        Print
      </Button>

      {/* View Summary */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <ImageIcon className="h-4 w-4" />
            Summary
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Inventory Summary</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Total Slabs</Label>
                <div className="text-2xl font-bold">{slabs.length}</div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Filtered Results</Label>
                <div className="text-2xl font-bold">{filteredSlabs.length}</div>
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label className="text-sm font-medium">Status Breakdown</Label>
              <div className="space-y-1">
                {["Available", "Reserved", "Sold", "Damaged"].map((status) => {
                  const count = filteredSlabs.filter((slab) => slab.status === status).length
                  const percentage = filteredSlabs.length > 0 ? ((count / filteredSlabs.length) * 100).toFixed(1) : "0"
                  return (
                    <div key={status} className="flex justify-between text-sm">
                      <span>{status}</span>
                      <span>
                        {count} ({percentage}%)
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label className="text-sm font-medium">Total Value</Label>
              <div className="text-lg font-semibold">
                {formatCurrency(filteredSlabs.reduce((sum, slab) => sum + (slab.cost || 0), 0))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
