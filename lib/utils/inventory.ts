// Utility functions for inventory calculations and operations
import { type Slab, SlabStatus, SlabType, type InventoryStats } from "@/types/inventory"

export function generateSlabId(): string {
  return `slab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export function generateSerialNumber(material: string, sequence: number): string {
  const prefix = material.substring(0, 3).toUpperCase()
  return `${prefix}-${sequence.toString().padStart(3, "0")}`
}

export function calculateSlabArea(length: number, width: number): number {
  // Returns area in square meters
  return (length * width) / 1000000
}

export function calculateInventoryStats(slabs: Slab[]): InventoryStats {
  const stats: InventoryStats = {
    totalSlabs: slabs.length,
    totalValue: 0,
    slabsByStatus: {} as Record<SlabStatus, number>,
    slabsByType: {} as Record<SlabType, number>,
    lowStockMaterials: [],
  }

  // Initialize counters
  Object.values(SlabStatus).forEach((status) => {
    stats.slabsByStatus[status] = 0
  })

  Object.values(SlabType).forEach((type) => {
    stats.slabsByType[type] = 0
  })

  // Calculate stats
  slabs.forEach((slab) => {
    stats.slabsByStatus[slab.status]++
    stats.slabsByType[slab.slabType]++
    if (slab.cost) {
      stats.totalValue += slab.cost
    }
  })

  // Calculate low stock materials (materials with less than 3 slabs in stock)
  const materialCounts: Record<string, number> = {}
  slabs
    .filter((slab) => slab.status === SlabStatus.STOCK)
    .forEach((slab) => {
      materialCounts[slab.material] = (materialCounts[slab.material] || 0) + 1
    })

  stats.lowStockMaterials = Object.entries(materialCounts)
    .filter(([, count]) => count < 3)
    .map(([material]) => material)

  return stats
}

export function formatDimensions(length: number, width: number, thickness: number): string {
  return `${length}mm × ${width}mm × ${thickness}mm`
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export function getStatusColor(status: SlabStatus): string {
  const colors: Record<SlabStatus, string> = {
    [SlabStatus.WANTED]: "text-orange-600 bg-orange-50",
    [SlabStatus.ORDERED]: "text-blue-600 bg-blue-50",
    [SlabStatus.RECEIVED]: "text-green-600 bg-green-50",
    [SlabStatus.ALLOCATED]: "text-purple-600 bg-purple-50",
    [SlabStatus.CONSUMED]: "text-gray-600 bg-gray-50",
    [SlabStatus.REMNANT]: "text-yellow-600 bg-yellow-50",
    [SlabStatus.STOCK]: "text-emerald-600 bg-emerald-50",
  }
  return colors[status]
}
