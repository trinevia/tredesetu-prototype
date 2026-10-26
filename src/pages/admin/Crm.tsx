import { CalendarClock, CircleCheckBig, CircleX, Globe2, Inbox, KanbanSquare, List, Percent, Timer, Users } from "lucide-react"
import { useMemo, useState } from "react"
import { Pie, PieChart, Cell } from "recharts"
import { CreateLeadDialog } from "@/components/admin/CreateLeadDialog"
import { crmStages, LeadSheet } from "@/components/admin/LeadSheet"
import { ChartCard, countBy, FilterSelect, RankBars, SearchInput, TableCard } from "@/components/admin/ui"
import { EmptyState, PageHeader, StatCard, StatusBadge } from "@/components/common/bits"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { crmUsers } from "@/data/leads"
import { fmtDateTime, inrCompact, num, timeAgo } from "@/lib/format"
import { cn } from "@/lib/utils"
import { useApp } from "@/store/app"
import type { Lead, LeadSource } from "@/types"

const sourceList: LeadSource[] = ["Product Page", "Post Requirement", "Supplier Profile", "WhatsApp", "BRICS Desk", "Phone Call"]
const pieColors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)", "var(--muted-foreground)"]

export default function AdminCrm() {
  const leads = useApp((s) => s.leads)
  const suppliers = useApp((s) => s.suppliers)
  const categories = useApp((s) => s.categories)

  const [view, setView] = useState<"table" | "pipeline">("table")
  const [q, setQ] = useState("")
  const [stage, setStage] = useState("all")
  const [assignee, setAssignee] = useState("all")
  const [source, setSource] = useState("all")
  const [category, setCategory] = useState("all")
  const [priority, setPriority] = useState("all")
  const [scope, setScope] = useState("all")
  const [openId, setOpenId] = useState<string | null>(null)

  const filtered = useMemo(
    () =>
      leads
        .filter((l) => {
          const text = `${l.id} ${l.title} ${l.buyer.name} ${l.buyer.company} ${l.buyer.city}`.toLowerCase()
          return (
            (!q || text.includes(q.toLowerCase())) &&
            (stage === "all" || l.crmStage === stage) &&
            (assignee === "all" || (assignee === "unassigned" ? !l.assignedTo : l.assignedTo === assignee)) &&
            (source === "all" || l.source === source) &&
            (category === "all" || l.categoryId === category) &&
            (priority === "all" || l.priority === priority) &&
            (scope === "all" || (scope === "intl" ? !!l.international : !l.international))
          )
        })
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [leads, q, stage, assignee, source, category, priority, scope],
  )

  const open = leads.filter((l) => !["Won", "Lost"].includes(l.crmStage)).length
  const won = leads.filter((l) => l.crmStage === "Won").length
  const lost = leads.filter((l) => l.crmStage === "Lost").length
  const followUps = leads.filter((l) => l.followUpAt && !["Won", "Lost"].includes(l.crmStage)).length
  const conversion = won + lost ? Math.round((won / (won + lost)) * 100) : 0

  const supplierWise = countBy(
    leads.flatMap((l) => l.supplierIds),
    (id) => suppliers.find((s) => s.id === id)?.name ?? id,
  ).slice(0, 6)
  const categoryWise = countBy(leads, (l) => categories.find((c) => c.id === l.categoryId)?.name ?? l.categoryId).slice(0, 6)
  const locationWise = countBy(leads, (l) => l.buyer.city.split(",")[0]).slice(0, 6)
  const sourceWise = countBy(leads, (l) => l.source, "source", "leads")
  const sourceConfig = Object.fromEntries(sourceWise.map((s, i) => [s.source, { label: s.source, color: pieColors[i] }]))

  const hasFilters = q || [stage, assignee, source, category, priority, scope].some((v) => v !== "all")
  const reset = () => {
    setQ("")
    setStage("all")
    setAssignee("all")
    setSource("all")
    setCategory("all")
    setPriority("all")
    setScope("all")
  }

  return (
    <>
      <PageHeader
        title="Leads CRM"
        description="Every enquiry from requirement to conversion — assign, follow up and close."
        actions={<CreateLeadDialog onCreated={setOpenId} />}
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
        <StatCard label="Total leads" value={num(leads.length)} icon={Users} />
        <StatCard label="New" value={leads.filter((l) => l.crmStage === "New").length} icon={Inbox} tone="violet" />
        <StatCard label="Open" value={open} icon={Timer} tone="saffron" />
        <StatCard label="Follow-ups due" value={followUps} icon={CalendarClock} tone="rose" />
        <StatCard label="Won" value={won} icon={CircleCheckBig} tone="success" />
        <StatCard label="Lost" value={lost} icon={CircleX} />
        <StatCard label="Conversion" value={`${conversion}%`} hint="Won ÷ closed" icon={Percent} tone="success" />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <ChartCard title="Supplier-wise">
          <RankBars data={supplierWise} labelKey="name" valueKey="leads" height={230} />
        </ChartCard>
        <ChartCard title="Category-wise">
          <RankBars data={categoryWise} labelKey="name" valueKey="leads" color="var(--chart-2)" height={230} />
        </ChartCard>
        <ChartCard title="Location-wise">
          <RankBars data={locationWise} labelKey="name" valueKey="leads" color="var(--chart-3)" height={230} />
        </ChartCard>
        <ChartCard title="Lead source">
          <ChartContainer config={sourceConfig} className="mx-auto h-[230px] w-full">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent nameKey="source" hideLabel />} />
              <Pie data={sourceWise} dataKey="leads" nameKey="source" innerRadius={60} outerRadius={95} paddingAngle={2}>
                {sourceWise.map((s, i) => (
                  <Cell key={s.source} fill={pieColors[i]} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          <div className="flex flex-wrap gap-x-3 gap-y-1 pb-1 text-[11px] text-muted-foreground">
            {sourceWise.map((s, i) => (
              <span key={s.source} className="inline-flex items-center gap-1">
                <span className="size-2 rounded-full" style={{ background: pieColors[i] }} />
                {s.source} ({s.leads})
              </span>
            ))}
          </div>
        </ChartCard>
      </div>

      <TableCard
        className="mt-6"
        title={`${filtered.length} lead${filtered.length === 1 ? "" : "s"}`}
        description="Lead flow: New → Assigned → Contacted → Qualified → Quotation → Negotiation → Won / Lost"
        actions={
          <ToggleGroup type="single" variant="outline" size="sm" value={view} onValueChange={(v) => v && setView(v as typeof view)}>
            <ToggleGroupItem value="table" aria-label="Table view">
              <List /> Table
            </ToggleGroupItem>
            <ToggleGroupItem value="pipeline" aria-label="Pipeline view">
              <KanbanSquare /> Pipeline
            </ToggleGroupItem>
          </ToggleGroup>
        }
        toolbar={
          <>
            <SearchInput value={q} onChange={setQ} placeholder="Search buyer, ID, requirement…" />
            {view === "table" && (
              <FilterSelect value={stage} onChange={setStage} placeholder="All stages" options={crmStages.map((s) => ({ value: s, label: s }))} />
            )}
            <FilterSelect
              value={assignee}
              onChange={setAssignee}
              placeholder="All owners"
              options={[{ value: "unassigned", label: "Unassigned" }, ...crmUsers.map((u) => ({ value: u, label: u }))]}
            />
            <FilterSelect value={source} onChange={setSource} placeholder="All sources" options={sourceList.map((s) => ({ value: s, label: s }))} />
            <FilterSelect value={category} onChange={setCategory} placeholder="All categories" options={categories.map((c) => ({ value: c.id, label: c.name }))} />
            <FilterSelect
              value={priority}
              onChange={setPriority}
              placeholder="Any priority"
              options={["High", "Medium", "Low"].map((p) => ({ value: p, label: p }))}
            />
            <FilterSelect
              value={scope}
              onChange={setScope}
              placeholder="Domestic + BRICS"
              options={[
                { value: "domestic", label: "Domestic only" },
                { value: "intl", label: "BRICS / International" },
              ]}
            />
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={reset}>
                Clear
              </Button>
            )}
          </>
        }
      >
        {filtered.length === 0 ? (
          <EmptyState icon={Inbox} title="No leads match these filters" body="Try clearing a filter or searching another term." className="m-4" action={<Button variant="outline" onClick={reset}>Clear filters</Button>} />
        ) : view === "table" ? (
          <LeadTable leads={filtered} onOpen={setOpenId} />
        ) : (
          <Pipeline leads={filtered} onOpen={setOpenId} />
        )}
      </TableCard>

      <LeadSheet leadId={openId} onOpenChange={(o) => !o && setOpenId(null)} />
    </>
  )
}

