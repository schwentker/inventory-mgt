"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Save, X, Package, Ruler, DollarSign, FileText } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { type Slab, SlabStatus, SlabType, type SlabFormData } from "@/types/inventory"
import type { ConfigMaterial, ConfigSupplier } from "@/types/config"
import { ConfigService } from "@/lib/config"
import { ValidationService } from "@/lib/validation"
import { InventoryRepository } from "@/lib/repository"

interface SlabDetailFormProps {
  slab?: Slab
  onSave: (slab: Slab) => void
  onCancel: () => void
  mode: "create" | "edit"
}

interface FormErrors {
  [key: string]: string
}

export function SlabDetailForm({ slab, onSave, onCancel, mode }: SlabDetailFormProps) {
  const [formData, setFormData] = useState<SlabFormData>({
    serialNumber: "",
    material: "",
    color: "",
    thickness: 20,
    length: 0,
    width: 0,
    supplier: "",
    status: SlabStatus.WANTED,
    slabType: SlabType.FULL,
    jobId: "",
    receivedDate: undefined,
    consumedDate: undefined,
    notes: "",
    cost: 0,
    location: "",
  })

  const [materials, setMaterials] = useState<ConfigMaterial[]>([])
  const [suppliers, setSuppliers] = useState<ConfigSupplier[]>([])
  const [availableColors, setAvailableColors] = useState<string[]>([])
  const [availableThicknesses, setAvailableThicknesses] = useState<number[]>([])
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Load configuration data
  useEffect(() => {
    const loadConfig = async () => {
      setIsLoading(true)
      try {
        const config = await ConfigService.getConfig()
        setMaterials(config.materials.filter((m) => m.isActive))
        setSuppliers(config.suppliers.filter((s) => s.isActive))
      } catch (error) {
        console.error("Failed to load configuration:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadConfig()
  }, [])

  // Initialize form data when slab prop changes
  useEffect(() => {
    if (slab && mode === "edit") {
      setFormData({
        serialNumber: slab.serialNumber,
        material: slab.material,
        color: slab.color,
        thickness: slab.thickness,
        length: slab.length,
        width: slab.width,
        supplier: slab.supplier,
        status: slab.status,
        slabType: slab.slabType,
        jobId: slab.jobId || "",
        receivedDate: slab.receivedDate,
        consumedDate: slab.consumedDate,
        notes: slab.notes || "",
        cost: slab.cost || 0,
        location: slab.location || "",
      })
    }
  }, [slab, mode])

  // Update available colors when material changes
  useEffect(() => {
    if (formData.material) {
      const selectedMaterial = materials.find((m) => m.name === formData.material)
      if (selectedMaterial) {
        setAvailableColors(selectedMaterial.colors)
        setAvailableThicknesses(selectedMaterial.defaultThickness)

        // Reset color if not available for new material
        if (!selectedMaterial.colors.includes(formData.color)) {
          setFormData((prev) => ({ ...prev, color: "" }))
        }

        // Set default thickness if current thickness not available
        if (!selectedMaterial.defaultThickness.includes(formData.thickness)) {
          setFormData((prev) => ({
            ...prev,
            thickness: selectedMaterial.defaultThickness[0] || 20,
          }))
        }
      }
    } else {
      setAvailableColors([])
      setAvailableThicknesses([])
    }
  }, [formData.material, materials])

  const handleInputChange = useCallback(
    (field: keyof SlabFormData, value: any) => {
      setFormData((prev) => ({ ...prev, [field]: value }))

      // Clear error for this field when user starts typing
      if (errors[field]) {
        setErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors[field]
          return newErrors
        })
      }
    },
    [errors],
  )

  const validateForm = async (): Promise<boolean> => {
    const config = await ConfigService.getConfig()
    const validationResult = await ValidationService.validateSlab(formData, config.businessRules)

    if (!validationResult.isValid) {
      const newErrors: FormErrors = {}
      validationResult.errors.forEach((error) => {
        newErrors[error.field] = error.message
      })
      setErrors(newErrors)
      return false
    }

    // Check for unique serial number
    if (mode === "create" || (slab && slab.serialNumber !== formData.serialNumber)) {
      const repository = new InventoryRepository()
      const existingSlab = await repository.getSlabBySerialNumber(formData.serialNumber)
      if (existingSlab) {
        setErrors({ serialNumber: "Serial number already exists" })
        return false
      }
    }

    setErrors({})
    return true
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const isValid = await validateForm()
      if (!isValid) {
        setIsSaving(false)
        return
      }

      const slabData: Slab = {
        id: slab?.id || crypto.randomUUID(),
        ...formData,
        receivedDate: formData.receivedDate ? new Date(formData.receivedDate) : undefined,
        consumedDate: formData.consumedDate ? new Date(formData.consumedDate) : undefined,
      }

      onSave(slabData)
    } catch (error) {
      console.error("Failed to save slab:", error)
      setErrors({ general: "Failed to save slab. Please try again." })
    } finally {
      setIsSaving(false)
    }
  }

  const formatDate = (date: Date | undefined): string => {
    if (!date) return ""
    return new Date(date).toISOString().split("T")[0]
  }

  const parseDate = (dateString: string): Date | undefined => {
    if (!dateString) return undefined
    return new Date(dateString)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading form...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Form Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{mode === "create" ? "Add New Slab" : "Edit Slab"}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === "create" ? "Enter details for the new stone slab" : `Editing slab ${slab?.serialNumber}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onCancel} disabled={isSaving}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save Slab"}
          </Button>
        </div>
      </div>

      {/* General Error */}
      {errors.general && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errors.general}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="serialNumber">Serial Number *</Label>
                <Input
                  id="serialNumber"
                  value={formData.serialNumber}
                  onChange={(e) => handleInputChange("serialNumber", e.target.value)}
                  placeholder="Enter serial number"
                  className={errors.serialNumber ? "border-red-500" : ""}
                />
                {errors.serialNumber && <p className="text-sm text-red-500">{errors.serialNumber}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="slabType">Slab Type *</Label>
                <Select
                  value={formData.slabType}
                  onValueChange={(value) => handleInputChange("slabType", value as SlabType)}
                >
                  <SelectTrigger className={errors.slabType ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select slab type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={SlabType.FULL}>Full Slab</SelectItem>
                    <SelectItem value={SlabType.REMNANT}>Remnant</SelectItem>
                  </SelectContent>
                </Select>
                {errors.slabType && <p className="text-sm text-red-500">{errors.slabType}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="material">Material *</Label>
                <Select value={formData.material} onValueChange={(value) => handleInputChange("material", value)}>
                  <SelectTrigger className={errors.material ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select material" />
                  </SelectTrigger>
                  <SelectContent>
                    {materials.map((material) => (
                      <SelectItem key={material.id} value={material.name}>
                        {material.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.material && <p className="text-sm text-red-500">{errors.material}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Color *</Label>
                <Select
                  value={formData.color}
                  onValueChange={(value) => handleInputChange("color", value)}
                  disabled={!formData.material}
                >
                  <SelectTrigger className={errors.color ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select color" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableColors.map((color) => (
                      <SelectItem key={color} value={color}>
                        {color}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.color && <p className="text-sm text-red-500">{errors.color}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier *</Label>
              <Select value={formData.supplier} onValueChange={(value) => handleInputChange("supplier", value)}>
                <SelectTrigger className={errors.supplier ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.name}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.supplier && <p className="text-sm text-red-500">{errors.supplier}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Status & Workflow */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {formData.status}
              </Badge>
              Status & Workflow
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status">Current Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange("status", value as SlabStatus)}
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
              <Label htmlFor="jobId">Job ID</Label>
              <Input
                id="jobId"
                value={formData.jobId}
                onChange={(e) => handleInputChange("jobId", e.target.value)}
                placeholder="Optional job reference"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                placeholder="Storage location"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dimensions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ruler className="h-5 w-5" />
              Dimensions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="thickness">Thickness (mm) *</Label>
              <Select
                value={formData.thickness.toString()}
                onValueChange={(value) => handleInputChange("thickness", Number.parseInt(value))}
                disabled={!formData.material}
              >
                <SelectTrigger className={errors.thickness ? "border-red-500" : ""}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableThicknesses.map((thickness) => (
                    <SelectItem key={thickness} value={thickness.toString()}>
                      {thickness}mm
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.thickness && <p className="text-sm text-red-500">{errors.thickness}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="length">Length (mm) *</Label>
                <Input
                  id="length"
                  type="number"
                  value={formData.length}
                  onChange={(e) => handleInputChange("length", Number.parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className={errors.length ? "border-red-500" : ""}
                />
                {errors.length && <p className="text-sm text-red-500">{errors.length}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="width">Width (mm) *</Label>
                <Input
                  id="width"
                  type="number"
                  value={formData.width}
                  onChange={(e) => handleInputChange("width", Number.parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className={errors.width ? "border-red-500" : ""}
                />
                {errors.width && <p className="text-sm text-red-500">{errors.width}</p>}
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Area:</strong> {((formData.length * formData.width) / 1000000).toFixed(2)} m²
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Financial & Dates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Financial & Dates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cost">Cost</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                value={formData.cost}
                onChange={(e) => handleInputChange("cost", Number.parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className={errors.cost ? "border-red-500" : ""}
              />
              {errors.cost && <p className="text-sm text-red-500">{errors.cost}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="receivedDate">Received Date</Label>
              <Input
                id="receivedDate"
                type="date"
                value={formatDate(formData.receivedDate)}
                onChange={(e) => handleInputChange("receivedDate", parseDate(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="consumedDate">Consumed Date</Label>
              <Input
                id="consumedDate"
                type="date"
                value={formatDate(formData.consumedDate)}
                onChange={(e) => handleInputChange("consumedDate", parseDate(e.target.value))}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={formData.notes}
            onChange={(e) => handleInputChange("notes", e.target.value)}
            placeholder="Additional notes about this slab..."
            rows={4}
          />
        </CardContent>
      </Card>
    </div>
  )
}
