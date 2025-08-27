"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Header } from "./header"
import { Sidebar } from "./sidebar"
import { SkipLinks } from "@/components/accessibility/skip-links"
import { useSkipLinks, useAccessibilityPreferences } from "@/hooks/use-accessibility"
import { BatchProgressIndicator } from "@/components/workflow/batch-progress-indicator"
import { batchOperationManager } from "@/lib/batch-operations"
import type { BatchOperation } from "@/components/workflow/batch-progress-indicator"
import { InventoryStorage } from "@/lib/storage"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { prefersReducedMotion } = useAccessibilityPreferences()
  const [batchOperations, setBatchOperations] = useState<BatchOperation[]>([])

  useSkipLinks()

  useEffect(() => {
    const unsubscribe = batchOperationManager.subscribe((operations) => {
      setBatchOperations(operations)
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    InventoryStorage.autoLoadDemoDataIfNeeded()
  }, [])

  return (
    <div className="h-screen flex flex-col bg-background">
      <SkipLinks />

      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex flex-1 overflow-hidden">
        <nav id="navigation" aria-label="Main navigation" role="navigation">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        </nav>

        <main id="main-content" className="flex-1 overflow-y-auto" role="main" aria-label="Main content" tabIndex={-1}>
          <div className={`p-3 sm:p-6 ${prefersReducedMotion ? "" : "transition-all duration-200"}`}>{children}</div>
        </main>
      </div>

      <BatchProgressIndicator
        operations={batchOperations}
        onCancel={(id) => batchOperationManager.cancelOperation(id)}
        onDismiss={(id) => batchOperationManager.dismissOperation(id)}
      />
    </div>
  )
}
