// Constants for the inventory management system
import { SlabStatus, SlabType } from "@/types/inventory"

export const SlabConstants = {
  // Individual status constants for easy access
  WANTED: SlabStatus.WANTED,
  ORDERED: SlabStatus.ORDERED,
  RECEIVED: SlabStatus.RECEIVED,
  ALLOCATED: SlabStatus.ALLOCATED,
  CONSUMED: SlabStatus.CONSUMED,
  REMNANT: SlabStatus.REMNANT,
  STOCK: SlabStatus.STOCK,

  // Full status and type objects for iteration
  Status: SlabStatus,
  Type: SlabType,

  // Status groups for business logic
  StatusGroups: {
    ACTIVE: [SlabStatus.STOCK, SlabStatus.ALLOCATED, SlabStatus.RECEIVED],
    INACTIVE: [SlabStatus.CONSUMED, SlabStatus.REMNANT],
    PENDING: [SlabStatus.WANTED, SlabStatus.ORDERED],
  },

  // Type groups
  TypeGroups: {
    SELLABLE: [SlabType.FULL, SlabType.REMNANT],
  },
} as const

// Export individual enums for backward compatibility
export { SlabStatus, SlabType }

// Additional constants for the application
export const AppConstants = {
  // Storage keys
  STORAGE_KEYS: {
    SLABS: "inventory_slabs",
    MATERIALS: "inventory_materials",
    SUPPLIERS: "inventory_suppliers",
    CONFIG: "inventory_config",
    SCHEMA: "inventory_schema",
    AUTO_SAVE: "inventory_auto_save",
  },

  // Default values
  DEFAULTS: {
    SLAB_THICKNESS: 20,
    SLAB_LENGTH: 3200,
    SLAB_WIDTH: 1600,
    AUTO_SAVE_DELAY: 1000,
    MAX_ERRORS: 100,
  },

  // Validation limits
  LIMITS: {
    MIN_THICKNESS: 10,
    MAX_THICKNESS: 50,
    MIN_LENGTH: 1000,
    MAX_LENGTH: 4000,
    MIN_WIDTH: 500,
    MAX_WIDTH: 2000,
  },
} as const
