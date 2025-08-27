"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import {
  Download,
  Upload,
  Database,
  Trash2,
  Shield,
  CheckCircle,
  AlertTriangle,
  FileText,
  HardDrive,
} from "lucide-react"
import { InventoryRepository } from "@/lib/repository"
import { ConfigService } from "@/lib/config"
import { ValidationService } from "@/lib/validation"
import type { StorageSchema } from "@/types/config"
import { toast } from "@/hooks/use-toast"

interface DataIntegrityResult {
  totalSlabs: number
  validSlabs: number
  invalidSlabs: number
  duplicateSerials: string[]
  missingFields: Array<{ slabId: string; field: string }>
  orphanedRecords: number
}

export function DataManagement() {
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [isCheckingIntegrity, setIsCheckingIntegrity] = useState(false)
  const [importData, setImportData] = useState("")
  const [importFile, setImportFile] = useState<File | null>(null)
  const [exportProgress, setExportProgress] = useState(0)
  const [importProgress, setImportProgress] = useState(0)
  const [integrityResult, setIntegrityResult] = useState<DataIntegrityResult | null>(null)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [showClearDialog, setShowClearDialog] = useState(false)
  const [confirmText, setConfirmText] = useState("")

  const repository = new InventoryRepository()

  const handleExportData = async () => {
    try {
      setIsExporting(true)
      setExportProgress(0)

      // Get all data
      setExportProgress(25)
      const slabs = await repository.getSlabs()

      setExportProgress(50)
      const config = await ConfigService.getConfig()

      setExportProgress(75)
      const exportData: StorageSchema = {
        version: "1.0.0",
        data: {
          slabs,
          materials: config.materials.map((m) => ({
            id: m.id,
            name: m.name,
            colors: m.colors,
            category: m.category,
            isActive: m.isActive,
          })),
          suppliers: config.suppliers.map((s) => ({
            id: s.id,
            name: s.name,
            contact: s.contact,
            phone: s.phone,
            email: s.email,
            isActive: s.isActive,
          })),
          config,
        },
        metadata: {
          createdAt: new Date(),
          lastModified: new Date(),
          recordCount: slabs.length,
        },
      }

      setExportProgress(90)
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `inventory-backup-${new Date().toISOString().split("T")[0]}.json`
      a.click()
      URL.revokeObjectURL(url)

      setExportProgress(100)
      toast({
        title: "Success",
        description: "Data exported successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export data",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
      setExportProgress(0)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setImportFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImportData(e.target?.result as string)
      }
      reader.readAsText(file)
    }
  }

  const validateImportData = (data: any): { isValid: boolean; errors: string[] } => {
    const errors: string[] = []

    if (!data.version) errors.push("Missing version information")
    if (!data.data) errors.push("Missing data section")
    if (!data.metadata) errors.push("Missing metadata section")

    if (data.data) {
      if (!Array.isArray(data.data.slabs)) errors.push("Invalid slabs data format")
      if (!Array.isArray(data.data.materials)) errors.push("Invalid materials data format")
      if (!Array.isArray(data.data.suppliers)) errors.push("Invalid suppliers data format")
      if (!data.data.config) errors.push("Missing configuration data")
    }

    return { isValid: errors.length === 0, errors }
  }

  const handleImportData = async () => {
    try {
      setIsImporting(true)
      setImportProgress(0)

      let parsedData: StorageSchema
      try {
        parsedData = JSON.parse(importData)
      } catch (error) {
        throw new Error("Invalid JSON format")
      }

      setImportProgress(20)
      const validation = validateImportData(parsedData)
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(", ")}`)
      }

      setImportProgress(40)
      // Validate individual slabs
      const validationService = new ValidationService()
      const config = await ConfigService.getConfig()

      for (const slab of parsedData.data.slabs) {
        const slabValidation = await validationService.validateSlab(slab, config.businessRules)
        if (!slabValidation.isValid) {
          console.warn(`Slab ${slab.serialNumber} has validation issues:`, slabValidation.errors)
        }
      }

      setImportProgress(60)
      // Import configuration first
      await ConfigService.updateConfig(parsedData.data.config)

      setImportProgress(80)
      // Import slabs
      for (const slab of parsedData.data.slabs) {
        await repository.saveSlab(slab)
      }

      setImportProgress(100)
      setShowImportDialog(false)
      setImportData("")
      setImportFile(null)

      toast({
        title: "Success",
        description: `Imported ${parsedData.data.slabs.length} slabs successfully`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to import data",
        variant: "destructive",
      })
    } finally {
      setIsImporting(false)
      setImportProgress(0)
    }
  }

  const handleDataIntegrityCheck = async () => {
    try {
      setIsCheckingIntegrity(true)
      const slabs = await repository.getSlabs()
      const config = await ConfigService.getConfig()
      const validationService = new ValidationService()

      const result: DataIntegrityResult = {
        totalSlabs: slabs.length,
        validSlabs: 0,
        invalidSlabs: 0,
        duplicateSerials: [],
        missingFields: [],
        orphanedRecords: 0,
      }

      // Check for duplicate serial numbers
      const serialNumbers = new Map<string, number>()
      slabs.forEach((slab) => {
        if (slab.serialNumber) {
          serialNumbers.set(slab.serialNumber, (serialNumbers.get(slab.serialNumber) || 0) + 1)
        }
      })

      result.duplicateSerials = Array.from(serialNumbers.entries())
        .filter(([_, count]) => count > 1)
        .map(([serial, _]) => serial)

      // Validate each slab
      for (const slab of slabs) {
        const validation = await validationService.validateSlab(slab, config.businessRules)
        if (validation.isValid) {
          result.validSlabs++
        } else {
          result.invalidSlabs++
          validation.errors.forEach((error) => {
            result.missingFields.push({ slabId: slab.id, field: error.field })
          })
        }
      }

      setIntegrityResult(result)
      toast({
        title: "Integrity Check Complete",
        description: `Found ${result.invalidSlabs} issues in ${result.totalSlabs} records`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to perform integrity check",
        variant: "destructive",
      })
    } finally {
      setIsCheckingIntegrity(false)
    }
  }

  const handleClearAllData = async () => {
    if (confirmText !== "DELETE ALL DATA") {
      toast({
        title: "Error",
        description: 'Please type "DELETE ALL DATA" to confirm',
        variant: "destructive",
      })
      return
    }

    try {
      // Clear all slabs
      const slabs = await repository.getSlabs()
      for (const slab of slabs) {
        await repository.deleteSlab(slab.id)
      }

      // Reset configuration to defaults
      await ConfigService.resetToDefaults()

      setShowClearDialog(false)
      setConfirmText("")

      toast({
        title: "Success",
        description: "All data has been cleared",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear data",
        variant: "destructive",
      })
    }
  }

  const createBackup = async () => {
    await handleExportData()
  }

  return (
    <div className="space-y-6">
      {/* Export/Import Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Export & Import
          </CardTitle>
          <CardDescription>Export your data for backup or import data from another system</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export Data
              </h4>
              <p className="text-sm text-muted-foreground">
                Export all inventory data, materials, suppliers, and configuration to a JSON file.
              </p>
              <Button onClick={handleExportData} disabled={isExporting} className="w-full">
                {isExporting ? "Exporting..." : "Export All Data"}
              </Button>
              {isExporting && <Progress value={exportProgress} className="w-full" />}
            </div>

            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Import Data
              </h4>
              <p className="text-sm text-muted-foreground">
                Import data from a previously exported JSON file. This will merge with existing data.
              </p>
              <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full bg-transparent">
                    Import Data
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Import Data</DialogTitle>
                    <DialogDescription>
                      Upload a JSON file or paste JSON data to import. This will merge with existing data.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="import-file">Upload JSON File</Label>
                      <Input id="import-file" type="file" accept=".json" onChange={handleFileUpload} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="import-data">Or Paste JSON Data</Label>
                      <Textarea
                        id="import-data"
                        value={importData}
                        onChange={(e) => setImportData(e.target.value)}
                        placeholder="Paste JSON data here..."
                        rows={8}
                      />
                    </div>
                    {isImporting && <Progress value={importProgress} className="w-full" />}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowImportDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleImportData} disabled={isImporting || !importData}>
                      {isImporting ? "Importing..." : "Import Data"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Integrity Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Data Integrity & Validation
          </CardTitle>
          <CardDescription>Check data integrity and validate records for consistency</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Run Integrity Check</h4>
              <p className="text-sm text-muted-foreground">
                Scan all records for duplicates, missing fields, and validation errors.
              </p>
            </div>
            <Button onClick={handleDataIntegrityCheck} disabled={isCheckingIntegrity}>
              {isCheckingIntegrity ? "Checking..." : "Run Check"}
            </Button>
          </div>

          {integrityResult && (
            <div className="space-y-4 p-4 border rounded-lg">
              <h5 className="font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Integrity Check Results
              </h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="font-medium">Total Records</div>
                  <div className="text-2xl font-bold">{integrityResult.totalSlabs}</div>
                </div>
                <div>
                  <div className="font-medium text-green-600">Valid Records</div>
                  <div className="text-2xl font-bold text-green-600">{integrityResult.validSlabs}</div>
                </div>
                <div>
                  <div className="font-medium text-red-600">Invalid Records</div>
                  <div className="text-2xl font-bold text-red-600">{integrityResult.invalidSlabs}</div>
                </div>
                <div>
                  <div className="font-medium text-yellow-600">Duplicate Serials</div>
                  <div className="text-2xl font-bold text-yellow-600">{integrityResult.duplicateSerials.length}</div>
                </div>
              </div>

              {integrityResult.duplicateSerials.length > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Duplicate Serial Numbers Found:</strong> {integrityResult.duplicateSerials.join(", ")}
                  </AlertDescription>
                </Alert>
              )}

              {integrityResult.missingFields.length > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Missing Required Fields:</strong> {integrityResult.missingFields.length} issues found
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Backup & Recovery Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Backup & Recovery
          </CardTitle>
          <CardDescription>Create backups and manage data recovery options</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Create Backup
              </h4>
              <p className="text-sm text-muted-foreground">
                Create a complete backup of all your inventory data for safekeeping.
              </p>
              <Button onClick={createBackup} className="w-full">
                Create Backup Now
              </Button>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2 text-red-600">
                <Trash2 className="h-4 w-4" />
                Danger Zone
              </h4>
              <p className="text-sm text-muted-foreground">
                Permanently delete all data. This action cannot be undone.
              </p>
              <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
                <DialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    Clear All Data
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Clear All Data</DialogTitle>
                    <DialogDescription>
                      This will permanently delete all slabs, materials, suppliers, and configuration data. This action
                      cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Warning:</strong> This will delete all your inventory data permanently. Make sure you
                        have a backup before proceeding.
                      </AlertDescription>
                    </Alert>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-text">
                        Type <strong>"DELETE ALL DATA"</strong> to confirm:
                      </Label>
                      <Input
                        id="confirm-text"
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        placeholder="DELETE ALL DATA"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowClearDialog(false)}>
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleClearAllData}
                      disabled={confirmText !== "DELETE ALL DATA"}
                    >
                      Delete All Data
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
