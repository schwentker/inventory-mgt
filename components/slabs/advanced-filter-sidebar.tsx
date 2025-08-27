"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X, Search, CalendarIcon, Filter, ChevronDown, ChevronUp, RotateCcw } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import type { Slab, SlabFilters as SlabFiltersType } from "@/types/inventory"
import { SlabStatus, SlabType } from "@/types/inventory"
import { SavedFilters } from "@/components/filters/saved-filters"
import { SmartFilters } from "@/components/filters/smart-filters"

interface AdvancedFilterSidebarProps {
  filters: SlabFiltersType & {
    dateRange?: {
      from?: Date
      to?: Date
    }
    searchTerm?: string
  }
  onFiltersChange: (filters: any) => void
  slabs: Slab[]
  className?: string
}

interface FilterSection {
  key: string
  title: string
  isExpanded: boolean
}

const STORAGE_KEY = "slab-filters"

export function AdvancedFilterSidebar({ filters, onFiltersChange, slabs, className }: AdvancedFilterSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    search: true,
    status: true,
    material: true,
    supplier: false,
    dates: false,
    type: false,
    location: false,
  })

  // Load filters from localStorage on mount
  useEffect(() => {
    const savedFilters = localStorage.getItem(STORAGE_KEY)
    if (savedFilters) {
      try {
        const parsed = JSON.parse(savedFilters)
        // Convert date strings back to Date objects
        if (parsed.dateRange) {
          if (parsed.dateRange.from) parsed.dateRange.from = new Date(parsed.dateRange.from)
          if (parsed.dateRange.to) parsed.dateRange.to = new Date(parsed.dateRange.to)
        }
        onFiltersChange(parsed)
      } catch (error) {
        console.error("Failed to load saved filters:", error)
      }
    }
  }, [])

  // Save filters to localStorage whenever they change
  useEffect(() => {
    if (Object.keys(filters).length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filters))
    }
  }, [filters])

  const uniqueMaterials = Array.from(new Set(slabs.map((slab) => slab.material))).sort()
  const uniqueSuppliers = Array.from(new Set(slabs.map((slab) => slab.supplier))).sort()
  const uniqueColors = Array.from(new Set(slabs.map((slab) => slab.color))).sort()
  const uniqueLocations = Array.from(new Set(slabs.map((slab) => slab.location).filter(Boolean))).sort()

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

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const clearAllFilters = () => {
    onFiltersChange({})
    localStorage.removeItem(STORAGE_KEY)
  }

  const clearFilterSection = (section: keyof SlabFiltersType) => {
    onFiltersChange({
      ...filters,
      [section]: undefined,
    })
  }

  const handleDateRangeChange = (range: { from?: Date; to?: Date } | undefined) => {
    onFiltersChange({
      ...filters,
      dateRange: range,
    })
  }

  const handleSearchChange = (searchTerm: string) => {
    onFiltersChange({
      ...filters,
      searchTerm: searchTerm || undefined,
    })
  }

  const getFilterCount = (filterKey: keyof SlabFiltersType) => {
    const values = filters[filterKey]
    return Array.isArray(values) ? values.length : 0
  }

  const getTotalActiveFilters = () => {
    let count = 0
    Object.entries(filters).forEach(([key, value]) => {
      if (key === "searchTerm" && value) count++
      else if (key === "dateRange" && value && (value.from || value.to)) count++
      else if (Array.isArray(value) && value.length > 0) count++
    })
    return count
  }

  const getItemCount = (filterKey: string, value: string) => {
    return slabs.filter((slab) => {
      switch (filterKey) {
        case "status":
          return slab.status === value
        case "slabType":
          return slab.slabType === value
        case "material":
          return slab.material === value
        case "supplier":
          return slab.supplier === value
        case "color":
          return slab.color === value
        case "location":
          return slab.location === value
        default:
          return false
      }
    }).length
  }

  const FilterSection = ({
    title,
    sectionKey,
    children,
    count = 0,
  }: {
    title: string
    sectionKey: string
    children: React.ReactNode
    count?: number
  }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          className="h-auto p-0 font-medium text-sm"
          onClick={() => toggleSection(sectionKey)}
        >
          <div className="flex items-center gap-2">
            {expandedSections[sectionKey] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            {title}
            {count > 0 && (
              <Badge variant="secondary" className="text-xs">
                {count}
              </Badge>
            )}
          </div>
        </Button>
        {count > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-1"
            onClick={() => clearFilterSection(sectionKey as keyof SlabFiltersType)}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
      {expandedSections[sectionKey] && <div className="pl-6 space-y-2">{children}</div>}
    </div>
  )

  return (
    <Card className={cn("w-80", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <CardTitle className="text-lg">Advanced Filters</CardTitle>
            {getTotalActiveFilters() > 0 && (
              <Badge variant="default" className="text-xs">
                {getTotalActiveFilters()}
              </Badge>
            )}
          </div>
          {getTotalActiveFilters() > 0 && (
            <Button variant="ghost" size="sm" onClick={clearAllFilters}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="space-y-4">
            {/* Smart Filters */}
            <SmartFilters slabs={slabs} onApplyFilter={onFiltersChange} />

            <Separator />

            {/* Saved Filters */}
            <SavedFilters
              currentFilters={filters}
              onApplyFilter={onFiltersChange}
              onSaveFilter={(filter) => {
                // Optional: Show success toast
                console.log("Filter saved:", filter.name)
              }}
            />

            <Separator />

            {/* Search */}
            <FilterSection title="Search" sectionKey="search" count={filters.searchTerm ? 1 : 0}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search slabs..."
                  value={filters.searchTerm || ""}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>
            </FilterSection>

            <Separator />

            {/* Status */}
            <FilterSection title="Status" sectionKey="status" count={getFilterCount("status")}>
              <div className="space-y-2">
                {Object.values(SlabStatus).map((status) => {
                  const count = getItemCount("status", status)
                  const isChecked = filters.status?.includes(status) || false
                  return (
                    <div key={status} className="flex items-center space-x-2">
                      <Checkbox
                        id={`status-${status}`}
                        checked={isChecked}
                        onCheckedChange={() => toggleFilter("status", status)}
                      />
                      <Label htmlFor={`status-${status}`} className="text-sm flex-1 cursor-pointer">
                        {status}
                      </Label>
                      <Badge variant="outline" className="text-xs">
                        {count}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            </FilterSection>

            <Separator />

            {/* Material */}
            <FilterSection title="Material" sectionKey="material" count={getFilterCount("material")}>
              <div className="space-y-2">
                {uniqueMaterials.map((material) => {
                  const count = getItemCount("material", material)
                  const isChecked = filters.material?.includes(material) || false
                  return (
                    <div key={material} className="flex items-center space-x-2">
                      <Checkbox
                        id={`material-${material}`}
                        checked={isChecked}
                        onCheckedChange={() => toggleFilter("material", material)}
                      />
                      <Label htmlFor={`material-${material}`} className="text-sm flex-1 cursor-pointer">
                        {material}
                      </Label>
                      <Badge variant="outline" className="text-xs">
                        {count}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            </FilterSection>

            <Separator />

            {/* Color */}
            <FilterSection title="Color" sectionKey="color" count={getFilterCount("color")}>
              <div className="space-y-2">
                {uniqueColors.map((color) => {
                  const count = getItemCount("color", color)
                  const isChecked = filters.color?.includes(color) || false
                  return (
                    <div key={color} className="flex items-center space-x-2">
                      <Checkbox
                        id={`color-${color}`}
                        checked={isChecked}
                        onCheckedChange={() => toggleFilter("color", color)}
                      />
                      <Label htmlFor={`color-${color}`} className="text-sm flex-1 cursor-pointer">
                        {color}
                      </Label>
                      <Badge variant="outline" className="text-xs">
                        {count}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            </FilterSection>

            <Separator />

            {/* Supplier */}
            <FilterSection title="Supplier" sectionKey="supplier" count={getFilterCount("supplier")}>
              <div className="space-y-2">
                {uniqueSuppliers.map((supplier) => {
                  const count = getItemCount("supplier", supplier)
                  const isChecked = filters.supplier?.includes(supplier) || false
                  return (
                    <div key={supplier} className="flex items-center space-x-2">
                      <Checkbox
                        id={`supplier-${supplier}`}
                        checked={isChecked}
                        onCheckedChange={() => toggleFilter("supplier", supplier)}
                      />
                      <Label htmlFor={`supplier-${supplier}`} className="text-sm flex-1 cursor-pointer">
                        {supplier}
                      </Label>
                      <Badge variant="outline" className="text-xs">
                        {count}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            </FilterSection>

            <Separator />

            {/* Date Range */}
            <FilterSection
              title="Received Date"
              sectionKey="dates"
              count={filters.dateRange && (filters.dateRange.from || filters.dateRange.to) ? 1 : 0}
            >
              <div className="space-y-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !filters.dateRange && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateRange?.from ? (
                        filters.dateRange.to ? (
                          <>
                            {format(filters.dateRange.from, "LLL dd, y")} - {format(filters.dateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(filters.dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={filters.dateRange?.from}
                      selected={filters.dateRange}
                      onSelect={handleDateRangeChange}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </FilterSection>

            <Separator />

            {/* Slab Type */}
            <FilterSection title="Slab Type" sectionKey="type" count={getFilterCount("slabType")}>
              <div className="space-y-2">
                {Object.values(SlabType).map((type) => {
                  const count = getItemCount("slabType", type)
                  const isChecked = filters.slabType?.includes(type) || false
                  return (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`type-${type}`}
                        checked={isChecked}
                        onCheckedChange={() => toggleFilter("slabType", type)}
                      />
                      <Label htmlFor={`type-${type}`} className="text-sm flex-1 cursor-pointer">
                        {type}
                      </Label>
                      <Badge variant="outline" className="text-xs">
                        {count}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            </FilterSection>

            {/* Location */}
            {uniqueLocations.length > 0 && (
              <>
                <Separator />
                <FilterSection title="Location" sectionKey="location" count={getFilterCount("location")}>
                  <div className="space-y-2">
                    {uniqueLocations.map((location) => {
                      const count = getItemCount("location", location)
                      const isChecked = filters.location?.includes(location) || false
                      return (
                        <div key={location} className="flex items-center space-x-2">
                          <Checkbox
                            id={`location-${location}`}
                            checked={isChecked}
                            onCheckedChange={() => toggleFilter("location", location)}
                          />
                          <Label htmlFor={`location-${location}`} className="text-sm flex-1 cursor-pointer">
                            {location}
                          </Label>
                          <Badge variant="outline" className="text-xs">
                            {count}
                          </Badge>
                        </div>
                      )
                    })}
                  </div>
                </FilterSection>
              </>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
