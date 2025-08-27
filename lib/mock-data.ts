// Mock data generator for testing and development
import type { Slab, Material, Supplier, SlabStatus, SlabType } from "@/types/inventory"

// Mock data constants
const MATERIALS = [
  {
    name: "Granite",
    colors: [
      "Black Galaxy",
      "Kashmir White",
      "Absolute Black",
      "Bianco Antico",
      "Uba Tuba",
      "Santa Cecilia",
      "Giallo Ornamental",
      "Baltic Brown",
      "Tan Brown",
      "Verde Peacock",
    ],
    category: "Natural Stone",
  },
  {
    name: "Quartz",
    colors: [
      "Calacatta Gold",
      "Carrara White",
      "Absolute Black",
      "Pure White",
      "Statuario",
      "Caesarstone White",
      "Silestone Black",
      "Cambria Quartz",
      "Corian Quartz",
      "HanStone Quartz",
    ],
    category: "Engineered Stone",
  },
  {
    name: "Marble",
    colors: [
      "Carrara White",
      "Calacatta Gold",
      "Emperador Dark",
      "Crema Marfil",
      "Statuario White",
      "Nero Marquina",
      "Thassos White",
      "Rosso Levanto",
      "Verde Guatemala",
      "Botticino Classico",
    ],
    category: "Natural Stone",
  },
  {
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
      "Fusion Blue",
      "Golden Beach",
    ],
    category: "Natural Stone",
  },
]

const SUPPLIERS = [
  {
    name: "Stone Depot",
    contact: "John Smith",
    phone: "(555) 123-4567",
    email: "john@stonedepot.com",
  },
  {
    name: "Granite World",
    contact: "Sarah Johnson",
    phone: "(555) 987-6543",
    email: "sarah@graniteworld.com",
  },
  {
    name: "Premium Stone Co",
    contact: "Mike Wilson",
    phone: "(555) 456-7890",
    email: "mike@premiumstone.com",
  },
  {
    name: "Natural Stone Supply",
    contact: "Lisa Chen",
    phone: "(555) 321-0987",
    email: "lisa@naturalstone.com",
  },
  {
    name: "Elite Marble & Granite",
    contact: "David Rodriguez",
    phone: "(555) 654-3210",
    email: "david@elitemarble.com",
  },
  {
    name: "Stone Masters Inc",
    contact: "Jennifer Brown",
    phone: "(555) 789-0123",
    email: "jennifer@stonemasters.com",
  },
]

const LOCATIONS = [
  "Warehouse A-1",
  "Warehouse A-2",
  "Warehouse A-3",
  "Warehouse B-1",
  "Warehouse B-2",
  "Warehouse C-1",
  "Yard Section 1",
  "Yard Section 2",
  "Yard Section 3",
  "Indoor Storage 1",
  "Indoor Storage 2",
  "Outdoor Storage",
]

const THICKNESSES = [12, 20, 30] // in mm
const STANDARD_LENGTHS = [2400, 2700, 3000, 3200, 3600] // in mm
const STANDARD_WIDTHS = [1200, 1400, 1600, 1800, 2000] // in mm

const JOB_IDS = [
  "JOB-2024-001",
  "JOB-2024-002",
  "JOB-2024-003",
  "JOB-2024-004",
  "JOB-2024-005",
  "KITCHEN-001",
  "KITCHEN-002",
  "BATHROOM-001",
  "COMMERCIAL-001",
  "RESIDENTIAL-001",
]

export class MockDataGenerator {
  private static idCounter = 1

  // Generate a unique ID
  private static generateId(): string {
    return (this.idCounter++).toString()
  }

  // Generate a realistic serial number
  private static generateSerialNumber(material: string, index: number): string {
    const materialCode = material.substring(0, 3).toUpperCase()
    const year = new Date().getFullYear().toString().slice(-2)
    const sequence = (index + 1).toString().padStart(3, "0")
    return `${materialCode}-${year}-${sequence}`
  }

  // Generate a random date within a range
  private static generateRandomDate(startDate: Date, endDate: Date): Date {
    const start = startDate.getTime()
    const end = endDate.getTime()
    const randomTime = start + Math.random() * (end - start)
    return new Date(randomTime)
  }

