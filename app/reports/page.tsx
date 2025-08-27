"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, PieChart, TrendingUp, Filter, Download, FileText, Lightbulb } from "lucide-react"
import { useState } from "react"
import { DashboardOverview } from "@/components/reports/dashboard-overview"
import { InventoryReports } from "@/components/reports/inventory-reports"
import { InventoryCharts } from "@/components/reports/inventory-charts"
import { ReportFilters, type ReportFilterState } from "@/components/reports/report-filters"
import { InventoryInsightsDashboard } from "@/components/insights/inventory-insights-dashboard"
import type { Slab } from "@/types/inventory"

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [filters, setFilters] = useState<ReportFilterState>({
    materials: [],
    suppliers: [],
    statuses: [],
    locations: [],
    searchTerm: "",
    slabTypes: [],
  })
  const [filteredData, setFilteredData] = useState<Slab[]>([])

  const handleFiltersChange = (newFilters: ReportFilterState) => {
    setFilters(newFilters)
  }

  const handleExport = (format: "csv" | "pdf", data: Slab[]) => {
    if (format === "csv") {
      exportToCSV(data)
    } else {
      exportToPDF(data)
    }
  }

  const exportToCSV = (data: Slab[]) => {
    const headers = [
      "Serial Number",
      "Material",
      "Color",
      "Supplier",
      "Status",
      "Length",
      "Width",
      "Thickness",
      "Cost",
      "Location",
      "Received Date",
      "Consumed Date",
    ]

    const csvContent = [
      headers.join(","),
      ...data.map((slab) =>
        [
          slab.serialNumber,
          slab.material,
          slab.color,
          slab.supplier,
          slab.status,
          slab.length || "",
          slab.width || "",
          slab.thickness || "",
          slab.cost || "",
          slab.location || "",
          slab.receivedDate ? new Date(slab.receivedDate).toLocaleDateString() : "",
          slab.consumedDate ? new Date(slab.consumedDate).toLocaleDateString() : "",
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `inventory-report-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportToPDF = (data: Slab[]) => {
    // This would typically use a library like jsPDF or similar
    console.log("Exporting to PDF:", data.length, "items")
    // Implementation would go here for actual PDF generation
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (filters.dateRange?.from || filters.dateRange?.to) count++
    if (filters.materials.length > 0) count++
    if (filters.suppliers.length > 0) count++
    if (filters.statuses.length > 0) count++
    if (filters.locations.length > 0) count++
    if (filters.slabTypes.length > 0) count++
    if (filters.searchTerm.trim()) count++
    return count
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
            <p className="text-muted-foreground">
              Comprehensive inventory insights and business intelligence
              {getActiveFilterCount() > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {getActiveFilterCount()} filters active
                </Badge>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => handleExport("csv", filteredData)}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline" onClick={() => handleExport("pdf", filteredData)}>
              <FileText className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Insights
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="charts" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Charts
            </TabsTrigger>
            <TabsTrigger value="filters" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
              {getActiveFilterCount() > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {getActiveFilterCount()}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <DashboardOverview />
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <InventoryInsightsDashboard />
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <InventoryReports />
          </TabsContent>

          <TabsContent value="charts" className="space-y-6">
            <InventoryCharts />
          </TabsContent>

          <TabsContent value="filters" className="space-y-6">
            <ReportFilters onFiltersChange={handleFiltersChange} onExport={handleExport} />

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Material Analysis
                  </CardTitle>
                  <CardDescription>Analyze inventory by material type and color</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" onClick={() => setActiveTab("charts")}>
                    View Charts
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Status Distribution
                  </CardTitle>
                  <CardDescription>View slab status breakdown and workflow</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" onClick={() => setActiveTab("charts")}>
                    View Distribution
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Detailed Reports
                  </CardTitle>
                  <CardDescription>Generate comprehensive inventory reports</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" onClick={() => setActiveTab("reports")}>
                    View Reports
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}
