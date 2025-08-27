"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Settings, Save, RotateCcw, Database, Columns, Hash, Ruler, Clock } from "lucide-react"
import { ConfigService } from "@/lib/config"
import type { BusinessRules, SlabColumn } from "@/types/config"
import { SlabStatus } from "@/types/inventory"
import { toast } from "@/hooks/use-toast"

const AVAILABLE_COLUMNS: SlabColumn[] = [
  { key: "serialNumber", label: "Serial Number", sortable: true, filterable: true, isVisible: true },
  { key: "material", label: "Material", sortable: true, filterable: true, isVisible: true },
  { key: "color", label: "Color", sortable: true, filterable: true, isVisible: true },
  { key: "thickness", label: "Thickness", sortable: true, filterable: true, isVisible: true },
  { key: "length", label: "Length", sortable: true, filterable: false, isVisible: true },
  { key: "width", label: "Width", sortable: true, filterable: false, isVisible: true },
  { key: "cost", label: "Cost", sortable: true, filterable: false, isVisible: true },
  { key: "supplier", label: "Supplier", sortable: true, filterable: true, isVisible: true },
  { key: "location", label: "Location", sortable: true, filterable: true, isVisible: true },
  { key: "status", label: "Status", sortable: true, filterable: true, isVisible: true },
  { key: "receivedDate", label: "Received Date", sortable: true, filterable: false, isVisible: true },
  { key: "consumedDate", label: "Consumed Date", sortable: true, filterable: false, isVisible: false },
  { key: "actions", label: "Actions", sortable: false, filterable: false, isVisible: true },
]

const SERIAL_NUMBER_PATTERNS = [
  { value: "YYYY-NNNN", label: "Year-Number (2024-0001)" },
  { value: "MM-YYYY-NNN", label: "Month-Year-Number (01-2024-001)" },
  { value: "YYYYMMDD-NN", label: "Date-Number (20240115-01)" },
  { value: "SL-NNNNNN", label: "Prefix-Number (SL-000001)" },
  { value: "custom", label: "Custom Pattern" },
]

const DATA_RETENTION_OPTIONS = [
  { value: "30", label: "30 days" },
  { value: "90", label: "90 days" },
  { value: "180", label: "6 months" },
  { value: "365", label: "1 year" },
  { value: "730", label: "2 years" },
  { value: "never", label: "Never delete" },
]

