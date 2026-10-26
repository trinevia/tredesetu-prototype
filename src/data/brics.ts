import { img } from "@/lib/images"

export interface BricsCountry {
  id: string
  name: string
  flag: string
  member: "Founding" | "Member" | "Partner"
  image: string
  currency: string
  ports: string[]
  demand: string[]
  compliance: string
  buyers: number
  openRequests: number
}

export const bricsCountries: BricsCountry[] = [
  { id: "brazil", name: "Brazil", flag: "🇧🇷", member: "Founding", image: img("rio", 900, 600), currency: "BRL", ports: ["Santos", "Paranaguá"], demand: ["Pharmaceuticals", "Auto components", "Agro-chemicals", "Electronics"], compliance: "Inmetro / ANVISA", buyers: 184, openRequests: 37 },
  { id: "russia", name: "Russia", flag: "🇷🇺", member: "Founding", image: img("moscow", 900, 600), currency: "RUB", ports: ["Novorossiysk", "St. Petersburg", "Vladivostok"], demand: ["Rice & tea", "Pharmaceuticals", "Machinery", "Textiles"], compliance: "EAC (EAEU)", buyers: 212, openRequests: 52 },
  { id: "india", name: "India", flag: "🇮🇳", member: "Founding", image: img("gatewayIndia", 900, 600), currency: "INR", ports: ["Nhava Sheva", "Mundra", "Chennai"], demand: ["Electronics components", "Machinery", "Solar cells", "Chemicals"], compliance: "BIS / FSSAI / CDSCO", buyers: 4820, openRequests: 640 },
  { id: "china", name: "China", flag: "🇨🇳", member: "Founding", image: img("forbiddenCity", 900, 600), currency: "CNY", ports: ["Shanghai", "Shenzhen", "Ningbo"], demand: ["Cotton & yarn", "Spices", "Marine products", "Organic chemicals"], compliance: "CCC / GACC", buyers: 156, openRequests: 29 },
  { id: "south-africa", name: "South Africa", flag: "🇿🇦", member: "Founding", image: img("capeTown", 900, 600), currency: "ZAR", ports: ["Durban", "Cape Town"], demand: ["Vehicles & parts", "Rice", "Pharmaceuticals", "Machinery"], compliance: "SABS / NRCS", buyers: 133, openRequests: 24 },
  { id: "uae", name: "UAE", flag: "🇦🇪", member: "Member", image: img("dubai", 900, 600), currency: "AED", ports: ["Jebel Ali", "Khalifa Port"], demand: ["Rice", "Electronics", "Jewellery", "Building materials"], compliance: "ESMA / ECAS", buyers: 298, openRequests: 61 },
  { id: "egypt", name: "Egypt", flag: "🇪🇬", member: "Member", image: img("pyramids", 900, 600), currency: "EGP", ports: ["Alexandria", "Port Said"], demand: ["Pharmaceuticals", "Cotton yarn", "Auto parts", "Rice"], compliance: "GOEIC", buyers: 97, openRequests: 18 },
  { id: "ethiopia", name: "Ethiopia", flag: "🇪🇹", member: "Member", image: img("crops", 900, 600), currency: "ETB", ports: ["Djibouti (transit)"], demand: ["Pharmaceuticals", "Machinery", "Steel products"], compliance: "ECAE", buyers: 41, openRequests: 9 },
  { id: "iran", name: "Iran", flag: "🇮🇷", member: "Member", image: img("spices", 900, 600), currency: "IRR", ports: ["Chabahar", "Bandar Abbas"], demand: ["Basmati rice", "Tea", "Pharmaceuticals"], compliance: "ISIRI", buyers: 64, openRequests: 14 },
  { id: "indonesia", name: "Indonesia", flag: "🇮🇩", member: "Member", image: img("port", 900, 600), currency: "IDR", ports: ["Tanjung Priok", "Surabaya"], demand: ["Auto components", "Cotton", "Machinery", "Pharmaceuticals"], compliance: "SNI", buyers: 88, openRequests: 16 },
]

export const bricsServices = [
  { icon: "FileCheck2", title: "Export documentation", body: "IEC, COO, phytosanitary, APEDA/ FIEO paperwork prepared and checked by our trade desk." },
  { icon: "Landmark", title: "Trade finance & LC", body: "Letter of credit advisory, export credit and local-currency (INR) settlement guidance." },
  { icon: "Ship", title: "Freight & logistics", body: "FCL/LCL quotes from partner forwarders with CIF/FOB comparison and shipment tracking." },
  { icon: "BadgeCheck", title: "Compliance & certification", body: "Inmetro, EAC, CCC, SABS and ESMA certification partners for market entry." },
  { icon: "UserCheck", title: "Buyer verification", body: "Background checks on overseas importers before you ship — reduce payment risk." },
  { icon: "Languages", title: "Market-entry advisory", body: "Country briefs, pricing benchmarks, translation and trade-fair matchmaking." },
]

export const bricsTradeLeads = [
  { id: "BT-901", type: "Buy" as const, country: "russia", title: "1121 Basmati rice, 2 × 20 ft containers", qty: "50 MT", posted: "2 days ago" },
  { id: "BT-902", type: "Buy" as const, country: "brazil", title: "65W fast chargers with Inmetro certification", qty: "10,000 pcs", posted: "1 week ago" },
  { id: "BT-903", type: "Buy" as const, country: "egypt", title: "Paracetamol 500/650 mg — public tender", qty: "5,000 boxes", posted: "Today" },
  { id: "BT-904", type: "Sell" as const, country: "china", title: "Lithium cells (21700) for power banks", qty: "1 lakh cells / month", posted: "3 days ago" },
  { id: "BT-905", type: "Buy" as const, country: "uae", title: "Hotel furniture — sheesham wood lobby sets", qty: "40 sets", posted: "4 days ago" },
  { id: "BT-906", type: "Buy" as const, country: "south-africa", title: "CNC turning centres for auto-parts plant", qty: "6 units", posted: "5 days ago" },
]
