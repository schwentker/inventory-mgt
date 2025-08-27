// Stone Inventory Management - Demo Data Generator
// Generates 1200 slabs, ~$850k value, 8 months of jobs, realistic suppliers & materials

interface Slab {
  id: string
  serialNumber: string
  material: string
  color: string
  thickness: number
  length: number
  width: number
  supplier: string
  status: SlabStatus
  slabType: SlabType
  jobId?: string
  receivedDate?: Date
  consumedDate?: Date
  notes?: string
  cost: number
  location?: string
}

enum SlabStatus {
  Wanted = "WANTED",
  Ordered = "ORDERED",
  Received = "RECEIVED",
  Allocated = "ALLOCATED",
  Consumed = "CONSUMED",
  Remnant = "REMNANT",
  Stock = "STOCK",
}

enum SlabType {
  Full = "FULL",
  Remnant = "REMNANT",
}

interface Job {
  id: string
  jobNumber: string
  customerName: string
  projectType: string
  startDate: Date
  targetDate: Date
  status: string
  squareFootage: number
  notes?: string
}

interface Material {
  id: string
  name: string
  colors: string[]
  category: string
  priceRange: { min: number; max: number }
  commonThickness: number[]
}

interface Supplier {
  id: string
  name: string
  contact: string
  phone: string
  email: string
  specialties: string[]
  location: string
}

