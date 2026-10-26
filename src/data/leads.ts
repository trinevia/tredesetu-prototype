import type { BuyerInfo, CrmStage, Lead, LeadSource, SupplierStage } from "@/types"

export const demoBuyer: BuyerInfo & { id: string; category: string; avatar: string } = {
  id: "b1",
  name: "Rohan Mehta",
  company: "Mehta Retail Solutions Pvt. Ltd.",
  phone: "+91 98220 41xxx",
  email: "rohan@mehtaretail.in",
  city: "Pune",
  gst: "27AAJCM8812L1ZV",
  category: "Electronics Retail & Distribution",
  avatar: "man3",
}

export const crmUsers = ["Priya Nair", "Vikram Singh", "Sneha Kulkarni"]

const otherBuyers: BuyerInfo[] = [
  { name: "Aisha Khan", company: "UrbanCart Retail LLP", phone: "+91 99300 22xxx", email: "aisha@urbancart.in", city: "Mumbai" },
  { name: "Karthik Raman", company: "Raman Distributors", phone: "+91 94440 18xxx", email: "karthik@ramandist.com", city: "Chennai" },
  { name: "Meera Joshi", company: "FreshBasket Foods", phone: "+91 98110 75xxx", email: "meera@freshbasket.co", city: "Delhi" },
  { name: "Suresh Patel", company: "Patel Infra Projects", phone: "+91 98250 63xxx", email: "suresh@patelinfra.in", city: "Ahmedabad" },
  { name: "Joao Ferreira", company: "Ferreira Importadora Ltda.", phone: "+55 11 9xxxx 4410", email: "joao@ferreira-imp.com.br", city: "São Paulo, Brazil" },
  { name: "Ahmed Saleh", company: "Nile Trading Co.", phone: "+20 10 xxxx 7721", email: "ahmed@niletrading.eg", city: "Cairo, Egypt" },
  { name: "Neha Agarwal", company: "Agarwal Hotels Group", phone: "+91 98290 11xxx", email: "neha@agarwalhotels.com", city: "Jaipur" },
  { name: "Dmitri Volkov", company: "Volga Agro Import", phone: "+7 9xx xxx 3310", email: "d.volkov@volgaagro.ru", city: "Moscow, Russia" },
]

let seq = 24100
function lead(
  l: Omit<Lead, "id" | "notes" | "activity" | "quotes" | "attachments" | "supplierStage" | "priority"> & {
    stage?: SupplierStage
    priority?: Lead["priority"]
    notes?: Lead["notes"]
    quotes?: Lead["quotes"]
    attachments?: string[]
    extraActivity?: Lead["activity"]
  },
): Lead {
  seq += 7
  const id = `ENQ-${seq}`
  const { stage = "New", extraActivity = [], ...rest } = l
  return {
    id,
    priority: "Medium",
    notes: [],
    quotes: [],
    attachments: [],
    ...rest,
    supplierStage: Object.fromEntries(l.supplierIds.map((s) => [s, stage])),
    activity: [
      { id: `${id}-a1`, kind: "created", text: `Enquiry submitted via ${l.source}`, at: l.createdAt, by: l.buyer.name },
      {
        id: `${id}-a2`,
        kind: "matched",
        text: `Matched to ${l.supplierIds.length} supplier(s) by category & location rules`,
        at: l.createdAt,
        by: "System",
      },
      ...extraActivity,
    ],
  }
}

const d = (day: number, h = 10, m = 0) => new Date(Date.UTC(2026, 9, day, h - 5, m - 30)).toISOString()

function mk(
  buyer: BuyerInfo,
  title: string,
  opts: {
    product?: string
    category: string
    suppliers: string[]
    qty: number
    unit: string
    budget?: number
    day: number
    source: LeadSource
    crm: CrmStage
    stage?: SupplierStage
    assigned?: string
    follow?: number
    priority?: Lead["priority"]
    desc?: string
    intl?: Lead["international"]
    buyerId?: string
  },
) {
  return lead({
    buyer,
    buyerId: opts.buyerId,
    productId: opts.product,
    categoryId: opts.category,
    title,
    quantity: opts.qty,
    unit: opts.unit,
    budget: opts.budget,
    deliveryLocation: buyer.city,
    deliveryDate: opts.follow ? `2026-11-${String(opts.follow + 5).padStart(2, "0")}` : undefined,
    description: opts.desc ?? `Looking for ${title.toLowerCase()} for regular monthly requirement. Please share best price with GST and delivery timeline.`,
    createdAt: d(opts.day, 9 + (opts.day % 8), (opts.day * 7) % 60),
    source: opts.source,
    supplierIds: opts.suppliers,
    crmStage: opts.crm,
    stage: opts.stage,
    assignedTo: opts.assigned,
    followUpAt: opts.follow ? d(opts.follow + 26 > 31 ? 31 : opts.follow + 26, 11) : undefined,
    priority: opts.priority,
    international: opts.intl,
  })
}

