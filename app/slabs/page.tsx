"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { SlabDataTable } from "@/components/slabs/slab-data-table"
import { AdvancedFilterSidebar } from "@/components/slabs/advanced-filter-sidebar"
import { BulkOperationsToolbar } from "@/components/slabs/bulk-operations-toolbar"
import { TableControls } from "@/components/slabs/table-controls"
import { QuickActionsMenu } from "@/components/slabs/quick-actions-menu"
import { AddSlabDialog } from "@/components/slabs/add-slab-dialog"
import { InventoryErrorBoundary } from "@/components/error-boundary"
import { WorkflowDiagram } from "@/components/workflow/workflow-diagram"
import { BatchProgressIndicator } from "@/components/workflow/batch-progress-indicator"
import { batchOperationManager } from "@/lib/batch-operations"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { RefreshCw, AlertTriangle, LayoutGrid, Table, SidebarOpen, SidebarClose, Workflow } from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import { InventoryRepository } from "@/lib/repository"
import { ConfigService } from "@/lib/config"
import { MockDataGenerator } from "@/lib/mock-data"
import { ErrorHandler, ErrorType } from "@/lib/error-handler"
import type { Slab, SlabFilters as SlabFiltersType } from "@/types/inventory"
import type { BatchOperation } from "@/components/workflow/batch-progress-indicator"

interface TableColumn {
  key: keyof Slab | "actions"
  label: string
  visible: boolean
  required?: boolean
}

