import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Circle,
  Clock3,
  Eye,
  Inbox,
  Package,
  PackageCheck,
  PhoneCall,
  Plus,
  Sparkles,
  Trophy,
} from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { Link } from "react-router-dom"
import { PageHeader, SmartImage, StatCard, StatusBadge } from "@/components/common/bits"
import { isDueSoon, isOverdue, profileChecklist, stageOf, useSupplierLeads, useSupplierProducts } from "@/components/supplier/useSupplierData"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Progress } from "@/components/ui/progress"
import { analytics } from "@/data/content"
import { fmtDateTime, num, timeAgo } from "@/lib/format"
import { DEMO_SUPPLIER_ID, useSupplier } from "@/store/app"

const chartConfig = {
  views: { label: "Profile & product views", color: "var(--chart-1)" },
  enquiries: { label: "Enquiries", color: "var(--chart-2)" },
} satisfies ChartConfig

export default function SupplierDashboard() {
  const supplier = useSupplier(DEMO_SUPPLIER_ID)
  const leads = useSupplierLeads()
  const products = useSupplierProducts()
  if (!supplier) return null

  const count = (...stages: string[]) => leads.filter((l) => stages.includes(stageOf(l))).length
  const checklist = profileChecklist(supplier)
  const completion = Math.round((checklist.filter((c) => c.done).length / checklist.length) * 100)
  const top = [...products].sort((a, b) => b.enquiries - a.enquiries).slice(0, 4)
  const due = leads
    .filter((l) => isDueSoon(l.followUpAt) && !["Won", "Lost"].includes(stageOf(l)))
    .sort((a, b) => +new Date(a.followUpAt!) - +new Date(b.followUpAt!))

  return (
    <>
      <PageHeader
        title="Welcome back, Arjun"
        description={`${supplier.name} · ${supplier.responseRate}% response rate · ${supplier.responseTime.toLowerCase()}`}
        actions={
          <>
            <Button variant="outline" asChild>
              <Link to="/supplier/leads">
                <Inbox /> View leads
              </Link>
            </Button>
            <Button asChild>
              <Link to="/supplier/products/new">
                <Plus /> Add product
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total products" value={products.length} icon={Package} hint={`${products.filter((p) => p.status === "active").length} active · ${products.filter((p) => p.status === "pending").length} pending approval`} />
        <StatCard label="Total enquiries" value={leads.length} icon={Inbox} tone="saffron" delta="+18%" hint="This month vs last" />
        <StatCard label="New leads" value={count("New")} icon={Sparkles} tone="violet" hint={`${count("Contacted", "In Discussion")} contacted / in discussion`} />
        <StatCard label="Converted" value={count("Won")} icon={Trophy} tone="success" hint={`${count("Follow-up Required", "Negotiation", "Quotation Sent")} need follow-up`} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Active products", value: products.filter((p) => p.status === "active").length, icon: PackageCheck },
          { label: "Pending products", value: products.filter((p) => p.status === "pending").length, icon: Clock3 },
          { label: "Contacted leads", value: count("Contacted", "In Discussion"), icon: PhoneCall },
          { label: "Follow-up leads", value: count("Follow-up Required", "Quotation Sent", "Negotiation"), icon: CalendarClock },
        ].map((m) => (
          <div key={m.label} className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3">
            <m.icon className="size-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{m.label}</span>
            <span className="ml-auto font-semibold">{m.value}</span>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent enquiries</CardTitle>
              <CardDescription>Respond within 2 hrs to keep your “Quick responder” badge</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/supplier/leads">
                All leads <ArrowRight />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y">
              {leads.slice(0, 6).map((l) => (
                <li key={l.id}>
                  <Link to={`/supplier/leads?lead=${l.id}`} className="flex items-center gap-3 px-4 py-3 transition hover:bg-muted/50">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {l.buyer.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{l.title}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {l.buyer.company} · {l.buyer.city} · {num(l.quantity)} {l.unit}
                      </p>
                    </div>
                    <span className="hidden text-xs text-muted-foreground sm:block">{timeAgo(l.createdAt)}</span>
                    <StatusBadge status={stageOf(l)} />
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profile completion</CardTitle>
            <CardDescription>Complete profiles get up to 3× more enquiries</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="mb-2 flex items-end justify-between">
                <span className="text-3xl font-semibold">{completion}%</span>
                <span className="text-xs text-muted-foreground">
                  {checklist.filter((c) => c.done).length}/{checklist.length} done
                </span>
              </div>
              <Progress value={completion} />
            </div>
            <ul className="space-y-2 text-sm">
              {checklist.map((c) => (
                <li key={c.label} className="flex items-center gap-2">
                  {c.done ? <CheckCircle2 className="size-4 text-success" /> : <Circle className="size-4 text-muted-foreground" />}
                  <span className={c.done ? "text-muted-foreground line-through decoration-muted-foreground/40" : ""}>{c.label}</span>
                </li>
              ))}
            </ul>
            <Button variant="outline" className="w-full" asChild>
              <Link to="/supplier/profile">Complete profile</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Product performance</CardTitle>
            <CardDescription>Views and enquiries over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <ChartContainer config={chartConfig} className="aspect-auto h-56 w-full">
              <AreaChart data={analytics.supplierViews} margin={{ left: 4, right: 4 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area dataKey="views" type="monotone" fill="var(--color-views)" fillOpacity={0.15} stroke="var(--color-views)" strokeWidth={2} />
                <Area dataKey="enquiries" type="monotone" fill="var(--color-enquiries)" fillOpacity={0.25} stroke="var(--color-enquiries)" strokeWidth={2} />
              </AreaChart>
            </ChartContainer>
            <div className="grid gap-2 sm:grid-cols-2">
              {top.map((p) => (
                <Link key={p.id} to={`/product/${p.id}`} className="flex items-center gap-3 rounded-lg border p-2 transition hover:bg-muted/50">
                  <SmartImage src={p.images[0]} alt="" className="size-12 rounded-md" />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-sm font-medium">{p.name}</p>
                    <p className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Eye className="size-3" /> {num(p.views)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Inbox className="size-3" /> {p.enquiries}
                      </span>
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarClock className="size-4 text-saffron" /> Upcoming follow-ups
            </CardTitle>
            <CardDescription>Overdue and next 7 days</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {due.length === 0 && <p className="text-sm text-muted-foreground">No follow-ups due. 🎉</p>}
            {due.map((l) => (
              <Link key={l.id} to={`/supplier/leads?lead=${l.id}`} className="block rounded-lg border p-3 transition hover:border-primary/40">
                <p className="line-clamp-1 text-sm font-medium">{l.buyer.company}</p>
                <p className="line-clamp-1 text-xs text-muted-foreground">{l.title}</p>
                <p className={`mt-1 text-xs font-medium ${isOverdue(l.followUpAt) ? "text-rose-600" : "text-amber-700"}`}>
                  {isOverdue(l.followUpAt) ? "Overdue · " : ""}
                  {fmtDateTime(l.followUpAt!)}
                </p>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