// Material Database
const MATERIALS: Material[] = [
  // Granite
  {
    id: "granite-absolute-black",
    name: "Absolute Black",
    colors: ["Absolute Black"],
    category: "Granite",
    priceRange: { min: 45, max: 65 },
    commonThickness: [20, 30],
  },
  {
    id: "granite-kashmir-white",
    name: "Kashmir White",
    colors: ["Kashmir White"],
    category: "Granite",
    priceRange: { min: 50, max: 70 },
    commonThickness: [20, 30],
  },
  {
    id: "granite-uba-tuba",
    name: "Uba Tuba",
    colors: ["Uba Tuba"],
    category: "Granite",
    priceRange: { min: 48, max: 68 },
    commonThickness: [20, 30],
  },
  {
    id: "granite-santa-cecilia",
    name: "Santa Cecilia",
    colors: ["Santa Cecilia", "Santa Cecilia Light"],
    category: "Granite",
    priceRange: { min: 52, max: 72 },
    commonThickness: [20, 30],
  },
  {
    id: "granite-black-galaxy",
    name: "Black Galaxy",
    colors: ["Black Galaxy"],
    category: "Granite",
    priceRange: { min: 55, max: 75 },
    commonThickness: [20, 30],
  },
  {
    id: "granite-imperial-red",
    name: "Imperial Red",
    colors: ["Imperial Red"],
    category: "Granite",
    priceRange: { min: 58, max: 78 },
    commonThickness: [20, 30],
  },
  {
    id: "granite-giallo-ornamental",
    name: "Giallo Ornamental",
    colors: ["Giallo Ornamental"],
    category: "Granite",
    priceRange: { min: 46, max: 66 },
    commonThickness: [20, 30],
  },
  {
    id: "granite-baltic-brown",
    name: "Baltic Brown",
    colors: ["Baltic Brown"],
    category: "Granite",
    priceRange: { min: 44, max: 64 },
    commonThickness: [20, 30],
  },
  {
    id: "granite-tan-brown",
    name: "Tan Brown",
    colors: ["Tan Brown"],
    category: "Granite",
    priceRange: { min: 47, max: 67 },
    commonThickness: [20, 30],
  },
  {
    id: "granite-new-venetian-gold",
    name: "New Venetian Gold",
    colors: ["New Venetian Gold"],
    category: "Granite",
    priceRange: { min: 54, max: 74 },
    commonThickness: [20, 30],
  },
  // Additional Premium Granites
  {
    id: "granite-blue-pearl",
    name: "Blue Pearl",
    colors: ["Blue Pearl", "Blue Pearl GT"],
    category: "Granite",
    priceRange: { min: 62, max: 82 },
    commonThickness: [20, 30],
  },
  {
    id: "granite-verde-ubatuba",
    name: "Verde Ubatuba",
    colors: ["Verde Ubatuba"],
    category: "Granite",
    priceRange: { min: 49, max: 69 },
    commonThickness: [20, 30],
  },
  {
    id: "granite-colonial-white",
    name: "Colonial White",
    colors: ["Colonial White"],
    category: "Granite",
    priceRange: { min: 51, max: 71 },
    commonThickness: [20, 30],
  },
  {
    id: "granite-typhoon-bordeaux",
    name: "Typhoon Bordeaux",
    colors: ["Typhoon Bordeaux"],
    category: "Granite",
    priceRange: { min: 65, max: 85 },
    commonThickness: [20, 30],
  },

  // Quartz
  {
    id: "quartz-calacatta",
    name: "Calacatta",
    colors: ["Calacatta Nuvo", "Calacatta Laza", "Calacatta Verona"],
    category: "Quartz",
    priceRange: { min: 75, max: 95 },
    commonThickness: [20, 30],
  },
  {
    id: "quartz-carrara",
    name: "Carrara",
    colors: ["Carrara Mist", "Carrara Grigio"],
    category: "Quartz",
    priceRange: { min: 65, max: 85 },
    commonThickness: [20, 30],
  },
  {
    id: "quartz-pure-white",
    name: "Pure White",
    colors: ["Pure White"],
    category: "Quartz",
    priceRange: { min: 55, max: 75 },
    commonThickness: [20, 30],
  },
  {
    id: "quartz-concrete",
    name: "Concrete",
    colors: ["Concrete Light", "Concrete Dark"],
    category: "Quartz",
    priceRange: { min: 60, max: 80 },
    commonThickness: [20, 30],
  },
  {
    id: "quartz-statuario",
    name: "Statuario",
    colors: ["Statuario Maximus", "Statuario Venato"],
    category: "Quartz",
    priceRange: { min: 80, max: 100 },
    commonThickness: [20, 30],
  },
  {
    id: "caesarstone-frosty-white",
    name: "Caesarstone Frosty White",
    colors: ["Frosty White"],
    category: "Quartz",
    priceRange: { min: 70, max: 90 },
    commonThickness: [20, 30],
  },
  {
    id: "silestone-white-storm",
    name: "Silestone White Storm",
    colors: ["White Storm"],
    category: "Quartz",
    priceRange: { min: 68, max: 88 },
    commonThickness: [20, 30],
  },
  {
    id: "cambria-torquay",
    name: "Cambria Torquay",
    colors: ["Torquay"],
    category: "Quartz",
    priceRange: { min: 85, max: 105 },
    commonThickness: [20, 30],
  },
  // Additional Premium Quartz
  {
    id: "quartz-arctic-white",
    name: "Arctic White",
    colors: ["Arctic White"],
    category: "Quartz",
    priceRange: { min: 58, max: 78 },
    commonThickness: [20, 30],
  },
  {
    id: "quartz-midnight-black",
    name: "Midnight Black",
    colors: ["Midnight Black"],
    category: "Quartz",
    priceRange: { min: 62, max: 82 },
    commonThickness: [20, 30],
  },
  {
    id: "quartz-bianco-drift",
    name: "Bianco Drift",
    colors: ["Bianco Drift"],
    category: "Quartz",
    priceRange: { min: 72, max: 92 },
    commonThickness: [20, 30],
  },
  {
    id: "quartz-emperador",
    name: "Emperador",
    colors: ["Emperador Light", "Emperador Dark"],
    category: "Quartz",
    priceRange: { min: 68, max: 88 },
    commonThickness: [20, 30],
  },

  // Marble
  {
    id: "marble-carrara-white",
    name: "Carrara White",
    colors: ["Carrara White", "Carrara Venatino"],
    category: "Marble",
    priceRange: { min: 65, max: 85 },
    commonThickness: [20, 30],
  },
  {
    id: "marble-calacatta-gold",
    name: "Calacatta Gold",
    colors: ["Calacatta Gold"],
    category: "Marble",
    priceRange: { min: 95, max: 120 },
    commonThickness: [20, 30],
  },
  {
    id: "marble-emperador-dark",
    name: "Emperador Dark",
    colors: ["Emperador Dark"],
    category: "Marble",
    priceRange: { min: 70, max: 90 },
    commonThickness: [20, 30],
  },
  {
    id: "marble-crema-marfil",
    name: "Crema Marfil",
    colors: ["Crema Marfil"],
    category: "Marble",
    priceRange: { min: 68, max: 88 },
    commonThickness: [20, 30],
  },
  {
    id: "marble-nero-marquina",
    name: "Nero Marquina",
    colors: ["Nero Marquina"],
    category: "Marble",
    priceRange: { min: 72, max: 92 },
    commonThickness: [20, 30],
  },
  {
    id: "marble-thassos-white",
    name: "Thassos White",
    colors: ["Thassos White"],
    category: "Marble",
    priceRange: { min: 85, max: 105 },
    commonThickness: [20, 30],
  },
  // Additional Premium Marbles
  {
    id: "marble-statuario-venato",
    name: "Statuario Venato",
    colors: ["Statuario Venato"],
    category: "Marble",
    priceRange: { min: 105, max: 135 },
    commonThickness: [20, 30],
  },
  {
    id: "marble-arabescato",
    name: "Arabescato",
    colors: ["Arabescato Carrara", "Arabescato Corchia"],
    category: "Marble",
    priceRange: { min: 88, max: 115 },
    commonThickness: [20, 30],
  },
  {
    id: "marble-verde-guatemala",
    name: "Verde Guatemala",
    colors: ["Verde Guatemala"],
    category: "Marble",
    priceRange: { min: 78, max: 98 },
    commonThickness: [20, 30],
  },

  // Quartzite
  {
    id: "quartzite-super-white",
    name: "Super White",
    colors: ["Super White"],
    category: "Quartzite",
    priceRange: { min: 75, max: 95 },
    commonThickness: [20, 30],
  },
  {
    id: "quartzite-taj-mahal",
    name: "Taj Mahal",
    colors: ["Taj Mahal"],
    category: "Quartzite",
    priceRange: { min: 85, max: 110 },
    commonThickness: [20, 30],
  },
  {
    id: "quartzite-sea-pearl",
    name: "Sea Pearl",
    colors: ["Sea Pearl"],
    category: "Quartzite",
    priceRange: { min: 80, max: 100 },
    commonThickness: [20, 30],
  },
  {
    id: "quartzite-white-ice",
    name: "White Ice",
    colors: ["White Ice"],
    category: "Quartzite",
    priceRange: { min: 90, max: 115 },
    commonThickness: [20, 30],
  },
  {
    id: "quartzite-fantasy-brown",
    name: "Fantasy Brown",
    colors: ["Fantasy Brown"],
    category: "Quartzite",
    priceRange: { min: 78, max: 98 },
    commonThickness: [20, 30],
  },
  // Additional Premium Quartzites
  {
    id: "quartzite-calacatta-macaubas",
    name: "Calacatta Macaubas",
    colors: ["Calacatta Macaubas"],
    category: "Quartzite",
    priceRange: { min: 95, max: 125 },
    commonThickness: [20, 30],
  },
  {
    id: "quartzite-azul-bahia",
    name: "Azul Bahia",
    colors: ["Azul Bahia"],
    category: "Quartzite",
    priceRange: { min: 110, max: 140 },
    commonThickness: [20, 30],
  },
  {
    id: "quartzite-mont-blanc",
    name: "Mont Blanc",
    colors: ["Mont Blanc"],
    category: "Quartzite",
    priceRange: { min: 88, max: 118 },
    commonThickness: [20, 30],
  },

  // Specialty
  {
    id: "soapstone-vermont",
    name: "Vermont Soapstone",
    colors: ["Vermont Green", "Vermont Gray"],
    category: "Soapstone",
    priceRange: { min: 65, max: 85 },
    commonThickness: [30, 40],
  },
  {
    id: "slate-brazilian-black",
    name: "Brazilian Black Slate",
    colors: ["Brazilian Black"],
    category: "Slate",
    priceRange: { min: 45, max: 65 },
    commonThickness: [20, 30],
  },
  {
    id: "travertine-noce",
    name: "Travertine Noce",
    colors: ["Noce", "Noce Filled"],
    category: "Travertine",
    priceRange: { min: 40, max: 60 },
    commonThickness: [20, 30],
  },
  {
    id: "onyx-white",
    name: "White Onyx",
    colors: ["White Onyx", "Honey Onyx"],
    category: "Onyx",
    priceRange: { min: 120, max: 200 },
    commonThickness: [20, 30],
  },
  // Additional Specialty Materials
  {
    id: "limestone-jerusalem-gold",
    name: "Jerusalem Gold Limestone",
    colors: ["Jerusalem Gold", "Jerusalem Cream"],
    category: "Limestone",
    priceRange: { min: 55, max: 75 },
    commonThickness: [20, 30, 40],
  },
  {
    id: "sandstone-rainbow",
    name: "Rainbow Sandstone",
    colors: ["Rainbow", "Autumn Brown"],
    category: "Sandstone",
    priceRange: { min: 35, max: 55 },
    commonThickness: [20, 30],
  },
  {
    id: "basalt-black",
    name: "Black Basalt",
    colors: ["Black Basalt"],
    category: "Basalt",
    priceRange: { min: 48, max: 68 },
    commonThickness: [20, 30],
  },
  {
    id: "lava-stone",
    name: "Lava Stone",
    colors: ["Charcoal", "Anthracite"],
    category: "Lava Stone",
    priceRange: { min: 85, max: 120 },
    commonThickness: [20, 30],
  },
]

