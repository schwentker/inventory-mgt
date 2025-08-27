"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  ChevronUp,
  ChevronDown,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  ArrowUpDown,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Grid,
  List,
} from "lucide-react"
import type { Slab } from "@/types/inventory"
import { getStatusColor, formatCurrency } from "@/lib/utils/inventory"
import { SlabDetailDialog } from "./slab-detail-dialog"
import { EditSlabDialog } from "./edit-slab-dialog"
import { MobileSlabCard } from "./mobile-slab-card"
import { useMediaQuery } from "@/hooks/use-mobile"
import { useDebounce } from "@/hooks/use-debounce"
import { SlabCardSkeleton, TableRowSkeleton } from "@/components/ui/loading-skeleton"

interface SlabDataTableProps {
  slabs: Slab[]
  onUpdateSlab: (id: string, updates: Partial<Slab>) => void
  onDeleteSlab: (id: string) => void
  onBulkUpdate?: (ids: string[], updates: Partial<Slab>) => void
  loading?: boolean
}

type SortField = keyof Slab
type SortDirection = "asc" | "desc"

interface SortConfig {
  field: SortField
  direction: SortDirection
}

const ROWS_PER_PAGE_OPTIONS = [25, 50, 100]

export function SlabDataTable({
  slabs,
  onUpdateSlab,
  onDeleteSlab,
  onBulkUpdate,
  loading = false,
}: SlabDataTableProps) {
  const [selectedSlab, setSelectedSlab] = useState<Slab | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: "receivedDate", direction: "desc" })
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [viewMode, setViewMode] = useState<"table" | "cards">("table")
  const [isSearching, setIsSearching] = useState(false)

  const isMobile = useMediaQuery("(max-width: 768px)")
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  const effectiveViewMode = isMobile ? "cards" : viewMode

  const filteredAndSortedSlabs = useMemo(() => {
    setIsSearching(false)
    let filtered = slabs

    if (debouncedSearchTerm) {
      const term = debouncedSearchTerm.toLowerCase()
      filtered = filtered.filter(
        (slab) =>
          slab.material.toLowerCase().includes(term) ||
          slab.color.toLowerCase().includes(term) ||
          slab.serialNumber.toLowerCase().includes(term) ||
          slab.supplier.toLowerCase().includes(term) ||
          slab.status.toLowerCase().includes(term) ||
          slab.slabType.toLowerCase().includes(term) ||
          (slab.location && slab.location.toLowerCase().includes(term)) ||
          (slab.notes && slab.notes.toLowerCase().includes(term)),
      )
    }

    filtered.sort((a, b) => {
      const aValue = a[sortConfig.field]
      const bValue = b[sortConfig.field]

      if (aValue === null || aValue === undefined) return 1
      if (bValue === null || bValue === undefined) return -1

      let comparison = 0
      if (typeof aValue === "string" && typeof bValue === "string") {
        comparison = aValue.localeCompare(bValue)
      } else if (typeof aValue === "number" && typeof bValue === "number") {
        comparison = aValue - bValue
      } else if (aValue instanceof Date && bValue instanceof Date) {
        comparison = aValue.getTime() - bValue.getTime()
      } else {
        comparison = String(aValue).localeCompare(String(bValue))
      }

      return sortConfig.direction === "asc" ? comparison : -comparison
    })

    return filtered
  }, [slabs, debouncedSearchTerm, sortConfig])

  const totalPages = Math.ceil(filteredAndSortedSlabs.length / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const paginatedSlabs = filteredAndSortedSlabs.slice(startIndex, startIndex + rowsPerPage)

  const handleSort = (field: SortField) => {
    setSortConfig((prev) => ({
      field,
      direction: prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }))
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(paginatedSlabs.map((slab) => slab.id)))
    } else {
      setSelectedIds(new Set())
    }
  }

  const handleSelectSlab = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds)
    if (checked) {
      newSelected.add(id)
    } else {
      newSelected.delete(id)
    }
    setSelectedIds(newSelected)
  }

  const handleViewSlab = (slab: Slab) => {
    setSelectedSlab(slab)
    setShowDetailDialog(true)
  }

  const handleEditSlab = (slab: Slab) => {
    setSelectedSlab(slab)
    setShowEditDialog(true)
  }

  const handleUpdateSlab = (updates: Partial<Slab>) => {
    if (selectedSlab) {
      onUpdateSlab(selectedSlab.id, updates)
      setShowEditDialog(false)
      setSelectedSlab(null)
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortConfig.field !== field) {
      return <ArrowUpDown className="h-4 w-4" />
    }
    return sortConfig.direction === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
  }

  const isAllSelected = paginatedSlabs.length > 0 && paginatedSlabs.every((slab) => selectedIds.has(slab.id))
  const isIndeterminate = selectedIds.size > 0 && !isAllSelected

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="h-7 w-48 bg-muted animate-pulse rounded" />
              {!isMobile && (
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 bg-muted animate-pulse rounded" />
                  <div className="h-9 w-9 bg-muted animate-pulse rounded" />
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <div className="relative flex-1 sm:flex-none">
                <div className="h-9 w-full sm:w-64 bg-muted animate-pulse rounded" />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {effectiveViewMode === "cards" ? (
            <div className="space-y-0">
              {Array.from({ length: 6 }).map((_, i) => (
                <SlabCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <div className="h-4 w-4 bg-muted animate-pulse rounded" />
                    </TableHead>
                    {Array.from({ length: 9 }).map((_, i) => (
                      <TableHead key={i}>
                        <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <TableRowSkeleton key={i} />
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <CardTitle className="text-lg sm:text-xl">
                Slab Inventory ({filteredAndSortedSlabs.length} items)
                {isSearching && <span className="text-sm text-muted-foreground ml-2">(searching...)</span>}
              </CardTitle>
              {!isMobile && (
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === "table" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("table")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "cards" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("cards")}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search slabs..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setCurrentPage(1)
                    if (e.target.value !== debouncedSearchTerm) {
                      setIsSearching(true)
                    }
                  }}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              {selectedIds.size > 0 && onBulkUpdate && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    console.log("Bulk update for:", Array.from(selectedIds))
                  }}
                  className="w-full sm:w-auto"
                >
                  Update Selected ({selectedIds.size})
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {effectiveViewMode === "cards" ? (
            <div className="space-y-0">
              {paginatedSlabs.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-muted-foreground">
                    {debouncedSearchTerm ? "No slabs found matching your search" : "No slabs available"}
                  </div>
                </div>
              ) : (
                paginatedSlabs.map((slab) => (
                  <MobileSlabCard
                    key={slab.id}
                    slab={slab}
                    isSelected={selectedIds.has(slab.id)}
                    onSelect={(checked) => handleSelectSlab(slab.id, checked)}
                    onView={() => handleViewSlab(slab)}
                    onEdit={() => handleEditSlab(slab)}
                    onDelete={() => onDeleteSlab(slab.id)}
                  />
                ))
              )}
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={isAllSelected}
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all"
                        {...(isIndeterminate && { "data-state": "indeterminate" })}
                      />
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 data-[state=open]:bg-accent"
                        onClick={() => handleSort("serialNumber")}
                      >
                        Serial Number
                        {getSortIcon("serialNumber")}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 data-[state=open]:bg-accent"
                        onClick={() => handleSort("material")}
                      >
                        Material
                        {getSortIcon("material")}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 data-[state=open]:bg-accent"
                        onClick={() => handleSort("color")}
                      >
                        Color
                        {getSortIcon("color")}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 data-[state=open]:bg-accent"
                        onClick={() => handleSort("thickness")}
                      >
                        Thickness
                        {getSortIcon("thickness")}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 data-[state=open]:bg-accent"
                        onClick={() => handleSort("status")}
                      >
                        Status
                        {getSortIcon("status")}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 data-[state=open]:bg-accent"
                        onClick={() => handleSort("supplier")}
                      >
                        Supplier
                        {getSortIcon("supplier")}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 data-[state=open]:bg-accent"
                        onClick={() => handleSort("receivedDate")}
                      >
                        Received
                        {getSortIcon("receivedDate")}
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedSlabs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8">
                        <div className="text-muted-foreground">
                          {debouncedSearchTerm ? "No slabs found matching your search" : "No slabs available"}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedSlabs.map((slab) => (
                      <TableRow key={slab.id} className="hover:bg-muted/50">
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.has(slab.id)}
                            onCheckedChange={(checked) => handleSelectSlab(slab.id, checked as boolean)}
                            aria-label={`Select slab ${slab.serialNumber}`}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{slab.serialNumber}</TableCell>
                        <TableCell>{slab.material}</TableCell>
                        <TableCell>{slab.color}</TableCell>
                        <TableCell>{slab.thickness}"</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(slab.status)}>{slab.status}</Badge>
                        </TableCell>
                        <TableCell>{slab.supplier}</TableCell>
                        <TableCell>
                          {slab.receivedDate ? new Date(slab.receivedDate).toLocaleDateString() : "-"}
                        </TableCell>
                        <TableCell className="text-right">{slab.cost ? formatCurrency(slab.cost) : "-"}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewSlab(slab)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditSlab(slab)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => onDeleteSlab(slab.id)} className="text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Rows per page:</span>
                <Select
                  value={rowsPerPage.toString()}
                  onValueChange={(value) => {
                    setRowsPerPage(Number(value))
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROWS_PER_PAGE_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option.toString()}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {startIndex + 1}-{Math.min(startIndex + rowsPerPage, filteredAndSortedSlabs.length)} of{" "}
                  {filteredAndSortedSlabs.length}
                </span>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedSlab && (
        <>
          <SlabDetailDialog slab={selectedSlab} open={showDetailDialog} onOpenChange={setShowDetailDialog} />
          <EditSlabDialog
            slab={selectedSlab}
            open={showEditDialog}
            onOpenChange={setShowEditDialog}
            onUpdateSlab={handleUpdateSlab}
          />
        </>
      )}
    </>
  )
}
