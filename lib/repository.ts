// Enhanced repository pattern for inventory data management
import type { Slab, SlabStatus, SlabType, SlabFilters } from "@/types/inventory"
import type { StorageSchema } from "@/types/config"
import { LocalStorage } from "./storage"
import { SlabConstants } from "@/constants" // Import SlabStatus and SlabType

export interface RepositoryResult<T> {
  success: boolean
  data?: T
  error?: string
}

export interface BulkOperationResult {
  success: boolean
  processedCount: number
  failedCount: number
  errors: string[]
}

export interface InventorySummary {
  totalSlabs: number
  totalValue: number
  averageCost: number
  slabsByStatus: Record<SlabStatus, number>
  slabsByType: Record<SlabType, number>
  slabsByMaterial: Record<string, number>
  slabsBySupplier: Record<string, number>
  lowStockAlerts: string[]
}

const STORAGE_KEYS = {
  SLABS: "inventory_slabs",
  SCHEMA: "inventory_schema",
  AUTO_SAVE: "inventory_auto_save",
} as const

export class InventoryRepository {
  private static instance: InventoryRepository
  private autoSaveEnabled = true
  private autoSaveTimeout: NodeJS.Timeout | null = null
  private readonly AUTO_SAVE_DELAY = 1000 // 1 second

  private constructor() {
    this.loadAutoSaveSettings()
  }

  static getInstance(): InventoryRepository {
    if (!InventoryRepository.instance) {
      InventoryRepository.instance = new InventoryRepository()
    }
    return InventoryRepository.instance
  }

  // Auto-save functionality
  private loadAutoSaveSettings(): void {
    const autoSave = LocalStorage.get<boolean>(STORAGE_KEYS.AUTO_SAVE)
    this.autoSaveEnabled = autoSave !== null ? autoSave : true
  }

  setAutoSave(enabled: boolean): void {
    this.autoSaveEnabled = enabled
    LocalStorage.set(STORAGE_KEYS.AUTO_SAVE, enabled)
  }

  private scheduleAutoSave(callback: () => void): void {
    if (!this.autoSaveEnabled) return

    if (this.autoSaveTimeout) {
      clearTimeout(this.autoSaveTimeout)
    }

    this.autoSaveTimeout = setTimeout(callback, this.AUTO_SAVE_DELAY)
  }

  // Data versioning and schema management
  private async saveWithSchema(slabs: Slab[]): Promise<void> {
    const schema: StorageSchema = {
      version: "1.0.0",
      data: {
        slabs,
        materials: [],
        suppliers: [],
        config: {} as any, // Will be populated by ConfigService
      },
      metadata: {
        createdAt: new Date(),
        lastModified: new Date(),
        recordCount: slabs.length,
      },
    }

    LocalStorage.set(STORAGE_KEYS.SLABS, slabs)
    LocalStorage.set(STORAGE_KEYS.SCHEMA, schema)
  }

