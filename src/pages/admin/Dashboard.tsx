import {
  ArrowRight,
  Boxes,
  Building2,
  Check,
  CircleCheckBig,
  FolderTree,
  Inbox,
  Package,
  ShoppingBag,
  Timer,
  UserPlus,
  X,
} from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import { ChartCard, RankBars, TableCard } from "@/components/admin/ui"
import { ActivityTimeline } from "@/components/leads/LeadShared"
import { PageHeader, SmartImage, StatCard, StatusBadge } from "@/components/common/bits"
import { SupplierLogo } from "@/components/market/cards"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { analytics } from "@/data/content"
import { num, timeAgo } from "@/lib/format"
import { DEMO_ADMIN, useApp } from "@/store/app"

const activityConfig = {
  enquiries: { label: "Enquiries", color: "var(--chart-1)" },
  registrations: { label: "Registrations", color: "var(--chart-2)" },
  conversions: { label: "Conversions", color: "var(--chart-3)" },
}

export default function AdminDashboard() {
  const users = useApp((s) => s.users)
  const suppliers = useApp((s) => s.suppliers)
  const products = useApp((s) => s.products)
  const categories = useApp((s) => s.categories)
  const leads = useApp((s) => s.leads)
  const setSupplierStatus = useApp((s) => s.setSupplierStatus)
  const setSupplierVerified = useApp((s) => s.setSupplierVerified)
  const setProductStatus = useApp((s) => s.setProductStatus)

  const buyers = users.filter((u) => u.role === "Buyer").length
  const pendingSuppliers = suppliers.filter((s) => s.status === "pending")
  const pendingProducts = products.filter((p) => p.status === "pending")
  const active = leads.filter((l) => !["Won", "Lost"].includes(l.crmStage)).length
  const won = leads.filter((l) => l.crmStage === "Won").length
  const newLeads = leads.filter((l) => l.crmStage === "New").length
  const newRegs = users.filter((u) => u.joinedAt >= "2026-10-01").length

  const feed = leads
    .flatMap((l) => l.activity.map((a) => ({ ...a, text: `${l.id} · ${a.text}` })))
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 7)

  const topCategories = categories
    .map((c) => ({ name: c.name, leads: leads.filter((l) => l.categoryId === c.id).length }))
    .filter((c) => c.leads > 0)
    .sort((a, b) => b.leads - a.leads)
    .slice(0, 6)

  return (
    <>
      <PageHeader
        title={`Good afternoon, ${DEMO_ADMIN.name.split(" ")[0]}`}
        description="Here's what is happening across the marketplace today."
        actions={
          <>
            <Button variant="outline" asChild>
              <Link to="/admin/analytics">View reports</Link>
            </Button>
            <Button asChild>
              <Link to="/admin/crm">
                Open CRM <ArrowRight />
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard label="Total buyers" value={num(12480 + buyers)} delta="+8.2%" icon={ShoppingBag} />
        <StatCard label="Total suppliers" value={num(18400 + suppliers.length)} delta="+5.1%" icon={Building2} tone="saffron" />
        <StatCard label="Total products" value={num(214300 + products.length)} delta="+11%" icon={Package} tone="violet" />
        <StatCard label="Categories" value={categories.length} hint={`${categories.reduce((a, c) => a + c.subs.length, 0)} sub-categories`} icon={FolderTree} />
        <StatCard label="New registrations" value={num(744 + newRegs)} hint="This month" icon={UserPlus} tone="success" />
        <StatCard label="New enquiries" value={num(newLeads)} hint="Awaiting assignment" icon={Inbox} />
        <StatCard label="Active leads" value={num(active)} icon={Timer} tone="saffron" />
        <StatCard label="Converted leads" value={num(won)} delta={`${Math.round((won / leads.length) * 100)}%`} icon={CircleCheckBig} tone="success" />
        <div className="col-span-2 grid lg:col-span-1 xl:col-span-2">
          <StatCard
            label="Pending approvals"
            value={pendingSuppliers.length + pendingProducts.length}
            hint={`${pendingSuppliers.length} suppliers · ${pendingProducts.length} products`}
            icon={Boxes}
            tone="rose"
          />
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <ChartCard title="Marketplace activity" description="Enquiries, registrations and conversions — last 6 months">
          <ChartContainer config={activityConfig} className="h-72 w-full">
            <AreaChart data={analytics.monthly} margin={{ left: -16, right: 8 }}>
              <defs>
                {Object.keys(activityConfig).map((k) => (
                  <linearGradient key={k} id={`fill-${k}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={`var(--color-${k})`} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={`var(--color-${k})`} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              {Object.keys(activityConfig).map((k) => (
                <Area key={k} dataKey={k} type="monotone" stroke={`var(--color-${k})`} fill={`url(#fill-${k})`} strokeWidth={2} />
              ))}
            </AreaChart>
          </ChartContainer>
        </ChartCard>
        <ChartCard title="Top categories by enquiries" description="Current lead pool">
          <RankBars data={topCategories} labelKey="name" valueKey="leads" height={280} />
        </ChartCard>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <TableCard
          title="Pending approvals"
          description="Review KYC and listings before they go live"
          actions={
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/suppliers">View all</Link>
            </Button>
          }
        >
          <div className="divide-y">
            {pendingSuppliers.length + pendingProducts.length === 0 && (
              <p className="px-4 py-10 text-center text-sm text-muted-foreground">Nothing waiting — all caught up. 🎉</p>
            )}
            {pendingSuppliers.map((s) => (
              <div key={s.id} className="flex items-center gap-3 px-4 py-3">
                <SupplierLogo supplier={s} className="size-9 text-xs" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{s.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Supplier · {s.businessType} · {s.city} · joined {timeAgo(s.joinedAt)}
                  </p>
                </div>
                <ApproveReject
                  onApprove={() => {
                    setSupplierStatus(s.id, "active")
                    setSupplierVerified(s.id, true)
                    toast.success(`${s.name} approved & verified`)
                  }}
                  onReject={() => {
                    setSupplierStatus(s.id, "rejected")
                    toast.error(`${s.name} rejected`)
                  }}
                />
              </div>
            ))}
            {pendingProducts.map((p) => (
              <div key={p.id} className="flex items-center gap-3 px-4 py-3">
                <SmartImage src={p.images[0]} alt="" className="size-9 shrink-0 rounded-lg" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{p.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    Product · {suppliers.find((s) => s.id === p.supplierId)?.name}
                  </p>
                </div>
                <ApproveReject
                  onApprove={() => {
                    setProductStatus(p.id, "active")
                    toast.success("Product approved and live")
                  }}
                  onReject={() => {
                    setProductStatus(p.id, "rejected")
                    toast.error("Product rejected")
                  }}
                />
              </div>
            ))}
          </div>
        </TableCard>

        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
          </CardHeader>
          <div className="px-6 pb-2">
            <ActivityTimeline activity={feed} />
          </div>
        </Card>
      </div>

      <TableCard
        className="mt-6"
        title="Recent enquiries"
        actions={
          <Button variant="ghost" size="sm" asChild>
            <Link to="/admin/crm">Go to CRM</Link>
          </Button>
        }
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Enquiry</TableHead>
              <TableHead>Buyer</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Assigned</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="pr-4 text-right">Received</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...leads]
              .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
              .slice(0, 6)
              .map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="max-w-64 pl-4">
                    <div className="truncate font-medium">{l.title}</div>
                    <div className="text-xs text-muted-foreground">{l.id}</div>
                  </TableCell>
                  <TableCell>
                    <div>{l.buyer.company}</div>
                    <div className="text-xs text-muted-foreground">{l.buyer.city}</div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {num(l.quantity)} {l.unit}
                  </TableCell>
                  <TableCell>{l.source}</TableCell>
                  <TableCell>{l.assignedTo ?? <span className="text-muted-foreground">Unassigned</span>}</TableCell>
                  <TableCell>
                    <StatusBadge status={l.crmStage} />
                  </TableCell>
                  <TableCell className="whitespace-nowrap pr-4 text-right text-muted-foreground">{timeAgo(l.createdAt)}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableCard>
    </>
  )
}

function ApproveReject({ onApprove, onReject }: { onApprove: () => void; onReject: () => void }) {
  return (
    <div className="flex shrink-0 gap-1.5">
      <Button size="icon-sm" variant="outline" aria-label="Reject" onClick={onReject}>
        <X className="text-destructive" />
      </Button>
      <Button size="sm" onClick={onApprove}>
        <Check /> Approve
      </Button>
    </div>
  )
}
