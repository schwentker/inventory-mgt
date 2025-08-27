"use client"

import type { Slab } from "@/types/inventory"
import { SlabStatus } from "@/types/inventory"

export interface TurnoverAnalysis {
  material: string
  totalSlabs: number
  consumedSlabs: number
  turnoverRate: number // percentage
  averageDaysInStock: number
  velocity: "fast" | "medium" | "slow"
}

export interface SupplierPerformance {
  supplier: string
  totalSlabs: number
  totalValue: number
  averageCost: number
  onTimeDeliveries: number
  totalDeliveries: number
  onTimeRate: number
  qualityScore: number
  materials: string[]
  lastDelivery?: Date
  performance: "excellent" | "good" | "average" | "poor"
}

export interface UtilizationMetrics {
  material: string
  totalReceived: number
  totalConsumed: number
  utilizationRate: number
  wastePercentage: number
  averageSlabValue: number
  efficiency: "high" | "medium" | "low"
}

export interface SlowMovingItem {
  id: string
  serialNumber: string
  material: string
  color: string
  daysInStock: number
  cost: number
  location?: string
  riskLevel: "high" | "medium" | "low"
}

export interface InventoryInsights {
  turnoverAnalysis: TurnoverAnalysis[]
  supplierPerformance: SupplierPerformance[]
  utilizationMetrics: UtilizationMetrics[]
  slowMovingItems: SlowMovingItem[]
  wasteAnalysis: {
    totalWasteValue: number
    wastePercentage: number
    topWasteMaterials: Array<{ material: string; wasteValue: number }>
  }
  recommendations: string[]
}

export class InventoryAnalytics {
  static generateInsights(slabs: Slab[]): InventoryInsights {
    const turnoverAnalysis = this.calculateTurnoverRates(slabs)
    const supplierPerformance = this.analyzeSupplierPerformance(slabs)
    const utilizationMetrics = this.calculateUtilizationRates(slabs)
    const slowMovingItems = this.identifySlowMovingItems(slabs)
    const wasteAnalysis = this.analyzeWaste(slabs)
    const recommendations = this.generateRecommendations(slabs, turnoverAnalysis, utilizationMetrics)

    return {
      turnoverAnalysis,
      supplierPerformance,
      utilizationMetrics,
      slowMovingItems,
      wasteAnalysis,
      recommendations,
    }
  }

  private static calculateTurnoverRates(slabs: Slab[]): TurnoverAnalysis[] {
    const materialGroups = new Map<string, Slab[]>()

    // Group slabs by material
    slabs.forEach((slab) => {
      if (!materialGroups.has(slab.material)) {
        materialGroups.set(slab.material, [])
      }
      materialGroups.get(slab.material)!.push(slab)
    })

    const analysis: TurnoverAnalysis[] = []

    materialGroups.forEach((materialSlabs, material) => {
      const totalSlabs = materialSlabs.length
      const consumedSlabs = materialSlabs.filter((s) => s.status === SlabStatus.CONSUMED).length
      const turnoverRate = totalSlabs > 0 ? (consumedSlabs / totalSlabs) * 100 : 0

      // Calculate average days in stock
      const stockSlabs = materialSlabs.filter((s) => s.status === SlabStatus.STOCK && s.receivedDate)
      const averageDaysInStock =
        stockSlabs.length > 0
          ? stockSlabs.reduce((sum, slab) => {
              const days = Math.floor(
                (new Date().getTime() - new Date(slab.receivedDate!).getTime()) / (1000 * 60 * 60 * 24),
              )
              return sum + days
            }, 0) / stockSlabs.length
          : 0

      let velocity: "fast" | "medium" | "slow" = "slow"
      if (turnoverRate > 70) velocity = "fast"
      else if (turnoverRate > 40) velocity = "medium"

      analysis.push({
        material,
        totalSlabs,
        consumedSlabs,
        turnoverRate,
        averageDaysInStock,
        velocity,
      })
    })

    return analysis.sort((a, b) => b.turnoverRate - a.turnoverRate)
  }