// Supplier Database
const SUPPLIERS: Supplier[] = [
  {
    id: "stone-source",
    name: "Stone Source",
    contact: "Michael Chen",
    phone: "555-0101",
    email: "mchen@stonesource.com",
    specialties: ["Marble", "Quartzite"],
    location: "New York, NY",
  },
  {
    id: "triton-stone",
    name: "Triton Stone Group",
    contact: "Sarah Johnson",
    phone: "555-0102",
    email: "sjohnson@tritonstone.com",
    specialties: ["Quartz", "Granite"],
    location: "Dallas, TX",
  },
  {
    id: "arizona-tile",
    name: "Arizona Tile",
    contact: "Roberto Martinez",
    phone: "555-0103",
    email: "rmartinez@aztile.com",
    specialties: ["Granite", "Travertine"],
    location: "Phoenix, AZ",
  },
  {
    id: "daltile",
    name: "Daltile",
    contact: "Jennifer Wong",
    phone: "555-0104",
    email: "jwong@daltile.com",
    specialties: ["Quartz", "Granite"],
    location: "Dallas, TX",
  },
  {
    id: "msi-surfaces",
    name: "MSI Surfaces",
    contact: "David Kim",
    phone: "555-0105",
    email: "dkim@msisurfaces.com",
    specialties: ["Quartz", "Quartzite"],
    location: "Orange, CA",
  },
  {
    id: "italian-stone-gallery",
    name: "Italian Stone Gallery",
    contact: "Marco Rossi",
    phone: "555-0106",
    email: "mrossi@italianstonegallery.com",
    specialties: ["Marble", "Onyx"],
    location: "Miami, FL",
  },
  {
    id: "brazilian-direct",
    name: "Brazilian Direct",
    contact: "Carlos Silva",
    phone: "555-0107",
    email: "csilva@braziliandirect.com",
    specialties: ["Granite", "Quartzite"],
    location: "Pompano Beach, FL",
  },
  {
    id: "antolini",
    name: "Antolini USA",
    contact: "Elena Bianchi",
    phone: "555-0108",
    email: "ebianchi@antolini.com",
    specialties: ["Marble", "Onyx"],
    location: "Orlando, FL",
  },
  {
    id: "levantina-usa",
    name: "Levantina USA",
    contact: "Antonio Garcia",
    phone: "555-0109",
    email: "agarcia@levantina.com",
    specialties: ["Granite", "Marble"],
    location: "Alpharetta, GA",
  },
  {
    id: "marble-systems",
    name: "Marble Systems Inc",
    contact: "Lisa Thompson",
    phone: "555-0110",
    email: "lthompson@marblesystems.com",
    specialties: ["Marble", "Travertine"],
    location: "Anaheim, CA",
  },
  {
    id: "local-stone-co",
    name: "Local Stone Co",
    contact: "James Wilson",
    phone: "555-0111",
    email: "jwilson@localstone.com",
    specialties: ["Granite", "Slate"],
    location: "Denver, CO",
  },
  {
    id: "rocky-mountain-stone",
    name: "Rocky Mountain Stone",
    contact: "Patricia Brown",
    phone: "555-0112",
    email: "pbrown@rmstone.com",
    specialties: ["Granite", "Soapstone"],
    location: "Salt Lake City, UT",
  },
  {
    id: "pacific-stone",
    name: "Pacific Stone Supply",
    contact: "Kevin Lee",
    phone: "555-0113",
    email: "klee@pacificstone.com",
    specialties: ["Granite", "Quartz"],
    location: "Seattle, WA",
  },
  {
    id: "atlantic-granite",
    name: "Atlantic Granite",
    contact: "Michelle Davis",
    phone: "555-0114",
    email: "mdavis@atlanticgranite.com",
    specialties: ["Granite", "Quartzite"],
    location: "Charlotte, NC",
  },
  {
    id: "midwest-marble",
    name: "Midwest Marble",
    contact: "Robert Anderson",
    phone: "555-0115",
    email: "randerson@midwestmarble.com",
    specialties: ["Marble", "Travertine"],
    location: "Chicago, IL",
  },
  // Additional Regional Suppliers
  {
    id: "granite-depot",
    name: "Granite Depot",
    contact: "Steven Rodriguez",
    phone: "555-0116",
    email: "srodriguez@granitedepot.com",
    specialties: ["Granite", "Quartzite"],
    location: "Houston, TX",
  },
  {
    id: "marble-unlimited",
    name: "Marble Unlimited",
    contact: "Diana Foster",
    phone: "555-0117",
    email: "dfoster@marbleunlimited.com",
    specialties: ["Marble", "Limestone"],
    location: "Las Vegas, NV",
  },
  {
    id: "stone-world",
    name: "Stone World",
    contact: "Thomas Mitchell",
    phone: "555-0118",
    email: "tmitchell@stoneworld.com",
    specialties: ["Granite", "Slate", "Sandstone"],
    location: "Portland, OR",
  },
  {
    id: "premium-surfaces",
    name: "Premium Surfaces",
    contact: "Amanda Clark",
    phone: "555-0119",
    email: "aclark@premiumsurfaces.com",
    specialties: ["Quartz", "Quartzite", "Onyx"],
    location: "Atlanta, GA",
  },
  {
    id: "natural-stone-concepts",
    name: "Natural Stone Concepts",
    contact: "Brian Murphy",
    phone: "555-0120",
    email: "bmurphy@naturalstoneconcepts.com",
    specialties: ["Marble", "Travertine", "Limestone"],
    location: "Minneapolis, MN",
  },
  {
    id: "stone-gallery",
    name: "The Stone Gallery",
    contact: "Rachel Green",
    phone: "555-0121",
    email: "rgreen@stonegallery.com",
    specialties: ["Granite", "Quartz"],
    location: "Nashville, TN",
  },
  {
    id: "exotic-stone-imports",
    name: "Exotic Stone Imports",
    contact: "Giuseppe Moretti",
    phone: "555-0122",
    email: "gmoretti@exoticstoneimports.com",
    specialties: ["Onyx", "Lava Stone", "Basalt"],
    location: "Boston, MA",
  },
  {
    id: "mountain-stone-supply",
    name: "Mountain Stone Supply",
    contact: "Jake Harrison",
    phone: "555-0123",
    email: "jharrison@mountainstone.com",
    specialties: ["Granite", "Soapstone", "Slate"],
    location: "Bozeman, MT",
  },
]

