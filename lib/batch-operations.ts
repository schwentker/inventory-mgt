"use client"

import type { Slab } from "@/types/inventory"
import { SlabStatus } from "@/types/inventory"
import type { BatchOperation } from "@/components/workflow/batch-progress-indicator"

export interface BatchOperationConfig {
  type: BatchOperation["type"]
  title: string
  items: string[] // slab IDs
  updates?: Partial<Slab>
  jobId?: string
  exportFormat?: "csv" | "json" | "labels"
}

export interface BatchOperationResult {
  success: boolean
  completed: number
  failed: number
  errors: string[]
  results?: any[]
}

export class BatchOperationManager {
  private operations: Map<string, BatchOperation> = new Map()
  private listeners: ((operations: BatchOperation[]) => void)[] = []

  subscribe(listener: (operations: BatchOperation[]) => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  private notify() {
    const operations = Array.from(this.operations.values())
    this.listeners.forEach((listener) => listener(operations))
  }

  async executeBatchOperation(
    config: BatchOperationConfig,
    onProgress?: (completed: number, total: number) => void,
  ): Promise<BatchOperationResult> {
    const operationId = Date.now().toString()
    const operation: BatchOperation = {
      id: operationId,
      type: config.type,
      title: config.title,
      total: config.items.length,
      completed: 0,
      failed: 0,
      status: "running",
      startTime: new Date(),
      errors: [],
    }

    this.operations.set(operationId, operation)
    this.notify()

    const results: any[] = []
    const errors: string[] = []

    try {
      for (let i = 0; i < config.items.length; i++) {
        const itemId = config.items[i]

        try {
          let result: any

          switch (config.type) {
            case "status_update":
              result = await this.updateSlabStatus(itemId, config.updates?.status!)
              break
            case "bulk_edit":
              result = await this.updateSlab(itemId, config.updates!)
              break
            case "allocation":
              result = await this.allocateSlabToJob(itemId, config.jobId!)
              break
            case "export":
              result = await this.exportSlab(itemId, config.exportFormat!)
              break
            case "import":
              result = await this.importSlab(itemId)
              break
            default:
              throw new Error(`Unknown operation type: ${config.type}`)
          }

          results.push(result)
          operation.completed++
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error"
          errors.push(`Item ${itemId}: ${errorMessage}`)
          operation.failed++
          operation.errors = errors
        }

        // Update progress
        this.operations.set(operationId, { ...operation })
        this.notify()
        onProgress?.(operation.completed + operation.failed, operation.total)

        // Small delay to prevent UI blocking
        await new Promise((resolve) => setTimeout(resolve, 10))
      }

      operation.status = operation.failed > 0 ? "failed" : "completed"
      operation.endTime = new Date()
      this.operations.set(operationId, operation)
      this.notify()

      return {
        success: operation.failed === 0,
        completed: operation.completed,
        failed: operation.failed,
        errors,
        results,
      }
    } catch (error) {
      operation.status = "failed"
      operation.endTime = new Date()
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      operation.errors = [errorMessage]
      this.operations.set(operationId, operation)
      this.notify()

      return {
        success: false,
        completed: operation.completed,
        failed: operation.total - operation.completed,
        errors: [errorMessage],
      }
    }
  }

  cancelOperation(operationId: string) {
    const operation = this.operations.get(operationId)
    if (operation && operation.status === "running") {
      operation.status = "cancelled"
      operation.endTime = new Date()
      this.operations.set(operationId, operation)
      this.notify()
    }
  }

  dismissOperation(operationId: string) {
    this.operations.delete(operationId)
    this.notify()
  }

  getOperations(): BatchOperation[] {
    return Array.from(this.operations.values())
  }

  // Mock implementation - replace with actual API calls
  private async updateSlabStatus(slabId: string, status: SlabStatus): Promise<Slab> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 100 + 50))

    // Get current slab data from localStorage
    const slabs = JSON.parse(localStorage.getItem("slabs") || "[]")
    const slabIndex = slabs.findIndex((s: Slab) => s.id === slabId)

    if (slabIndex === -1) {
      throw new Error(`Slab not found: ${slabId}`)
    }

    // Update status with automatic date stamping
    const updatedSlab = { ...slabs[slabIndex], status }
    if (status === SlabStatus.RECEIVED && !updatedSlab.receivedDate) {
      updatedSlab.receivedDate = new Date()
    }
    if (status === SlabStatus.CONSUMED && !updatedSlab.consumedDate) {
      updatedSlab.consumedDate = new Date()
    }

    slabs[slabIndex] = updatedSlab
    localStorage.setItem("slabs", JSON.stringify(slabs))

    return updatedSlab
  }

  private async updateSlab(slabId: string, updates: Partial<Slab>): Promise<Slab> {
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 100 + 50))

    const slabs = JSON.parse(localStorage.getItem("slabs") || "[]")
    const slabIndex = slabs.findIndex((s: Slab) => s.id === slabId)

    if (slabIndex === -1) {
      throw new Error(`Slab not found: ${slabId}`)
    }

    const updatedSlab = { ...slabs[slabIndex], ...updates }
    slabs[slabIndex] = updatedSlab
    localStorage.setItem("slabs", JSON.stringify(slabs))

    return updatedSlab
  }

  private async allocateSlabToJob(slabId: string, jobId: string): Promise<Slab> {
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 100 + 50))

    const slabs = JSON.parse(localStorage.getItem("slabs") || "[]")
    const slabIndex = slabs.findIndex((s: Slab) => s.id === slabId)

    if (slabIndex === -1) {
      throw new Error(`Slab not found: ${slabId}`)
    }

    const updatedSlab = {
      ...slabs[slabIndex],
      status: SlabStatus.ALLOCATED,
      jobId,
    }

    slabs[slabIndex] = updatedSlab
    localStorage.setItem("slabs", JSON.stringify(slabs))

    return updatedSlab
  }

  private async exportSlab(slabId: string, format: string): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 50 + 25))

    const slabs = JSON.parse(localStorage.getItem("slabs") || "[]")
    const slab = slabs.find((s: Slab) => s.id === slabId)

    if (!slab) {
      throw new Error(`Slab not found: ${slabId}`)
    }

    switch (format) {
      case "csv":
        return `${slab.serialNumber},${slab.material},${slab.color},${slab.status}`
      case "json":
        return JSON.stringify(slab)
      case "labels":
        return `Label for ${slab.serialNumber} - ${slab.material} ${slab.color}`
      default:
        throw new Error(`Unknown export format: ${format}`)
    }
  }

  private async importSlab(data: string): Promise<Slab> {
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 100 + 50))
    // Mock import logic
    throw new Error("Import not implemented")
  }
}

// Global instance
export const batchOperationManager = new BatchOperationManager()
