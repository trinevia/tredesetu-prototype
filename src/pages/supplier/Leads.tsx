import {
  AlarmClock,
  ArrowUpRight,
  CalendarClock,
  Columns3,
  FileText,
  Flame,
  Globe2,
  Inbox,
  IndianRupee,
  List,
  MapPin,
  MessageCircle,
  MousePointerClick,
  Package,
  Phone,
  Search,
  Sparkles,
  Trophy,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react"
import { useMemo, useState, type DragEvent } from "react"
import { useSearchParams } from "react-router-dom"
import { toast } from "sonner"
import { EmptyState, StatusBadge } from "@/components/common/bits"
import { WhatsAppDialog } from "@/components/market/WhatsAppDialog"
import { LeadSheet } from "@/components/supplier/LeadSheet"
import { QuoteDialog } from "@/components/supplier/QuoteDialog"
import { SUPPLIER_STAGES, isOverdue, leadValue, stageOf, useSupplierLeads } from "@/components/supplier/useSupplierData"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { fmtDateTime, initials, inrCompact, num, timeAgo } from "@/lib/format"
import { cn } from "@/lib/utils"
import { DEMO_SUPPLIER_ID, useApp } from "@/store/app"
import type { Lead, LeadSource, SupplierStage } from "@/types"

const stageStyle: Record<SupplierStage, { dot: string; bar: string; soft: string; text: string }> = {
  New: { dot: "bg-blue-500", bar: "bg-blue-500", soft: "bg-blue-50", text: "text-blue-700" },
  Contacted: { dot: "bg-sky-500", bar: "bg-sky-500", soft: "bg-sky-50", text: "text-sky-700" },
  "In Discussion": { dot: "bg-violet-500", bar: "bg-violet-500", soft: "bg-violet-50", text: "text-violet-700" },
  "Quotation Sent": { dot: "bg-amber-500", bar: "bg-amber-500", soft: "bg-amber-50", text: "text-amber-700" },
  Negotiation: { dot: "bg-orange-500", bar: "bg-orange-500", soft: "bg-orange-50", text: "text-orange-700" },
  "Follow-up Required": { dot: "bg-rose-500", bar: "bg-rose-500", soft: "bg-rose-50", text: "text-rose-700" },
  Won: { dot: "bg-emerald-500", bar: "bg-emerald-500", soft: "bg-emerald-50", text: "text-emerald-700" },
  Lost: { dot: "bg-zinc-400", bar: "bg-zinc-300", soft: "bg-zinc-100", text: "text-zinc-600" },
}

const sourceIcon: Record<LeadSource, LucideIcon> = {
  "Product Page": Package,
  "Post Requirement": Sparkles,
  "Supplier Profile": UserRound,
  WhatsApp: MessageCircle,
  "BRICS Desk": Globe2,
  "Phone Call": Phone,
}

const sources = Object.keys(sourceIcon) as LeadSource[]
const isOpen = (l: Lead) => !["Won", "Lost"].includes(stageOf(l))

const avatarTone = ["bg-blue-100 text-blue-700", "bg-violet-100 text-violet-700", "bg-emerald-100 text-emerald-700", "bg-amber-100 text-amber-800", "bg-rose-100 text-rose-700", "bg-cyan-100 text-cyan-700"]
const toneFor = (s: string) => avatarTone[[...s].reduce((a, c) => a + c.charCodeAt(0), 0) % avatarTone.length]

function BuyerAvatar({ name, className }: { name: string; className?: string }) {
  return (
    <span className={cn("grid size-8 shrink-0 place-items-center rounded-full text-[11px] font-semibold", toneFor(name), className)}>{initials(name)}</span>
  )
}

function Kpi({
  icon: Icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: LucideIcon
  label: string
  value: string
  hint: string
  tone: string
}) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-2xl border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:gap-4">
      <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl sm:size-11", tone)}>
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="text-[13px] text-muted-foreground">{label}</p>
        <p className="text-xl font-semibold tracking-tight">{value}</p>
        <p className="truncate text-xs text-muted-foreground">{hint}</p>
      </div>
    </div>
  )
}

