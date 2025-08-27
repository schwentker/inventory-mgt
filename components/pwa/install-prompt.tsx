"use client"

import { useState } from "react"
import { Download, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { usePWA } from "./pwa-provider"

export function InstallPrompt() {
  const [dismissed, setDismissed] = useState(false)
  const { isInstallable, installApp } = usePWA()

  if (!isInstallable || dismissed) {
    return null
  }

  return (
    <Card className="fixed bottom-4 right-4 z-50 w-80 shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <Download className="h-6 w-6 text-cyan-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-900">Install App</h3>
              <p className="text-sm text-gray-500">Install this app for quick access and offline use.</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setDismissed(true)} className="flex-shrink-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-4 flex space-x-2">
          <Button onClick={installApp} size="sm" className="flex-1">
            Install
          </Button>
          <Button variant="outline" size="sm" onClick={() => setDismissed(true)} className="flex-1">
            Not Now
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