  private static analyzeSupplierPerformance(slabs: Slab[]): SupplierPerformance[] {
    const supplierGroups = new Map<string, Slab[]>()

    slabs.forEach((slab) => {
      if (!supplierGroups.has(slab.supplier)) {
        supplierGroups.set(slab.supplier, [])
      }
      supplierGroups.get(slab.supplier)!.push(slab)
    })

    const performance: SupplierPerformance[] = []

    supplierGroups.forEach((supplierSlabs, supplier) => {
      const totalSlabs = supplierSlabs.length
      const totalValue = supplierSlabs.reduce((sum, slab) => sum + (slab.cost || 0), 0)
      const averageCost = totalSlabs > 0 ? totalValue / totalSlabs : 0

      // Mock delivery performance (in real app, this would come from delivery data)
      const onTimeDeliveries = Math.floor(totalSlabs * (0.8 + Math.random() * 0.2))
      const totalDeliveries = totalSlabs
      const onTimeRate = totalDeliveries > 0 ? (onTimeDeliveries / totalDeliveries) * 100 : 0

      // Mock quality score based on various factors
      const qualityScore = Math.floor(75 + Math.random() * 25)

      const materials = Array.from(new Set(supplierSlabs.map((s) => s.material)))
      const lastDelivery = supplierSlabs
        .filter((s) => s.receivedDate)
        .sort((a, b) => new Date(b.receivedDate!).getTime() - new Date(a.receivedDate!).getTime())[0]?.receivedDate

      let performanceRating: "excellent" | "good" | "average" | "poor" = "poor"
      if (onTimeRate > 90 && qualityScore > 90) performanceRating = "excellent"
      else if (onTimeRate > 80 && qualityScore > 80) performanceRating = "good"
      else if (onTimeRate > 70 && qualityScore > 70) performanceRating = "average"

      performance.push({
        supplier,
        totalSlabs,
        totalValue,
        averageCost,
        onTimeDeliveries,
        totalDeliveries,
        onTimeRate,
        qualityScore,
        materials,
        lastDelivery: lastDelivery ? new Date(lastDelivery) : undefined,
        performance: performanceRating,
      })
    })

    return performance.sort((a, b) => b.onTimeRate - a.onTimeRate)
  }

  private static calculateUtilizationRates(slabs: Slab[]): UtilizationMetrics[] {
    const materialGroups = new Map<string, Slab[]>()

    slabs.forEach((slab) => {
      if (!materialGroups.has(slab.material)) {
        materialGroups.set(slab.material, [])
      }
      materialGroups.get(slab.material)!.push(slab)
    })

    const metrics: UtilizationMetrics[] = []

    materialGroups.forEach((materialSlabs, material) => {
      const receivedSlabs = materialSlabs.filter(
        (s) => s.status !== SlabStatus.WANTED && s.status !== SlabStatus.ORDERED,
      )
      const consumedSlabs = materialSlabs.filter((s) => s.status === SlabStatus.CONSUMED)
      const remnantSlabs = materialSlabs.filter((s) => s.status === SlabStatus.REMNANT)

      const totalReceived = receivedSlabs.length
      const totalConsumed = consumedSlabs.length
      const utilizationRate = totalReceived > 0 ? (totalConsumed / totalReceived) * 100 : 0

      // Calculate waste percentage (remnants as waste indicator)
      const wastePercentage = totalReceived > 0 ? (remnantSlabs.length / totalReceived) * 100 : 0

      const averageSlabValue =
        receivedSlabs.length > 0
          ? receivedSlabs.reduce((sum, slab) => sum + (slab.cost || 0), 0) / receivedSlabs.length
          : 0

      let efficiency: "high" | "medium" | "low" = "low"
      if (utilizationRate > 80 && wastePercentage < 10) efficiency = "high"
      else if (utilizationRate > 60 && wastePercentage < 20) efficiency = "medium"

      metrics.push({
        material,
        totalReceived,
        totalConsumed,
        utilizationRate,
        wastePercentage,
        averageSlabValue,
        efficiency,
      })
    })

    return metrics.sort((a, b) => b.utilizationRate - a.utilizationRate)
  }

