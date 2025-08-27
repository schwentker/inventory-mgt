// Configuration management service
import type { AppConfig, ConfigMaterial, ConfigSupplier, SlabColumn, BusinessRules } from "@/types/config"
import type { SlabStatus } from "@/types/inventory"
import { LocalStorage } from "./storage"
import { SUPPLIERS } from "@/data/suppliers"

const CONFIG_KEY = "inventory_config"
const CONFIG_VERSION = "1.0.0"

// Default configuration
const DEFAULT_CONFIG: AppConfig = {
  materials: [
    {
      id: "granite",
      name: "Granite",
      colors: [
        "Black Galaxy",
        "Kashmir White",
        "Absolute Black",
        "Bianco Antico",
        "Uba Tuba",
        "Baltic Brown",
        "Giallo Ornamental",
        "Santa Cecilia",
        "Venetian Gold",
        "Tan Brown",
        "Blue Pearl",
        "Verde Peacock",
        "Colonial White",
        "Imperial Red",
        "Labrador Antique",
      ],
      defaultThickness: [20, 30],
      category: "Natural Stone",
      isActive: true,
    },
    {
      id: "quartz",
      name: "Quartz",
      colors: [
        "Calacatta Gold",
        "Carrara White",
        "Absolute Black",
        "Pure White",
        "Statuario",
        "Caesarstone White",
        "Silestone Blanco",
        "Cambria Quartz",
        "Corian Quartz",
        "Arctic White",
        "Eternal Calacatta",
        "Dekton Aura",
        "Neolith Iron",
        "Lapitec Bianco",
        "Laminam Oxide",
      ],
      defaultThickness: [12, 20, 30],
      category: "Engineered Stone",
      isActive: true,
    },
    {
      id: "marble",
      name: "Marble",
      colors: [
        "Carrara White",
        "Calacatta Gold",
        "Emperador Dark",
        "Crema Marfil",
        "Thassos White",
        "Nero Marquina",
        "Travertine Beige",
        "Botticino",
        "Statuario Venato",
        "Arabescato",
        "Breccia Capraia",
        "Portoro Gold",
        "Verde Guatemala",
        "Rosso Levanto",
      ],
      defaultThickness: [20, 30],
      category: "Natural Stone",
      isActive: true,
    },
    {
      id: "quartzite",
      name: "Quartzite",
      colors: [
        "Super White",
        "Taj Mahal",
        "Sea Pearl",
        "Arctic White",
        "Azul Macaubas",
        "Blue Bahia",
        "Fantasy Brown",
        "White Ice",
        "Fusion",
        "Perla Venata",
        "Cristallo",
        "Mont Blanc",
        "Bianco Rhino",
        "Silver Root",
      ],
      defaultThickness: [20, 30],
      category: "Natural Stone",
      isActive: true,
    },
    {
      id: "limestone",
      name: "Limestone",
      colors: [
        "Jerusalem Gold",
        "Jura Beige",
        "Pietra Gray",
        "Moca Cream",
        "Sinai Pearl",
        "Indiana Limestone",
        "French Limestone",
      ],
      defaultThickness: [20, 30, 40],
      category: "Natural Stone",
      isActive: true,
    },
    {
      id: "travertine",
      name: "Travertine",
      colors: [
        "Classic Beige",
        "Noce Brown",
        "Silver Gray",
        "Ivory Cream",
        "Gold Yellow",
        "Roman Travertine",
        "Turkish Travertine",
      ],
      defaultThickness: [20, 30],
      category: "Natural Stone",
      isActive: true,
    },
    {
      id: "onyx",
      name: "Onyx",
      colors: ["White Onyx", "Green Onyx", "Honey Onyx", "Red Onyx", "Blue Onyx", "Rainbow Onyx", "Black Onyx"],
      defaultThickness: [20, 30],
      category: "Natural Stone",
      isActive: true,
    },
    {
      id: "slate",
      name: "Slate",
      colors: ["Welsh Gray", "Vermont Black", "Brazilian Green", "Indian Multicolor", "Copper Slate", "Silver Slate"],
      defaultThickness: [12, 20, 30],
      category: "Natural Stone",
      isActive: true,
    },
    {
      id: "sandstone",
      name: "Sandstone",
      colors: ["Buff Sandstone", "Red Sandstone", "Gray Sandstone", "Brown Sandstone", "Yellow Sandstone"],
      defaultThickness: [20, 30, 40],
      category: "Natural Stone",
      isActive: true,
    },
    {
      id: "basalt",
      name: "Basalt",
      colors: ["Black Basalt", "Gray Basalt", "Blue Basalt", "Green Basalt"],
      defaultThickness: [20, 30],
      category: "Natural Stone",
      isActive: true,
    },
    {
      id: "lava-stone",
      name: "Lava Stone",
      colors: ["Black Lava", "Red Lava", "Gray Lava", "Brown Lava"],
      defaultThickness: [20, 30],
      category: "Natural Stone",
      isActive: true,
    },
    {
      id: "soapstone",
      name: "Soapstone",
      colors: ["Gray Soapstone", "Green Soapstone", "Black Soapstone"],
      defaultThickness: [20, 30, 40],
      category: "Natural Stone",
      isActive: true,
    },
    {
      id: "concrete",
      name: "Concrete",
      colors: ["Natural Gray", "Charcoal", "White Concrete", "Beige Concrete", "Custom Color"],
      defaultThickness: [30, 40, 50],
      category: "Engineered Stone",
      isActive: true,
    },
    {
      id: "recycled-glass",
      name: "Recycled Glass",
      colors: ["Clear Glass", "Blue Glass", "Green Glass", "Amber Glass", "Mixed Glass"],
      defaultThickness: [12, 20, 30],
      category: "Engineered Stone",
      isActive: true,
    },
    {
      id: "porcelain",
      name: "Porcelain Slabs",
      colors: [
        "Carrara Porcelain",
        "Calacatta Porcelain",
        "Wood Look",
        "Concrete Look",
        "Metal Look",
        "Stone Look",
        "Marble Look",
        "Granite Look",
        "Solid Colors",
      ],
      defaultThickness: [6, 12, 20],
      category: "Engineered Stone",
      isActive: true,
    },
    {
      id: "dekton",
      name: "Dekton",
      colors: [
        "Aura",
        "Blanc Concrete",
        "Domoos",
        "Fossil",
        "Kairos",
        "Kelya",
        "Laurent",
        "Lunar",
        "Nilium",
        "Orix",
        "Radium",
        "Sirius",
        "Stonika",
        "Trilium",
        "Ventus",
      ],
      defaultThickness: [8, 12, 20],
      category: "Ultra-Compact Surface",
      isActive: true,
    },
    {
      id: "neolith",
      name: "Neolith",
      colors: [
        "Arctic White",
        "Basalt Black",
        "Calacatta",
        "Carrara",
        "Iron Moss",
        "Nero Zimbabwe",
        "Pietra di Piombo",
        "Strata Argentum",
        "Zaha Stone",
      ],
      defaultThickness: [6, 12, 20],
      category: "Ultra-Compact Surface",
      isActive: true,
    },
    {
      id: "lapitec",
      name: "Lapitec",
      colors: [
        "Bianco Assoluto",
        "Nero Assoluto",
        "Avorio",
        "Grigio Cemento",
        "Corten",
        "Verde Bamboo",
        "Blu Mediterraneo",
        "Rosa Portogallo",
      ],
      defaultThickness: [12, 20, 30],
      category: "Ultra-Compact Surface",
      isActive: true,
    },
    {
      id: "corian",
      name: "Corian",
      colors: [
        "Glacier White",
        "Designer White",
        "Cameo White",
        "Linen",
        "Bisque",
        "Bone",
        "Pebble",
        "Concrete",
        "Deep Nocturne",
        "Deep Black Quartz",
      ],
      defaultThickness: [6, 12, 19],
      category: "Solid Surface",
      isActive: true,
    },
    {
      id: "staron",
      name: "Staron",
      colors: [
        "Solid White",
        "Natural",
        "Pebble Gray",
        "Metallic Gray",
        "Deep Black",
        "Tempest",
        "Sanded Sahara",
        "Metallic Copper",
      ],
      defaultThickness: [6, 12, 19],
      category: "Solid Surface",
      isActive: true,
    },
    {
      id: "butcher-block",
      name: "Butcher Block",
      colors: ["Maple", "Oak", "Cherry", "Walnut", "Bamboo", "Teak", "Mahogany", "Birch"],
      defaultThickness: [25, 38, 50],
      category: "Wood",
      isActive: true,
    },
    {
      id: "stainless-steel",
      name: "Stainless Steel",
      colors: ["Brushed Finish", "Mirror Finish", "Satin Finish", "Antique Finish"],
      defaultThickness: [16, 20, 25],
      category: "Metal",
      isActive: true,
    },
    {
      id: "copper",
      name: "Copper",
      colors: ["Natural Copper", "Patina Copper", "Antique Copper", "Brushed Copper"],
      defaultThickness: [16, 20, 25],
      category: "Metal",
      isActive: true,
    },
  ],
  suppliers: SUPPLIERS.map((supplier) => ({
    id: supplier.id,
    name: supplier.name,
    contact: supplier.contact,
    phone: supplier.phone,
    email: supplier.email,
    isActive: true,
    specialties: supplier.specialties,
    location: supplier.location,
  })),
  defaultColumns: [
    { key: "serialNumber", label: "Serial Number", sortable: true, filterable: true, isVisible: true },
    { key: "material", label: "Material", sortable: true, filterable: true, isVisible: true },
    { key: "color", label: "Color", sortable: true, filterable: true, isVisible: true },
    { key: "thickness", label: "Thickness", sortable: true, filterable: false, isVisible: true },
    { key: "status", label: "Status", sortable: true, filterable: true, isVisible: true },
    { key: "actions", label: "Actions", sortable: false, filterable: false, isVisible: true },
  ],
  availableColumns: [
    { key: "serialNumber", label: "Serial Number", sortable: true, filterable: true, isVisible: true },
    { key: "material", label: "Material", sortable: true, filterable: true, isVisible: true },
    { key: "color", label: "Color", sortable: true, filterable: true, isVisible: true },
    { key: "thickness", label: "Thickness (mm)", sortable: true, filterable: false, isVisible: true },
    { key: "length", label: "Length (mm)", sortable: true, filterable: false, isVisible: false },
    { key: "width", label: "Width (mm)", sortable: true, filterable: false, isVisible: false },
    { key: "supplier", label: "Supplier", sortable: true, filterable: true, isVisible: false },
    { key: "status", label: "Status", sortable: true, filterable: true, isVisible: true },
    { key: "slabType", label: "Type", sortable: true, filterable: true, isVisible: false },
    { key: "cost", label: "Cost", sortable: true, filterable: false, isVisible: false },
    { key: "location", label: "Location", sortable: true, filterable: true, isVisible: false },
    { key: "receivedDate", label: "Received Date", sortable: true, filterable: false, isVisible: false },
    { key: "actions", label: "Actions", sortable: false, filterable: false, isVisible: true },
  ],
  businessRules: {
    minSlabThickness: 10,
    maxSlabThickness: 50,
    minSlabLength: 1000,
    maxSlabLength: 4000,
    minSlabWidth: 500,
    maxSlabWidth: 2000,
    requireSerialNumber: true,
    allowNegativeCost: false,
    autoGenerateSerialNumber: true,
    defaultSlabStatus: "STOCK" as SlabStatus,
    defaultLocation: "Warehouse A",
  },
  version: CONFIG_VERSION,
  lastUpdated: new Date(),
}

