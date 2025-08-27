"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Zap, Package, AlertTriangle, Clock, DollarSign, Scissors, Calendar, TrendingDown, Target } from "lucide-react"
import type { Slab } from "@/types/inventory"
import { SlabStatus } from "@/types/inventory"

interface SmartFiltersProps {
  slabs: Slab[]
  onApplyFilter: (filters: any) => void
}

interface SmartFilter {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  getFilters: (slabs: Slab[]) => any
  getCount: (slabs: Slab[]) => number
}

export function SmartFilters({ slabs, onApplyFilter }: SmartFiltersProps) {
  const smartFilters: SmartFilter[] = [
    {
      id: "available-for-allocation",
      name: "Available for Allocation",
      description: "Slabs in stock ready to be allocated to jobs",
      icon: Package,
      color: "bg-green-100 text-green-800 border-green-300",
      getFilters: () => ({
        status: [SlabStatus.STOCK],
      }),
      getCount: (slabs) => slabs.filter((s) => s.status === SlabStatus.STOCK).length,
    },
    {
      id: "low-stock-materials",
      name: "Low Stock Materials",
      description: "Materials with fewer than 3 slabs in stock",
      icon: AlertTriangle,
      color: "bg-amber-100 text-amber-800 border-amber-300",
      getFilters: (slabs) => {
        const materialCounts = slabs
          .filter((s) => s.status === SlabStatus.STOCK)
          .reduce(
            (acc, slab) => {
              acc[slab.material] = (acc[slab.material] || 0) + 1
              return acc
            },
            {} as Record<string, number>,
          )

        const lowStockMaterials = Object.entries(materialCounts)
          .filter(([, count]) => count < 3)
          .map(([material]) => material)

        return {
          material: lowStockMaterials,
          status: [SlabStatus.STOCK],
        }
      },
      getCount: (slabs) => {
        const materialCounts = slabs
          .filter((s) => s.status === SlabStatus.STOCK)
          .reduce(
            (acc, slab) => {
              acc[slab.material] = (acc[slab.material] || 0) + 1
              return acc
            },
            {} as Record<string, number>,
          )

        return Object.values(materialCounts).filter((count) => count < 3).length
      },
    },
    {
      id: "recent-arrivals",
      name: "Recent Arrivals",
      description: "Slabs received in the last 7 days",
      icon: Clock,
      color: "bg-blue-100 text-blue-800 border-blue-300",
      getFilters: () => {
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        return {
          dateRange: {
            from: sevenDaysAgo,
            to: new Date(),
          },
        }
      },
      getCount: (slabs) => {
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        return slabs.filter(
          (s) => s.receivedDate && new Date(s.receivedDate) >= sevenDaysAgo && s.status === SlabStatus.RECEIVED,
        ).length
      },
    },
    {
      id: "high-value-slabs",
      name: "High Value Slabs",
      description: "Slabs worth more than $1,000",
      icon: DollarSign,
      color: "bg-purple-100 text-purple-800 border-purple-300",
      getFilters: () => ({}), // Custom logic needed in parent component
      getCount: (slabs) => slabs.filter((s) => s.cost && s.cost > 1000).length,
    },
    {
      id: "remnants-only",
      name: "Remnants Only",
      description: "Small pieces and leftover materials",
      icon: Scissors,
      color: "bg-orange-100 text-orange-800 border-orange-300",
      getFilters: () => ({
        status: [SlabStatus.REMNANT],
      }),
      getCount: (slabs) => slabs.filter((s) => s.status === SlabStatus.REMNANT).length,
    },
    {
      id: "this-month-received",
      name: "This Month's Arrivals",
      description: "Slabs received in the current month",
      icon: Calendar,
      color: "bg-indigo-100 text-indigo-800 border-indigo-300",
      getFilters: () => {
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        return {
          dateRange: {
            from: startOfMonth,
            to: endOfMonth,
          },
        }
      },
      getCount: (slabs) => {
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        return slabs.filter(
          (s) => s.receivedDate && new Date(s.receivedDate) >= startOfMonth && s.status === SlabStatus.RECEIVED,
        ).length
      },
    },
    {
      id: "slow-moving",
      name: "Slow Moving Inventory",
      description: "Slabs in stock for more than 30 days",
      icon: TrendingDown,
      color: "bg-red-100 text-red-800 border-red-300",
      getFilters: () => {
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        return {
          status: [SlabStatus.STOCK],
          dateRange: {
            to: thirtyDaysAgo,
          },
        }
      },
      getCount: (slabs) => {
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        return slabs.filter(
          (s) => s.status === SlabStatus.STOCK && s.receivedDate && new Date(s.receivedDate) <= thirtyDaysAgo,
        ).length
      },
    },
    {
      id: "allocated-jobs",
      name: "Allocated to Jobs",
      description: "Slabs currently allocated to specific jobs",
      icon: Target,
      color: "bg-yellow-100 text-yellow-800 border-yellow-300",
      getFilters: () => ({
        status: [SlabStatus.ALLOCATED],
      }),
      getCount: (slabs) => slabs.filter((s) => s.status === SlabStatus.ALLOCATED).length,
    },
  ]

  const handleApplySmartFilter = (filter: SmartFilter) => {
    const filters = filter.getFilters(slabs)

    // Special handling for high-value slabs
    if (filter.id === "high-value-slabs") {
      // This would need custom logic in the parent component
      // For now, we'll pass a special flag
      onApplyFilter({
        ...filters,
        _smartFilter: "high-value-slabs",
      })
    } else {
      onApplyFilter(filters)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Zap className="w-4 h-4" />
          Smart Filters
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-2">
          {smartFilters.map((filter) => {
            const count = filter.getCount(slabs)
            const Icon = filter.icon

            return (
              <Button
                key={filter.id}
                variant="ghost"
                className="h-auto p-3 justify-start"
                onClick={() => handleApplySmartFilter(filter)}
                disabled={count === 0}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className={`p-2 rounded-lg ${filter.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{filter.name}</p>
                      <Badge variant="outline" className="text-xs">
                        {count}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{filter.description}</p>
                  </div>
                </div>
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
