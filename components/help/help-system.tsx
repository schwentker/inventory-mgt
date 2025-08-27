"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HelpCircle, Search } from "lucide-react"

interface HelpArticle {
  id: string
  title: string
  content: string
  category: "getting-started" | "features" | "shortcuts" | "troubleshooting"
  tags: string[]
  searchTerms: string[]
}

const helpArticles: HelpArticle[] = [
  {
    id: "quick-start",
    title: "Quick Start Guide",
    content: `
      <h3>Welcome to Stone Slab Inventory Management</h3>
      <p>This guide will help you get started with managing your stone slab inventory.</p>
      
      <h4>Step 1: Add Your First Slab</h4>
      <p>Click the "Add Slab" button in the top right corner of the Slabs page. Fill in the required information:</p>
      <ul>
        <li>Serial Number (auto-generated if left blank)</li>
        <li>Material and Color</li>
        <li>Dimensions (Length × Width × Thickness)</li>
        <li>Supplier and Cost</li>
      </ul>
      
      <h4>Step 2: Manage Your Inventory</h4>
      <p>Use the table view to see all your slabs. You can:</p>
      <ul>
        <li>Filter by material, status, or supplier</li>
        <li>Sort by any column</li>
        <li>Search across all fields</li>
        <li>Select multiple slabs for bulk operations</li>
      </ul>
      
      <h4>Step 3: Track Workflow</h4>
      <p>Each slab moves through these statuses:</p>
      <ul>
        <li><strong>Available:</strong> Ready for use</li>
        <li><strong>Reserved:</strong> Set aside for a job</li>
        <li><strong>In Production:</strong> Being fabricated</li>
        <li><strong>Consumed:</strong> Used in a project</li>
      </ul>
    `,
    category: "getting-started",
    tags: ["basics", "tutorial", "first-time"],
    searchTerms: ["start", "begin", "new", "first", "tutorial", "guide"],
  },
  {
    id: "keyboard-shortcuts",
    title: "Keyboard Shortcuts",
    content: `
      <h3>Keyboard Shortcuts</h3>
      <p>Use these shortcuts to work more efficiently:</p>
      
      <h4>Global Shortcuts</h4>
      <ul>
        <li><kbd>Ctrl/Cmd + K</kbd> - Open search</li>
        <li><kbd>Ctrl/Cmd + /</kbd> - Show this help</li>
        <li><kbd>Ctrl/Cmd + N</kbd> - Add new slab</li>
        <li><kbd>Esc</kbd> - Close dialogs/modals</li>
      </ul>
      
      <h4>Table Navigation</h4>
      <ul>
        <li><kbd>↑/↓</kbd> - Navigate rows</li>
        <li><kbd>Space</kbd> - Select/deselect row</li>
        <li><kbd>Ctrl/Cmd + A</kbd> - Select all</li>
        <li><kbd>Delete</kbd> - Delete selected items</li>
      </ul>
      
      <h4>Form Shortcuts</h4>
      <ul>
        <li><kbd>Ctrl/Cmd + Enter</kbd> - Save form</li>
        <li><kbd>Tab</kbd> - Next field</li>
        <li><kbd>Shift + Tab</kbd> - Previous field</li>
      </ul>
    `,
    category: "shortcuts",
    tags: ["keyboard", "shortcuts", "hotkeys", "navigation"],
    searchTerms: ["keyboard", "shortcuts", "hotkeys", "keys", "navigation", "ctrl", "cmd"],
  },
  {
    id: "filtering-searching",
    title: "Advanced Filtering & Search",
    content: `
      <h3>Advanced Filtering & Search</h3>
      
      <h4>Quick Search</h4>
      <p>Use the search bar to find slabs across all fields. Search supports:</p>
      <ul>
        <li>Serial numbers: "SL-2024-001"</li>
        <li>Materials: "granite", "quartz"</li>
        <li>Colors: "white", "black"</li>
        <li>Suppliers: "Stone Supply Co"</li>
      </ul>
      
      <h4>Advanced Filters</h4>
      <p>Click the filter icon to access advanced filtering:</p>
      <ul>
        <li><strong>Material & Color:</strong> Multi-select checkboxes</li>
        <li><strong>Status:</strong> Filter by workflow status</li>
        <li><strong>Date Range:</strong> Filter by received date</li>
        <li><strong>Size Range:</strong> Filter by dimensions</li>
        <li><strong>Cost Range:</strong> Filter by price</li>
      </ul>
      
      <h4>Saved Filters</h4>
      <p>Save frequently used filter combinations:</p>
      <ul>
        <li>Click "Save Filter" after setting up filters</li>
        <li>Give it a descriptive name</li>
        <li>Access from the "My Filters" dropdown</li>
      </ul>
      
      <h4>Smart Filters</h4>
      <p>Pre-configured filters for common scenarios:</p>
      <ul>
        <li><strong>Available for Allocation:</strong> Ready-to-use slabs</li>
        <li><strong>Low Stock Materials:</strong> Materials running low</li>
        <li><strong>Remnants:</strong> Small pieces under 24" in any dimension</li>
      </ul>
    `,
    category: "features",
    tags: ["filtering", "search", "advanced", "saved filters"],
    searchTerms: ["filter", "search", "find", "advanced", "saved", "smart"],
  },
  {
    id: "bulk-operations",
    title: "Bulk Operations",
    content: `
      <h3>Bulk Operations</h3>
      <p>Efficiently manage multiple slabs at once.</p>
      
      <h4>Selecting Multiple Slabs</h4>
      <ul>
        <li>Click checkboxes to select individual slabs</li>
        <li>Use "Select All" to select all visible slabs</li>
        <li>Hold Shift and click to select a range</li>
      </ul>
      
      <h4>Available Bulk Actions</h4>
      <ul>
        <li><strong>Status Update:</strong> Change status of multiple slabs</li>
        <li><strong>Location Change:</strong> Move slabs to different locations</li>
        <li><strong>Supplier Update:</strong> Change supplier information</li>
        <li><strong>Export:</strong> Export selected slabs to CSV/JSON</li>
        <li><strong>Delete:</strong> Remove multiple slabs (with confirmation)</li>
      </ul>
      
      <h4>Batch Allocation</h4>
      <p>Allocate multiple slabs to a job:</p>
      <ul>
        <li>Select slabs you want to allocate</li>
        <li>Click "Allocate to Job"</li>
        <li>Enter job details and confirm</li>
      </ul>
    `,
    category: "features",
    tags: ["bulk", "batch", "multiple", "operations"],
    searchTerms: ["bulk", "batch", "multiple", "select", "operations", "mass"],
  },
  {
    id: "reports-analytics",
    title: "Reports & Analytics",
    content: `
      <h3>Reports & Analytics</h3>
      <p>Gain insights into your inventory performance.</p>
      
      <h4>Dashboard Overview</h4>
      <ul>
        <li><strong>Status Cards:</strong> Quick counts by status</li>
        <li><strong>Inventory Value:</strong> Total value of your stock</li>
        <li><strong>Recent Activity:</strong> Latest status changes</li>
        <li><strong>Low Stock Alerts:</strong> Materials running low</li>
      </ul>
      
      <h4>Detailed Reports</h4>
      <ul>
        <li><strong>Material Breakdown:</strong> Inventory by material type</li>
        <li><strong>Supplier Analysis:</strong> Performance by supplier</li>
        <li><strong>Remnants Report:</strong> Small pieces available</li>
        <li><strong>Turnover Analysis:</strong> How quickly materials move</li>
      </ul>
      
      <h4>Charts & Visualizations</h4>
      <ul>
        <li><strong>Bar Charts:</strong> Material quantities</li>
        <li><strong>Pie Charts:</strong> Status distribution</li>
        <li><strong>Time Series:</strong> Inventory movements over time</li>
      </ul>
      
      <h4>Export Options</h4>
      <ul>
        <li>Export reports to CSV or PDF</li>
        <li>Print-friendly formats</li>
        <li>Chart image exports</li>
      </ul>
    `,
    category: "features",
    tags: ["reports", "analytics", "charts", "insights"],
    searchTerms: ["reports", "analytics", "charts", "insights", "dashboard", "export"],
  },
]

export function HelpSystem() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredArticles, setFilteredArticles] = useState(helpArticles)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  useEffect(() => {
    const filtered = helpArticles.filter((article) => {
      const matchesSearch =
        searchQuery === "" ||
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.searchTerms.some((term) => term.toLowerCase().includes(searchQuery.toLowerCase())) ||
        article.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesCategory = selectedCategory === "all" || article.category === selectedCategory

      return matchesSearch && matchesCategory
    })

    setFilteredArticles(filtered)
  }, [searchQuery, selectedCategory])

  // Global keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "/") {
        e.preventDefault()
        setIsOpen(true)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <HelpCircle className="h-4 w-4" />
          Help
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Help & Documentation
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="shortcuts">Shortcuts</TabsTrigger>
              <TabsTrigger value="troubleshooting">Troubleshooting</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedCategory} className="mt-4">
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-4">
                  {filteredArticles.map((article) => (
                    <div key={article.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-lg">{article.title}</h3>
                        <div className="flex gap-1">
                          {article.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: article.content }}
                      />
                    </div>
                  ))}

                  {filteredArticles.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <HelpCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No help articles found matching your search.</p>
                      <p className="text-sm">Try different keywords or browse by category.</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
