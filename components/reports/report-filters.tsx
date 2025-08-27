"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Filter, CalendarIcon, Download, FileText, X, RotateCcw, Search } from "lucide-react"
import { useEffect, useState } from "react"
import { format } from "date-fns"
import type { DateRange } from "react-day-picker"
import { InventoryRepository } from "@/lib/repository"
import { SlabConstants } from "@/constants"
import type { Slab, SlabFilters } from "@/types/inventory"

interface ReportFiltersProps {
  onFiltersChange: (filters: ReportFilterState) => void
  onExport: (format: "csv" | "pdf", data: any) => void
  className?: string
}

export interface ReportFilterState {
  dateRange?: DateRange
  materials: string[]
  suppliers: string[]
  statuses: string[]
  locations: string[]
  searchTerm: string
  slabTypes: string[]
}

const initialFilters: ReportFilterState = {
  materials: [],
  suppliers: [],
  statuses: [],
  locations: [],
  searchTerm: "",
  slabTypes: [],
}

export function ReportFilters({ onFiltersChange, onExport, className }: ReportFiltersProps) {
  const [filters, setFilters] = useState<ReportFilterState>(initialFilters)
  const [availableOptions, setAvailableOptions] = useState({
    materials: [] as string[],
    suppliers: [] as string[],
    locations: [] as string[],
  })
  const [filteredData, setFilteredData] = useState<Slab[]>([])
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {
    loadAvailableOptions()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [filters])

  const loadAvailableOptions = async () => {
    try {
      const repository = InventoryRepository.getInstance()
      const result = await repository.getSlabs()

      if (result.success && result.data) {
        const slabs = result.data
        const materials = [...new Set(slabs.map((slab) => slab.material))].sort()
        const suppliers = [...new Set(slabs.map((slab) => slab.supplier))].sort()
        const locations = [...new Set(slabs.map((slab) => slab.location).filter(Boolean))].sort()

        setAvailableOptions({ materials, suppliers, locations })
      }
    } catch (error) {
      console.error("Failed to load filter options:", error)
    }
  }

  const applyFilters = async () => {
    try {
      const repository = InventoryRepository.getInstance()
      const slabFilters: SlabFilters = {
        status: filters.statuses.length > 0 ? filters.statuses : undefined,
        material: filters.materials.length > 0 ? filters.materials : undefined,
        supplier: filters.suppliers.length > 0 ? filters.suppliers : undefined,
        location: filters.locations.length > 0 ? filters.locations : undefined,
        slabType: filters.slabTypes.length > 0 ? filters.slabTypes : undefined,
      }

      const result = await repository.searchSlabs(slabFilters, filters.searchTerm)

      if (result.success && result.data) {
        let filtered = result.data

        // Apply date range filter
        if (filters.dateRange?.from || filters.dateRange?.to) {
          filtered = filtered.filter((slab) => {
            if (!slab.receivedDate) return false
            const slabDate = new Date(slab.receivedDate)
            const fromDate = filters.dateRange?.from
            const toDate = filters.dateRange?.to

            if (fromDate && slabDate < fromDate) return false
            if (toDate && slabDate > toDate) return false
            return true
          })
        }

        setFilteredData(filtered)
        onFiltersChange(filters)
      }
    } catch (error) {
      console.error("Failed to apply filters:", error)
    }
  }

  const updateFilter = <K extends keyof ReportFilterState>(key: K, value: ReportFilterState[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const toggleArrayFilter = (
    key: "materials" | "suppliers" | "statuses" | "locations" | "slabTypes",
    value: string,
  ) => {
    setFilters((prev) => {
      const currentArray = prev[key]
      const newArray = currentArray.includes(value)
        ? currentArray.filter((item) => item !== value)
        : [...currentArray, value]
      return { ...prev, [key]: newArray }
    })
  }

  const clearFilters = () => {
    setFilters(initialFilters)
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (filters.dateRange?.from || filters.dateRange?.to) count++
    if (filters.materials.length > 0) count++
    if (filters.suppliers.length > 0) count++
    if (filters.statuses.length > 0) count++
    if (filters.locations.length > 0) count++
    if (filters.slabTypes.length > 0) count++
    if (filters.searchTerm.trim()) count++
    return count
  }

  const exportData = (format: "csv" | "pdf") => {
    onExport(format, filteredData)
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Report Filters
            {getActiveFilterCount() > 0 && <Badge variant="secondary">{getActiveFilterCount()} active</Badge>}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsCollapsed(!isCollapsed)}>
              {isCollapsed ? "Expand" : "Collapse"}
            </Button>
            <Button variant="outline" size="sm" onClick={clearFilters}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </div>
        </div>
      </CardHeader>

      {!isCollapsed && (
        <CardContent className="space-y-6">
          {/* Search */}
          <div className="space-y-2">
            <Label>Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search slabs..."
                value={filters.searchTerm}
                onChange={(e) => updateFilter("searchTerm", e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <Label>Date Range</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
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
                  onSelect={(range) => updateFilter("dateRange", range)}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Materials */}
            <div className="space-y-2">
              <Label>Materials ({filters.materials.length} selected)</Label>
              <div className="max-h-32 overflow-y-auto space-y-2 border rounded p-2">
                {availableOptions.materials.map((material) => (
                  <div key={material} className="flex items-center space-x-2">
                    <Checkbox
                      id={`material-${material}`}
                      checked={filters.materials.includes(material)}
                      onCheckedChange={() => toggleArrayFilter("materials", material)}
                    />
                    <Label htmlFor={`material-${material}`} className="text-sm">
                      {material}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Suppliers */}
            <div className="space-y-2">
              <Label>Suppliers ({filters.suppliers.length} selected)</Label>
              <div className="max-h-32 overflow-y-auto space-y-2 border rounded p-2">
                {availableOptions.suppliers.map((supplier) => (
                  <div key={supplier} className="flex items-center space-x-2">
                    <Checkbox
                      id={`supplier-${supplier}`}
                      checked={filters.suppliers.includes(supplier)}
                      onCheckedChange={() => toggleArrayFilter("suppliers", supplier)}
                    />
                    <Label htmlFor={`supplier-${supplier}`} className="text-sm">
                      {supplier}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label>Status ({filters.statuses.length} selected)</Label>
              <div className="space-y-2 border rounded p-2">
                {Object.values(SlabConstants.Status).map((status) => (
                  <div key={status} className="flex items-center space-x-2">
                    <Checkbox
                      id={`status-${status}`}
                      checked={filters.statuses.includes(status)}
                      onCheckedChange={() => toggleArrayFilter("statuses", status)}
                    />
                    <Label htmlFor={`status-${status}`} className="text-sm capitalize">
                      {status.replace("_", " ").toLowerCase()}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Locations */}
            <div className="space-y-2">
              <Label>Locations ({filters.locations.length} selected)</Label>
              <div className="max-h-32 overflow-y-auto space-y-2 border rounded p-2">
                {availableOptions.locations.map((location) => (
                  <div key={location} className="flex items-center space-x-2">
                    <Checkbox
                      id={`location-${location}`}
                      checked={filters.locations.includes(location)}
                      onCheckedChange={() => toggleArrayFilter("locations", location)}
                    />
                    <Label htmlFor={`location-${location}`} className="text-sm">
                      {location}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Slab Types */}
          <div className="space-y-2">
            <Label>Slab Types ({filters.slabTypes.length} selected)</Label>
            <div className="flex flex-wrap gap-2">
              {Object.values(SlabConstants.Type).map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={`type-${type}`}
                    checked={filters.slabTypes.includes(type)}
                    onCheckedChange={() => toggleArrayFilter("slabTypes", type)}
                  />
                  <Label htmlFor={`type-${type}`} className="text-sm capitalize">
                    {type.replace("_", " ").toLowerCase()}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Export Options */}
          <div className="space-y-3">
            <Label>Export Filtered Data ({filteredData.length} items)</Label>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => exportData("csv")} className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button variant="outline" onClick={() => exportData("pdf")} className="flex-1">
                <FileText className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>

          {/* Active Filters Summary */}
          {getActiveFilterCount() > 0 && (
            <div className="space-y-2">
              <Label>Active Filters</Label>
              <div className="flex flex-wrap gap-2">
                {filters.dateRange?.from && (
                  <Badge variant="secondary">
                    Date: {format(filters.dateRange.from, "MMM dd")}
                    {filters.dateRange.to && ` - ${format(filters.dateRange.to, "MMM dd")}`}
                    <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => updateFilter("dateRange", undefined)} />
                  </Badge>
                )}
                {filters.searchTerm && (
                  <Badge variant="secondary">
                    Search: {filters.searchTerm}
                    <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => updateFilter("searchTerm", "")} />
                  </Badge>
                )}
                {filters.materials.map((material) => (
                  <Badge key={material} variant="secondary">
                    {material}
                    <X
                      className="h-3 w-3 ml-1 cursor-pointer"
                      onClick={() => toggleArrayFilter("materials", material)}
                    />
                  </Badge>
                ))}
                {filters.suppliers.map((supplier) => (
                  <Badge key={supplier} variant="secondary">
                    {supplier}
                    <X
                      className="h-3 w-3 ml-1 cursor-pointer"
                      onClick={() => toggleArrayFilter("suppliers", supplier)}
                    />
                  </Badge>
                ))}
                {filters.statuses.map((status) => (
                  <Badge key={status} variant="secondary">
                    {status.replace("_", " ")}
                    <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => toggleArrayFilter("statuses", status)} />
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}
