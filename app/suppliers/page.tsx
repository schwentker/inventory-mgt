import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Phone, Mail } from "lucide-react"

export default function SuppliersPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Suppliers</h1>
            <p className="text-muted-foreground">Manage your stone suppliers and contacts</p>
          </div>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Supplier
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Stone Depot</CardTitle>
              <CardDescription>Primary Supplier</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-medium">John Smith</p>
                <p className="text-sm text-muted-foreground">Contact Person</p>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4" />
                <span>(555) 123-4567</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4" />
                <span>john@stonedepot.com</span>
              </div>
              <Badge variant="secondary">Active</Badge>
            </CardContent>
          </Card>

          <Card className="border-dashed">
            <CardContent className="flex items-center justify-center h-full min-h-[160px]">
              <Button variant="ghost" className="h-full w-full">
                <Plus className="h-6 w-6 mr-2" />
                Add New Supplier
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
