"use client"

import type React from "react"

import { Suspense, lazy } from "react"

interface LazyWrapperProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  height?: string
}

export function LazyWrapper({ children, fallback, height = "200px" }: LazyWrapperProps) {
  const defaultFallback = (
    <div className="flex items-center justify-center" style={{ height }}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  )

  return <Suspense fallback={fallback || defaultFallback}>{children}</Suspense>
}

// Lazy load heavy components
export const LazyInventoryCharts = lazy(() =>
  import("@/components/reports/inventory-charts").then((module) => ({
    default: module.InventoryCharts,
  })),
)

export const LazyReportFilters = lazy(() =>
  import("@/components/reports/report-filters").then((module) => ({
    default: module.ReportFilters,
  })),
)

export const LazyViewConfigurationModal = lazy(() =>
  import("@/components/views/view-configuration-modal").then((module) => ({
    default: module.ViewConfigurationModal,
  })),
)