export function ApplicationSettings() {
  const [businessRules, setBusinessRules] = useState<BusinessRules>({
    minSlabThickness: 10,
    maxSlabThickness: 100,
    minSlabLength: 100,
    maxSlabLength: 3500,
    minSlabWidth: 100,
    maxSlabWidth: 2000,
    requireSerialNumber: true,
    allowNegativeCost: false,
    autoGenerateSerialNumber: true,
    defaultSlabStatus: SlabStatus.AVAILABLE,
    defaultLocation: "Warehouse A",
  })

  const [columnSettings, setColumnSettings] = useState<SlabColumn[]>(AVAILABLE_COLUMNS)
  const [serialNumberPattern, setSerialNumberPattern] = useState("YYYY-NNNN")
  const [customPattern, setCustomPattern] = useState("")
  const [remnantThreshold, setRemnantThreshold] = useState(500) // sq inches
  const [dataRetentionDays, setDataRetentionDays] = useState("365")
  const [isLoading, setIsLoading] = useState(true)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const config = await ConfigService.getConfig()
      setBusinessRules(config.businessRules)
      setColumnSettings(config.availableColumns || AVAILABLE_COLUMNS)
      setHasChanges(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load application settings",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    try {
      await ConfigService.updateConfig({
        businessRules,
        availableColumns: columnSettings,
        defaultColumns: columnSettings.filter((col) => col.isVisible),
      })

      setHasChanges(false)
      toast({
        title: "Success",
        description: "Application settings saved successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save application settings",
        variant: "destructive",
      })
    }
  }

  const handleResetToDefaults = () => {
    if (!confirm("Are you sure you want to reset all settings to defaults? This action cannot be undone.")) {
      return
    }

    setBusinessRules({
      minSlabThickness: 10,
      maxSlabThickness: 100,
      minSlabLength: 100,
      maxSlabLength: 3500,
      minSlabWidth: 100,
      maxSlabWidth: 2000,
      requireSerialNumber: true,
      allowNegativeCost: false,
      autoGenerateSerialNumber: true,
      defaultSlabStatus: SlabStatus.AVAILABLE,
      defaultLocation: "Warehouse A",
    })
    setColumnSettings(AVAILABLE_COLUMNS)
    setSerialNumberPattern("YYYY-NNNN")
    setCustomPattern("")
    setRemnantThreshold(500)
    setDataRetentionDays("365")
    setHasChanges(true)
  }

  const updateBusinessRule = (key: keyof BusinessRules, value: any) => {
    setBusinessRules((prev) => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const toggleColumnVisibility = (columnKey: string) => {
    setColumnSettings((prev) =>
      prev.map((col) => (col.key === columnKey ? { ...col, isVisible: !col.isVisible } : col)),
    )
    setHasChanges(true)
  }

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading application settings...</div>
  }

  return (
    <div className="space-y-6">
      {/* Business Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Business Rules Configuration
          </CardTitle>
          <CardDescription>Configure validation rules and business logic for slab management</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-medium mb-4 flex items-center gap-2">
              <Ruler className="h-4 w-4" />
              Dimension Limits (mm)
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min-thickness">Min Thickness</Label>
                <Input
                  id="min-thickness"
                  type="number"
                  value={businessRules.minSlabThickness}
                  onChange={(e) => updateBusinessRule("minSlabThickness", Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-thickness">Max Thickness</Label>
                <Input
                  id="max-thickness"
                  type="number"
                  value={businessRules.maxSlabThickness}
                  onChange={(e) => updateBusinessRule("maxSlabThickness", Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="min-length">Min Length</Label>
                <Input
                  id="min-length"
                  type="number"
                  value={businessRules.minSlabLength}
                  onChange={(e) => updateBusinessRule("minSlabLength", Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-length">Max Length</Label>
                <Input
                  id="max-length"
                  type="number"
                  value={businessRules.maxSlabLength}
                  onChange={(e) => updateBusinessRule("maxSlabLength", Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="min-width">Min Width</Label>
                <Input
                  id="min-width"
                  type="number"
                  value={businessRules.minSlabWidth}
                  onChange={(e) => updateBusinessRule("minSlabWidth", Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-width">Max Width</Label>
                <Input
                  id="max-width"
                  type="number"
                  value={businessRules.maxSlabWidth}
                  onChange={(e) => updateBusinessRule("maxSlabWidth", Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-4 flex items-center gap-2">
              <Hash className="h-4 w-4" />
              Serial Number Configuration
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="require-serial"
                    checked={businessRules.requireSerialNumber}
                    onCheckedChange={(checked) => updateBusinessRule("requireSerialNumber", checked)}
                  />
                  <Label htmlFor="require-serial">Require Serial Number</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto-generate"
                    checked={businessRules.autoGenerateSerialNumber}
                    onCheckedChange={(checked) => updateBusinessRule("autoGenerateSerialNumber", checked)}
                  />
                  <Label htmlFor="auto-generate">Auto-Generate Serial Numbers</Label>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="serial-pattern">Serial Number Pattern</Label>
                <Select value={serialNumberPattern} onValueChange={setSerialNumberPattern}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SERIAL_NUMBER_PATTERNS.map((pattern) => (
                      <SelectItem key={pattern.value} value={pattern.value}>
                        {pattern.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {serialNumberPattern === "custom" && (
                  <Input
                    value={customPattern}
                    onChange={(e) => setCustomPattern(e.target.value)}
                    placeholder="Enter custom pattern (e.g., ABC-YYYY-NNN)"
                  />
                )}
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-4">Default Settings</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="default-status">Default Slab Status</Label>
                <Select
                  value={businessRules.defaultSlabStatus}
                  onValueChange={(value) => updateBusinessRule("defaultSlabStatus", value as SlabStatus)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(SlabStatus).map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.replace("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="default-location">Default Location</Label>
                <Input
                  id="default-location"
                  value={businessRules.defaultLocation}
                  onChange={(e) => updateBusinessRule("defaultLocation", e.target.value)}
                />
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex items-center space-x-2">
            <Switch
              id="allow-negative"
              checked={businessRules.allowNegativeCost}
              onCheckedChange={(checked) => updateBusinessRule("allowNegativeCost", checked)}
            />
            <Label htmlFor="allow-negative">Allow Negative Cost Values</Label>
          </div>
        </CardContent>
      </Card>

      {/* Column Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Columns className="h-5 w-5" />
            Column Configuration
          </CardTitle>
          <CardDescription>Configure which columns are visible in the slab list view</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {columnSettings.map((column) => (
              <div key={column.key} className="flex items-center space-x-2">
                <Switch
                  id={`column-${column.key}`}
                  checked={column.isVisible}
                  onCheckedChange={() => toggleColumnVisibility(column.key)}
                />
                <Label htmlFor={`column-${column.key}`} className="flex items-center gap-2">
                  {column.label}
                  {column.sortable && <Badge variant="outline">Sortable</Badge>}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Management Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Management
          </CardTitle>
          <CardDescription>Configure data retention and cleanup policies</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="remnant-threshold">Remnant Size Threshold (sq inches)</Label>
              <Input
                id="remnant-threshold"
                type="number"
                value={remnantThreshold}
                onChange={(e) => setRemnantThreshold(Number(e.target.value))}
              />
              <p className="text-sm text-muted-foreground">Slabs smaller than this size will be marked as remnants</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="data-retention">Data Retention Period</Label>
              <Select value={dataRetentionDays} onValueChange={setDataRetentionDays}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DATA_RETENTION_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">How long to keep consumed slab records</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={handleResetToDefaults}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset to Defaults
        </Button>
        <div className="flex gap-2">
          {hasChanges && (
            <Badge variant="secondary" className="mr-2">
              <Clock className="h-3 w-3 mr-1" />
              Unsaved Changes
            </Badge>
          )}
          <Button onClick={handleSaveSettings} disabled={!hasChanges}>
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  )
}
