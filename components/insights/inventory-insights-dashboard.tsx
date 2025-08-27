"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TrendingUp, Users, AlertTriangle, Target, Lightbulb, Download, Clock } from "lucide-react"
import { InventoryAnalytics, type InventoryInsights } from "@/lib/analytics"
import { InventoryRepository } from "@/lib/repository"

interface InventoryInsightsDashboardProps {
  className?: string
}

export function InventoryInsightsDashboard({ className }: InventoryInsightsDashboardProps) {
  const [insights, setInsights] = useState<InventoryInsights | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadInsights()
  }, [])

  const loadInsights = async () => {
    setLoading(true)
    try {
      const repository = InventoryRepository.getInstance()
      const result = await repository.getSlabs()

      if (result.success && result.data) {
        const generatedInsights = InventoryAnalytics.generateInsights(result.data)
        setInsights(generatedInsights)
      }
    } catch (error) {
      console.error("Failed to load insights:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case "excellent":
        return "bg-green-100 text-green-800 border-green-300"
      case "good":
        return "bg-blue-100 text-blue-800 border-blue-300"
      case "average":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "poor":
        return "bg-red-100 text-red-800 border-red-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const getVelocityColor = (velocity: string) => {
    switch (velocity) {
      case "fast":
        return "bg-green-100 text-green-800 border-green-300"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "slow":
        return "bg-red-100 text-red-800 border-red-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "high":
        return "bg-red-100 text-red-800 border-red-300"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "low":
        return "bg-green-100 text-green-800 border-green-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 bg-muted rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!insights) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-muted-foreground">Failed to load insights</p>
        <Button onClick={loadInsights} className="mt-4">
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Key Metrics Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Turnover Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {insights.turnoverAnalysis.length > 0
                ? Math.round(
                    insights.turnoverAnalysis.reduce((sum, t) => sum + t.turnoverRate, 0) /
                      insights.turnoverAnalysis.length,
                  )
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">Inventory turnover rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Waste Percentage</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.wasteAnalysis.wastePercentage.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(insights.wasteAnalysis.totalWasteValue)} in remnants
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Slow Moving Items</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.slowMovingItems.length}</div>
            <p className="text-xs text-muted-foreground">Items over 60 days in stock</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Suppliers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.supplierPerformance.length}</div>
            <p className="text-xs text-muted-foreground">
              {insights.supplierPerformance.filter((s) => s.performance === "excellent").length} excellent rated
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Turnover Analysis */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Material Turnover Analysis
          </CardTitle>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Material</TableHead>
                <TableHead className="text-right">Total Slabs</TableHead>
                <TableHead className="text-right">Consumed</TableHead>
                <TableHead className="text-right">Turnover Rate</TableHead>
                <TableHead className="text-right">Avg Days in Stock</TableHead>
                <TableHead>Velocity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {insights.turnoverAnalysis.map((analysis) => (
                <TableRow key={analysis.material}>
                  <TableCell className="font-medium">{analysis.material}</TableCell>
                  <TableCell className="text-right">{analysis.totalSlabs}</TableCell>
                  <TableCell className="text-right">{analysis.consumedSlabs}</TableCell>
                  <TableCell className="text-right">{analysis.turnoverRate.toFixed(1)}%</TableCell>
                  <TableCell className="text-right">{Math.round(analysis.averageDaysInStock)}</TableCell>
                  <TableCell>
                    <Badge className={getVelocityColor(analysis.velocity)}>{analysis.velocity}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Supplier Performance */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Supplier Performance Metrics
          </CardTitle>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Supplier</TableHead>
                <TableHead className="text-right">Total Value</TableHead>
                <TableHead className="text-right">On-Time Rate</TableHead>
                <TableHead className="text-right">Quality Score</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Last Delivery</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {insights.supplierPerformance.map((supplier) => (
                <TableRow key={supplier.supplier}>
                  <TableCell className="font-medium">{supplier.supplier}</TableCell>
                  <TableCell className="text-right">{formatCurrency(supplier.totalValue)}</TableCell>
                  <TableCell className="text-right">{supplier.onTimeRate.toFixed(1)}%</TableCell>
                  <TableCell className="text-right">{supplier.qualityScore}/100</TableCell>
                  <TableCell>
                    <Badge className={getPerformanceColor(supplier.performance)}>{supplier.performance}</Badge>
                  </TableCell>
                  <TableCell>{supplier.lastDelivery ? supplier.lastDelivery.toLocaleDateString() : "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Utilization Metrics */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Material Utilization & Efficiency
          </CardTitle>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.utilizationMetrics.map((metric) => (
              <div key={metric.material} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h4 className="font-medium">{metric.material}</h4>
                    <Badge className={getPerformanceColor(metric.efficiency)}>{metric.efficiency} efficiency</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {metric.totalConsumed}/{metric.totalReceived} utilized
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Utilization Rate</span>
                      <span>{metric.utilizationRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={metric.utilizationRate} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Waste Percentage</span>
                      <span className="text-red-600">{metric.wastePercentage.toFixed(1)}%</span>
                    </div>
                    <Progress value={metric.wastePercentage} className="h-2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Slow Moving Items */}
      {insights.slowMovingItems.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <Clock className="h-5 w-5" />
              Slow Moving Inventory
              <Badge variant="destructive">{insights.slowMovingItems.length}</Badge>
            </CardTitle>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Serial Number</TableHead>
                  <TableHead>Material</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead className="text-right">Days in Stock</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>Location</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {insights.slowMovingItems.slice(0, 10).map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.serialNumber}</TableCell>
                    <TableCell>{item.material}</TableCell>
                    <TableCell>{item.color}</TableCell>
                    <TableCell className="text-right">{item.daysInStock}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.cost)}</TableCell>
                    <TableCell>
                      <Badge className={getRiskColor(item.riskLevel)}>{item.riskLevel}</Badge>
                    </TableCell>
                    <TableCell>{item.location || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {insights.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              AI-Powered Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5" />
                  <p className="text-sm text-blue-900">{recommendation}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
