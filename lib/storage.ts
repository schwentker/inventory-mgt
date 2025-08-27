// Local storage utilities for offline-first inventory management
import type { Slab, Material, Supplier } from "@/types/inventory"
import { generateDemoData } from "./generate-demo-data"
import { ConfigService } from "./config"

const STORAGE_KEYS = {
  SLABS: "inventory_slabs",
  MATERIALS: "inventory_materials",
  SUPPLIERS: "inventory_suppliers",
  SETTINGS: "inventory_settings",
  JOBS: "inventory_jobs",
} as const

// Generic storage utilities
export class LocalStorage {
  static get<T>(key: string): T | null {
    if (typeof window === "undefined") return null

    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.error(`Error reading from localStorage key "${key}":`, error)
      return null
    }
  }

  static set<T>(key: string, value: T): void {
    if (typeof window === "undefined") return

    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Error writing to localStorage key "${key}":`, error)
    }
  }

  static remove(key: string): void {
    if (typeof window === "undefined") return
    localStorage.removeItem(key)
  }

  static clear(): void {
    if (typeof window === "undefined") return
    localStorage.clear()
  }
}

// Inventory-specific storage utilities
export class InventoryStorage {
  // Slab operations
  static getSlabs(): Slab[] {
    return LocalStorage.get<Slab[]>(STORAGE_KEYS.SLABS) || []
  }

  static saveSlabs(slabs: Slab[]): void {
    LocalStorage.set(STORAGE_KEYS.SLABS, slabs)
  }

  static addSlab(slab: Slab): void {
    const slabs = this.getSlabs()
    slabs.push(slab)
    this.saveSlabs(slabs)
  }

  static updateSlab(id: string, updates: Partial<Slab>): void {
    const slabs = this.getSlabs()
    const index = slabs.findIndex((slab) => slab.id === id)
    if (index !== -1) {
      slabs[index] = { ...slabs[index], ...updates }
      this.saveSlabs(slabs)
    }
  }

  static deleteSlab(id: string): void {
    const slabs = this.getSlabs().filter((slab) => slab.id !== id)
    this.saveSlabs(slabs)
  }

  // Material operations
  static getMaterials(): Material[] {
    return LocalStorage.get<Material[]>(STORAGE_KEYS.MATERIALS) || []
  }

  static saveMaterials(materials: Material[]): void {
    LocalStorage.set(STORAGE_KEYS.MATERIALS, materials)
  }

  static addMaterial(material: Material): void {
    const materials = this.getMaterials()
    materials.push(material)
    this.saveMaterials(materials)
  }

  // Supplier operations
  static getSuppliers(): Supplier[] {
    return LocalStorage.get<Supplier[]>(STORAGE_KEYS.SUPPLIERS) || []
  }

  static saveSuppliers(suppliers: Supplier[]): void {
    LocalStorage.set(STORAGE_KEYS.SUPPLIERS, suppliers)
  }

  static addSupplier(supplier: Supplier): void {
    const suppliers = this.getSuppliers()
    suppliers.push(supplier)
    this.saveSuppliers(suppliers)
  }

  // Job operations
  static getJobs(): any[] {
    return LocalStorage.get<any[]>(STORAGE_KEYS.JOBS) || []
  }

  static saveJobs(jobs: any[]): void {
    LocalStorage.set(STORAGE_KEYS.JOBS, jobs)
  }

  static async autoLoadDemoDataIfNeeded(): Promise<void> {
    const currentSlabs = this.getSlabs()
    if (currentSlabs.length < 1000) {
      console.log(`Found ${currentSlabs.length} slabs, loading comprehensive demo data...`)

      await this.loadConfigurationData()

      const demoData = generateDemoData()

      // Convert dates from demo data (they're Date objects, need to be serializable)
      const slabsWithStringDates = demoData.slabs.map((slab) => ({
        ...slab,
        receivedDate: slab.receivedDate?.toISOString(),
        consumedDate: slab.consumedDate?.toISOString(),
      }))

      const jobsWithStringDates = demoData.jobs.map((job) => ({
        ...job,
        startDate: job.startDate.toISOString(),
        targetDate: job.targetDate.toISOString(),
      }))

      this.saveSlabs(slabsWithStringDates as any)
      this.saveJobs(jobsWithStringDates)
      this.saveMaterials(demoData.materials as any)
      this.saveSuppliers(demoData.suppliers as any)

      console.log(
        `Auto-loaded ${demoData.summary.totalSlabs} slabs worth $${demoData.summary.totalValue.toLocaleString()}`,
      )
    }
  }

  static initializeSampleData(): void {
    this.autoLoadDemoDataIfNeeded()
  }

  static async resetWithDemoData(): Promise<void> {
    console.log("Resetting with fresh demo data...")

    await this.loadConfigurationData()

    const demoData = generateDemoData()

    // Convert dates from demo data
    const slabsWithStringDates = demoData.slabs.map((slab) => ({
      ...slab,
      receivedDate: slab.receivedDate?.toISOString(),
      consumedDate: slab.consumedDate?.toISOString(),
    }))

    const jobsWithStringDates = demoData.jobs.map((job) => ({
      ...job,
      startDate: job.startDate.toISOString(),
      targetDate: job.targetDate.toISOString(),
    }))

    this.saveSlabs(slabsWithStringDates as any)
    this.saveJobs(jobsWithStringDates)
    this.saveMaterials(demoData.materials as any)
    this.saveSuppliers(demoData.suppliers as any)

    console.log(
      `Reset with ${demoData.summary.totalSlabs} slabs worth $${demoData.summary.totalValue.toLocaleString()}`,
    )
  }

  private static async loadConfigurationData(): Promise<void> {
    try {
      // This will load the default configuration with comprehensive materials and suppliers
      await ConfigService.loadConfig()
      console.log("Configuration loaded with comprehensive materials and suppliers data")
    } catch (error) {
      console.error("Error loading configuration data:", error)
    }
  }
}
