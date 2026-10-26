import { cn } from "@/lib/utils"
import type { BuyerStatus } from "./useBuyer"

const tone: Record<BuyerStatus, string> = {
  Open: "bg-blue-50 text-blue-700 ring-blue-200",
  Quoted: "bg-amber-50 text-amber-700 ring-amber-200",
  Won: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Closed: "bg-zinc-100 text-zinc-600 ring-zinc-200",
}

const label: Record<BuyerStatus, string> = {
  Open: "Awaiting quotes",
  Quoted: "Quotes received",
  Won: "Order confirmed",
  Closed: "Closed",
}

export function BuyerStatusBadge({ status, className }: { status: BuyerStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center whitespace-nowrap rounded-full px-2 text-[11px] font-medium ring-1 ring-inset",
        tone[status],
        className,
      )}
    >
      {label[status]}
    </span>
  )
}