  // Generate a random cost based on material and size
  private static generateCost(material: string, length: number, width: number, thickness: number): number {
    const baseRates = {
      Granite: 45, // per sq ft
      Quartz: 65,
      Marble: 85,
      Quartzite: 75,
    }

    const rate = baseRates[material as keyof typeof baseRates] || 50
    const sqFt = (length * width) / 92903 // Convert mm² to sq ft
    const thicknessMultiplier = thickness === 30 ? 1.5 : thickness === 20 ? 1.2 : 1.0

    return Math.round(sqFt * rate * thicknessMultiplier)
  }

  // Generate random array element
  private static randomChoice<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)]
  }

  // Generate random boolean with probability
  private static randomBoolean(probability = 0.5): boolean {
    return Math.random() < probability
  }

  // Generate a single mock slab
  static generateSlab(index = 0): Slab {
    const material = this.randomChoice(MATERIALS)
    const materialName = material.name
    const color = this.randomChoice(material.colors)
    const supplier = this.randomChoice(SUPPLIERS)
    const thickness = this.randomChoice(THICKNESSES)
    const length = this.randomChoice(STANDARD_LENGTHS)
    const width = this.randomChoice(STANDARD_WIDTHS)
    const location = this.randomChoice(LOCATIONS)

    // Generate dates
    const now = new Date()
    const sixMonthsAgo = new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000)
    const receivedDate = this.generateRandomDate(sixMonthsAgo, now)

    // Determine status with realistic distribution
    const statusWeights = {
      STOCK: 0.4,
      ALLOCATED: 0.2,
      CONSUMED: 0.25,
      REMNANT: 0.1,
      RECEIVED: 0.03,
      ORDERED: 0.02,
    }

    let random = Math.random()
    let status: SlabStatus = "STOCK"

    for (const [statusKey, weight] of Object.entries(statusWeights)) {
      if (random < weight) {
        status = statusKey as SlabStatus
        break
      }
      random -= weight
    }

    // Determine slab type
    const slabType: SlabType = status === "REMNANT" ? "REMNANT" : "FULL"

    // Generate consumed date if consumed
    const consumedDate = status === "CONSUMED" ? this.generateRandomDate(receivedDate, now) : undefined

    // Generate job ID if allocated or consumed
    const jobId = status === "ALLOCATED" || status === "CONSUMED" ? this.randomChoice(JOB_IDS) : undefined

    // Generate notes occasionally
    const notes = this.randomBoolean(0.3)
      ? this.randomChoice([
          "Minor edge chip - still usable",
          "Premium quality slab",
          "Customer approved sample",
          "Rush order - priority handling",
          "Matched set with other slabs",
          "Special order - non-returnable",
          "Slight color variation",
          "Perfect for kitchen island",
          "Bookmatched pair available",
          "Last slab in stock",
        ])
      : undefined

    const cost = this.generateCost(materialName, length, width, thickness)

    return {
      id: this.generateId(),
      serialNumber: this.generateSerialNumber(materialName, index),
      material: materialName,
      color,
      thickness,
      length,
      width,
      supplier: supplier.name,
      status,
      slabType,
      jobId,
      receivedDate,
      consumedDate,
      notes,
      cost,
      location,
    }
  }

  // Generate multiple slabs
  static generateSlabs(count: number): Slab[] {
    const slabs: Slab[] = []

    for (let i = 0; i < count; i++) {
      slabs.push(this.generateSlab(i))
    }

    return slabs
  }

  // Generate slabs with specific criteria
  static generateSlabsWithCriteria(criteria: {
    count: number
    material?: string
    status?: SlabStatus
    supplier?: string
    minCost?: number
    maxCost?: number
  }): Slab[] {
    const slabs: Slab[] = []

    for (let i = 0; i < criteria.count; i++) {
      const slab = this.generateSlab(i)

      // Apply criteria
      if (criteria.material) {
        const materialData = MATERIALS.find((m) => m.name === criteria.material)
        if (materialData) {
          slab.material = materialData.name
          slab.color = this.randomChoice(materialData.colors)
          slab.cost = this.generateCost(slab.material, slab.length, slab.width, slab.thickness)
        }
      }

      if (criteria.status) {
        slab.status = criteria.status
        if (criteria.status === "CONSUMED" && !slab.consumedDate) {
          slab.consumedDate = this.generateRandomDate(slab.receivedDate!, new Date())
        }
        if (criteria.status === "REMNANT") {
          slab.slabType = "REMNANT"
          // Make remnants smaller
          slab.length = Math.floor(slab.length * 0.6)
          slab.width = Math.floor(slab.width * 0.7)
          slab.cost = Math.floor(slab.cost! * 0.4)
        }
      }

      if (criteria.supplier) {
        slab.supplier = criteria.supplier
      }

      if (criteria.minCost && slab.cost! < criteria.minCost) {
        slab.cost = criteria.minCost + Math.floor(Math.random() * 500)
      }

      if (criteria.maxCost && slab.cost! > criteria.maxCost) {
        slab.cost = criteria.maxCost - Math.floor(Math.random() * 200)
      }

      slabs.push(slab)
    }

    return slabs
  }

  // Generate materials data
  static generateMaterials(): Material[] {
    return MATERIALS.map((material, index) => ({
      id: (index + 1).toString(),
      name: material.name,
      colors: material.colors,
      defaultThickness: THICKNESSES,
      category: material.category,
    }))
  }

  // Generate suppliers data
  static generateSuppliers(): Supplier[] {
    return SUPPLIERS.map((supplier, index) => ({
      id: (index + 1).toString(),
      ...supplier,
    }))
  }

  // Generate a complete dataset for testing
  static generateCompleteDataset(slabCount = 50): {
    slabs: Slab[]
    materials: Material[]
    suppliers: Supplier[]
  } {
    return {
      slabs: this.generateSlabs(slabCount),
      materials: this.generateMaterials(),
      suppliers: this.generateSuppliers(),
    }
  }

  // Generate scenario-based datasets
  static generateScenarioData(scenario: "small_shop" | "medium_fabricator" | "large_warehouse"): {
    slabs: Slab[]
    materials: Material[]
    suppliers: Supplier[]
  } {
    const scenarios = {
      small_shop: {
        slabCount: 25,
        materials: MATERIALS.slice(0, 2), // Only Granite and Quartz
        suppliers: SUPPLIERS.slice(0, 3),
      },
      medium_fabricator: {
        slabCount: 100,
        materials: MATERIALS.slice(0, 3), // Granite, Quartz, Marble
        suppliers: SUPPLIERS.slice(0, 4),
      },
      large_warehouse: {
        slabCount: 250,
        materials: MATERIALS, // All materials
        suppliers: SUPPLIERS,
      },
    }

    const config = scenarios[scenario]

    return {
      slabs: this.generateSlabs(config.slabCount),
      materials: config.materials.map((material, index) => ({
        id: (index + 1).toString(),
        name: material.name,
        colors: material.colors,
        defaultThickness: THICKNESSES,
        category: material.category,
      })),
      suppliers: config.suppliers.map((supplier, index) => ({
        id: (index + 1).toString(),
        ...supplier,
      })),
    }
  }

  // Reset the ID counter (useful for testing)
  static resetIdCounter(): void {
    this.idCounter = 1
  }

  // Generate test data for specific use cases
  static generateTestData(): {
    emptyInventory: Slab[]
    singleSlab: Slab[]
    mixedStatuses: Slab[]
    highValueSlabs: Slab[]
    remnants: Slab[]
    recentlyReceived: Slab[]
  } {
    return {
      emptyInventory: [],
      singleSlab: [this.generateSlab(0)],
      mixedStatuses: [
        this.generateSlabsWithCriteria({ count: 1, status: "STOCK" })[0],
        this.generateSlabsWithCriteria({ count: 1, status: "ALLOCATED" })[0],
        this.generateSlabsWithCriteria({ count: 1, status: "CONSUMED" })[0],
        this.generateSlabsWithCriteria({ count: 1, status: "REMNANT" })[0],
      ],
      highValueSlabs: this.generateSlabsWithCriteria({ count: 5, minCost: 2000 }),
      remnants: this.generateSlabsWithCriteria({ count: 10, status: "REMNANT" }),
      recentlyReceived: this.generateSlabsWithCriteria({ count: 8, status: "RECEIVED" }),
    }
  }
}
