"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Edit, Trash2, Upload, Download, X } from "lucide-react"
import { InventoryStorage } from "@/lib/storage"
import type { ConfigMaterial } from "@/types/config"
import type { Material } from "@/types/inventory"
import { toast } from "@/hooks/use-toast"

const MATERIAL_CATEGORIES = ["Natural Stone", "Engineered Stone", "Quartz", "Granite", "Marble", "Quartzite", "Other"]

const DEFAULT_THICKNESSES = [
  { value: 20, label: '20mm (3/4")' },
  { value: 30, label: '30mm (1 1/4")' },
  { value: 40, label: '40mm (1 1/2")' },
  { value: 50, label: '50mm (2")' },
]

interface MaterialFormData {
  name: string
  colors: string[]
  defaultThickness: number[]
  category: string
  isActive: boolean
}

export function MaterialsManagement() {
  const [materials, setMaterials] = useState<ConfigMaterial[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingMaterial, setEditingMaterial] = useState<ConfigMaterial | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState<MaterialFormData>({
    name: "",
    colors: [],
    defaultThickness: [20],
    category: "Natural Stone",
    isActive: true,
  })
  const [newColor, setNewColor] = useState("")
  const [csvData, setCsvData] = useState("")
  const [showImportDialog, setShowImportDialog] = useState(false)

  useEffect(() => {
    loadMaterials()
  }, [])

  const loadMaterials = async () => {
    try {
      console.log("[v0] Loading materials from InventoryStorage...")
      const storageMaterials = InventoryStorage.getMaterials()
      console.log("[v0] Found materials in storage:", storageMaterials.length)

      // Convert Material[] to ConfigMaterial[] format for compatibility
      const configMaterials: ConfigMaterial[] = storageMaterials.map((material: Material) => ({
        id: material.id,
        name: material.name,
        colors: material.colors || [],
        defaultThickness: material.defaultThickness || [20],
        category: material.category || "Natural Stone",
        isActive: material.isActive !== false, // Default to true if not specified
      }))

      setMaterials(configMaterials)
    } catch (error) {
      console.error("[v0] Error loading materials:", error)
      toast({
        title: "Error",
        description: "Failed to load materials",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveMaterial = async () => {
    try {
      const currentMaterials = InventoryStorage.getMaterials()

      if (editingMaterial) {
        // Update existing material
        const updatedMaterials = currentMaterials.map((m: Material) =>
          m.id === editingMaterial.id ? { ...m, ...formData } : m,
        )
        InventoryStorage.saveMaterials(updatedMaterials)
      } else {
        // Add new material
        const newMaterial: Material = {
          id: `material_${Date.now()}`,
          ...formData,
        }
        InventoryStorage.saveMaterials([...currentMaterials, newMaterial])
      }

      await loadMaterials()
      resetForm()
      setIsDialogOpen(false)

      toast({
        title: "Success",
        description: `Material ${editingMaterial ? "updated" : "created"} successfully`,
      })
    } catch (error) {
      console.error("[v0] Error saving material:", error)
      toast({
        title: "Error",
        description: "Failed to save material",
        variant: "destructive",
      })
    }
  }

  const handleDeleteMaterial = async (materialId: string) => {
    if (!confirm("Are you sure you want to delete this material? This action cannot be undone.")) {
      return
    }

    try {
      const currentMaterials = InventoryStorage.getMaterials()
      const updatedMaterials = currentMaterials.filter((m: Material) => m.id !== materialId)
      InventoryStorage.saveMaterials(updatedMaterials)
      await loadMaterials()

      toast({
        title: "Success",
        description: "Material deleted successfully",
      })
    } catch (error) {
      console.error("[v0] Error deleting material:", error)
      toast({
        title: "Error",
        description: "Failed to delete material",
        variant: "destructive",
      })
    }
  }

  const handleEditMaterial = (material: ConfigMaterial) => {
    setEditingMaterial(material)
    setFormData({
      name: material.name,
      colors: material.colors,
      defaultThickness: material.defaultThickness,
      category: material.category,
      isActive: material.isActive,
    })
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setEditingMaterial(null)
    setFormData({
      name: "",
      colors: [],
      defaultThickness: [20],
      category: "Natural Stone",
      isActive: true,
    })
    setNewColor("")
  }

  const addColor = () => {
    if (newColor.trim() && !formData.colors.includes(newColor.trim())) {
      setFormData((prev) => ({
        ...prev,
        colors: [...prev.colors, newColor.trim()],
      }))
      setNewColor("")
    }
  }

  const removeColor = (colorToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.filter((color) => color !== colorToRemove),
    }))
  }

  const toggleThickness = (thickness: number) => {
    setFormData((prev) => ({
      ...prev,
      defaultThickness: prev.defaultThickness.includes(thickness)
        ? prev.defaultThickness.filter((t) => t !== thickness)
        : [...prev.defaultThickness, thickness],
    }))
  }

  const exportMaterials = () => {
    const csvContent = [
      "Name,Category,Colors,Default Thicknesses,Active",
      ...materials.map(
        (m) => `"${m.name}","${m.category}","${m.colors.join(";")}","${m.defaultThickness.join(";")}",${m.isActive}`,
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "materials.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportCSV = async () => {
    try {
      const lines = csvData.trim().split("\n")
      const headers = lines[0].split(",")

      if (headers.length < 5 || !headers.includes("Name")) {
        throw new Error("Invalid CSV format")
      }

      const importedMaterials: Material[] = []

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map((v) => v.replace(/"/g, "").trim())

        if (values.length >= 5) {
          importedMaterials.push({
            id: `material_${Date.now()}_${i}`,
            name: values[0],
            category: values[1] || "Natural Stone",
            colors: values[2] ? values[2].split(";") : [],
            defaultThickness: values[3] ? values[3].split(";").map(Number) : [20],
            isActive: values[4].toLowerCase() === "true",
          })
        }
      }

      const currentMaterials = InventoryStorage.getMaterials()
      InventoryStorage.saveMaterials([...currentMaterials, ...importedMaterials])

      await loadMaterials()
      setShowImportDialog(false)
      setCsvData("")

      toast({
        title: "Success",
        description: `Imported ${importedMaterials.length} materials successfully`,
      })
    } catch (error) {
      console.error("[v0] Error importing materials:", error)
      toast({
        title: "Error",
        description: "Failed to import materials. Please check CSV format.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading materials...</div>
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Materials Management</CardTitle>
            <CardDescription>Manage stone materials, colors, and specifications</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportMaterials}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline" onClick={() => setShowImportDialog(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Import CSV
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Material
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingMaterial ? "Edit Material" : "Add New Material"}</DialogTitle>
                  <DialogDescription>Configure material properties and available options</DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Material Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Carrara Marble"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {MATERIAL_CATEGORIES.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Available Colors</Label>
                    <div className="flex gap-2">
                      <Input
                        value={newColor}
                        onChange={(e) => setNewColor(e.target.value)}
                        placeholder="Add color name"
                        onKeyPress={(e) => e.key === "Enter" && addColor()}
                      />
                      <Button type="button" onClick={addColor}>
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.colors.map((color) => (
                        <Badge key={color} variant="secondary" className="flex items-center gap-1">
                          {color}
                          <X className="h-3 w-3 cursor-pointer" onClick={() => removeColor(color)} />
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Default Thicknesses</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {DEFAULT_THICKNESSES.map((thickness) => (
                        <div key={thickness.value} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`thickness-${thickness.value}`}
                            checked={formData.defaultThickness.includes(thickness.value)}
                            onChange={() => toggleThickness(thickness.value)}
                            className="rounded"
                          />
                          <Label htmlFor={`thickness-${thickness.value}`}>{thickness.label}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="active"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))}
                    />
                    <Label htmlFor="active">Active Material</Label>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveMaterial}>{editingMaterial ? "Update" : "Create"} Material</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {materials.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No materials configured. Add your first material to get started.
            </div>
          ) : (
            <div className="grid gap-4">
              {materials.map((material) => (
                <div key={material.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{material.name}</h3>
                        <Badge variant={material.isActive ? "default" : "secondary"}>
                          {material.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant="outline">{material.category}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        <strong>Colors:</strong>{" "}
                        {material.colors.length > 0 ? material.colors.join(", ") : "No colors defined"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <strong>Default Thicknesses:</strong>{" "}
                        {material.defaultThickness.map((t) => `${t}mm`).join(", ")}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditMaterial(material)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteMaterial(material.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>

      {/* Import CSV Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Materials from CSV</DialogTitle>
            <DialogDescription>
              Paste CSV data with columns: Name, Category, Colors, Default Thicknesses, Active
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={csvData}
              onChange={(e) => setCsvData(e.target.value)}
              placeholder="Name,Category,Colors,Default Thicknesses,Active&#10;Carrara Marble,Marble,White;Grey,20;30,true"
              rows={8}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImportDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleImportCSV}>Import Materials</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