export class ConfigService {
  private static config: AppConfig | null = null

  // Load configuration from localStorage or use defaults
  static async loadConfig(): Promise<AppConfig> {
    try {
      const storedConfig = LocalStorage.get<AppConfig>(CONFIG_KEY)

      if (storedConfig && storedConfig.version === CONFIG_VERSION) {
        this.config = {
          ...storedConfig,
          lastUpdated: new Date(storedConfig.lastUpdated),
        }
        return this.config
      }

      // Use default config if none exists or version mismatch
      this.config = { ...DEFAULT_CONFIG }
      await this.saveConfig()
      return this.config
    } catch (error) {
      console.error("Error loading configuration:", error)
      this.config = { ...DEFAULT_CONFIG }
      return this.config
    }
  }

  // Save configuration to localStorage
  static async saveConfig(config?: AppConfig): Promise<void> {
    try {
      const configToSave = config || this.config
      if (!configToSave) throw new Error("No configuration to save")

      configToSave.lastUpdated = new Date()
      LocalStorage.set(CONFIG_KEY, configToSave)
      this.config = configToSave
    } catch (error) {
      console.error("Error saving configuration:", error)
      throw error
    }
  }

  // Get current configuration
  static getConfig(): AppConfig {
    if (!this.config) {
      throw new Error("Configuration not loaded. Call loadConfig() first.")
    }
    return this.config
  }

