import { create } from "zustand"
import { persist } from "zustand/middleware"
import { categories as seedCategories } from "@/data/categories"
import { banners as seedBanners, cmsPages as seedPages, platformUsers, seedNotifications, whatsappTemplates } from "@/data/content"
import { demoBuyer, seedLeads } from "@/data/leads"
import { products as seedProducts } from "@/data/products"
import { suppliers as seedSuppliers } from "@/data/suppliers"
import type {
  AppNotification,
  Banner,
  BuyerInfo,
  Category,
  CmsPage,
  CrmStage,
  Lead,
  LeadActivity,
  LeadNote,
  LeadSource,
  PlatformUser,
  Product,
  ProductStatus,
  Quote,
  Role,
  Supplier,
  SupplierStage,
  SupplierStatus,
  WhatsAppTemplate,
} from "@/types"

/** The supplier account used when the demo is switched to the Supplier role. */
export const DEMO_SUPPLIER_ID = "volta"
export const DEMO_ADMIN = { name: "Ananya Rao", title: "Marketplace Admin" }

export interface EnquiryInput {
  title: string
  categoryId: string
  productId?: string
  supplierId?: string
  quantity: number
  unit: string
  budget?: number
  deliveryLocation: string
  deliveryDate?: string
  description: string
  attachments: string[]
  buyer: BuyerInfo
  source: LeadSource
  international?: Lead["international"]
}

export interface WhatsAppMessage {
  id: string
  to: string
  toName: string
  body: string
  at: string
  leadId?: string
  direction: "outbound" | "inbound"
  status: "sent" | "delivered" | "read"
}

interface AppState {
  role: Role
  categories: Category[]
  suppliers: Supplier[]
  products: Product[]
  leads: Lead[]
  notifications: AppNotification[]
  banners: Banner[]
  templates: WhatsAppTemplate[]
  pages: CmsPage[]
  users: PlatformUser[]
  savedProductIds: string[]
  savedSupplierIds: string[]
  whatsappLog: WhatsAppMessage[]

  setRole: (role: Role) => void
  resetDemo: () => void

  toggleSaveProduct: (id: string) => void
  toggleSaveSupplier: (id: string) => void

  submitEnquiry: (input: EnquiryInput) => Lead
  setSupplierStage: (leadId: string, supplierId: string, stage: SupplierStage, by: string) => void
  setCrmStage: (leadId: string, stage: CrmStage, by: string) => void
  assignLead: (leadId: string, user: string, by: string) => void
  addNote: (leadId: string, note: Omit<LeadNote, "id" | "at">) => void
  setFollowUp: (leadId: string, at: string, by: string) => void
  sendQuote: (leadId: string, quote: Omit<Quote, "id" | "at" | "status">) => void
  respondToQuote: (leadId: string, quoteId: string, accept: boolean) => void
  logWhatsApp: (msg: Omit<WhatsAppMessage, "id" | "at" | "status">) => void

  upsertProduct: (p: Product) => void
  setProductStatus: (id: string, status: ProductStatus) => void
  deleteProduct: (id: string) => void
  toggleProductFeatured: (id: string) => void
  clearReport: (id: string) => void

  setSupplierStatus: (id: string, status: SupplierStatus) => void
  setSupplierVerified: (id: string, verified: boolean) => void
  toggleSupplierFeatured: (id: string) => void
  updateSupplier: (id: string, patch: Partial<Supplier>) => void

  markNotificationsRead: (role: AppNotification["role"]) => void
  markNotificationRead: (id: string) => void

  upsertBanner: (b: Banner) => void
  deleteBanner: (id: string) => void
  updatePage: (slug: string, patch: Partial<CmsPage>) => void
  upsertTemplate: (t: WhatsAppTemplate) => void

  addCategory: (name: string) => void
  addSubCategory: (categoryId: string, name: string) => void
  addChildCategory: (categoryId: string, subId: string, name: string) => void

  setUserStatus: (id: string, status: PlatformUser["status"]) => void
}

