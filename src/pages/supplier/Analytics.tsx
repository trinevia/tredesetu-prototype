import { Eye, Inbox, Percent, Store } from "lucide-react"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from "recharts"
import { PageHeader, SmartImage, StatCard } from "@/components/common/bits"
import { stageOf, useSupplierLeads, useSupplierProducts } from "@/components/supplier/useSupplierData"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { analytics } from "@/data/content"
import { subName } from "@/data/categories"
import { num } from "@/lib/format"
import { DEMO_SUPPLIER_ID, useSupplier } from "@/store/app"

const trendConfig = {
  views: { label: "Views", color: "var(--chart-1)" },
  enquiries: { label: "Enquiries", color: "var(--chart-2)" },
} satisfies ChartConfig

const categoryConfig = {
  views: { label: "Views", color: "var(--chart-1)" },
  enquiries: { label: "Enquiries", color: "var(--chart-3)" },
} satisfies ChartConfig

const pieColors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)", "var(--muted-foreground)"]

export default function SupplierAnalytics() {
  const supplier = useSupplier(DEMO_SUPPLIER_ID)
  const leads = useSupplierLeads()
  const products = useSupplierProducts()

  // Six-month trend for this supplier, scaled from marketplace totals.
  const trend = analytics.monthly.map((m) => ({ month: m.month, views: Math.round(m.enquiries * 1.9), enquiries: Math.round(m.enquiries / 18) }))
  const totalViews = products.reduce((s, p) => s + p.views, 0)
  const won = leads.filter((l) => stageOf(l) === "Won").length
  const conversion = leads.length ? Math.round((won / leads.length) * 100) : 0

  const bySource = Object.entries(
    leads.reduce<Record<string, number>>((acc, l) => ({ ...acc, [l.source]: (acc[l.source] ?? 0) + 1 }), {}),
  ).map(([source, value]) => ({ source, value }))
  const sourceConfig = Object.fromEntries(bySource.map((s, i) => [s.source, { label: s.source, color: pieColors[i % pieColors.length] }])) satisfies ChartConfig

  const reached = (stages: string[]) => leads.filter((l) => stages.includes(stageOf(l))).length
  const funnel = [
    { label: "Enquiries received", value: leads.length },
    { label: "Contacted", value: leads.length - reached(["New"]) },
    { label: "Quotation sent", value: reached(["Quotation Sent", "Negotiation", "Won", "Follow-up Required"]) },
    { label: "Negotiation", value: reached(["Negotiation", "Won"]) },
    { label: "Won", value: won },
  ]

  const byCategory = Object.values(
    products.reduce<Record<string, { name: string; views: number; enquiries: number }>>((acc, p) => {
      const name = subName(p.categoryId, p.subId) || p.subId
      acc[name] ??= { name, views: 0, enquiries: 0 }
      acc[name].views += p.views
      acc[name].enquiries += p.enquiries
      return acc
    }, {}),
  )

  return (
    <>
      <PageHeader title="Performance" description="How buyers discover and engage with your catalogue (last 6 months)." />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Product views" value={num(totalViews)} icon={Eye} delta="+24%" />
        <StatCard label="Profile views" value={num(supplier?.profileViews ?? 0)} icon={Store} tone="violet" delta="+11%" />
        <StatCard label="Enquiries" value={leads.length} icon={Inbox} tone="saffron" hint="All sources" />
        <StatCard label="Lead conversion" value={`${conversion}%`} icon={Percent} tone="success" hint={`${won} won of ${leads.length}`} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Views & enquiries trend</CardTitle>
            <CardDescription>Monthly, May – Oct 2026</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={trendConfig} className="aspect-auto h-64 w-full">
              <AreaChart data={trend} margin={{ left: 0, right: 8 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis yAxisId="v" hide />
                <YAxis yAxisId="e" hide orientation="right" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Area yAxisId="v" dataKey="views" type="monotone" stroke="var(--color-views)" fill="var(--color-views)" fillOpacity={0.12} strokeWidth={2} />
                <Area yAxisId="e" dataKey="enquiries" type="monotone" stroke="var(--color-enquiries)" fill="var(--color-enquiries)" fillOpacity={0.2} strokeWidth={2} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Lead sources</CardTitle>
            <CardDescription>Where your enquiries come from</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={sourceConfig} className="mx-auto aspect-square h-52">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent nameKey="source" hideLabel />} />
                <Pie data={bySource} dataKey="value" nameKey="source" innerRadius={50} strokeWidth={3}>
                  {bySource.map((s, i) => (
                    <Cell key={s.source} fill={pieColors[i % pieColors.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <ul className="mt-2 space-y-1.5 text-sm">
              {bySource.map((s, i) => (
                <li key={s.source} className="flex items-center gap-2">
                  <span className="size-2.5 rounded-sm" style={{ background: pieColors[i % pieColors.length] }} />
                  <span className="flex-1">{s.source}</span>
                  <span className="font-medium">{s.value}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Conversion funnel</CardTitle>
            <CardDescription>From enquiry to won deal</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {funnel.map((f) => {
              const pct = leads.length ? Math.round((f.value / leads.length) * 100) : 0
              return (
                <div key={f.label}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>{f.label}</span>
                    <span className="font-medium">
                      {f.value} <span className="text-xs text-muted-foreground">({pct}%)</span>
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.max(pct, 2)}%` }} />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Category performance</CardTitle>
            <CardDescription>Views and enquiries by sub-category</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={categoryConfig} className="aspect-auto h-60 w-full">
              <BarChart data={byCategory} layout="vertical" margin={{ left: 8, right: 8 }}>
                <CartesianGrid horizontal={false} />
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} width={120} tick={{ fontSize: 11 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="views" fill="var(--color-views)" radius={4} />
                <Bar dataKey="enquiries" fill="var(--color-enquiries)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 p-0">
        <CardHeader className="pt-4">
          <CardTitle>Product performance</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Product</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Enquiries</TableHead>
                <TableHead className="pr-4">Enquiry rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...products]
                .sort((a, b) => b.enquiries - a.enquiries)
                .map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="pl-4">
                      <div className="flex min-w-56 items-center gap-3">
                        <SmartImage src={p.images[0]} alt="" className="size-9 rounded-md" />
                        <span className="line-clamp-1">{p.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{num(p.views)}</TableCell>
                    <TableCell>{p.enquiries}</TableCell>
                    <TableCell className="pr-4">{p.views ? ((p.enquiries / p.views) * 100).toFixed(1) : "0.0"}%</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </>
  )
}