export default function SlabsPage() {
  const [slabs, setSlabs] = useState<Slab[]>([])
  const [filteredSlabs, setFilteredSlabs] = useState<Slab[]>([])
  const [filters, setFilters] = useState<
    SlabFiltersType & {
      dateRange?: { from?: Date; to?: Date }
      searchTerm?: string
      _smartFilter?: string
    }
  >({})
  const [showFilters, setShowFilters] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showWorkflowDialog, setShowWorkflowDialog] = useState(false)
  const [selectedSlabForWorkflow, setSelectedSlabForWorkflow] = useState<Slab | null>(null)
  const [batchOperations, setBatchOperations] = useState<BatchOperation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [repository] = useState(() => InventoryRepository.getInstance())
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [viewMode, setViewMode] = useState<"table" | "grid">("table")
  const [tableColumns, setTableColumns] = useState<TableColumn[]>([
    { key: "serialNumber", label: "Serial Number", visible: true, required: true },
    { key: "material", label: "Material", visible: true },
    { key: "color", label: "Color", visible: true },
    { key: "thickness", label: "Thickness", visible: true },
    { key: "status", label: "Status", visible: true },
    { key: "supplier", label: "Supplier", visible: true },
    { key: "receivedDate", label: "Received", visible: true },
    { key: "cost", label: "Cost", visible: true },
    { key: "location", label: "Location", visible: false },
    { key: "slabType", label: "Type", visible: false },
    { key: "actions", label: "Actions", visible: true, required: true },
  ])

  useEffect(() => {
    const unsubscribe = batchOperationManager.subscribe((operations) => {
      setBatchOperations(operations)
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        await ConfigService.loadConfig()

        const result = await repository.getSlabs()

        if (result.success && result.data) {
          setSlabs(result.data)

          if (result.data.length === 0) {
            const sampleData = MockDataGenerator.generateScenarioData("medium_fabricator")

            for (const slab of sampleData.slabs) {
              await repository.saveSlab(slab)
            }

            const updatedResult = await repository.getSlabs()
            if (updatedResult.success && updatedResult.data) {
              setSlabs(updatedResult.data)
            }
          }
        } else {
          throw new Error(result.error || "Failed to load slabs")
        }
      } catch (err) {
        const error = ErrorHandler.createError(ErrorType.STORAGE, "Failed to load slab data", "SLAB_LOAD_ERROR", {
          error: err,
        })
        setError(error.message)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [repository])

  useEffect(() => {
    const applyFilters = async () => {
      try {
        let filtered = slabs

        if (filters._smartFilter === "high-value-slabs") {
          filtered = filtered.filter((slab) => slab.cost && slab.cost > 1000)
        }

        if (filters.searchTerm) {
          const term = filters.searchTerm.toLowerCase()
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

        Object.entries(filters).forEach(([key, values]) => {
          if (
            key !== "searchTerm" &&
            key !== "dateRange" &&
            key !== "_smartFilter" &&
            Array.isArray(values) &&
            values.length > 0
          ) {
            filtered = filtered.filter((slab) => values.includes(slab[key as keyof Slab] as string))
          }
        })

        if (filters.dateRange && (filters.dateRange.from || filters.dateRange.to)) {
          filtered = filtered.filter((slab) => {
            if (!slab.receivedDate) return false
            const slabDate = new Date(slab.receivedDate)
            if (filters.dateRange!.from && slabDate < filters.dateRange!.from) return false
            if (filters.dateRange!.to && slabDate > filters.dateRange!.to) return false
            return true
          })
        }

        setFilteredSlabs(filtered)
      } catch (err) {
        ErrorHandler.createError(ErrorType.UNKNOWN, "Unexpected error during filtering", "FILTER_ERROR", { error: err })
        setFilteredSlabs(slabs)
      }
    }

    if (slabs.length > 0) {
      applyFilters()
    }
  }, [slabs, filters])

  const handleAddSlab = async (newSlabData: Omit<Slab, "id">) => {
    try {
      const newSlab: Slab = {
        ...newSlabData,
        id: `slab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      }

      const result = await repository.saveSlab(newSlab)

      if (result.success) {
        const updatedResult = await repository.getSlabs()
        if (updatedResult.success && updatedResult.data) {
          setSlabs(updatedResult.data)
        }
        setShowAddDialog(false)
      } else {
        ErrorHandler.createError(ErrorType.STORAGE, result.error || "Failed to add slab", "SLAB_ADD_ERROR")
      }
    } catch (err) {
      ErrorHandler.createError(ErrorType.UNKNOWN, "Unexpected error while adding slab", "ADD_SLAB_ERROR", {
        error: err,
      })
    }
  }

  const handleUpdateSlab = async (id: string, updates: Partial<Slab>) => {
    try {
      const currentSlab = slabs.find((s) => s.id === id)
      if (!currentSlab) {
        throw new Error("Slab not found")
      }

      const updatedSlab = { ...currentSlab, ...updates }
      const result = await repository.saveSlab(updatedSlab)

      if (result.success) {
        const updatedResult = await repository.getSlabs()
        if (updatedResult.success && updatedResult.data) {
          setSlabs(updatedResult.data)
        }
      } else {
        ErrorHandler.createError(ErrorType.STORAGE, result.error || "Failed to update slab", "SLAB_UPDATE_ERROR")
      }
    } catch (err) {
      ErrorHandler.createError(ErrorType.UNKNOWN, "Unexpected error while updating slab", "UPDATE_SLAB_ERROR", {
        error: err,
      })
    }
  }

  const handleDeleteSlab = async (id: string) => {
    try {
      const result = await repository.deleteSlab(id)

      if (result.success) {
        const updatedResult = await repository.getSlabs()
        if (updatedResult.success && updatedResult.data) {
          setSlabs(updatedResult.data)
        }
      } else {
        ErrorHandler.createError(ErrorType.STORAGE, result.error || "Failed to delete slab", "SLAB_DELETE_ERROR")
      }
    } catch (err) {
      ErrorHandler.createError(ErrorType.UNKNOWN, "Unexpected error while deleting slab", "DELETE_SLAB_ERROR", {
        error: err,
      })
    }
  }

  const handleExport = async () => {
    try {
      const result = await repository.exportData()

      if (result.success && result.data) {
        const dataStr = JSON.stringify(result.data, null, 2)
        const dataBlob = new Blob([dataStr], { type: "application/json" })
        const url = URL.createObjectURL(dataBlob)

        const link = document.createElement("a")
        link.href = url
        link.download = `inventory-export-${new Date().toISOString().split("T")[0]}.json`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      } else {
        ErrorHandler.createError(ErrorType.STORAGE, result.error || "Failed to export data", "EXPORT_ERROR")
      }
    } catch (err) {
      ErrorHandler.createError(ErrorType.UNKNOWN, "Unexpected error during export", "EXPORT_ERROR", { error: err })
    }
  }

  const handleRetry = () => {
    window.location.reload()
  }

  const handleBulkUpdate = async (ids: string[], updates: Partial<Slab>) => {
    try {
      const result = await repository.bulkUpdateStatus(ids, updates.status!)
      if (result.success) {
        const updatedResult = await repository.getSlabs()
        if (updatedResult.success && updatedResult.data) {
          setSlabs(updatedResult.data)
        }
        setSelectedIds(new Set())
      } else {
        ErrorHandler.createError(ErrorType.STORAGE, result.error || "Failed to bulk update slabs", "BULK_UPDATE_ERROR")
      }
    } catch (err) {
      ErrorHandler.createError(ErrorType.UNKNOWN, "Unexpected error during bulk update", "BULK_UPDATE_ERROR", {
        error: err,
      })
    }
  }

  const handleBulkDelete = async (ids: string[]) => {
    try {
      for (const id of ids) {
        await repository.deleteSlab(id)
      }
      const updatedResult = await repository.getSlabs()
      if (updatedResult.success && updatedResult.data) {
        setSlabs(updatedResult.data)
      }
      setSelectedIds(new Set())
    } catch (err) {
      ErrorHandler.createError(ErrorType.UNKNOWN, "Unexpected error during bulk delete", "BULK_DELETE_ERROR", {
        error: err,
      })
    }
  }

  const handleWorkflowStatusChange = async (slab: Slab, newStatus: string) => {
    setSelectedSlabForWorkflow(slab)
    await handleUpdateSlab(slab.id, { status: newStatus as any })
  }

  const selectedSlabs = useMemo(() => {
    return slabs.filter((slab) => selectedIds.has(slab.id))
  }, [slabs, selectedIds])

  const recentSlabs = useMemo(() => {
    return slabs
      .filter((slab) => slab.receivedDate)
      .sort((a, b) => new Date(b.receivedDate!).getTime() - new Date(a.receivedDate!).getTime())
      .slice(0, 5)
  }, [slabs])

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading inventory data...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (error) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button variant="outline" size="sm" onClick={handleRetry}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </MainLayout>
    )
  }

  return (
    <InventoryErrorBoundary>
      <MainLayout>
        <div className="flex h-[calc(100vh-4rem)]">
          {showFilters && (
            <div className="flex-shrink-0">
              <AdvancedFilterSidebar
                filters={filters}
                onFiltersChange={setFilters}
                slabs={slabs}
                className="h-full border-r"
              />
            </div>
          )}

          <div className="flex-1 flex flex-col min-w-0">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-foreground">Slab Inventory</h1>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span>
                        {filteredSlabs.length} of {slabs.length} slabs
                      </span>
                      {filteredSlabs.length !== slabs.length && (
                        <Badge variant="secondary" className="text-xs">
                          Filtered
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="gap-2">
                    {showFilters ? <SidebarClose className="h-4 w-4" /> : <SidebarOpen className="h-4 w-4" />}
                    {showFilters ? "Hide" : "Show"} Filters
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowWorkflowDialog(!showWorkflowDialog)}
                    className="gap-2"
                  >
                    <Workflow className="h-4 w-4" />
                    Workflow
                  </Button>

                  <Separator orientation="vertical" className="h-6" />

                  <div className="flex items-center gap-1">
                    <Button
                      variant={viewMode === "table" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("table")}
                    >
                      <Table className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "grid" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                    >
                      <LayoutGrid className="h-4 w-4" />
                    </Button>
                  </div>

                  <Separator orientation="vertical" className="h-6" />

                  <TableControls
                    columns={tableColumns}
                    onColumnsChange={setTableColumns}
                    slabs={slabs}
                    filteredSlabs={filteredSlabs}
                    onPrintView={() => {}}
                  />

                  <QuickActionsMenu onAddSlab={handleAddSlab} recentSlabs={recentSlabs} />
                </div>
              </div>

              {showWorkflowDialog && selectedSlabs.length === 1 && (
                <WorkflowDiagram
                  currentStatus={selectedSlabs[0].status}
                  slab={selectedSlabs[0]}
                  onStatusChange={(newStatus) => handleWorkflowStatusChange(selectedSlabs[0], newStatus)}
                  showTransitions={true}
                  interactive={true}
                />
              )}

              <BulkOperationsToolbar
                selectedSlabs={selectedSlabs}
                selectedIds={selectedIds}
                onBulkUpdate={handleBulkUpdate}
                onBulkDelete={handleBulkDelete}
                onClearSelection={() => setSelectedIds(new Set())}
                allSlabs={slabs}
              />

              {viewMode === "table" ? (
                <SlabDataTable
                  slabs={filteredSlabs}
                  onUpdateSlab={handleUpdateSlab}
                  onDeleteSlab={handleDeleteSlab}
                  onBulkUpdate={handleBulkUpdate}
                  loading={isLoading}
                />
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <LayoutGrid className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Grid view coming soon...</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 bg-transparent"
                    onClick={() => setViewMode("table")}
                  >
                    Switch to Table View
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <AddSlabDialog open={showAddDialog} onOpenChange={setShowAddDialog} onAddSlab={handleAddSlab} />

        <BatchProgressIndicator
          operations={batchOperations}
          onCancel={(id) => batchOperationManager.cancelOperation(id)}
          onDismiss={(id) => batchOperationManager.dismissOperation(id)}
        />
      </MainLayout>
    </InventoryErrorBoundary>
  )
}