function LeadCard({
  lead,
  value,
  onOpen,
  onStage,
}: {
  lead: Lead
  value: number
  onOpen: () => void
  onStage: (s: SupplierStage) => void
}) {
  const stage = stageOf(lead)
  const SourceIcon = sourceIcon[lead.source]
  const fresh = stage === "New" && Date.now() - new Date(lead.createdAt).getTime() < 86400000
  const quote = lead.quotes.find((q) => q.supplierId === DEMO_SUPPLIER_ID)
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", lead.id)
        e.dataTransfer.effectAllowed = "move"
      }}
      onClick={onOpen}
      className="group relative cursor-grab rounded-xl border bg-card p-3.5 shadow-xs transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md active:cursor-grabbing"
    >
      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 font-medium">
          <SourceIcon className="size-3" /> {lead.source}
        </span>
        {lead.international && (
          <span className="inline-flex items-center gap-1 rounded-md bg-saffron/15 px-1.5 py-0.5 font-medium text-amber-800">
            <Globe2 className="size-3" /> {lead.international.country}
          </span>
        )}
        <span className="ml-auto whitespace-nowrap">{timeAgo(lead.createdAt)}</span>
      </div>

      <p className="mt-2.5 line-clamp-2 text-[14px] font-semibold leading-snug">{lead.title}</p>

      <div className="mt-3 flex items-center gap-2.5">
        <BuyerAvatar name={lead.buyer.name} />
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-[13px] font-medium">{lead.buyer.name}</p>
          <p className="truncate text-xs text-muted-foreground">{lead.buyer.company}</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-surface px-2.5 py-1.5">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Value</p>
          <p className="text-sm font-semibold text-brand">{value ? inrCompact(value) : "—"}</p>
        </div>
        <div className="rounded-lg bg-surface px-2.5 py-1.5">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Qty</p>
          <p className="truncate text-sm font-semibold">
            {num(lead.quantity)} <span className="text-xs font-normal text-muted-foreground">{lead.unit}</span>
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px]">
        <span className="inline-flex items-center gap-1 text-muted-foreground">
          <MapPin className="size-3" /> {lead.buyer.city}
        </span>
        {lead.priority === "High" && (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 font-medium text-rose-700">
            <Flame className="size-3" /> Hot
          </span>
        )}
        {fresh && <span className="rounded-full bg-blue-50 px-2 py-0.5 font-medium text-blue-700">Respond now</span>}
        {quote && (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 font-medium text-amber-800">
            <FileText className="size-3" /> Quoted
          </span>
        )}
      </div>

      {lead.followUpAt && isOpen(lead) && (
        <p
          className={cn(
            "mt-3 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium",
            isOverdue(lead.followUpAt) ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-800",
          )}
        >
          <CalendarClock className="size-3.5" />
          {isOverdue(lead.followUpAt) ? "Overdue · " : "Follow-up · "}
          {fmtDateTime(lead.followUpAt)}
        </p>
      )}

      {/* Touch devices can't drag: offer a stage picker instead. */}
      <div className="mt-3 md:hidden" onClick={(e) => e.stopPropagation()}>
        <Select value={stage} onValueChange={(v) => onStage(v as SupplierStage)}>
          <SelectTrigger size="sm" className="w-full text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SUPPLIER_STAGES.map((s) => (
              <SelectItem key={s} value={s}>
                Move to: {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isOpen(lead) && (
        <div
          className="absolute right-2.5 top-9 hidden gap-1 rounded-lg border bg-background p-1 opacity-0 shadow-md transition group-hover:opacity-100 md:flex"
          onClick={(e) => e.stopPropagation()}
        >
          <QuoteDialog lead={lead}>
            <Button size="icon-xs" variant="ghost" aria-label="Send quotation">
              <FileText />
            </Button>
          </QuoteDialog>
          <WhatsAppDialog
            toName={lead.buyer.name}
            phone={lead.buyer.phone}
            leadId={lead.id}
            defaultMessage={`Hello ${lead.buyer.name.split(" ")[0]}, this is Arjun from Volta Electronics regarding your enquiry ${lead.id} for ${lead.title}.`}
          >
            <Button size="icon-xs" variant="ghost" aria-label="WhatsApp buyer" className="text-whatsapp hover:text-whatsapp">
              <MessageCircle />
            </Button>
          </WhatsAppDialog>
        </div>
      )}
    </div>
  )
}

