import { useMemo } from "react"
import { demoBuyer } from "@/data/leads"
import { useApp } from "@/store/app"
import type { Lead } from "@/types"

export type BuyerStatus = "Open" | "Quoted" | "Won" | "Closed"

export function buyerStatus(l: Lead): BuyerStatus {
  if (l.crmStage === "Won") return "Won"
  if (l.crmStage === "Lost") return "Closed"
  if (l.quotes.length > 0) return "Quoted"
  return "Open"
}

export function useBuyerLeads() {
  const leads = useApp((s) => s.leads)
  return useMemo(
    () =>
      leads
        .filter((l) => l.buyerId === demoBuyer.id)
        .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    [leads],
  )
}