export const seedLeads: Lead[] = [
  {
    ...mk(demoBuyer, "65W GaN chargers for retail stores — private label", {
      product: "p-65w-gan",
      category: "electronics",
      suppliers: ["volta"],
      qty: 2000,
      unit: "Piece",
      budget: 1500000,
      day: 22,
      source: "Product Page",
      crm: "Quotation",
      stage: "Quotation Sent",
      assigned: "Priya Nair",
      follow: 2,
      priority: "High",
      buyerId: "b1",
      desc: "We run 38 electronics stores across Maharashtra. Need 2,000 units of 65W GaN chargers with our brand 'MehtaTech' on the device and box. Please confirm BIS under our brand, lead time and payment terms.",
    }),
    notes: [
      { id: "n1", by: "Arjun Malhotra", text: "Buyer confirmed white colour only. Wants first lot before 15 Nov.", at: d(23, 12), kind: "call" },
    ],
    quotes: [
      {
        id: "q1",
        supplierId: "volta",
        pricePerUnit: 715,
        total: 1430000,
        message:
          "Private-label pricing for 2,000 units incl. custom retail box. BIS under your brand takes ~3 weeks; we can ship our BIS stock with your packaging in the interim.",
        validTill: "2026-11-10",
        leadTime: "18 working days",
        at: d(23, 15),
        status: "sent",
      },
    ],
  },
  mk(demoBuyer, "20000 mAh power banks — 3 colours", {
    product: "p-20k-powerbank",
    category: "electronics",
    suppliers: ["volta"],
    qty: 600,
    unit: "Piece",
    budget: 560000,
    day: 25,
    source: "Product Page",
    crm: "Assigned",
    stage: "New",
    assigned: "Vikram Singh",
    buyerId: "b1",
  }),
  mk(demoBuyer, "Corrugated shipping boxes for e-commerce dispatch", {
    product: "p-3ply-box",
    category: "packaging",
    suppliers: ["packright"],
    qty: 20000,
    unit: "Piece",
    day: 14,
    source: "Post Requirement",
    crm: "Won",
    stage: "Won",
    assigned: "Sneha Kulkarni",
    buyerId: "b1",
  }),
  mk(otherBuyers[0], "Bluetooth speakers for festive combo offers", {
    product: "p-bt-speaker",
    category: "electronics",
    suppliers: ["volta"],
    qty: 800,
    unit: "Piece",
    budget: 1000000,
    day: 24,
    source: "WhatsApp",
    crm: "Contacted",
    stage: "Contacted",
    assigned: "Priya Nair",
    follow: 1,
    priority: "High",
  }),
  mk(otherBuyers[1], "ANC headphones — distributor pricing for Tamil Nadu", {
    product: "p-anc-headphones",
    category: "electronics",
    suppliers: ["volta"],
    qty: 400,
    unit: "Piece",
    day: 20,
    source: "Supplier Profile",
    crm: "Negotiation",
    stage: "Negotiation",
    assigned: "Vikram Singh",
    follow: 3,
  }),
  mk(otherBuyers[4], "Fast chargers & cables for Brazil import (Inmetro)", {
    product: "p-65w-gan",
    category: "electronics",
    suppliers: ["volta"],
    qty: 10000,
    unit: "Piece",
    day: 18,
    source: "BRICS Desk",
    crm: "Qualified",
    stage: "In Discussion",
    assigned: "Priya Nair",
    follow: 4,
    priority: "High",
    intl: { country: "Brazil", incoterm: "CIF Santos" },
  }),
  mk(otherBuyers[2], "Smart door locks for residential project", {
    product: "p-smart-lock",
    category: "electronics",
    suppliers: ["volta"],
    qty: 120,
    unit: "Piece",
    day: 12,
    source: "Phone Call",
    crm: "Lost",
    stage: "Lost",
    assigned: "Sneha Kulkarni",
  }),
  mk(otherBuyers[3], "USB-C cables — 5,000 pcs monthly", {
    category: "electronics",
    suppliers: ["volta"],
    qty: 5000,
    unit: "Piece",
    day: 9,
    source: "Post Requirement",
    crm: "Won",
    stage: "Won",
    assigned: "Vikram Singh",
  }),
  mk(otherBuyers[6], "Hotel lobby sofas — 24 units, velvet finish", {
    product: "p-sofa",
    category: "furniture",
    suppliers: ["woodcraft"],
    qty: 24,
    unit: "Piece",
    budget: 600000,
    day: 23,
    source: "Product Page",
    crm: "Qualified",
    stage: "In Discussion",
    assigned: "Sneha Kulkarni",
    follow: 2,
  }),
  mk(otherBuyers[7], "1121 Basmati rice — 2 containers CIF Novorossiysk", {
    product: "p-1121-basmati",
    category: "agriculture",
    suppliers: ["kaveri"],
    qty: 50,
    unit: "Metric Ton",
    day: 21,
    source: "BRICS Desk",
    crm: "Quotation",
    stage: "Quotation Sent",
    assigned: "Priya Nair",
    priority: "High",
    intl: { country: "Russia", incoterm: "CIF Novorossiysk" },
  }),
  mk(otherBuyers[5], "Generic paracetamol tablets for Egypt tender", {
    product: "p-paracetamol",
    category: "pharma",
    suppliers: ["medlife"],
    qty: 5000,
    unit: "Box",
    day: 25,
    source: "BRICS Desk",
    crm: "New",
    intl: { country: "Egypt", incoterm: "FOB Nhava Sheva" },
  }),
  mk(otherBuyers[3], "540Wp solar modules for 1 MW ground-mount", {
    product: "p-solar-540",
    category: "solar",
    suppliers: ["surya"],
    qty: 1850,
    unit: "Panel",
    budget: 24000000,
    day: 26,
    source: "Post Requirement",
    crm: "New",
    priority: "High",
  }),
  mk(otherBuyers[0], "Kraft paper bags with logo print", {
    product: "p-kraft-bag",
    category: "packaging",
    suppliers: ["packright"],
    qty: 10000,
    unit: "Piece",
    day: 19,
    source: "Product Page",
    crm: "Contacted",
    stage: "Contacted",
    assigned: "Vikram Singh",
  }),
  mk(otherBuyers[2], "Green cardamom 8 mm — 500 kg", {
    product: "p-green-cardamom",
    category: "agriculture",
    suppliers: ["malabar"],
    qty: 500,
    unit: "Kg",
    day: 16,
    source: "WhatsApp",
    crm: "Won",
    stage: "Won",
    assigned: "Sneha Kulkarni",
  }),
]
