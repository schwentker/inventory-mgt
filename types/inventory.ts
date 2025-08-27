// Core enums for stone slab inventory management
export enum SlabStatus {
  WANTED = "WANTED",
  ORDERED = "ORDERED",
  RECEIVED = "RECEIVED",
  ALLOCATED = "ALLOCATED",
  CONSUMED = "CONSUMED",
  REMNANT = "REMNANT",
  STOCK = "STOCK",
}

export enum SlabType {
  FULL = "FULL",
  REMNANT = "REMNANT",
}

// Core interfaces for the inventory system
export interface Slab {
  id: string
  serialNumber: string
  material: string
  color: string
  thickness: number // in mm
  length: number // in mm
  width: number // in mm
  supplier: string
  status: SlabStatus
  slabType: SlabType
  jobId?: string
  receivedDate?: Date
  consumedDate?: Date
  notes?: string
  cost?: number
  location?: string
}

export interface Material {
  id: string
  name: string
  colors: string[]
  defaultThickness: number[] // available thicknesses in mm
  category: string
}

export interface Supplier {
  id: string
  name: string
  contact: string
  phone: string
  email: string
}

// Utility types for forms and filtering
export type SlabFormData = Omit<Slab, "id">

export interface SlabFilters {
  status?: SlabStatus[]
  slabType?: SlabType[]
  material?: string[]
  supplier?: string[]
  location?: string[]
}

export interface InventoryStats {
  totalSlabs: number
  totalValue: number
  slabsByStatus: Record<SlabStatus, number>
  slabsByType: Record<SlabType, number>
  lowStockMaterials: string[]
}