export default function SupplierLeads() {
  const leads = useSupplierLeads()
  const products = useApp((s) => s.products)
  const setStage = useApp((s) => s.setSupplierStage)
  const [params, setParams] = useSearchParams()
  const openId = params.get("lead")
  const [view, setView] = useState<"board" | "list">("board")
  const [q, setQ] = useState("")
  const [source, setSource] = useState<"all" | LeadSource>("all")
  const [priority, setPriority] = useState<"all" | Lead["priority"]>("all")
  const [stageFilter, setStageFilter] = useState<SupplierStage | null>(null)
  const [over, setOver] = useState<SupplierStage | null>(null)

  const price = (l: Lead) => products.find((p) => p.id === l.productId)?.priceMin
  const value = (l: Lead) => leadValue(l, price(l))
  const filtered = useMemo(
    () =>
      leads.filter(
        (l) =>
          (source === "all" || l.source === source) &&
          (priority === "all" || l.priority === priority) &&
          (!q || `${l.title} ${l.buyer.name} ${l.buyer.company} ${l.id}`.toLowerCase().includes(q.toLowerCase())),
      ),
    [leads, q, source, priority],
  )

  const open = (id: string) => setParams({ lead: id })
  const move = (id: string, stage: SupplierStage) => {
    const l = leads.find((x) => x.id === id)
    if (!l || stageOf(l) === stage) return
    setStage(id, DEMO_SUPPLIER_ID, stage, "Arjun Malhotra")
    toast.success(`${l.buyer.company} moved to “${stage}”`)
  }
  const onDrop = (e: DragEvent, stage: SupplierStage) => {
    e.preventDefault()
    setOver(null)
    move(e.dataTransfer.getData("text/plain"), stage)
  }

  // KPIs over all of this supplier's leads (not the filtered view).
  const openLeads = leads.filter(isOpen)
  const pipeline = openLeads.reduce((s, l) => s + value(l), 0)
  const newCount = leads.filter((l) => stageOf(l) === "New").length
  const overdue = openLeads.filter((l) => isOverdue(l.followUpAt)).length
  const dueSoon = openLeads.filter((l) => l.followUpAt && !isOverdue(l.followUpAt)).length
  const won = leads.filter((l) => stageOf(l) === "Won")
  const closed = leads.filter((l) => !isOpen(l)).length
  const winRate = closed ? Math.round((won.length / closed) * 100) : 0

  const stageCounts = SUPPLIER_STAGES.map((s) => ({ stage: s, count: filtered.filter((l) => stageOf(l) === s).length }))
  const visibleStages = stageFilter ? [stageFilter] : SUPPLIER_STAGES
  const listRows = stageFilter ? filtered.filter((l) => stageOf(l) === stageFilter) : filtered
  const hasFilters = q || source !== "all" || priority !== "all" || stageFilter

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Leads & enquiries</h1>
          <p className="mt-1 text-sm text-muted-foreground">Every buyer enquiry, from first contact to closed deal. Drag cards to move them through your pipeline.</p>
        </div>
        <ToggleGroup type="single" variant="outline" value={view} onValueChange={(v) => v && setView(v as typeof view)} className="self-start bg-background sm:self-auto">
          <ToggleGroupItem value="board" aria-label="Board view" className="px-3.5">
            <Columns3 /> Board
          </ToggleGroupItem>
          <ToggleGroupItem value="list" aria-label="List view" className="px-3.5">
            <List /> List
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Kpi icon={Inbox} label="New enquiries" value={String(newCount)} hint="Respond within 2 hrs to keep your badge" tone="bg-blue-50 text-blue-600" />
        <Kpi icon={IndianRupee} label="Open pipeline" value={inrCompact(pipeline)} hint={`${openLeads.length} active deals`} tone="bg-primary/10 text-primary" />
        <Kpi
          icon={AlarmClock}
          label="Follow-ups"
          value={`${overdue + dueSoon}`}
          hint={overdue ? `${overdue} overdue · ${dueSoon} upcoming` : `${dueSoon} upcoming`}
          tone={overdue ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-700"}
        />
        <Kpi icon={Trophy} label="Win rate" value={`${winRate}%`} hint={`${won.length} won · ${closed - won.length} lost`} tone="bg-emerald-50 text-emerald-600" />
      </div>

      {/* Pipeline distribution — click a stage to focus on it */}
      <div className="mt-4 rounded-2xl border bg-card p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="text-sm font-semibold">Pipeline overview</p>
          <p className="hidden items-center gap-1 text-xs text-muted-foreground sm:flex">
            <MousePointerClick className="size-3.5" /> Click a stage to focus
          </p>
        </div>
        <div className="flex h-2.5 overflow-hidden rounded-full bg-muted">
          {stageCounts
            .filter((s) => s.count)
            .map((s) => (
              <Tooltip key={s.stage}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => setStageFilter(stageFilter === s.stage ? null : s.stage)}
                    className={cn("h-full transition-opacity", stageStyle[s.stage].bar, stageFilter && stageFilter !== s.stage && "opacity-25")}
                    style={{ width: `${(s.count / Math.max(filtered.length, 1)) * 100}%` }}
                    aria-label={`${s.stage}: ${s.count}`}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  {s.stage}: {s.count}
                </TooltipContent>
              </Tooltip>
            ))}
        </div>
        <div className="scrollbar-none -mx-1 mt-3 flex gap-1.5 overflow-x-auto px-1 pb-0.5">
          {stageCounts.map((s) => {
            const active = stageFilter === s.stage
            return (
              <button
                key={s.stage}
                type="button"
                onClick={() => setStageFilter(active ? null : s.stage)}
                className={cn(
                  "inline-flex h-8 shrink-0 items-center gap-2 rounded-full border px-3 text-xs font-medium transition-colors",
                  active ? cn("border-transparent", stageStyle[s.stage].soft, stageStyle[s.stage].text, "ring-2 ring-current/20") : "bg-background hover:bg-muted",
                )}
              >
                <span className={cn("size-2 rounded-full", stageStyle[s.stage].dot)} />
                {s.stage}
                <span className="tabular-nums text-muted-foreground">{s.count}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 rounded-2xl border bg-card p-3 shadow-sm md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search buyer, company, product or enquiry ID" className="pl-9" />
        </div>
        <div className="grid grid-cols-2 gap-2 md:flex">
          <Select value={source} onValueChange={(v) => setSource(v as typeof source)}>
            <SelectTrigger className="w-full md:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sources</SelectItem>
              {sources.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={priority} onValueChange={(v) => setPriority(v as typeof priority)}>
            <SelectTrigger className="w-full md:w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any priority</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {hasFilters && (
          <Button
            variant="ghost"
            onClick={() => {
              setQ("")
              setSource("all")
              setPriority("all")
              setStageFilter(null)
            }}
          >
            <X /> Clear
          </Button>
        )}
      </div>

      <div className="mt-4">
        {filtered.length === 0 ? (
          <EmptyState icon={Inbox} className="bg-card" title="No leads match these filters" body="Clear the search or filters to see all enquiries." />
        ) : view === "board" ? (
          <div className="-mx-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
            <div className="flex min-w-max gap-4">
              {visibleStages.map((stage) => {
                const items = filtered.filter((l) => stageOf(l) === stage)
                const total = items.reduce((s, l) => s + value(l), 0)
                const st = stageStyle[stage]
                return (
                  <div
                    key={stage}
                    onDragOver={(e) => {
                      e.preventDefault()
                      setOver(stage)
                    }}
                    onDragLeave={() => setOver((o) => (o === stage ? null : o))}
                    onDrop={(e) => onDrop(e, stage)}
                    className={cn(
                      "flex w-[19rem] shrink-0 flex-col overflow-hidden rounded-2xl border bg-muted/40 transition",
                      over === stage && "border-primary/40 bg-primary/[0.06] ring-2 ring-primary/30",
                    )}
                  >
                    <div className={cn("h-1", st.bar)} />
                    <div className="flex items-center gap-2 px-3.5 pb-2.5 pt-3">
                      <span className={cn("size-2.5 rounded-full", st.dot)} />
                      <span className="text-sm font-semibold">{stage}</span>
                      <span className={cn("rounded-full px-2 py-px text-[11px] font-semibold", st.soft, st.text)}>{items.length}</span>
                      <span className="ml-auto text-xs font-medium text-muted-foreground">{total ? inrCompact(total) : ""}</span>
                    </div>
                    <div className="flex min-h-40 flex-1 flex-col gap-2.5 px-2.5 pb-2.5">
                      {items.map((l) => (
                        <LeadCard key={l.id} lead={l} value={value(l)} onOpen={() => open(l.id)} onStage={(s) => move(l.id, s)} />
                      ))}
                      {items.length === 0 && (
                        <div className="grid flex-1 place-items-center rounded-xl border-2 border-dashed border-muted-foreground/15 px-4 py-8 text-center text-xs text-muted-foreground">
                          Drag a lead here
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-surface">
                  <TableRow>
                    <TableHead className="pl-5">Buyer</TableHead>
                    <TableHead>Requirement</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Follow-up</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead className="pr-5" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {listRows.map((l) => {
                    const SourceIcon = sourceIcon[l.source]
                    return (
                      <TableRow key={l.id} className="cursor-pointer" onClick={() => open(l.id)}>
                        <TableCell className="pl-5">
                          <div className="flex items-center gap-3">
                            <BuyerAvatar name={l.buyer.name} className="size-9" />
                            <div className="min-w-0">
                              <p className="font-medium">{l.buyer.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {l.buyer.company} · {l.buyer.city}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-72">
                          <p className="flex items-center gap-1.5 truncate font-medium">
                            {l.priority === "High" && <Flame className="size-3.5 shrink-0 text-rose-500" />}
                            <span className="truncate">{l.title}</span>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {num(l.quantity)} {l.unit} · {l.id} · {timeAgo(l.createdAt)}
                          </p>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-brand">{inrCompact(value(l))}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 text-xs">
                            <SourceIcon className="size-3.5" /> {l.source}
                          </span>
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-xs">
                          {l.followUpAt && isOpen(l) ? (
                            <span className={cn("inline-flex items-center gap-1", isOverdue(l.followUpAt) ? "font-medium text-rose-600" : "text-foreground")}>
                              <CalendarClock className="size-3.5" />
                              {fmtDateTime(l.followUpAt)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={stageOf(l)} />
                        </TableCell>
                        <TableCell className="pr-5 text-right">
                          <ArrowUpRight className="ml-auto size-4 text-muted-foreground" />
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>

      <LeadSheet leadId={openId} onClose={() => setParams({})} />
    </>
  )
}