// Standard slab dimensions
const SLAB_DIMENSIONS = [
  { length: 126, width: 63, type: "Standard" },
  { length: 130, width: 65, type: "Standard" },
  { length: 120, width: 55, type: "Compact" },
  { length: 144, width: 63, type: "Large Format" },
  { length: 132, width: 76, type: "Large Format" },
]

// Job templates for realistic projects
const JOB_TEMPLATES = [
  { type: "Kitchen Remodel", sqftRange: [80, 150], materials: ["Granite", "Quartz", "Quartzite"] },
  { type: "Bathroom Renovation", sqftRange: [25, 60], materials: ["Marble", "Granite", "Quartz"] },
  { type: "Commercial Project", sqftRange: [200, 500], materials: ["Granite", "Quartz"] },
  { type: "New Construction", sqftRange: [120, 300], materials: ["Granite", "Quartz", "Quartzite"] },
  { type: "Fireplace Surround", sqftRange: [15, 35], materials: ["Marble", "Granite", "Slate"] },
  { type: "Bar Top", sqftRange: [30, 80], materials: ["Granite", "Quartz", "Marble"] },
  { type: "Outdoor Kitchen", sqftRange: [60, 120], materials: ["Granite", "Quartzite", "Basalt"] },
  { type: "Vanity Tops", sqftRange: [20, 45], materials: ["Marble", "Quartz", "Granite"] },
  { type: "Reception Desk", sqftRange: [40, 100], materials: ["Quartz", "Granite", "Marble"] },
  { type: "Conference Table", sqftRange: [50, 150], materials: ["Granite", "Marble", "Quartzite"] },
  { type: "Retail Display", sqftRange: [80, 200], materials: ["Quartz", "Granite"] },
  { type: "Hotel Lobby", sqftRange: [300, 800], materials: ["Marble", "Granite", "Onyx"] },
  { type: "Restaurant Kitchen", sqftRange: [150, 400], materials: ["Granite", "Quartz"] },
  { type: "Laundry Room", sqftRange: [15, 40], materials: ["Granite", "Quartz"] },
  { type: "Wine Cellar", sqftRange: [25, 75], materials: ["Slate", "Granite", "Limestone"] },
  { type: "Master Bath Suite", sqftRange: [45, 85], materials: ["Marble", "Quartzite", "Onyx"] },
  { type: "Powder Room", sqftRange: [8, 20], materials: ["Marble", "Granite", "Quartz"] },
  { type: "Office Building Lobby", sqftRange: [400, 1000], materials: ["Granite", "Marble", "Travertine"] },
  { type: "Spa Reception", sqftRange: [60, 150], materials: ["Marble", "Onyx", "Travertine"] },
  { type: "Retail Store Counter", sqftRange: [30, 80], materials: ["Quartz", "Granite"] },
  { type: "Medical Office", sqftRange: [100, 250], materials: ["Quartz", "Granite"] },
  { type: "Luxury Condo Kitchen", sqftRange: [90, 180], materials: ["Marble", "Quartzite", "Dekton"] },
  { type: "Corporate Cafeteria", sqftRange: [200, 600], materials: ["Granite", "Quartz"] },
  { type: "Yacht Interior", sqftRange: [40, 120], materials: ["Marble", "Onyx", "Granite"] },
  { type: "Private Jet Interior", sqftRange: [15, 45], materials: ["Marble", "Onyx"] },
]

