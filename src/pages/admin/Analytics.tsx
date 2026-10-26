import { BarChart3, CircleCheck, CircleDashed, Download, Eye, Globe, Inbox, Package, Percent, Search, UserPlus } from "lucide-react"
import { useState } from "react"
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { toast } from "sonner"
import { ChartCard, FilterSelect, RankBars, TableCard } from "@/components/admin/ui"
import { PageHeader, SimulatedNote, StatCard } from "@/components/common/bits"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { analytics } from "@/data/content"
import { num } from "@/lib/format"
import { useApp } from "@/store/app"

const regConfig = {
  registrations: { label: "Registrations", color: "var(--chart-1)" },
  enquiries: { label: "Enquiries", color: "var(--chart-2)" },
}
const convConfig = { conversions: { label: "Conversions", color: "var(--chart-3)" }, enquiries: { label: "Enquiries", color: "var(--chart-1)" } }
const viewsConfig = { views: { label: "Profile & product views", color: "var(--chart-1)" }, enquiries: { label: "Enquiries", color: "var(--chart-2)" } }

const seo = [
  { item: "SEO-friendly URLs (/product/:slug, /suppliers/:city)", done: true },
  { item: "Dynamic meta titles & descriptions", done: true },
  { item: "Canonical URLs on filtered listing pages", done: true },
  { item: "XML sitemap (products, categories, suppliers, cities)", done: false },
  { item: "robots.txt", done: false },
  { item: "Structured data — Product, Organization, BreadcrumbList", done: false },
  { item: "Indexable category & city landing pages", done: true },
]