const now = () => new Date().toISOString()
const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 8)}`
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")

const seed = () => ({
  role: "guest" as Role,
  categories: structuredClone(seedCategories),
  suppliers: structuredClone(seedSuppliers),
  products: structuredClone(seedProducts),
  leads: structuredClone(seedLeads),
  notifications: structuredClone(seedNotifications),
  banners: structuredClone(seedBanners),
  templates: structuredClone(whatsappTemplates),
  pages: structuredClone(seedPages),
  users: structuredClone(platformUsers),
  savedProductIds: ["p-65w-gan", "p-3ply-box", "p-solar-540"],
  savedSupplierIds: ["volta", "packright"],
  whatsappLog: [] as WhatsAppMessage[],
})

const supplierToCrm: Partial<Record<SupplierStage, CrmStage>> = {
  Contacted: "Contacted",
  "In Discussion": "Qualified",
  "Quotation Sent": "Quotation",
  Negotiation: "Negotiation",
  Won: "Won",
  Lost: "Lost",
}

/** Phase One rule-based matching: category match, then same-city, verified and rating as tie-breakers. */
export function matchSuppliers(suppliers: Supplier[], categoryId: string, city: string, limit = 3) {
  return suppliers
    .filter((s) => s.status === "active" && s.categoryIds.includes(categoryId))
    .map((s) => ({
      s,
      score:
        (s.city.toLowerCase() === city.toLowerCase() ? 3 : 0) + (s.verified ? 2 : 0) + (s.trustSeal ? 1 : 0) + s.rating,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.s.id)
}

export const useApp = create<AppState>()(
  persist(
    (set, get) => {
      const updateLead = (leadId: string, fn: (l: Lead) => Lead) =>
        set((st) => ({ leads: st.leads.map((l) => (l.id === leadId ? fn(l) : l)) }))
      const activity = (kind: LeadActivity["kind"], text: string, by: string): LeadActivity => ({
        id: uid("act"),
        kind,
        text,
        by,
        at: now(),
      })
      const notify = (n: Omit<AppNotification, "id" | "at" | "read">) =>
        set((st) => ({ notifications: [{ ...n, id: uid("nt"), at: now(), read: false }, ...st.notifications] }))

      return {
        ...seed(),

        setRole: (role) => set({ role }),
        resetDemo: () => set({ ...seed(), role: get().role }),

        toggleSaveProduct: (id) =>
          set((st) => ({
            savedProductIds: st.savedProductIds.includes(id)
              ? st.savedProductIds.filter((x) => x !== id)
              : [id, ...st.savedProductIds],
          })),
        toggleSaveSupplier: (id) =>
          set((st) => ({
            savedSupplierIds: st.savedSupplierIds.includes(id)
              ? st.savedSupplierIds.filter((x) => x !== id)
              : [id, ...st.savedSupplierIds],
          })),

        submitEnquiry: (input) => {
          const st = get()
          const product = input.productId ? st.products.find((p) => p.id === input.productId) : undefined
          const direct = input.supplierId ?? product?.supplierId
          const supplierIds = direct ? [direct] : matchSuppliers(st.suppliers, input.categoryId, input.deliveryLocation)
          const id = `ENQ-${24200 + st.leads.length + Math.floor(Math.random() * 50)}`
          const at = now()
          const names = supplierIds.map((s) => st.suppliers.find((x) => x.id === s)?.name).filter(Boolean)
          const lead: Lead = {
            id,
            buyer: input.buyer,
            buyerId: st.role === "buyer" || input.buyer.email === demoBuyer.email ? demoBuyer.id : undefined,
            productId: input.productId,
            categoryId: input.categoryId,
            title: input.title,
            quantity: input.quantity,
            unit: input.unit,
            budget: input.budget,
            deliveryLocation: input.deliveryLocation,
            deliveryDate: input.deliveryDate,
            description: input.description,
            attachments: input.attachments,
            createdAt: at,
            source: input.source,
            supplierIds,
            supplierStage: Object.fromEntries(supplierIds.map((s) => [s, "New" as SupplierStage])),
            crmStage: "New",
            priority: (input.budget ?? 0) > 1000000 ? "High" : "Medium",
            notes: [],
            quotes: [],
            international: input.international,
            activity: [
              { id: uid("act"), kind: "created", text: `Enquiry submitted via ${input.source}`, at, by: input.buyer.name },
              {
                id: uid("act"),
                kind: "matched",
                text: direct
                  ? `Routed directly to ${names[0]}`
                  : `Matched to ${names.length} supplier(s): ${names.join(", ")}`,
                at,
                by: "System",
              },
              { id: uid("act"), kind: "whatsapp", text: "WhatsApp & email alerts sent to matched suppliers", at, by: "System" },
            ],
          }
          set((s) => ({ leads: [lead, ...s.leads] }))
          if (supplierIds.includes(DEMO_SUPPLIER_ID)) {
            notify({
              role: "supplier",
              title: `New enquiry: ${input.title}`,
              body: `${input.buyer.name} (${input.deliveryLocation}) needs ${input.quantity.toLocaleString("en-IN")} ${input.unit}.`,
              channel: "whatsapp",
              link: "/supplier/leads",
            })
          }
          notify({
            role: "admin",
            title: "New enquiry received",
            body: `${id} · ${input.title} — matched to ${supplierIds.length} supplier(s).`,
            channel: "in-app",
            link: "/admin/crm",
          })
          notify({
            role: "buyer",
            title: "Your enquiry has been submitted",
            body: `${id} was shared with ${supplierIds.length} verified supplier(s). Expect responses shortly.`,
            channel: "email",
            link: "/buyer/enquiries",
          })
          return lead
        },

        setSupplierStage: (leadId, supplierId, stage, by) => {
          updateLead(leadId, (l) => ({
            ...l,
            supplierStage: { ...l.supplierStage, [supplierId]: stage },
            crmStage: supplierToCrm[stage] ?? l.crmStage,
            activity: [activity("status", `Supplier stage changed to “${stage}”`, by), ...l.activity],
          }))
          if (stage === "Won") {
            notify({ role: "admin", title: "Lead converted", body: `${leadId} was marked Won by the supplier.`, channel: "in-app", link: "/admin/crm" })
          }
        },
        setCrmStage: (leadId, stage, by) =>
          updateLead(leadId, (l) => ({
            ...l,
            crmStage: stage,
            activity: [activity("status", `CRM status changed to “${stage}”`, by), ...l.activity],
          })),
        assignLead: (leadId, user, by) =>
          updateLead(leadId, (l) => ({
            ...l,
            assignedTo: user,
            crmStage: l.crmStage === "New" ? "Assigned" : l.crmStage,
            activity: [activity("assigned", `Assigned to ${user}`, by), ...l.activity],
          })),
        addNote: (leadId, note) =>
          updateLead(leadId, (l) => ({
            ...l,
            notes: [{ ...note, id: uid("note"), at: now() }, ...l.notes],
            activity: [
              activity(
                "note",
                note.kind === "call" ? "Call remark added" : note.kind === "internal" ? "Internal comment added" : "Note added",
                note.by,
              ),
              ...l.activity,
            ],
          })),
        setFollowUp: (leadId, at, by) =>
          updateLead(leadId, (l) => ({
            ...l,
            followUpAt: at,
            activity: [
              activity("followup", `Follow-up scheduled for ${new Date(at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}`, by),
              ...l.activity,
            ],
          })),
        sendQuote: (leadId, q) => {
          const supplier = get().suppliers.find((s) => s.id === q.supplierId)
          updateLead(leadId, (l) => ({
            ...l,
            quotes: [{ ...q, id: uid("q"), at: now(), status: "sent" }, ...l.quotes],
            supplierStage: { ...l.supplierStage, [q.supplierId]: "Quotation Sent" },
            crmStage: ["Won", "Lost", "Negotiation"].includes(l.crmStage) ? l.crmStage : "Quotation",
            activity: [
              activity("quote", `Quotation sent: ₹${q.pricePerUnit.toLocaleString("en-IN")}/unit`, supplier?.name ?? "Supplier"),
              ...l.activity,
            ],
          }))
          notify({
            role: "buyer",
            title: "New quotation received",
            body: `${supplier?.name} quoted ₹${q.pricePerUnit.toLocaleString("en-IN")}/unit for your enquiry ${leadId}.`,
            channel: "whatsapp",
            link: `/buyer/enquiries/${leadId}`,
          })
        },
        respondToQuote: (leadId, quoteId, accept) => {
          const lead = get().leads.find((l) => l.id === leadId)
          const quote = lead?.quotes.find((q) => q.id === quoteId)
          if (!lead || !quote) return
          updateLead(leadId, (l) => ({
            ...l,
            quotes: l.quotes.map((q) => (q.id === quoteId ? { ...q, status: accept ? "accepted" : "declined" } : q)),
            supplierStage: { ...l.supplierStage, [quote.supplierId]: accept ? "Won" : "Negotiation" },
            crmStage: accept ? "Won" : "Negotiation",
            activity: [
              activity("quote", accept ? "Buyer accepted the quotation" : "Buyer requested a revised quotation", l.buyer.name),
              ...l.activity,
            ],
          }))
          if (quote.supplierId === DEMO_SUPPLIER_ID) {
            notify({
              role: "supplier",
              title: accept ? "🎉 Quotation accepted" : "Buyer requested a better price",
              body: `${lead.buyer.company} ${accept ? "accepted" : "responded to"} your quote on ${leadId}.`,
              channel: "whatsapp",
              link: "/supplier/leads",
            })
          }
        },
        logWhatsApp: (msg) => {
          set((st) => ({ whatsappLog: [{ ...msg, id: uid("wa"), at: now(), status: "delivered" }, ...st.whatsappLog] }))
          if (msg.leadId) {
            updateLead(msg.leadId, (l) => ({
              ...l,
              activity: [activity("whatsapp", `WhatsApp message sent to ${msg.toName}`, "You"), ...l.activity],
            }))
          }
        },

        upsertProduct: (p) =>
          set((st) => ({
            products: st.products.some((x) => x.id === p.id)
              ? st.products.map((x) => (x.id === p.id ? p : x))
              : [p, ...st.products],
          })),
        setProductStatus: (id, status) => {
          set((st) => ({ products: st.products.map((p) => (p.id === id ? { ...p, status } : p)) }))
          const p = get().products.find((x) => x.id === id)
          if (p?.supplierId === DEMO_SUPPLIER_ID && (status === "active" || status === "rejected")) {
            notify({
              role: "supplier",
              title: status === "active" ? "Product approved" : "Product needs changes",
              body: `${p.name} was ${status === "active" ? "approved and is now live" : "rejected by the moderation team"}.`,
              channel: "email",
              link: "/supplier/products",
            })
          }
          if (status === "pending") {
            notify({ role: "admin", title: "Product awaiting approval", body: `${p?.name} was submitted for review.`, channel: "in-app", link: "/admin/products" })
          }
        },
        deleteProduct: (id) => set((st) => ({ products: st.products.filter((p) => p.id !== id) })),
        toggleProductFeatured: (id) =>
          set((st) => ({ products: st.products.map((p) => (p.id === id ? { ...p, featured: !p.featured } : p)) })),
        clearReport: (id) =>
          set((st) => ({ products: st.products.map((p) => (p.id === id ? { ...p, reported: false } : p)) })),

        setSupplierStatus: (id, status) =>
          set((st) => ({ suppliers: st.suppliers.map((s) => (s.id === id ? { ...s, status } : s)) })),
        setSupplierVerified: (id, verified) =>
          set((st) => ({ suppliers: st.suppliers.map((s) => (s.id === id ? { ...s, verified } : s)) })),
        toggleSupplierFeatured: (id) =>
          set((st) => ({ suppliers: st.suppliers.map((s) => (s.id === id ? { ...s, featured: !s.featured } : s)) })),
        updateSupplier: (id, patch) =>
          set((st) => ({ suppliers: st.suppliers.map((s) => (s.id === id ? { ...s, ...patch } : s)) })),

        markNotificationsRead: (role) =>
          set((st) => ({ notifications: st.notifications.map((n) => (n.role === role ? { ...n, read: true } : n)) })),
        markNotificationRead: (id) =>
          set((st) => ({ notifications: st.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) })),

        upsertBanner: (b) =>
          set((st) => ({
            banners: st.banners.some((x) => x.id === b.id) ? st.banners.map((x) => (x.id === b.id ? b : x)) : [b, ...st.banners],
          })),
        deleteBanner: (id) => set((st) => ({ banners: st.banners.filter((b) => b.id !== id) })),
        updatePage: (slug, patch) =>
          set((st) => ({
            pages: st.pages.map((p) => (p.slug === slug ? { ...p, ...patch, updatedAt: now().slice(0, 10) } : p)),
          })),
        upsertTemplate: (t) =>
          set((st) => ({
            templates: st.templates.some((x) => x.id === t.id)
              ? st.templates.map((x) => (x.id === t.id ? t : x))
              : [t, ...st.templates],
          })),

        addCategory: (name) =>
          set((st) => ({
            categories: [
              ...st.categories,
              { id: slugify(name), name, icon: "Boxes", image: st.categories[0].image, tagline: "New category", subs: [], attributes: [], units: ["Piece"] },
            ],
          })),
        addSubCategory: (categoryId, name) =>
          set((st) => ({
            categories: st.categories.map((c) =>
              c.id === categoryId ? { ...c, subs: [...c.subs, { id: slugify(name), name, children: [] }] } : c,
            ),
          })),
        addChildCategory: (categoryId, subId, name) =>
          set((st) => ({
            categories: st.categories.map((c) =>
              c.id === categoryId
                ? {
                    ...c,
                    subs: c.subs.map((s) =>
                      s.id === subId ? { ...s, children: [...s.children, { id: slugify(name), name }] } : s,
                    ),
                  }
                : c,
            ),
          })),

        setUserStatus: (id, status) =>
          set((st) => ({ users: st.users.map((u) => (u.id === id ? { ...u, status } : u)) })),
      }
    },
    { name: "tradesetu-demo-v1", version: 1 },
  ),
)

export const useSupplier = (id?: string) => useApp((s) => s.suppliers.find((x) => x.id === id))
export const useProduct = (id?: string) => useApp((s) => s.products.find((x) => x.id === id))