// Customer names for realistic projects
const CUSTOMER_NAMES = [
  "Johnson Residence",
  "Smith Kitchen Remodel",
  "Brown Family",
  "Davis Home",
  "Wilson Project",
  "Miller Renovation",
  "Moore Residence",
  "Taylor Kitchen",
  "Anderson Home",
  "Thomas Project",
  "Jackson Renovation",
  "White Residence",
  "Harris Kitchen",
  "Martin Home",
  "Thompson Project",
  "Garcia Residence",
  "Martinez Kitchen",
  "Robinson Home",
  "Clark Renovation",
  "Rodriguez Project",
  "Lewis Residence",
  "Lee Kitchen",
  "Walker Home",
  "Hall Renovation",
  "Allen Project",
  "Young Residence",
  "Hernandez Kitchen",
  "King Home",
  "Wright Renovation",
  "Lopez Project",
  // Additional Residential
  "Cooper Family Kitchen",
  "Reed Bathroom Remodel",
  "Bailey Home Project",
  "Rivera Residence",
  "Coleman Kitchen",
  "Jenkins Home",
  "Perry Renovation",
  "Powell Project",
  "Long Residence",
  "Hughes Kitchen",
  "Flores Home",
  "Washington Project",
  "Butler Residence",
  "Simmons Kitchen",
  "Foster Home",
  "Gonzales Renovation",
  "Bryant Project",
  "Alexander Residence",
  "Russell Kitchen",
  "Griffin Home",
  "Diaz Family",
  "Hayes Renovation",
  "Myers Project",
  "Ford Residence",
  "Hamilton Kitchen",
  "Graham Home",
  "Sullivan Project",
  "Wallace Residence",
  "Woods Kitchen",
  "Cole Home",
  "West Renovation",
  "Jordan Project",
  "Owens Residence",
  "Reynolds Kitchen",
  "Fisher Home",
  "Ellis Renovation",
  "Harrison Project",
  "Gibson Residence",
  "McDonald Kitchen",
  "Cruz Home",
  "Marshall Renovation",
  "Ortiz Project",
  "Gomez Residence",
  "Murray Kitchen",
  "Freeman Home",
  "Wells Renovation",
  "Webb Project",
  "Simpson Residence",
  "Stevens Kitchen",
  "Tucker Home",
  "Porter Renovation",
  "Hunter Project",
  "Hicks Residence",
  "Crawford Kitchen",
  "Henry Home",
  "Boyd Renovation",
  "Mason Project",
  "Morales Residence",
  "Kennedy Kitchen",
  "Warren Home",
  "Dixon Renovation",
  "Ramos Project",
  "Reyes Residence",
  "Burns Kitchen",
  "Gordon Home",
  "Shaw Renovation",
  "Holmes Project",
  "Rice Residence",
  "Robertson Kitchen",
  "Hunt Home",
  "Black Renovation",
  "Daniels Project",
  "Palmer Residence",
  "Mills Kitchen",
  "Nichols Home",
  "Grant Renovation",
  "Knight Project",
  "Ferguson Residence",
  // Commercial Clients
  "Marriott Downtown",
  "Hilton Garden Inn",
  "Four Seasons Resort",
  "The Ritz-Carlton",
  "Hyatt Regency",
  "Embassy Suites",
  "Westin Hotel",
  "Sheraton Conference Center",
  "Starbucks Location #247",
  "McDonald's Franchise",
  "Olive Garden Restaurant",
  "Cheesecake Factory",
  "P.F. Chang's",
  "Ruth's Chris Steakhouse",
  "Capital Grille",
  "Morton's Steakhouse",
  "Wells Fargo Branch",
  "Chase Bank Office",
  "Bank of America Center",
  "Medical Arts Building",
  "Dental Associates",
  "Pediatric Care Center",
  "Law Offices of Smith & Co",
  "Corporate Headquarters",
  "Tech Startup Office",
  "Luxury Car Dealership",
  "High-End Retail Store",
  "Apple Store Renovation",
  "Tesla Showroom",
  "Nordstrom Department Store",
  "Whole Foods Market",
  "Trader Joe's",
  "REI Flagship Store",
  "Sephora Beauty Studio",
  "Williams Sonoma",
  "Pottery Barn",
  "West Elm Showroom",
]

