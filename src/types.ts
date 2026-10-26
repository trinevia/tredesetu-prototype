export type Role = "guest" | "buyer" | "supplier" | "admin"

export type BusinessType = "Manufacturer" | "Wholesaler" | "Distributor" | "Exporter" | "Trader"

export interface ChildCategory {
  id: string
  name: string
}

export interface SubCategory {
  id: string
  name: string
  children: ChildCategory[]
}

export interface Category {
  id: string
  name: string
  icon: string
  image: string
  tagline: string
  subs: SubCategory[]
  attributes: string[]
  units: string[]
}

export type SupplierStatus = "active" | "pending" | "suspended" | "rejected"

export interface Supplier {
  id: string
  name: string
  logo: string
  logoColor: string
  cover: string
  tagline: string
  description: string
  businessType: BusinessType
  yearEstablished: number
  city: string
  state: string
  address: string
  contactPerson: string
  phone: string
  whatsapp: string
  email: string
  website: string
  gst: string
  certifications: string[]
  categoryIds: string[]
  capabilities: string[]
  minOrderInfo: string
  paymentTerms: string[]
  deliveryInfo: string
  gallery: string[]
  verified: boolean
  trustSeal: "Gold" | "Silver" | null
  rating: number
  reviews: number
  responseRate: number
  responseTime: string
  employees: string
  turnover: string
  exportMarkets: string[]
  status: SupplierStatus
  featured: boolean
  joinedAt: string
  profileViews: number
  bricsReady: boolean
}

export type ProductStatus = "active" | "pending" | "rejected" | "inactive" | "draft"

export interface Product {
  id: string
  name: string
  supplierId: string
  categoryId: string
  subId: string
  childId?: string
  images: string[]
  description: string
  specs: Record<string, string>
  brand: string
  model: string
  moq: number
  unit: string
  priceMin: number
  priceMax: number
  availableQty: number
  variants: string[]
  packaging: string
  delivery: string
  location: string
  gstPct: number
  documents: string[]
  status: ProductStatus
  featured: boolean
  trending: boolean
  views: number
  enquiries: number
  rating: number
  createdAt: string
  reported?: boolean
}

export type SupplierStage =
  | "New"
  | "Contacted"
  | "In Discussion"
  | "Quotation Sent"
  | "Negotiation"
  | "Follow-up Required"
  | "Won"
  | "Lost"

export type CrmStage = "New" | "Assigned" | "Contacted" | "Qualified" | "Quotation" | "Negotiation" | "Won" | "Lost"

export type LeadSource =
  | "Product Page"
  | "Post Requirement"
  | "Supplier Profile"
  | "WhatsApp"
  | "BRICS Desk"
  | "Phone Call"

export interface BuyerInfo {
  name: string
  company: string
  phone: string
  email: string
  city: string
  gst?: string
}

export interface LeadNote {
  id: string
  by: string
  text: string
  at: string
  kind: "note" | "call" | "internal"
}

export interface LeadActivity {
  id: string
  kind: "created" | "matched" | "assigned" | "status" | "whatsapp" | "email" | "quote" | "note" | "followup" | "viewed"
  text: string
  at: string
  by: string
}

export interface Quote {
  id: string
  supplierId: string
  pricePerUnit: number
  total: number
  message: string
  validTill: string
  leadTime: string
  at: string
  status: "sent" | "accepted" | "declined"
}

export interface Lead {
  id: string
  buyer: BuyerInfo
  buyerId?: string
  productId?: string
  categoryId: string
  title: string
  quantity: number
  unit: string
  budget?: number
  deliveryLocation: string
  deliveryDate?: string
  description: string
  attachments: string[]
  createdAt: string
  source: LeadSource
  supplierIds: string[]
  supplierStage: Record<string, SupplierStage>
  crmStage: CrmStage
  assignedTo?: string
  followUpAt?: string
  priority: "High" | "Medium" | "Low"
  notes: LeadNote[]
  activity: LeadActivity[]
  quotes: Quote[]
  international?: { country: string; incoterm: string }
}

export interface AppNotification {
  id: string
  role: Exclude<Role, "guest">
  title: string
  body: string
  at: string
  read: boolean
  channel: "in-app" | "email" | "whatsapp" | "sms"
  link?: string
}

export interface Banner {
  id: string
  title: string
  subtitle: string
  cta: string
  link: string
  image: string
  placement: "Homepage Hero" | "Homepage Strip" | "Category" | "BRICS"
  active: boolean
  starts: string
  ends: string
  clicks: number
}

export interface WhatsAppTemplate {
  id: string
  name: string
  category: "Utility" | "Marketing" | "Authentication"
  audience: "Buyer" | "Supplier"
  body: string
  status: "Approved" | "Pending" | "Rejected"
  sent: number
  readRate: number
}

export interface PlatformUser {
  id: string
  name: string
  email: string
  phone: string
  role: "Buyer" | "Supplier" | "CRM Executive" | "Admin" | "Super Admin"
  company: string
  city: string
  status: "Active" | "Pending" | "Suspended"
  verified: boolean
  joinedAt: string
  lastActive: string
}

export interface CmsPage {
  slug: string
  title: string
  updatedAt: string
  status: "Published" | "Draft"
  body: string
}
