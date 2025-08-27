// Configuration types for the inventory management system
export interface AppConfig {
  materials: ConfigMaterial[]
  suppliers: ConfigSupplier[]
  defaultColumns: SlabColumn[]
  availableColumns: SlabColumn[]
  businessRules: BusinessRules
  version: string
  lastUpdated: Date
}

export interface ConfigMaterial {
  id: string
  name: string
  colors: string[]
  defaultThickness: number[]
  category: string
  isActive: boolean
}

export interface ConfigSupplier {
  id: string
  name: string
  contact: string
  phone: string
  email: string
  isActive: boolean
}

export interface SlabColumn {
  key: keyof import("./inventory").Slab | "actions"
  label: string
  sortable: boolean
  filterable: boolean
  width?: number
  isVisible: boolean
}

export interface BusinessRules {
  minSlabThickness: number
  maxSlabThickness: number
  minSlabLength: number
  maxSlabLength: number
  minSlabWidth: number
  maxSlabWidth: number
  requireSerialNumber: boolean
  allowNegativeCost: boolean
  autoGenerateSerialNumber: boolean
  defaultSlabStatus: import("./inventory").SlabStatus
  defaultLocation: string
}

export interface StorageSchema {
  version: string
  data: {
    slabs: import("./inventory").Slab[]
    materials: import("./inventory").Material[]
    suppliers: import("./inventory").Supplier[]
    config: AppConfig
  }
  metadata: {
    createdAt: Date
    lastModified: Date
    recordCount: number
  }
}
