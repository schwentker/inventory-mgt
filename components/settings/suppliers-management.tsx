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
import { Textarea } from "@/components/ui/textarea"
import { Plus, Edit, Trash2, Phone, Mail, TrendingUp, Star } from "lucide-react"
import { InventoryStorage } from "@/lib/storage"
import { InventoryRepository } from "@/lib/repository"
import type { ConfigSupplier } from "@/types/config"
import type { Supplier } from "@/types/inventory"
import { toast } from "@/hooks/use-toast"

interface SupplierFormData {
  name: string
  contact: string
  phone: string
  email: string
  address: string
  website: string
  notes: string
  isActive: boolean
}

interface SupplierMetrics {
  totalSlabs: number
  totalValue: number
  averageCost: number
  lastDelivery: Date | null
  rating: number
}

export function SuppliersManagement() {
  const [suppliers, setSuppliers] = useState<ConfigSupplier[]>([])
  const [supplierMetrics, setSupplierMetrics] = useState<Record<string, SupplierMetrics>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [editingSupplier, setEditingSupplier] = useState<ConfigSupplier | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState<SupplierFormData>({
    name: "",
    contact: "",
    phone: "",
    email: "",
    address: "",
    website: "",
    notes: "",
    isActive: true,
  })

  useEffect(() => {
    loadSuppliers()
  }, [])

  const loadSuppliers = async () => {
    try {
      console.log("[v0] Loading suppliers from InventoryStorage...")
      const storageSuppliers = InventoryStorage.getSuppliers()
      console.log("[v0] Found suppliers in storage:", storageSuppliers.length)

      // Convert Supplier[] to ConfigSupplier[] format for compatibility
      const configSuppliers: ConfigSupplier[] = storageSuppliers.map((supplier: Supplier) => ({
        id: supplier.id,
        name: supplier.name,
        contact: supplier.contact || "",
        phone: supplier.phone || "",
        email: supplier.email || "",
        isActive: supplier.isActive !== false, // Default to true if not specified
      }))

      setSuppliers(configSuppliers)
      await loadSupplierMetrics(configSuppliers)
    } catch (error) {
      console.error("[v0] Error loading suppliers:", error)
      toast({
        title: "Error",
        description: "Failed to load suppliers",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadSupplierMetrics = async (supplierList: ConfigSupplier[]) => {
    try {
      const repository = new InventoryRepository()
      const result = await repository.getSlabs()

      if (!result.success || !result.data) {
        console.error("Failed to load slabs for supplier metrics:", result.error)
        return
      }

      const allSlabs = result.data
      const metrics: Record<string, SupplierMetrics> = {}

      for (const supplier of supplierList) {
        const supplierSlabs = allSlabs.filter((slab) => slab.supplier === supplier.name)

        metrics[supplier.id] = {
          totalSlabs: supplierSlabs.length,
          totalValue: supplierSlabs.reduce((sum, slab) => sum + (slab.cost || 0), 0),
          averageCost:
            supplierSlabs.length > 0
              ? supplierSlabs.reduce((sum, slab) => sum + (slab.cost || 0), 0) / supplierSlabs.length
              : 0,
          lastDelivery:
            supplierSlabs.length > 0
              ? new Date(Math.max(...supplierSlabs.map((slab) => new Date(slab.receivedDate).getTime())))
              : null,
          rating: Math.min(5, Math.max(1, 3 + supplierSlabs.length / 10)), // Simple rating based on volume
        }
      }

      setSupplierMetrics(metrics)
    } catch (error) {
      console.error("Failed to load supplier metrics:", error)
    }
  }

  const handleSaveSupplier = async () => {
    try {
      const currentSuppliers = InventoryStorage.getSuppliers()

      if (editingSupplier) {
        // Update existing supplier
        const updatedSuppliers = currentSuppliers.map((s: Supplier) =>
          s.id === editingSupplier.id
            ? {
                ...s,
                name: formData.name,
                contact: formData.contact,
                phone: formData.phone,
                email: formData.email,
                isActive: formData.isActive,
              }
            : s,
        )
        InventoryStorage.saveSuppliers(updatedSuppliers)
      } else {
        // Add new supplier
        const newSupplier: Supplier = {
          id: `supplier_${Date.now()}`,
          name: formData.name,
          contact: formData.contact,
          phone: formData.phone,
          email: formData.email,
          isActive: formData.isActive,
        }
        InventoryStorage.saveSuppliers([...currentSuppliers, newSupplier])
      }

      await loadSuppliers()
      resetForm()
      setIsDialogOpen(false)

      toast({
        title: "Success",
        description: `Supplier ${editingSupplier ? "updated" : "created"} successfully`,
      })
    } catch (error) {
      console.error("[v0] Error saving supplier:", error)
      toast({
        title: "Error",
        description: "Failed to save supplier",
        variant: "destructive",
      })
    }
  }

  const handleDeleteSupplier = async (supplierId: string) => {
    if (!confirm("Are you sure you want to delete this supplier? This action cannot be undone.")) {
      return
    }

    try {
      const currentSuppliers = InventoryStorage.getSuppliers()
      const updatedSuppliers = currentSuppliers.filter((s: Supplier) => s.id !== supplierId)
      InventoryStorage.saveSuppliers(updatedSuppliers)
      await loadSuppliers()

      toast({
        title: "Success",
        description: "Supplier deleted successfully",
      })
    } catch (error) {
      console.error("[v0] Error deleting supplier:", error)
      toast({
        title: "Error",
        description: "Failed to delete supplier",
        variant: "destructive",
      })
    }
  }

  const handleEditSupplier = (supplier: ConfigSupplier) => {
    setEditingSupplier(supplier)
    setFormData({
      name: supplier.name,
      contact: supplier.contact,
      phone: supplier.phone,
      email: supplier.email,
      address: "",
      website: "",
      notes: "",
      isActive: supplier.isActive,
    })
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setEditingSupplier(null)
    setFormData({
      name: "",
      contact: "",
      phone: "",
      email: "",
      address: "",
      website: "",
      notes: "",
      isActive: true,
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatDate = (date: Date | null) => {
    if (!date) return "Never"
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date)
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
      />
    ))
  }

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading suppliers...</div>
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Suppliers Management</CardTitle>
            <CardDescription>Manage supplier information and track performance metrics</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add Supplier
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingSupplier ? "Edit Supplier" : "Add New Supplier"}</DialogTitle>
                <DialogDescription>Configure supplier contact information and details</DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Company Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Stone Supply Co."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact">Contact Person</Label>
                    <Input
                      id="contact"
                      value={formData.contact}
                      onChange={(e) => setFormData((prev) => ({ ...prev, contact: e.target.value }))}
                      placeholder="e.g., John Smith"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                      placeholder="e.g., (555) 123-4567"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder="e.g., contact@stonesupply.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                    placeholder="e.g., 123 Industrial Blvd, City, State 12345"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => setFormData((prev) => ({ ...prev, website: e.target.value }))}
                    placeholder="e.g., https://www.stonesupply.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes about this supplier..."
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="active"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))}
                  />
                  <Label htmlFor="active">Active Supplier</Label>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveSupplier}>{editingSupplier ? "Update" : "Create"} Supplier</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {suppliers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No suppliers configured. Add your first supplier to get started.
            </div>
          ) : (
            <div className="grid gap-4">
              {suppliers.map((supplier) => {
                const metrics = supplierMetrics[supplier.id] || {
                  totalSlabs: 0,
                  totalValue: 0,
                  averageCost: 0,
                  lastDelivery: null,
                  rating: 0,
                }

                return (
                  <div key={supplier.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{supplier.name}</h3>
                          <Badge variant={supplier.isActive ? "default" : "secondary"}>
                            {supplier.isActive ? "Active" : "Inactive"}
                          </Badge>
                          <div className="flex items-center gap-1">{renderStars(metrics.rating)}</div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Phone className="h-4 w-4" />
                              <span>{supplier.contact}</span>
                            </div>
                            {supplier.phone && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Phone className="h-4 w-4" />
                                <span>{supplier.phone}</span>
                              </div>
                            )}
                            {supplier.email && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Mail className="h-4 w-4" />
                                <span>{supplier.email}</span>
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <TrendingUp className="h-4 w-4 text-green-600" />
                              <span className="font-medium">{metrics.totalSlabs} slabs supplied</span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              <strong>Total Value:</strong> {formatCurrency(metrics.totalValue)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              <strong>Avg Cost:</strong> {formatCurrency(metrics.averageCost)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              <strong>Last Delivery:</strong> {formatDate(metrics.lastDelivery)}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditSupplier(supplier)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteSupplier(supplier.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