  // Core CRUD operations
  async getSlabs(): Promise<RepositoryResult<Slab[]>> {
    try {
      const slabs = LocalStorage.get<Slab[]>(STORAGE_KEYS.SLABS) || []

      // Convert date strings back to Date objects
      const processedSlabs = slabs.map((slab) => ({
        ...slab,
        receivedDate: slab.receivedDate ? new Date(slab.receivedDate) : undefined,
        consumedDate: slab.consumedDate ? new Date(slab.consumedDate) : undefined,
      }))

      return {
        success: true,
        data: processedSlabs,
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to retrieve slabs: ${error instanceof Error ? error.message : "Unknown error"}`,
      }
    }
  }

  async getSlab(id: string): Promise<RepositoryResult<Slab>> {
    try {
      const result = await this.getSlabs()
      if (!result.success || !result.data) {
        return { success: false, error: result.error }
      }

      const slab = result.data.find((s) => s.id === id)
      if (!slab) {
        return { success: false, error: `Slab with ID ${id} not found` }
      }

      return { success: true, data: slab }
    } catch (error) {
      return {
        success: false,
        error: `Failed to retrieve slab: ${error instanceof Error ? error.message : "Unknown error"}`,
      }
    }
  }

  async saveSlab(slab: Slab): Promise<RepositoryResult<Slab>> {
    try {
      const result = await this.getSlabs()
      if (!result.success || !result.data) {
        return { success: false, error: result.error }
      }

      const slabs = result.data
      const existingIndex = slabs.findIndex((s) => s.id === slab.id)

      if (existingIndex >= 0) {
        slabs[existingIndex] = slab
      } else {
        slabs.push(slab)
      }

      this.scheduleAutoSave(() => this.saveWithSchema(slabs))

      return { success: true, data: slab }
    } catch (error) {
      return {
        success: false,
        error: `Failed to save slab: ${error instanceof Error ? error.message : "Unknown error"}`,
      }
    }
  }

  async deleteSlab(id: string): Promise<RepositoryResult<boolean>> {
    try {
      const result = await this.getSlabs()
      if (!result.success || !result.data) {
        return { success: false, error: result.error }
      }

      const slabs = result.data
      const initialLength = slabs.length
      const filteredSlabs = slabs.filter((s) => s.id !== id)

      if (filteredSlabs.length === initialLength) {
        return { success: false, error: `Slab with ID ${id} not found` }
      }

      this.scheduleAutoSave(() => this.saveWithSchema(filteredSlabs))

      return { success: true, data: true }
    } catch (error) {
      return {
        success: false,
        error: `Failed to delete slab: ${error instanceof Error ? error.message : "Unknown error"}`,
      }
    }
  }

  // Bulk operations
  async bulkUpdateStatus(ids: string[], status: SlabStatus): Promise<BulkOperationResult> {
    const errors: string[] = []
    let processedCount = 0
    let failedCount = 0

    try {
      const result = await this.getSlabs()
      if (!result.success || !result.data) {
        return {
          success: false,
          processedCount: 0,
          failedCount: ids.length,
          errors: [result.error || "Failed to retrieve slabs"],
        }
      }

      const slabs = result.data

      for (const id of ids) {
        const slabIndex = slabs.findIndex((s) => s.id === id)
        if (slabIndex >= 0) {
          slabs[slabIndex].status = status
          if (status === SlabConstants.CONSUMED && !slabs[slabIndex].consumedDate) {
            slabs[slabIndex].consumedDate = new Date()
          }
          processedCount++
        } else {
          failedCount++
          errors.push(`Slab with ID ${id} not found`)
        }
      }

      if (processedCount > 0) {
        await this.saveWithSchema(slabs)
      }

      return {
        success: processedCount > 0,
        processedCount,
        failedCount,
        errors,
      }
    } catch (error) {
      return {
        success: false,
        processedCount,
        failedCount: ids.length - processedCount,
        errors: [...errors, error instanceof Error ? error.message : "Unknown error"],
      }
    }
  }

  async bulkDelete(ids: string[]): Promise<BulkOperationResult> {
    const errors: string[] = []
    let processedCount = 0
    let failedCount = 0

    try {
      const result = await this.getSlabs()
      if (!result.success || !result.data) {
        return {
          success: false,
          processedCount: 0,
          failedCount: ids.length,
          errors: [result.error || "Failed to retrieve slabs"],
        }
      }

      const slabs = result.data
      const initialLength = slabs.length

      const filteredSlabs = slabs.filter((slab) => {
        if (ids.includes(slab.id)) {
          processedCount++
          return false
        }
        return true
      })

      failedCount = ids.length - processedCount

      if (processedCount > 0) {
        await this.saveWithSchema(filteredSlabs)
      }

      return {
        success: processedCount > 0,
        processedCount,
        failedCount,
        errors,
      }
    } catch (error) {
      return {
        success: false,
        processedCount,
        failedCount: ids.length - processedCount,
        errors: [...errors, error instanceof Error ? error.message : "Unknown error"],
      }
    }
  }

  // Advanced queries and analytics
  async getInventorySummary(): Promise<RepositoryResult<InventorySummary>> {
    try {
      const result = await this.getSlabs()
      if (!result.success || !result.data) {
        return { success: false, error: result.error }
      }

      const slabs = result.data
      const totalSlabs = slabs.length
      const totalValue = slabs.reduce((sum, slab) => sum + (slab.cost || 0), 0)
      const averageCost = totalSlabs > 0 ? totalValue / totalSlabs : 0

      // Group by status
      const slabsByStatus = Object.values(SlabConstants.Status).reduce(
        (acc, status) => {
          acc[status] = slabs.filter((slab) => slab.status === status).length
          return acc
        },
        {} as Record<SlabStatus, number>,
      )

      // Group by type
      const slabsByType = Object.values(SlabConstants.Type).reduce(
        (acc, type) => {
          acc[type] = slabs.filter((slab) => slab.slabType === type).length
          return acc
        },
        {} as Record<SlabType, number>,
      )

      // Group by material
      const slabsByMaterial = slabs.reduce(
        (acc, slab) => {
          acc[slab.material] = (acc[slab.material] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      )

      // Group by supplier
      const slabsBySupplier = slabs.reduce(
        (acc, slab) => {
          acc[slab.supplier] = (acc[slab.supplier] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      )

      // Low stock alerts (materials with less than 5 slabs in stock)
      const lowStockAlerts = Object.entries(slabsByMaterial)
        .filter(([_, count]) => count < 5)
        .map(([material, _]) => material)

      const summary: InventorySummary = {
        totalSlabs,
        totalValue,
        averageCost,
        slabsByStatus,
        slabsByType,
        slabsByMaterial,
        slabsBySupplier,
        lowStockAlerts,
      }

      return { success: true, data: summary }
    } catch (error) {
      return {
        success: false,
        error: `Failed to generate inventory summary: ${error instanceof Error ? error.message : "Unknown error"}`,
      }
    }
  }

  async searchSlabs(filters: SlabFilters, searchTerm?: string): Promise<RepositoryResult<Slab[]>> {
    try {
      const result = await this.getSlabs()
      if (!result.success || !result.data) {
        return { success: false, error: result.error }
      }

      let filteredSlabs = result.data

      // Apply filters
      if (filters.status && filters.status.length > 0) {
        filteredSlabs = filteredSlabs.filter((slab) => filters.status!.includes(slab.status))
      }

      if (filters.slabType && filters.slabType.length > 0) {
        filteredSlabs = filteredSlabs.filter((slab) => filters.slabType!.includes(slab.slabType))
      }

      if (filters.material && filters.material.length > 0) {
        filteredSlabs = filteredSlabs.filter((slab) => filters.material!.includes(slab.material))
      }

      if (filters.supplier && filters.supplier.length > 0) {
        filteredSlabs = filteredSlabs.filter((slab) => filters.supplier!.includes(slab.supplier))
      }

      if (filters.location && filters.location.length > 0) {
        filteredSlabs = filteredSlabs.filter((slab) => slab.location && filters.location!.includes(slab.location))
      }

      // Apply search term
      if (searchTerm && searchTerm.trim()) {
        const term = searchTerm.toLowerCase().trim()
        filteredSlabs = filteredSlabs.filter(
          (slab) =>
            slab.serialNumber.toLowerCase().includes(term) ||
            slab.material.toLowerCase().includes(term) ||
            slab.color.toLowerCase().includes(term) ||
            slab.supplier.toLowerCase().includes(term) ||
            (slab.location && slab.location.toLowerCase().includes(term)) ||
            (slab.notes && slab.notes.toLowerCase().includes(term)),
        )
      }

      return { success: true, data: filteredSlabs }
    } catch (error) {
      return {
        success: false,
        error: `Failed to search slabs: ${error instanceof Error ? error.message : "Unknown error"}`,
      }
    }
  }

  // Data export/import
  async exportData(): Promise<RepositoryResult<StorageSchema>> {
    try {
      const slabsResult = await this.getSlabs()
      if (!slabsResult.success || !slabsResult.data) {
        return { success: false, error: slabsResult.error }
      }

      const schema: StorageSchema = {
        version: "1.0.0",
        data: {
          slabs: slabsResult.data,
          materials: [],
          suppliers: [],
          config: {} as any,
        },
        metadata: {
          createdAt: new Date(),
          lastModified: new Date(),
          recordCount: slabsResult.data.length,
        },
      }

      return { success: true, data: schema }
    } catch (error) {
      return {
        success: false,
        error: `Failed to export data: ${error instanceof Error ? error.message : "Unknown error"}`,
      }
    }
  }

  async importData(schema: StorageSchema): Promise<RepositoryResult<boolean>> {
    try {
      if (!schema.data.slabs) {
        return { success: false, error: "Invalid schema: missing slabs data" }
      }

      await this.saveWithSchema(schema.data.slabs)

      return { success: true, data: true }
    } catch (error) {
      return {
        success: false,
        error: `Failed to import data: ${error instanceof Error ? error.message : "Unknown error"}`,
      }
    }
  }

  async getSlabBySerialNumber(serialNumber: string): Promise<Slab | null> {
    try {
      const result = await this.getSlabs()
      if (!result.success || !result.data) {
        return null
      }

      return result.data.find((slab) => slab.serialNumber === serialNumber) || null
    } catch (error) {
      console.error("Failed to get slab by serial number:", error)
      return null
    }
  }
}
