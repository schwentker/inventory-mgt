"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, BarChart3, PieChart, TrendingUp } from "lucide-react"
import { useEffect, useState, useRef } from "react"
import { InventoryRepository, type InventorySummary } from "@/lib/repository"
import { SlabConstants } from "@/constants"
import type { Slab } from "@/types/inventory"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart as RechartsPieChart,
  Cell,
  Pie,
  Line,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts"

interface InventoryChartsProps {
  className?: string
}

interface MaterialChartData {
  material: string
  count: number
  value: number
}

interface StatusChartData {
  status: string
  count: number
  percentage: number
  color: string
}

interface TimeSeriesData {
  date: string
  received: number
  consumed: number
  cumulative: number
}

const STATUS_COLORS = {
  [SlabConstants.AVAILABLE]: "#22c55e",
  [SlabConstants.RESERVED]: "#eab308",
  [SlabConstants.IN_PRODUCTION]: "#3b82f6",
  [SlabConstants.CONSUMED]: "#6b7280",
}

export function InventoryCharts({ className }: InventoryChartsProps) {
  const [summary, setSummary] = useState<InventorySummary | null>(null)
  const [slabs, setSlabs] = useState<Slab[]>([])
  const [materialData, setMaterialData] = useState<MaterialChartData[]>([])
  const [statusData, setStatusData] = useState<StatusChartData[]>([])
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([])
  const [loading, setLoading] = useState(true)

  const materialChartRef = useRef<HTMLDivElement>(null)
  const statusChartRef = useRef<HTMLDivElement>(null)
  const timeSeriesChartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadChartData()
  }, [])

  const loadChartData = async () => {
    setLoading(true)
    try {
      const repository = InventoryRepository.getInstance()

      const [summaryResult, slabsResult] = await Promise.all([repository.getInventorySummary(), repository.getSlabs()])

      if (summaryResult.success && summaryResult.data) {
        setSummary(summaryResult.data)
        generateStatusChartData(summaryResult.data)
      }

      if (slabsResult.success && slabsResult.data) {
        setSlabs(slabsResult.data)
        generateMaterialChartData(slabsResult.data)
        generateTimeSeriesData(slabsResult.data)
      }
    } catch (error) {
      console.error("Failed to load chart data:", error)
    } finally {
      setLoading(false)
    }
  }

  const generateMaterialChartData = (slabData: Slab[]) => {
    const materialMap = new Map<string, { count: number; value: number }>()

    slabData.forEach((slab) => {
      const existing = materialMap.get(slab.material) || { count: 0, value: 0 }
      materialMap.set(slab.material, {
        count: existing.count + 1,
        value: existing.value + (slab.cost || 0),
      })
    })

    const data = Array.from(materialMap.entries())
      .map(([material, stats]) => ({
        material,
        count: stats.count,
        value: stats.value,
      }))
      .sort((a, b) => b.count - a.count)

    setMaterialData(data)
  }

  const generateStatusChartData = (summaryData: InventorySummary) => {
    const total = summaryData.totalSlabs
    const data = Object.entries(summaryData.slabsByStatus)
      .map(([status, count]) => ({
        status: status.replace("_", " ").toLowerCase(),
        count,
        percentage: total > 0 ? (count / total) * 100 : 0,
        color: STATUS_COLORS[status as keyof typeof STATUS_COLORS] || "#6b7280",
      }))
      .filter((item) => item.count > 0)
      .sort((a, b) => b.count - a.count)

    setStatusData(data)
  }

  const generateTimeSeriesData = (slabData: Slab[]) => {
    // Generate last 30 days of data
    const days = 30
    const endDate = new Date()
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000)

    const timeSeriesMap = new Map<string, { received: number; consumed: number }>()

    // Initialize all dates
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000)
      const dateStr = date.toISOString().split("T")[0]
      timeSeriesMap.set(dateStr, { received: 0, consumed: 0 })
    }

    // Count received and consumed slabs by date
    slabData.forEach((slab) => {
      if (slab.receivedDate) {
        const receivedDateStr = new Date(slab.receivedDate).toISOString().split("T")[0]
        const existing = timeSeriesMap.get(receivedDateStr)
        if (existing) {
          existing.received += 1
        }
      }

      if (slab.consumedDate) {
        const consumedDateStr = new Date(slab.consumedDate).toISOString().split("T")[0]
        const existing = timeSeriesMap.get(consumedDateStr)
        if (existing) {
          existing.consumed += 1
        }
      }
    })

    // Convert to array and calculate cumulative
    let cumulative = 0
    const data = Array.from(timeSeriesMap.entries())
      .map(([date, counts]) => {
        cumulative += counts.received - counts.consumed
        return {
          date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          received: counts.received,
          consumed: counts.consumed,
          cumulative,
        }
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    setTimeSeriesData(data)
  }

  const exportChart = async (chartRef: React.RefObject<HTMLDivElement>, filename: string) => {
    if (!chartRef.current) return

    try {
      // This would typically use html2canvas or similar library
      console.log(`Exporting chart: ${filename}`)
      // Implementation would go here for actual image export
    } catch (error) {
      console.error("Failed to export chart:", error)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="grid gap-6 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 bg-muted rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Material Quantities Bar Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Material Quantities
          </CardTitle>
          <Button variant="outline" size="sm" onClick={() => exportChart(materialChartRef, "material-quantities")}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </CardHeader>
        <CardContent>
          <div ref={materialChartRef} className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={materialData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="material" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="count" fill="#3b82f6" name="Slab Count" />
                <Bar dataKey="value" fill="#10b981" name="Total Value ($)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Status Distribution Pie Chart */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Status Distribution
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => exportChart(statusChartRef, "status-distribution")}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </CardHeader>
          <CardContent>
            <div ref={statusChartRef} className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ status, percentage }) => `${status} (${percentage.toFixed(1)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Status Legend */}
        <Card>
          <CardHeader>
            <CardTitle>Status Legend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {statusData.map((status) => (
                <div key={status.status} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: status.color }} />
                    <span className="font-medium capitalize">{status.status}</span>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary">{status.count}</Badge>
                    <p className="text-xs text-muted-foreground">{status.percentage.toFixed(1)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time Series Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Inventory Movements (Last 30 Days)
          </CardTitle>
          <Button variant="outline" size="sm" onClick={() => exportChart(timeSeriesChartRef, "inventory-movements")}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </CardHeader>
        <CardContent>
          <div ref={timeSeriesChartRef} className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeriesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="cumulative"
                  stackId="1"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                  name="Cumulative Inventory"
                />
                <Line type="monotone" dataKey="received" stroke="#10b981" strokeWidth={2} name="Received" />
                <Line type="monotone" dataKey="consumed" stroke="#ef4444" strokeWidth={2} name="Consumed" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