  // Update specific configuration sections
  static async updateMaterials(materials: ConfigMaterial[]): Promise<void> {
    const config = this.getConfig()
    config.materials = materials
    await this.saveConfig(config)
  }

  static async updateSuppliers(suppliers: ConfigSupplier[]): Promise<void> {
    const config = this.getConfig()
    config.suppliers = suppliers
    await this.saveConfig(config)
  }

  static async updateBusinessRules(rules: Partial<BusinessRules>): Promise<void> {
    const config = this.getConfig()
    config.businessRules = { ...config.businessRules, ...rules }
    await this.saveConfig(config)
  }

  static async updateColumnSettings(columns: SlabColumn[]): Promise<void> {
    const config = this.getConfig()
    config.defaultColumns = columns
    await this.saveConfig(config)
  }

  // Reset to default configuration
  static async resetToDefaults(): Promise<AppConfig> {
    this.config = { ...DEFAULT_CONFIG }
    await this.saveConfig()
    return this.config
  }

  // Validate configuration
  static validateConfig(config: AppConfig): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!config.version) {
      errors.push("Configuration version is required")
    }

    if (!config.materials || config.materials.length === 0) {
      errors.push("At least one material must be configured")
    }

    if (!config.suppliers || config.suppliers.length === 0) {
      errors.push("At least one supplier must be configured")
    }

    if (!config.businessRules) {
      errors.push("Business rules are required")
    } else {
      const rules = config.businessRules
      if (rules.minSlabThickness >= rules.maxSlabThickness) {
        errors.push("Minimum slab thickness must be less than maximum")
      }
      if (rules.minSlabLength >= rules.maxSlabLength) {
        errors.push("Minimum slab length must be less than maximum")
      }
      if (rules.minSlabWidth >= rules.maxSlabWidth) {
        errors.push("Minimum slab width must be less than maximum")
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }
}
