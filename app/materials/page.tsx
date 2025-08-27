import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function MaterialsPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Materials</h1>
            <p className="text-muted-foreground">Manage material types and specifications</p>
          </div>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Material
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quartz</CardTitle>
              <CardDescription>Engineered Stone</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">
                  <strong>Colors:</strong> Calacatta Gold, Carrara White, Absolute Black
                </p>
                <p className="text-sm">
                  <strong>Thickness:</strong> 12mm, 20mm, 30mm
                </p>
                <p className="text-sm text-muted-foreground">15 slabs in stock</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Granite</CardTitle>
              <CardDescription>Natural Stone</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">
                  <strong>Colors:</strong> Black Galaxy, Kashmir White, Absolute Black
                </p>
                <p className="text-sm">
                  <strong>Thickness:</strong> 20mm, 30mm
                </p>
                <p className="text-sm text-muted-foreground">8 slabs in stock</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-dashed">
            <CardContent className="flex items-center justify-center h-full min-h-[120px]">
              <Button variant="ghost" className="h-full w-full">
                <Plus className="h-6 w-6 mr-2" />
                Add New Material
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
