"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, Package, Users, Ruler, Download, TrendingDown } from "lucide-react"
import { useEffect, useState } from "react"
import { InventoryRepository, type InventorySummary } from "@/lib/repository"
import { SlabConstants } from "@/constants"
import type { Slab } from "@/types/inventory"

interface InventoryReportsProps {
  className?: string
}

interface MaterialColorBreakdown {
  material: string
  colors: Record<string, number>
  total: number
}

interface SupplierAnalysis {
  supplier: string
  totalSlabs: number
  totalValue: number
  averageCost: number
  materials: string[]
}

interface RemnantReport {
  id: string
  serialNumber: string
  material: string
  color: string
  dimensions: string
  area: number
  cost: number
  location?: string
}

export function InventoryReports({ className }: InventoryReportsProps) {
  const [summary, setSummary] = useState<InventorySummary | null>(null)
  const [slabs, setSlabs] = useState<Slab[]>([])
  const [materialBreakdown, setMaterialBreakdown] = useState<MaterialColorBreakdown[]>([])
  const [supplierAnalysis, setSupplierAnalysis] = useState<SupplierAnalysis[]>([])
  const [remnants, setRemnants] = useState<RemnantReport[]>([])
  const [loading, setLoading] = useState(true)
  const [lowStockThreshold, setLowStockThreshold] = useState(5)

  useEffect(() => {
    loadReportData()
  }, [])

  const loadReportData = async () => {
    setLoading(true)
    try {
      const repository = InventoryRepository.getInstance()

      // Load summary and slabs data
      const [summaryResult, slabsResult] = await Promise.all([repository.getInventorySummary(), repository.getSlabs()])

      if (summaryResult.success && summaryResult.data) {
        setSummary(summaryResult.data)
      }

      if (slabsResult.success && slabsResult.data) {
        setSlabs(slabsResult.data)
        generateMaterialBreakdown(slabsResult.data)
        generateSupplierAnalysis(slabsResult.data)
        generateRemnantsReport(slabsResult.data)
      }
    } catch (error) {
      console.error("Failed to load report data:", error)
    } finally {
      setLoading(false)
    }
  }

  const generateMaterialBreakdown = (slabData: Slab[]) => {
    const breakdown = new Map<string, Record<string, number>>()

    slabData.forEach((slab) => {
      if (!breakdown.has(slab.material)) {
        breakdown.set(slab.material, {})
      }
      const colors = breakdown.get(slab.material)!
      colors[slab.color] = (colors[slab.color] || 0) + 1
    })

    const result: MaterialColorBreakdown[] = Array.from(breakdown.entries()).map(([material, colors]) => ({
      material,
      colors,
      total: Object.values(colors).reduce((sum, count) => sum + count, 0),
    }))

    result.sort((a, b) => b.total - a.total)
    setMaterialBreakdown(result)
  }

  const generateSupplierAnalysis = (slabData: Slab[]) => {
    const analysis = new Map<string, SupplierAnalysis>()

    slabData.forEach((slab) => {
      if (!analysis.has(slab.supplier)) {
        analysis.set(slab.supplier, {
          supplier: slab.supplier,
          totalSlabs: 0,
          totalValue: 0,
          averageCost: 0,
          materials: [],
        })
      }

      const supplierData = analysis.get(slab.supplier)!
      supplierData.totalSlabs += 1
      supplierData.totalValue += slab.cost || 0

      if (!supplierData.materials.includes(slab.material)) {
        supplierData.materials.push(slab.material)
      }
    })

    const result = Array.from(analysis.values()).map((supplier) => ({
      ...supplier,
      averageCost: supplier.totalSlabs > 0 ? supplier.totalValue / supplier.totalSlabs : 0,
    }))

    result.sort((a, b) => b.totalValue - a.totalValue)
    setSupplierAnalysis(result)
  }

  const generateRemnantsReport = (slabData: Slab[]) => {
    // Consider slabs with area < 20 sq ft as remnants
    const remnantThreshold = 20

    const remnantSlabs = slabData
      .filter((slab) => {
        const area = ((slab.length || 0) * (slab.width || 0)) / 144 // Convert to sq ft
        return area < remnantThreshold && slab.status === SlabConstants.AVAILABLE
      })
      .map((slab) => ({
        id: slab.id,
        serialNumber: slab.serialNumber,
        material: slab.material,
        color: slab.color,
        dimensions: `${slab.length || 0}" × ${slab.width || 0}" × ${slab.thickness || 0}"`,
        area: ((slab.length || 0) * (slab.width || 0)) / 144,
        cost: slab.cost || 0,
        location: slab.location,
      }))

    remnantSlabs.sort((a, b) => a.area - b.area)
    setRemnants(remnantSlabs)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const exportReport = (reportType: string) => {
    // Implementation for exporting reports
    console.log(`Exporting ${reportType} report`)
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
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse" />
                  <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Material & Color Breakdown */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Material & Color Breakdown
          </CardTitle>
          <Button variant="outline" size="sm" onClick={() => exportReport("material-breakdown")}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {materialBreakdown.map((material) => (
              <div key={material.material} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{material.material}</h4>
                  <Badge variant="secondary">{material.total} slabs</Badge>
                </div>
                <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                  {Object.entries(material.colors).map(([color, count]) => (
                    <div key={color} className="flex items-center justify-between p-2 bg-muted rounded">
                      <span className="text-sm">{color}</span>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Supplier Analysis */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Supplier Analysis
          </CardTitle>
          <Button variant="outline" size="sm" onClick={() => exportReport("supplier-analysis")}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Supplier</TableHead>
                <TableHead className="text-right">Slabs</TableHead>
                <TableHead className="text-right">Total Value</TableHead>
                <TableHead className="text-right">Avg Cost</TableHead>
                <TableHead>Materials</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {supplierAnalysis.map((supplier) => (
                <TableRow key={supplier.supplier}>
                  <TableCell className="font-medium">{supplier.supplier}</TableCell>
                  <TableCell className="text-right">{supplier.totalSlabs}</TableCell>
                  <TableCell className="text-right">{formatCurrency(supplier.totalValue)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(supplier.averageCost)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {supplier.materials.map((material) => (
                        <Badge key={material} variant="outline" className="text-xs">
                          {material}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Remnants Report */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Ruler className="h-5 w-5" />
            Remnants Report
            <Badge variant="secondary">{remnants.length} items</Badge>
          </CardTitle>
          <Button variant="outline" size="sm" onClick={() => exportReport("remnants")}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </CardHeader>
        <CardContent>
          {remnants.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Serial Number</TableHead>
                  <TableHead>Material</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Dimensions</TableHead>
                  <TableHead className="text-right">Area (sq ft)</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                  <TableHead>Location</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {remnants.map((remnant) => (
                  <TableRow key={remnant.id}>
                    <TableCell className="font-medium">{remnant.serialNumber}</TableCell>
                    <TableCell>{remnant.material}</TableCell>
                    <TableCell>{remnant.color}</TableCell>
                    <TableCell>{remnant.dimensions}</TableCell>
                    <TableCell className="text-right">{remnant.area.toFixed(1)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(remnant.cost)}</TableCell>
                    <TableCell>{remnant.location || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No remnants found (slabs under 20 sq ft)</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Low Stock Alerts */}
      {summary && summary.lowStockAlerts.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <AlertTriangle className="h-5 w-5" />
              Low Stock Alerts
              <Badge variant="destructive">{summary.lowStockAlerts.length}</Badge>
            </CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Threshold: {lowStockThreshold}</span>
              <Button variant="outline" size="sm" onClick={() => exportReport("low-stock")}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {summary.lowStockAlerts.map((material) => {
                const count = summary.slabsByMaterial[material]
                const percentage = (count / lowStockThreshold) * 100
                return (
                  <div key={material} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{material}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive">{count} remaining</Badge>
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      </div>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
