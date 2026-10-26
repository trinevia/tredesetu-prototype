import { useMemo } from "react"
import { DEMO_SUPPLIER_ID, useApp } from "@/store/app"
import type { Lead, Supplier, SupplierStage } from "@/types"

export const SUPPLIER_STAGES: SupplierStage[] = [
  "New",
  "Contacted",
  "In Discussion",
  "Quotation Sent",
  "Negotiation",
  "Follow-up Required",
  "Won",
  "Lost",
]

export const stageOf = (l: Lead): SupplierStage => l.supplierStage[DEMO_SUPPLIER_ID] ?? "New"

/** Estimated deal value: budget, else latest quote total, else MOQ-based estimate. */
export function leadValue(l: Lead, priceHint?: number) {
  return l.budget ?? l.quotes[0]?.total ?? (priceHint ? priceHint * l.quantity : 0)
}

export function useSupplierLeads() {
  const leads = useApp((s) => s.leads)
  return useMemo(
    () =>
      leads
        .filter((l) => l.supplierIds.includes(DEMO_SUPPLIER_ID))
        .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    [leads],
  )
}

export function useSupplierProducts() {
  const products = useApp((s) => s.products)
  return useMemo(() => products.filter((p) => p.supplierId === DEMO_SUPPLIER_ID), [products])
}

export function profileChecklist(s: Supplier) {
  return [
    { label: "Company description", done: s.description.length > 120 },
    { label: "Logo & cover image", done: !!s.logo && !!s.cover },
    { label: "GST & business details", done: !!s.gst },
    { label: "Certifications", done: s.certifications.length > 0 },
    { label: "Factory / office photos", done: s.gallery.length >= 3 },
    { label: "Payment & delivery terms", done: s.paymentTerms.length > 0 && !!s.deliveryInfo },
    { label: "Website & social links", done: !!s.website },
    { label: "Export markets", done: s.exportMarkets.length > 0 },
    { label: "Video introduction", done: false },
  ]
}

/** Follow-up is overdue or falls within the next `days` days. */
export function isDueSoon(iso?: string, days = 7) {
  if (!iso) return false
  return new Date(iso).getTime() <= Date.now() + days * 86400000
}

export const isOverdue = (iso?: string) => !!iso && new Date(iso).getTime() < Date.now()
