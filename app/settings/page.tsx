"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, Package, Users, Database, Sliders, Bell, Shield, Save } from "lucide-react"

import { MaterialsManagement } from "@/components/settings/materials-management"
import { SuppliersManagement } from "@/components/settings/suppliers-management"
import { ApplicationSettings } from "@/components/settings/application-settings"
import { DataManagement } from "@/components/settings/data-management"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("materials")

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Configure your inventory management system</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
            <TabsTrigger value="materials" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Materials</span>
            </TabsTrigger>
            <TabsTrigger value="suppliers" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Suppliers</span>
            </TabsTrigger>
            <TabsTrigger value="application" className="flex items-center gap-2">
              <Sliders className="h-4 w-4" />
              <span className="hidden sm:inline">Application</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">Data</span>
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">System</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="materials" className="space-y-6">
            <MaterialsManagement />
          </TabsContent>

          <TabsContent value="suppliers" className="space-y-6">
            <SuppliersManagement />
          </TabsContent>

          <TabsContent value="application" className="space-y-6">
            <ApplicationSettings />
          </TabsContent>

          <TabsContent value="data" className="space-y-6">
            <DataManagement />
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    System Settings
                  </CardTitle>
                  <CardDescription>General system configuration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="company-name" className="text-sm font-medium">
                      Company Name
                    </label>
                    <input
                      id="company-name"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      defaultValue="Stone Fabrication Co."
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="warehouse-location" className="text-sm font-medium">
                      Warehouse Location
                    </label>
                    <input
                      id="warehouse-location"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      defaultValue="Main Warehouse"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="currency" className="text-sm font-medium">
                      Default Currency
                    </label>
                    <input
                      id="currency"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      defaultValue="USD"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notifications
                  </CardTitle>
                  <CardDescription>Configure notification preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label htmlFor="low-stock" className="text-sm font-medium">
                      Low Stock Alerts
                    </label>
                    <button
                      type="button"
                      role="switch"
                      aria-checked="true"
                      data-state="checked"
                      value="on"
                      className="peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input bg-primary"
                      id="low-stock"
                    >
                      <span className="pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0 translate-x-5"></span>
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="new-orders" className="text-sm font-medium">
                      New Order Notifications
                    </label>
                    <button
                      type="button"
                      role="switch"
                      aria-checked="true"
                      data-state="checked"
                      value="on"
                      className="peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input bg-primary"
                      id="new-orders"
                    >
                      <span className="pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0 translate-x-5"></span>
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="job-updates" className="text-sm font-medium">
                      Job Status Updates
                    </label>
                    <button
                      type="button"
                      role="switch"
                      aria-checked="false"
                      data-state="unchecked"
                      value="on"
                      className="peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input bg-input"
                      id="job-updates"
                    >
                      <span className="pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0 translate-x-0"></span>
                    </button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Security
                  </CardTitle>
                  <CardDescription>Security and access settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label htmlFor="two-factor" className="text-sm font-medium">
                      Two-Factor Authentication
                    </label>
                    <button
                      type="button"
                      role="switch"
                      aria-checked="false"
                      data-state="unchecked"
                      value="on"
                      className="peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input bg-input"
                      id="two-factor"
                    >
                      <span className="pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0 translate-x-0"></span>
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="session-timeout" className="text-sm font-medium">
                      Auto Logout
                    </label>
                    <button
                      type="button"
                      role="switch"
                      aria-checked="true"
                      data-state="checked"
                      value="on"
                      className="peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input bg-primary"
                      id="session-timeout"
                    >
                      <span className="pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0 translate-x-5"></span>
                    </button>
                  </div>
                  <Button variant="outline" className="w-full bg-transparent">
                    Change Password
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common system operations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full bg-transparent" onClick={() => setActiveTab("data")}>
                    <Database className="h-4 w-4 mr-2" />
                    Manage Data
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent" onClick={() => setActiveTab("materials")}>
                    <Package className="h-4 w-4 mr-2" />
                    Manage Materials
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent" onClick={() => setActiveTab("suppliers")}>
                    <Users className="h-4 w-4 mr-2" />
                    Manage Suppliers
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end">
              <Button>
                <Save className="h-4 w-4 mr-2" />
                Save System Settings
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}