function csvEscape(v: unknown) {
  const s = String(v ?? "")
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export default function AdminAnalytics() {
  const leads = useApp((s) => s.leads)
  const products = useApp((s) => s.products)
  const suppliers = useApp((s) => s.suppliers)
  const categories = useApp((s) => s.categories)
  const [range, setRange] = useState("6m")

  const categoryPerf = categories
    .map((c) => {
      const ps = products.filter((p) => p.categoryId === c.id)
      return {
        name: c.name,
        listings: ps.length,
        views: ps.reduce((a, p) => a + p.views, 0),
        enquiries: ps.reduce((a, p) => a + p.enquiries, 0),
      }
    })
    .sort((a, b) => b.enquiries - a.enquiries)

  const supplierActivity = suppliers
    .filter((s) => s.status === "active")
    .map((s) => {
      const ls = leads.filter((l) => l.supplierIds.includes(s.id))
      const won = ls.filter((l) => l.supplierStage[s.id] === "Won").length
      return {
        s,
        listings: products.filter((p) => p.supplierId === s.id).length,
        leads: ls.length,
        quotes: ls.filter((l) => l.quotes.some((q) => q.supplierId === s.id)).length,
        won,
      }
    })
    .sort((a, b) => b.leads - a.leads || b.s.profileViews - a.s.profileViews)

  const exportCsv = () => {
    const header = ["Lead ID", "Title", "Buyer", "Company", "City", "Category", "Quantity", "Unit", "Budget", "Source", "CRM stage", "Assigned to", "Created"]
    const rows = leads.map((l) => [
      l.id,
      l.title,
      l.buyer.name,
      l.buyer.company,
      l.buyer.city,
      categories.find((c) => c.id === l.categoryId)?.name,
      l.quantity,
      l.unit,
      l.budget ?? "",
      l.source,
      l.crmStage,
      l.assignedTo ?? "",
      l.createdAt,
    ])
    const csv = [header, ...rows].map((r) => r.map(csvEscape).join(",")).join("\n")
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }))
    const a = document.createElement("a")
    a.href = url
    a.download = `tradesetu-leads-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`Exported ${leads.length} leads to CSV`)
  }

  const won = leads.filter((l) => l.crmStage === "Won").length
  const totalViews = products.reduce((a, p) => a + p.views, 0) + suppliers.reduce((a, s) => a + s.profileViews, 0)

  return (
    <>
      <PageHeader
        title="Analytics & reports"
        description="Registrations, listings, enquiries, lead sources and conversion — operational reporting for the marketplace."
        actions={
          <>
            <FilterSelect
              value={range}
              onChange={setRange}
              placeholder="All time"
              options={[
                { value: "7d", label: "Last 7 days" },
                { value: "30d", label: "Last 30 days" },
                { value: "6m", label: "Last 6 months" },
              ]}
            />
            <Button variant="outline" onClick={exportCsv}>
              <Download /> Export leads CSV
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard label="Registrations" value={num(analytics.monthly.reduce((a, m) => a + m.registrations, 0))} delta="+22%" icon={UserPlus} />
        <StatCard label="Product listings" value={num(214300 + products.length)} delta="+11%" icon={Package} tone="violet" />
        <StatCard label="Enquiries" value={num(analytics.monthly.reduce((a, m) => a + m.enquiries, 0))} delta="+23%" icon={Inbox} tone="saffron" />
        <StatCard label="Profile & product views" value={num(totalViews)} icon={Eye} />
        <StatCard label="Lead conversion" value={`${Math.round((won / leads.length) * 100)}%`} hint="Of all CRM leads" icon={Percent} tone="success" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <ChartCard title="Registrations vs enquiries" description="Monthly trend">
          <ChartContainer config={regConfig} className="h-64 w-full">
            <BarChart data={analytics.monthly} margin={{ left: -16 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="registrations" fill="var(--color-registrations)" radius={4} />
              <Bar dataKey="enquiries" fill="var(--color-enquiries)" radius={4} />
            </BarChart>
          </ChartContainer>
        </ChartCard>
        <ChartCard title="Lead conversion" description="Enquiries converted to orders">
          <ChartContainer config={convConfig} className="h-64 w-full">
            <LineChart data={analytics.monthly} margin={{ left: -16, right: 8 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Line dataKey="enquiries" stroke="var(--color-enquiries)" strokeWidth={2} dot={false} />
              <Line dataKey="conversions" stroke="var(--color-conversions)" strokeWidth={2.5} />
            </LineChart>
          </ChartContainer>
        </ChartCard>
        <ChartCard title="Lead sources" description="Where enquiries originate">
          <RankBars data={analytics.sources} labelKey="source" valueKey="leads" height={230} />
        </ChartCard>
        <ChartCard title="Views & enquiries this week" description="Product and supplier profile views">
          <ChartContainer config={viewsConfig} className="h-[230px] w-full">
            <BarChart data={analytics.supplierViews} margin={{ left: -16 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="day" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="views" fill="var(--color-views)" radius={4} />
              <Bar dataKey="enquiries" fill="var(--color-enquiries)" radius={4} />
            </BarChart>
          </ChartContainer>
        </ChartCard>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <TableCard title="Category performance">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Category</TableHead>
                <TableHead className="text-right">Listings</TableHead>
                <TableHead className="text-right">Views</TableHead>
                <TableHead className="text-right">Enquiries</TableHead>
                <TableHead className="pr-4 text-right">Enq. rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categoryPerf.map((c) => (
                <TableRow key={c.name}>
                  <TableCell className="pl-4 font-medium">{c.name}</TableCell>
                  <TableCell className="text-right">{c.listings}</TableCell>
                  <TableCell className="text-right">{num(c.views)}</TableCell>
                  <TableCell className="text-right">{num(c.enquiries)}</TableCell>
                  <TableCell className="pr-4 text-right">{c.views ? `${((c.enquiries / c.views) * 100).toFixed(1)}%` : "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableCard>
        <TableCard title="Supplier activity">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Supplier</TableHead>
                <TableHead className="text-right">Listings</TableHead>
                <TableHead className="text-right">Profile views</TableHead>
                <TableHead className="text-right">Leads</TableHead>
                <TableHead className="text-right">Quoted</TableHead>
                <TableHead className="pr-4 text-right">Won</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {supplierActivity.map((r) => (
                <TableRow key={r.s.id}>
                  <TableCell className="max-w-52 truncate pl-4 font-medium">{r.s.name}</TableCell>
                  <TableCell className="text-right">{r.listings}</TableCell>
                  <TableCell className="text-right">{num(r.s.profileViews)}</TableCell>
                  <TableCell className="text-right">{r.leads}</TableCell>
                  <TableCell className="text-right">{r.quotes}</TableCell>
                  <TableCell className="pr-4 text-right">{r.won}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableCard>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="gap-4 p-5">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
              <BarChart3 className="size-5" />
            </span>
            <div>
              <h3 className="font-semibold">Google Analytics & Search Console</h3>
              <p className="text-sm text-muted-foreground">Traffic, acquisition and search performance</p>
            </div>
          </div>
          {[
            { icon: Globe, name: "Google Analytics 4", detail: "Property G-TS2026XXXX · Ecommerce & lead events", connected: true },
            { icon: Search, name: "Google Search Console", detail: "tradesetu.in · sitemap pending submission", connected: false },
          ].map((i) => (
            <div key={i.name} className="flex items-center gap-3 rounded-lg border p-3">
              <i.icon className="size-5 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{i.name}</p>
                <p className="truncate text-xs text-muted-foreground">{i.detail}</p>
              </div>
              {i.connected ? (
                <Badge className="bg-success/12 text-success">Connected</Badge>
              ) : (
                <Button size="sm" variant="outline" onClick={() => toast("OAuth connection is simulated in this prototype")}>
                  Connect
                </Button>
              )}
            </div>
          ))}
          <SimulatedNote>Integrations are mocked. GA4 / Search Console are wired up during launch with the client's Google accounts.</SimulatedNote>
        </Card>
        <Card className="gap-4 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold">SEO foundation</h3>
              <p className="text-sm text-muted-foreground">Phase One technical SEO checklist</p>
            </div>
            <span className="text-sm font-semibold">
              {seo.filter((s) => s.done).length}/{seo.length}
            </span>
          </div>
          <Progress value={(seo.filter((s) => s.done).length / seo.length) * 100} />
          <ul className="space-y-2">
            {seo.map((s) => (
              <li key={s.item} className="flex items-start gap-2 text-sm">
                {s.done ? <CircleCheck className="mt-0.5 size-4 shrink-0 text-success" /> : <CircleDashed className="mt-0.5 size-4 shrink-0 text-muted-foreground" />}
                <span className={s.done ? "" : "text-muted-foreground"}>{s.item}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  )
}
