"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { Slab } from "@/types/inventory"
import { formatCurrency, getStatusColor } from "@/lib/utils/inventory"

interface PrintViewProps {
  slabs: Slab[]
  title?: string
  showSummary?: boolean
  className?: string
}

export function PrintView({ slabs, title = "Slab Inventory Report", showSummary = true, className }: PrintViewProps) {
  const statusCounts = slabs.reduce(
    (acc, slab) => {
      acc[slab.status] = (acc[slab.status] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const totalValue = slabs.reduce((sum, slab) => sum + (slab.cost || 0), 0)

  return (
    <div className={`print:p-0 print:m-0 ${className}`}>
      <style jsx global>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
          .no-print {
            display: none !important;
          }
          .print-break {
            page-break-before: always;
          }
        }
      `}</style>

      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="text-muted-foreground">Generated on {new Date().toLocaleString()}</p>
        </div>

        {/* Summary */}
        {showSummary && (
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{slabs.length}</div>
                  <div className="text-sm text-muted-foreground">Total Slabs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
                  <div className="text-sm text-muted-foreground">Total Value</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{Object.keys(statusCounts).length}</div>
                  <div className="text-sm text-muted-foreground">Status Types</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{new Set(slabs.map((s) => s.material)).size}</div>
                  <div className="text-sm text-muted-foreground">Materials</div>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-2">
                <h4 className="font-medium">Status Breakdown</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(statusCounts).map(([status, count]) => (
                    <Badge key={status} className={getStatusColor(status as any)}>
                      {status}: {count}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Slab List */}
        <Card>
          <CardHeader>
            <CardTitle>Slab Details ({slabs.length} items)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-medium">Serial</th>
                    <th className="text-left p-2 font-medium">Material</th>
                    <th className="text-left p-2 font-medium">Color</th>
                    <th className="text-left p-2 font-medium">Dimensions</th>
                    <th className="text-left p-2 font-medium">Status</th>
                    <th className="text-left p-2 font-medium">Supplier</th>
                    <th className="text-left p-2 font-medium">Cost</th>
                    <th className="text-left p-2 font-medium">Location</th>
                  </tr>
                </thead>
                <tbody>
                  {slabs.map((slab, index) => (
                    <tr key={slab.id} className={`border-b ${index % 2 === 0 ? "bg-muted/20" : ""}`}>
                      <td className="p-2 font-mono text-sm">{slab.serialNumber}</td>
                      <td className="p-2">{slab.material}</td>
                      <td className="p-2">{slab.color}</td>
                      <td className="p-2 text-sm">
                        {slab.length}" × {slab.width}" × {slab.thickness}"
                      </td>
                      <td className="p-2">
                        <Badge className={getStatusColor(slab.status)} variant="outline">
                          {slab.status}
                        </Badge>
                      </td>
                      <td className="p-2">{slab.supplier}</td>
                      <td className="p-2">{slab.cost ? formatCurrency(slab.cost) : "-"}</td>
                      <td className="p-2">{slab.location || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground print:fixed print:bottom-4 print:left-0 print:right-0">
          <p>Slab Inventory Management System - Report generated on {new Date().toLocaleString()}</p>
        </div>
      </div>
    </div>
  )
}