function LeadTable({ leads, onOpen }: { leads: Lead[]; onOpen: (id: string) => void }) {
  const categories = useApp((s) => s.categories)
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="pl-4">Lead</TableHead>
          <TableHead>Buyer</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Qty / Budget</TableHead>
          <TableHead>Source</TableHead>
          <TableHead>Owner</TableHead>
          <TableHead>Follow-up</TableHead>
          <TableHead className="pr-4">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {leads.map((l) => (
          <TableRow key={l.id} className="cursor-pointer" onClick={() => onOpen(l.id)}>
            <TableCell className="max-w-72 pl-4">
              <div className="flex items-center gap-1.5">
                {l.priority === "High" && <span className="size-1.5 shrink-0 rounded-full bg-rose-500" title="High priority" />}
                <span className="truncate font-medium">{l.title}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                {l.id} · {timeAgo(l.createdAt)}
                {l.international && (
                  <Badge variant="outline" className="h-4 border-primary/30 px-1.5 text-[10px] text-primary">
                    <Globe2 /> {l.international.country}
                  </Badge>
                )}
              </div>
            </TableCell>
            <TableCell>
              <div className="whitespace-nowrap">{l.buyer.name}</div>
              <div className="max-w-44 truncate text-xs text-muted-foreground">
                {l.buyer.company} · {l.buyer.city}
              </div>
            </TableCell>
            <TableCell className="whitespace-nowrap text-xs">{categories.find((c) => c.id === l.categoryId)?.name}</TableCell>
            <TableCell className="whitespace-nowrap">
              {num(l.quantity)} {l.unit}
              <div className="text-xs text-muted-foreground">{l.budget ? inrCompact(l.budget) : "—"}</div>
            </TableCell>
            <TableCell className="whitespace-nowrap text-xs">{l.source}</TableCell>
            <TableCell className="whitespace-nowrap">{l.assignedTo ?? <span className="text-xs text-amber-700">Unassigned</span>}</TableCell>
            <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{l.followUpAt ? fmtDateTime(l.followUpAt) : "—"}</TableCell>
            <TableCell className="pr-4">
              <StatusBadge status={l.crmStage} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function Pipeline({ leads, onOpen }: { leads: Lead[]; onOpen: (id: string) => void }) {
  const setCrmStage = useApp((s) => s.setCrmStage)
  const [dragId, setDragId] = useState<string | null>(null)
  const [over, setOver] = useState<string | null>(null)
  return (
    <div className="flex gap-3 overflow-x-auto p-4">
      {crmStages.map((stage) => {
        const items = leads.filter((l) => l.crmStage === stage)
        const value = items.reduce((a, l) => a + (l.budget ?? 0), 0)
        return (
          <div
            key={stage}
            onDragOver={(e) => {
              e.preventDefault()
              setOver(stage)
            }}
            onDragLeave={() => setOver(null)}
            onDrop={() => {
              if (dragId) setCrmStage(dragId, stage, "Ananya Rao")
              setDragId(null)
              setOver(null)
            }}
            className={cn("flex w-64 shrink-0 flex-col rounded-xl bg-muted/50 p-2 transition", over === stage && "bg-primary/10 ring-2 ring-primary/30")}
          >
            <div className="flex items-center justify-between px-1.5 py-1">
              <StatusBadge status={stage} />
              <span className="text-xs text-muted-foreground">
                {items.length}
                {value > 0 && ` · ${inrCompact(value)}`}
              </span>
            </div>
            <div className="mt-2 flex min-h-24 flex-col gap-2">
              {items.map((l) => (
                <Card
                  key={l.id}
                  draggable
                  onDragStart={() => setDragId(l.id)}
                  onClick={() => onOpen(l.id)}
                  className="cursor-grab gap-1.5 p-3 transition hover:shadow-md active:cursor-grabbing"
                >
                  <p className="line-clamp-2 text-sm font-medium leading-snug">{l.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {l.buyer.company} · {l.buyer.city.split(",")[0]}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{l.assignedTo ?? "Unassigned"}</span>
                    <span>{timeAgo(l.createdAt)}</span>
                  </div>
                  {(l.priority === "High" || l.international) && (
                    <div className="flex gap-1">
                      {l.priority === "High" && <Badge className="h-4 bg-rose-50 px-1.5 text-[10px] text-rose-700">High</Badge>}
                      {l.international && <Badge className="h-4 bg-primary/10 px-1.5 text-[10px] text-primary">{l.international.country}</Badge>}
                    </div>
                  )}
                </Card>
              ))}
              {items.length === 0 && <p className="rounded-lg border border-dashed px-2 py-6 text-center text-xs text-muted-foreground">Drop leads here</p>}
            </div>
          </div>
        )
      })}
    </div>
  )
}