// Utility functions
function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

function randomRange(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateSerialNumber(material: string, index: number): string {
  const prefix = material.substring(0, 3).toUpperCase()
  return `${prefix}-${String(index).padStart(4, "0")}`
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

function getRandomSupplierForMaterial(material: Material): Supplier {
  const suitableSuppliers = SUPPLIERS.filter((s) => s.specialties.includes(material.category))
  if (suitableSuppliers.length > 0) {
    return randomChoice(suitableSuppliers)
  }
  return randomChoice(SUPPLIERS)
}

// Main data generation functions
function generateJobs(): Job[] {
  const jobs: Job[] = []
  let jobCounter = 1

  // More realistic monthly job distribution (seasonal patterns) - increased counts
  const monthlyJobCounts = [8, 10, 14, 18, 22, 20, 16, 12] // Jan-Aug 2025 (spring/summer peak) - Total: 120 jobs

  for (let month = 0; month < 8; month++) {
    const year = 2025
    const monthStartDate = new Date(year, month, 1)

    for (let i = 0; i < monthlyJobCounts[month]; i++) {
      const template = randomChoice(JOB_TEMPLATES)
      const startDate = new Date(monthStartDate)
      startDate.setDate(randomInt(1, 28))

      // More realistic project duration based on type
      let durationDays = randomInt(14, 60)
      if (
        template.type.includes("Commercial") ||
        template.type.includes("Hotel") ||
        template.type.includes("Office Building")
      ) {
        durationDays = randomInt(30, 90)
      } else if (
        template.type.includes("Fireplace") ||
        template.type.includes("Bar") ||
        template.type.includes("Powder Room")
      ) {
        durationDays = randomInt(7, 21)
      } else if (template.type.includes("Yacht") || template.type.includes("Private Jet")) {
        durationDays = randomInt(21, 45)
      }

      const job: Job = {
        id: `job-${String(jobCounter).padStart(3, "0")}`,
        jobNumber: `JOB-${year}-${String(jobCounter).padStart(3, "0")}`,
        customerName: randomChoice(CUSTOMER_NAMES),
        projectType: template.type,
        startDate,
        targetDate: addDays(startDate, durationDays),
        status:
          month >= 7
            ? Math.random() > 0.6
              ? "In Progress"
              : "Planning"
            : month >= 6
              ? Math.random() > 0.3
                ? "Completed"
                : "In Progress"
              : Math.random() > 0.1
                ? "Completed"
                : "In Progress",
        squareFootage: randomInt(template.sqftRange[0], template.sqftRange[1]),
        notes: Math.random() > 0.7 ? `Customer prefers ${randomChoice(template.materials)} materials` : undefined,
      }

      jobs.push(job)
      jobCounter++
    }
  }

  return jobs
}

function generateSlabs(jobs: Job[]): Slab[] {
  const slabs: Slab[] = []
  let slabCounter = 1

  // Target values for realistic distribution
  const targetTotalValue = 850000
  let currentValue = 0

  // Status distribution targets
  const statusTargets = {
    [SlabStatus.Stock]: 420, // 35%
    [SlabStatus.Allocated]: 180, // 15%
    [SlabStatus.Consumed]: 300, // 25%
    [SlabStatus.Remnant]: 240, // 20%
    [SlabStatus.Received]: 36, // 3%
    [SlabStatus.Ordered]: 24, // 2%
  }

  const statusCounts = {
    [SlabStatus.Stock]: 0,
    [SlabStatus.Allocated]: 0,
    [SlabStatus.Consumed]: 0,
    [SlabStatus.Remnant]: 0,
    [SlabStatus.Received]: 0,
    [SlabStatus.Ordered]: 0,
    [SlabStatus.Wanted]: 0,
  }

  // Get active jobs for allocation
  const activeJobs = jobs.filter((j) => j.status === "In Progress" || j.status === "Planning")

  while (slabs.length < 1200 && currentValue < targetTotalValue) {
    const material = randomChoice(MATERIALS)
    const color = randomChoice(material.colors)
    const supplier = getRandomSupplierForMaterial(material)
    const dimensions = randomChoice(SLAB_DIMENSIONS)
    const thickness = randomChoice(material.commonThickness)

    // Determine if this should be a remnant
    const isRemnant = Math.random() > 0.8 // 20% chance of remnant

    let length = dimensions.length
    let width = dimensions.width
    let slabType = SlabType.Full

    if (isRemnant) {
      length = randomInt(24, 96)
      width = randomInt(12, 48)
      slabType = SlabType.Remnant
    }

    // Calculate area and cost
    const areaInches = length * width
    const areaSquareFeet = areaInches / 144
    const pricePerSqFt = randomRange(material.priceRange.min, material.priceRange.max)
    const cost = Math.round(areaSquareFeet * pricePerSqFt)

    // Determine status based on targets
    let status = SlabStatus.Stock

    // Prefer statuses that haven't met their targets
    const availableStatuses = Object.keys(statusTargets).filter(
      (s) => statusCounts[s as SlabStatus] < statusTargets[s as SlabStatus],
    ) as SlabStatus[]

    if (availableStatuses.length > 0) {
      // Weight toward status types we need more of
      if (availableStatuses.includes(SlabStatus.Stock) && Math.random() > 0.3) {
        status = SlabStatus.Stock
      } else if (availableStatuses.includes(SlabStatus.Consumed) && Math.random() > 0.4) {
        status = SlabStatus.Consumed
      } else if (availableStatuses.includes(SlabStatus.Remnant) && slabType === SlabType.Remnant) {
        status = SlabStatus.Remnant
      } else if (availableStatuses.includes(SlabStatus.Allocated) && activeJobs.length > 0) {
        status = SlabStatus.Allocated
      } else {
        status = randomChoice(availableStatuses)
      }
    }

    // Create slab
    const slab: Slab = {
      id: `slab-${String(slabCounter).padStart(4, "0")}`,
      serialNumber: generateSerialNumber(material.name, slabCounter),
      material: material.name,
      color,
      thickness,
      length,
      width,
      supplier: supplier.name,
      status,
      slabType,
      cost,
      location: `${randomChoice(["A", "B", "C", "D"])}-${randomInt(1, 20)}`,
    }

    // Add dates and job assignments based on status
    const baseDate = new Date(2025, 0, 1)
    const daysOffset = randomInt(0, 240) // Jan-Aug 2025

    switch (status) {
      case SlabStatus.Received:
        slab.receivedDate = addDays(baseDate, daysOffset)
        break
      case SlabStatus.Allocated:
        slab.receivedDate = addDays(baseDate, daysOffset - randomInt(7, 30))
        slab.jobId = randomChoice(activeJobs).id
        break
      case SlabStatus.Consumed:
        slab.receivedDate = addDays(baseDate, daysOffset - randomInt(30, 90))
        slab.consumedDate = addDays(baseDate, daysOffset)
        slab.jobId = randomChoice(jobs.filter((j) => j.status === "Completed")).id
        break
      case SlabStatus.Remnant:
        slab.receivedDate = addDays(baseDate, daysOffset - randomInt(60, 120))
        slab.consumedDate = addDays(baseDate, daysOffset - randomInt(0, 30))
        if (Math.random() > 0.3) {
          slab.jobId = randomChoice(jobs.filter((j) => j.status === "Completed")).id
        }
        break
      case SlabStatus.Stock:
        if (Math.random() > 0.3) {
          slab.receivedDate = addDays(baseDate, daysOffset - randomInt(0, 60))
        }
        break
    }

    // Add occasional notes
    if (Math.random() > 0.85) {
      const notes = [
        "Minor edge chip - usable",
        "Beautiful veining pattern",
        "Customer approved sample",
        "Slight color variation",
        "Premium selection",
        "Book matched available",
      ]
      slab.notes = randomChoice(notes)
    }

    slabs.push(slab)
    statusCounts[status]++
    currentValue += cost
    slabCounter++
  }

  return slabs
}

// Export all data
export function generateDemoData() {
  console.log("Generating comprehensive demo data...")

  const jobs = generateJobs()
  const slabs = generateSlabs(jobs)

  // Calculate detailed summary stats
  const totalValue = slabs.reduce((sum, slab) => sum + slab.cost, 0)
  const statusCounts = slabs.reduce(
    (counts, slab) => {
      counts[slab.status] = (counts[slab.status] || 0) + 1
      return counts
    },
    {} as Record<string, number>,
  )

  const materialCounts = slabs.reduce(
    (counts, slab) => {
      const category = MATERIALS.find((m) => m.name === slab.material)?.category || "Unknown"
      counts[category] = (counts[category] || 0) + 1
      return counts
    },
    {} as Record<string, number>,
  )

  const supplierCounts = slabs.reduce(
    (counts, slab) => {
      counts[slab.supplier] = (counts[slab.supplier] || 0) + 1
      return counts
    },
    {} as Record<string, number>,
  )

  console.log(`Generated ${slabs.length} slabs worth $${totalValue.toLocaleString()}`)
  console.log(`Generated ${jobs.length} jobs`)
  console.log("Status distribution:", statusCounts)
  console.log("Material distribution:", materialCounts)
  console.log(`Active suppliers: ${Object.keys(supplierCounts).length}`)

  return {
    slabs,
    jobs,
    materials: MATERIALS,
    suppliers: SUPPLIERS,
    summary: {
      totalSlabs: slabs.length,
      totalValue,
      totalJobs: jobs.length,
      statusDistribution: statusCounts,
      materialDistribution: materialCounts,
      supplierDistribution: supplierCounts,
      activeSuppliers: Object.keys(supplierCounts).length,
    },
  }
}

// Usage example:
// const demoData = generateDemoData();
// localStorage.setItem('inventory-slabs', JSON.stringify(demoData.slabs));
// localStorage.setItem('inventory-jobs', JSON.stringify(demoData.jobs));
// localStorage.setItem('inventory-materials', JSON.stringify(demoData.materials));
// localStorage.setItem('inventory-suppliers', JSON.stringify(demoData.suppliers));
