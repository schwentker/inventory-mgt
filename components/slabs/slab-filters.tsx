"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Search } from "lucide-react"
import type { Slab, SlabFilters as SlabFiltersType } from "@/types/inventory"
import { SlabStatus, SlabType } from "@/types/inventory"

interface SlabFiltersProps {
  filters: SlabFiltersType
  onFiltersChange: (filters: SlabFiltersType) => void
  slabs: Slab[]
  searchTerm?: string
  onSearchChange?: (searchTerm: string) => void
}

export function SlabFilters({ filters, onFiltersChange, slabs, searchTerm = "", onSearchChange }: SlabFiltersProps) {
  const uniqueMaterials = Array.from(new Set(slabs.map((slab) => slab.material)))
  const uniqueSuppliers = Array.from(new Set(slabs.map((slab) => slab.supplier)))
  const uniqueLocations = Array.from(new Set(slabs.map((slab) => slab.location).filter(Boolean)))

  const toggleFilter = <T extends string>(filterKey: keyof SlabFiltersType, value: T) => {
    const currentValues = (filters[filterKey] as T[]) || []
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value]

    onFiltersChange({
      ...filters,
      [filterKey]: newValues.length > 0 ? newValues : undefined,
    })
  }

  const clearAllFilters = () => {
    onFiltersChange({})
    if (onSearchChange) {
      onSearchChange("")
    }
  }

  const hasActiveFilters =
    Object.values(filters).some((filter) => Array.isArray(filter) && filter.length > 0) || searchTerm.length > 0

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filters & Search</CardTitle>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearAllFilters}>
              <X className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {onSearchChange && (
          <div className="space-y-2">
            <Label htmlFor="search">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search by serial number, material, color, supplier, location, or notes..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            {searchTerm && <p className="text-xs text-muted-foreground">Searching for: "{searchTerm}"</p>}
          </div>
        )}

        {/* Status Filters */}
        <div>
          <h4 className="text-sm font-medium mb-2">Status</h4>
          <div className="flex flex-wrap gap-2">
            {Object.values(SlabStatus).map((status) => {
              const count = slabs.filter((slab) => slab.status === status).length
              return (
                <Badge
                  key={status}
                  variant={filters.status?.includes(status) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleFilter("status", status)}
                >
                  {status} ({count})
                </Badge>
              )
            })}
          </div>
        </div>

        {/* Type Filters */}
        <div>
          <h4 className="text-sm font-medium mb-2">Type</h4>
          <div className="flex flex-wrap gap-2">
            {Object.values(SlabType).map((type) => {
              const count = slabs.filter((slab) => slab.slabType === type).length
              return (
                <Badge
                  key={type}
                  variant={filters.slabType?.includes(type) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleFilter("slabType", type)}
                >
                  {type} ({count})
                </Badge>
              )
            })}
          </div>
        </div>

        {/* Material Filters */}
        <div>
          <h4 className="text-sm font-medium mb-2">Material</h4>
          <div className="flex flex-wrap gap-2">
            {uniqueMaterials.map((material) => {
              const count = slabs.filter((slab) => slab.material === material).length
              return (
                <Badge
                  key={material}
                  variant={filters.material?.includes(material) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleFilter("material", material)}
                >
                  {material} ({count})
                </Badge>
              )
            })}
          </div>
        </div>

        {/* Supplier Filters */}
        <div>
          <h4 className="text-sm font-medium mb-2">Supplier</h4>
          <div className="flex flex-wrap gap-2">
            {uniqueSuppliers.map((supplier) => {
              const count = slabs.filter((slab) => slab.supplier === supplier).length
              return (
                <Badge
                  key={supplier}
                  variant={filters.supplier?.includes(supplier) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleFilter("supplier", supplier)}
                >
                  {supplier} ({count})
                </Badge>
              )
            })}
          </div>
        </div>

        {/* Location Filters */}
        {uniqueLocations.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Location</h4>
            <div className="flex flex-wrap gap-2">
              {uniqueLocations.map((location) => {
                const count = slabs.filter((slab) => slab.location === location).length
                return (
                  <Badge
                    key={location}
                    variant={filters.location?.includes(location) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleFilter("location", location)}
                  >
                    {location} ({count})
                  </Badge>
                )
              })}
            </div>
          </div>
        )}

        {hasActiveFilters && (
          <div className="pt-2 border-t">
            <h4 className="text-sm font-medium mb-2">Active Filters</h4>
            <div className="flex flex-wrap gap-1">
              {searchTerm && (
                <Badge variant="secondary" className="text-xs">
                  Search: {searchTerm}
                </Badge>
              )}
              {Object.entries(filters).map(([key, values]) =>
                Array.isArray(values) && values.length > 0
                  ? values.map((value) => (
                      <Badge key={`${key}-${value}`} variant="secondary" className="text-xs">
                        {key}: {value}
                      </Badge>
                    ))
                  : null,
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
