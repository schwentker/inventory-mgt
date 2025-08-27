"use client"

import { useEffect, useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Calendar, User, DollarSign } from "lucide-react"
import { InventoryStorage } from "@/lib/storage"

interface Job {
  id: string
  jobNumber: string
  customerName: string
  projectType: string
  status: "Planning" | "In Progress" | "Completed" | "On Hold"
  startDate: string | Date
  targetDate: string | Date
  squareFootage: number
  notes?: string
  estimatedValue?: number
  materials?: string[]
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadJobs()
  }, [])

  const loadJobs = async () => {
    try {
      const jobsData = InventoryStorage.getJobs()
      console.log("[v0] Loaded jobs data:", jobsData.length, "jobs")
      setJobs(jobsData)
    } catch (error) {
      console.error("Failed to load jobs:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "In Progress":
        return "default"
      case "Completed":
        return "secondary"
      case "Planning":
        return "outline"
      case "On Hold":
        return "destructive"
      default:
        return "outline"
    }
  }

  const formatDate = (date: string | Date) => {
    const dateObj = typeof date === "string" ? new Date(date) : date
    return dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const getEstimatedValue = (job: Job) => {
    if (job.estimatedValue) return job.estimatedValue
    // Estimate $150-300 per sq ft for stone fabrication
    return job.squareFootage * (Math.random() * 150 + 150)
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Jobs</h1>
              <p className="text-muted-foreground">Manage fabrication jobs and projects</p>
            </div>
          </div>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading jobs...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Jobs</h1>
            <p className="text-muted-foreground">Manage fabrication jobs and projects</p>
          </div>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Create Job
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Jobs</p>
                  <p className="text-2xl font-bold">{jobs.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold">{jobs.filter((j) => j.status === "In Progress").length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{jobs.filter((j) => j.status === "Completed").length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Value</p>
                  <p className="text-2xl font-bold">
                    ${jobs.reduce((sum, job) => sum + getEstimatedValue(job), 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4">
          {jobs.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No jobs found. Demo data may not be loaded yet.</p>
                <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
                  Refresh Page
                </Button>
              </CardContent>
            </Card>
          ) : (
            jobs.map((job) => (
              <Card key={job.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>
                        {job.customerName} - {job.projectType}
                      </CardTitle>
                      <CardDescription>{job.jobNumber}</CardDescription>
                    </div>
                    <Badge variant={getStatusVariant(job.status)}>{job.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{job.customerName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Due: {formatDate(job.targetDate)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">${getEstimatedValue(job).toLocaleString()}</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Size:</span> {job.squareFootage} sq ft
                    </div>
                  </div>
                  {job.notes && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm text-muted-foreground">{job.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </MainLayout>
  )
}