  private static identifySlowMovingItems(slabs: Slab[]): SlowMovingItem[] {
    const slowMovingThreshold = 60 // days
    const now = new Date()

    const slowMoving = slabs
      .filter((slab) => {
        if (slab.status !== SlabStatus.STOCK || !slab.receivedDate) return false
        const daysInStock = Math.floor((now.getTime() - new Date(slab.receivedDate).getTime()) / (1000 * 60 * 60 * 24))
        return daysInStock > slowMovingThreshold
      })
      .map((slab) => {
        const daysInStock = Math.floor((now.getTime() - new Date(slab.receivedDate!).getTime()) / (1000 * 60 * 60 * 24))

        let riskLevel: "high" | "medium" | "low" = "low"
        if (daysInStock > 120) riskLevel = "high"
        else if (daysInStock > 90) riskLevel = "medium"

        return {
          id: slab.id,
          serialNumber: slab.serialNumber,
          material: slab.material,
          color: slab.color,
          daysInStock,
          cost: slab.cost || 0,
          location: slab.location,
          riskLevel,
        }
      })

    return slowMoving.sort((a, b) => b.daysInStock - a.daysInStock)
  }

  private static analyzeWaste(slabs: Slab[]) {
    const remnantSlabs = slabs.filter((s) => s.status === SlabStatus.REMNANT)
    const totalWasteValue = remnantSlabs.reduce((sum, slab) => sum + (slab.cost || 0), 0)
    const totalInventoryValue = slabs.reduce((sum, slab) => sum + (slab.cost || 0), 0)
    const wastePercentage = totalInventoryValue > 0 ? (totalWasteValue / totalInventoryValue) * 100 : 0

    // Group waste by material
    const wasteByMaterial = new Map<string, number>()
    remnantSlabs.forEach((slab) => {
      const current = wasteByMaterial.get(slab.material) || 0
      wasteByMaterial.set(slab.material, current + (slab.cost || 0))
    })

    const topWasteMaterials = Array.from(wasteByMaterial.entries())
      .map(([material, wasteValue]) => ({ material, wasteValue }))
      .sort((a, b) => b.wasteValue - a.wasteValue)
      .slice(0, 5)

    return {
      totalWasteValue,
      wastePercentage,
      topWasteMaterials,
    }
  }

  private static generateRecommendations(
    slabs: Slab[],
    turnoverAnalysis: TurnoverAnalysis[],
    utilizationMetrics: UtilizationMetrics[],
  ): string[] {
    const recommendations: string[] = []

    // Slow-moving inventory recommendations
    const slowMaterials = turnoverAnalysis.filter((t) => t.velocity === "slow")
    if (slowMaterials.length > 0) {
      recommendations.push(
        `Consider promotional pricing for slow-moving materials: ${slowMaterials.map((m) => m.material).join(", ")}`,
      )
    }

    // High waste recommendations
    const highWasteMaterials = utilizationMetrics.filter((u) => u.wastePercentage > 15)
    if (highWasteMaterials.length > 0) {
      recommendations.push(
        `Review cutting processes for materials with high waste: ${highWasteMaterials.map((m) => m.material).join(", ")}`,
      )
    }

    // Stock level recommendations
    const fastMovingMaterials = turnoverAnalysis.filter((t) => t.velocity === "fast")
    if (fastMovingMaterials.length > 0) {
      recommendations.push(
        `Consider increasing stock levels for fast-moving materials: ${fastMovingMaterials.map((m) => m.material).join(", ")}`,
      )
    }

    // Supplier diversification
    const supplierCounts = new Map<string, number>()
    slabs.forEach((slab) => {
      supplierCounts.set(slab.supplier, (supplierCounts.get(slab.supplier) || 0) + 1)
    })

    const dominantSuppliers = Array.from(supplierCounts.entries()).filter(([, count]) => count > slabs.length * 0.4)
    if (dominantSuppliers.length > 0) {
      recommendations.push("Consider diversifying suppliers to reduce dependency risk")
    }

    return recommendations
  }
}
