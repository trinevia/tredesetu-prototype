import {
  BadgeCheck,
  Boxes,
  Factory,
  FileCheck2,
  FlaskConical,
  HardHat,
  ImageOff,
  Landmark,
  Languages,
  Package,
  Pill,
  Shirt,
  ShieldCheck,
  Ship,
  Sofa,
  Sparkles,
  Star,
  Sun,
  UserCheck,
  Wheat,
  Zap,
  type LucideIcon,
} from "lucide-react"
import { useState, type ReactNode } from "react"
import { Link } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { CrmStage, ProductStatus, SupplierStage } from "@/types"

export function Logo({ className, light = false }: { className?: string; light?: boolean }) {
  return (
    <Link to="/" className={cn("flex items-center gap-2 font-semibold", className)}>
      <span className="relative grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm">
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
          <path d="M3 17c3-6 15-6 18 0" />
          <path d="M7 13.5V19M12 12v7M17 13.5V19" />
        </svg>
        <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-saffron ring-2 ring-background" />
      </span>
      <span className={cn("text-lg tracking-tight", light ? "text-white" : "text-brand")}>
        Trade<span className="text-saffron">Setu</span>
      </span>
    </Link>
  )
}

const iconMap: Record<string, LucideIcon> = {
  Boxes,
  Factory,
  FileCheck2,
  HardHat,
  Landmark,
  Languages,
  Package,
  Pill,
  Shirt,
  Ship,
  Sofa,
  Sparkles,
  Sun,
  UserCheck,
  BadgeCheck,
  Wheat,
  Zap,
}

/** Renders an icon referenced by name in seed data (categories, BRICS services). */
export function DynamicIcon({ name, className }: { name: string; className?: string }) {
  const Icon = iconMap[name] ?? Boxes
  return <Icon className={className} />
}

export function SmartImage({ src, alt, className }: { src?: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false)
  if (!src || failed) {
    return (
      <div className={cn("grid place-items-center bg-muted text-muted-foreground", className)}>
        <ImageOff className="size-6" />
      </div>
    )
  }
  return <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} className={cn("object-cover", className)} />
}

export function VerifiedBadge({ className, label = "Verified" }: { className?: string; label?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-medium text-success", className)}>
      <BadgeCheck className="size-3.5" /> {label}
    </span>
  )
}

export function TrustSeal({ seal }: { seal: "Gold" | "Silver" | null }) {
  if (!seal) return null
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
        seal === "Gold" ? "bg-saffron/15 text-amber-700" : "bg-slate-100 text-slate-600",
      )}
    >
      <ShieldCheck className="size-3" /> {seal} Trust Seal
    </span>
  )
}

export function Rating({ value, count, className }: { value: number; count?: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs", className)}>
      <Star className="size-3.5 fill-saffron text-saffron" />
      <span className="font-semibold text-foreground">{value.toFixed(1)}</span>
      {count !== undefined && <span className="text-muted-foreground">({count})</span>}
    </span>
  )
}

const stageTone: Record<string, string> = {
  New: "bg-blue-50 text-blue-700 ring-blue-200",
  Assigned: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  Contacted: "bg-sky-50 text-sky-700 ring-sky-200",
  "In Discussion": "bg-violet-50 text-violet-700 ring-violet-200",
  Qualified: "bg-violet-50 text-violet-700 ring-violet-200",
  "Quotation Sent": "bg-amber-50 text-amber-700 ring-amber-200",
  Quotation: "bg-amber-50 text-amber-700 ring-amber-200",
  Negotiation: "bg-orange-50 text-orange-700 ring-orange-200",
  "Follow-up Required": "bg-rose-50 text-rose-700 ring-rose-200",
  Won: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Lost: "bg-zinc-100 text-zinc-600 ring-zinc-200",
  active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Approved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Published: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  Pending: "bg-amber-50 text-amber-700 ring-amber-200",
  Draft: "bg-zinc-100 text-zinc-600 ring-zinc-200",
  draft: "bg-zinc-100 text-zinc-600 ring-zinc-200",
  inactive: "bg-zinc-100 text-zinc-600 ring-zinc-200",
  rejected: "bg-rose-50 text-rose-700 ring-rose-200",
  Rejected: "bg-rose-50 text-rose-700 ring-rose-200",
  suspended: "bg-rose-50 text-rose-700 ring-rose-200",
  Suspended: "bg-rose-50 text-rose-700 ring-rose-200",
}

const statusLabel: Record<string, string> = {
  active: "Active",
  pending: "Pending approval",
  rejected: "Rejected",
  inactive: "Inactive",
  draft: "Draft",
  suspended: "Suspended",
}

export function StatusBadge({
  status,
  className,
}: {
  status: SupplierStage | CrmStage | ProductStatus | string
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center whitespace-nowrap rounded-full px-2 text-[11px] font-medium ring-1 ring-inset",
        stageTone[status] ?? "bg-muted text-muted-foreground ring-border",
        className,
      )}
    >
      {statusLabel[status] ?? status}
    </span>
  )
}

export function StatCard({
  label,
  value,
  delta,
  icon: Icon,
  hint,
  tone = "primary",
}: {
  label: string
  value: ReactNode
  delta?: string
  icon: LucideIcon
  hint?: string
  tone?: "primary" | "saffron" | "success" | "violet" | "rose"
}) {
  const tones = {
    primary: "bg-primary/10 text-primary",
    saffron: "bg-saffron/15 text-amber-700",
    success: "bg-success/12 text-success",
    violet: "bg-violet-100 text-violet-700",
    rose: "bg-rose-100 text-rose-700",
  }
  return (
    <Card className="gap-3 p-4">
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className={cn("grid size-8 place-items-center rounded-lg", tones[tone])}>
          <Icon className="size-4" />
        </span>
      </div>
      <div className="flex items-end justify-between gap-2">
        <span className="text-2xl font-semibold tracking-tight">{value}</span>
        {delta && (
          <Badge variant="secondary" className="bg-success/10 text-success">
            {delta}
          </Badge>
        )}
      </div>
      {hint && <span className="-mt-1 text-xs text-muted-foreground">{hint}</span>}
    </Card>
  )
}

export function EmptyState({
  icon: Icon,
  title,
  body,
  action,
  className,
}: {
  icon: LucideIcon
  title: string
  body?: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center rounded-xl border border-dashed px-6 py-14 text-center", className)}>
      <span className="mb-3 grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
        <Icon className="size-6" />
      </span>
      <h3 className="font-semibold">{title}</h3>
      {body && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string
  description?: string
  actions?: ReactNode
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

export function SectionHeading({
  eyebrow,
  title,
  action,
  className,
}: {
  eyebrow?: string
  title: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cn("mb-5 flex items-end justify-between gap-4", className)}>
      <div>
        {eyebrow && <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-primary">{eyebrow}</p>}
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">{title}</h2>
      </div>
      {action}
    </div>
  )
}

export function SimulatedNote({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("flex items-start gap-1.5 text-[11px] leading-snug text-muted-foreground", className)}>
      <FlaskConical className="mt-px size-3 shrink-0" />
      <span>{children}</span>
    </p>
  )
}
