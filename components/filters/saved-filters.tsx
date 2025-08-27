"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Save, BookmarkPlus, MoreVertical, Trash2, Star, StarOff } from "lucide-react"
import type { SlabFilters } from "@/types/inventory"

export interface SavedFilter {
  id: string
  name: string
  description?: string
  filters: SlabFilters & {
    dateRange?: { from?: Date; to?: Date }
    searchTerm?: string
  }
  isDefault?: boolean
  isFavorite?: boolean
  createdAt: Date
  lastUsed?: Date
  useCount: number
}

interface SavedFiltersProps {
  currentFilters: any
  onApplyFilter: (filters: any) => void
  onSaveFilter: (filter: SavedFilter) => void
}

const STORAGE_KEY = "saved-slab-filters"

export function SavedFilters({ currentFilters, onApplyFilter, onSaveFilter }: SavedFiltersProps) {
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [filterName, setFilterName] = useState("")
  const [filterDescription, setFilterDescription] = useState("")

  // Load saved filters from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved).map((filter: any) => ({
          ...filter,
          createdAt: new Date(filter.createdAt),
          lastUsed: filter.lastUsed ? new Date(filter.lastUsed) : undefined,
          filters: {
            ...filter.filters,
            dateRange: filter.filters.dateRange
              ? {
                  from: filter.filters.dateRange.from ? new Date(filter.filters.dateRange.from) : undefined,
                  to: filter.filters.dateRange.to ? new Date(filter.filters.dateRange.to) : undefined,
                }
              : undefined,
          },
        }))
        setSavedFilters(parsed)
      } catch (error) {
        console.error("Failed to load saved filters:", error)
      }
    }
  }, [])

  // Save filters to localStorage
  const saveToStorage = (filters: SavedFilter[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filters))
    setSavedFilters(filters)
  }

  const handleSaveFilter = () => {
    if (!filterName.trim()) return

    const newFilter: SavedFilter = {
      id: Date.now().toString(),
      name: filterName.trim(),
      description: filterDescription.trim() || undefined,
      filters: currentFilters,
      createdAt: new Date(),
      useCount: 0,
    }

    const updatedFilters = [...savedFilters, newFilter]
    saveToStorage(updatedFilters)
    onSaveFilter(newFilter)

    setFilterName("")
    setFilterDescription("")
    setIsDialogOpen(false)
  }

  const handleApplyFilter = (filter: SavedFilter) => {
    // Update usage statistics
    const updatedFilters = savedFilters.map((f) =>
      f.id === filter.id
        ? {
            ...f,
            lastUsed: new Date(),
            useCount: f.useCount + 1,
          }
        : f,
    )
    saveToStorage(updatedFilters)
    onApplyFilter(filter.filters)
  }

  const handleDeleteFilter = (filterId: string) => {
    const updatedFilters = savedFilters.filter((f) => f.id !== filterId)
    saveToStorage(updatedFilters)
  }

  const handleToggleFavorite = (filterId: string) => {
    const updatedFilters = savedFilters.map((f) => (f.id === filterId ? { ...f, isFavorite: !f.isFavorite } : f))
    saveToStorage(updatedFilters)
  }

  const handleSetDefault = (filterId: string) => {
    const updatedFilters = savedFilters.map((f) => ({
      ...f,
      isDefault: f.id === filterId,
    }))
    saveToStorage(updatedFilters)
  }

  const getFilterSummary = (filters: any) => {
    const parts: string[] = []
    if (filters.status?.length) parts.push(`${filters.status.length} status`)
    if (filters.material?.length) parts.push(`${filters.material.length} material`)
    if (filters.supplier?.length) parts.push(`${filters.supplier.length} supplier`)
    if (filters.searchTerm) parts.push("search")
    if (filters.dateRange?.from || filters.dateRange?.to) parts.push("date range")
    return parts.join(", ") || "No filters"
  }

  const hasActiveFilters = () => {
    return Object.values(currentFilters).some((value) => {
      if (Array.isArray(value)) return value.length > 0
      if (typeof value === "object" && value !== null) return Object.keys(value).length > 0
      return Boolean(value)
    })
  }

  // Sort filters: favorites first, then by usage, then by recency
  const sortedFilters = [...savedFilters].sort((a, b) => {
    if (a.isFavorite && !b.isFavorite) return -1
    if (!a.isFavorite && b.isFavorite) return 1
    if (a.useCount !== b.useCount) return b.useCount - a.useCount
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  return (
    <div className="space-y-4">
      {/* Save Current Filter */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" disabled={!hasActiveFilters()} className="w-full bg-transparent">
            <Save className="w-4 h-4 mr-2" />
            Save Current Filter
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Filter</DialogTitle>
            <DialogDescription>Save your current filter combination for quick access later.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="filter-name">Filter Name *</Label>
              <Input
                id="filter-name"
                placeholder="e.g., Available Granite Slabs"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="filter-description">Description</Label>
              <Input
                id="filter-description"
                placeholder="Optional description"
                value={filterDescription}
                onChange={(e) => setFilterDescription(e.target.value)}
              />
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-1">Current filters:</p>
              <p className="text-sm text-gray-600">{getFilterSummary(currentFilters)}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveFilter} disabled={!filterName.trim()}>
              Save Filter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Saved Filters List */}
      {sortedFilters.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BookmarkPlus className="w-4 h-4" />
              Saved Filters ({sortedFilters.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {sortedFilters.map((filter) => (
              <div
                key={filter.id}
                className="flex items-center justify-between p-2 rounded-lg border hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApplyFilter(filter)}
                      className="text-sm font-medium text-left hover:text-blue-600 transition-colors"
                    >
                      {filter.name}
                    </button>
                    {filter.isDefault && <Badge variant="secondary">Default</Badge>}
                    {filter.isFavorite && <Star className="w-3 h-3 text-yellow-500 fill-current" />}
                  </div>
                  {filter.description && <p className="text-xs text-gray-500 mt-1">{filter.description}</p>}
                  <p className="text-xs text-gray-400 mt-1">{getFilterSummary(filter.filters)}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                    <span>Used {filter.useCount} times</span>
                    {filter.lastUsed && <span>• Last used {filter.lastUsed.toLocaleDateString()}</span>}
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleApplyFilter(filter)}>Apply Filter</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleToggleFavorite(filter.id)}>
                      {filter.isFavorite ? (
                        <>
                          <StarOff className="w-4 h-4 mr-2" />
                          Remove from Favorites
                        </>
                      ) : (
                        <>
                          <Star className="w-4 h-4 mr-2" />
                          Add to Favorites
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSetDefault(filter.id)}>
                      {filter.isDefault ? "Remove as Default" : "Set as Default"}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleDeleteFilter(filter.id)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
