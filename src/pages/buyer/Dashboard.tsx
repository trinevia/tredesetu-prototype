import { ArrowRight, Building2, FileText, Heart, Inbox, MessageSquarePlus, Search, Sparkles } from "lucide-react"
import { Link } from "react-router-dom"
import { BuyerStatusBadge } from "@/components/buyer/BuyerStatusBadge"
import { buyerStatus, useBuyerLeads } from "@/components/buyer/useBuyer"
import { EmptyState, PageHeader, Rating, StatCard, TrustSeal, VerifiedBadge } from "@/components/common/bits"
import { SupplierLogo } from "@/components/market/cards"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { demoBuyer } from "@/data/leads"
import { inr, num, timeAgo } from "@/lib/format"
import { useApp } from "@/store/app"

export default function BuyerDashboard() {
  const leads = useBuyerLeads()
  const suppliers = useApp((s) => s.suppliers)
  const saved = useApp((s) => s.savedProductIds.length + s.savedSupplierIds.length)
  const open = leads.filter((l) => !["Won", "Lost"].includes(l.crmStage))
  const quotes = leads.flatMap((l) => l.quotes.map((q) => ({ q, l })))
  const awaiting = quotes.filter(({ q, l }) => q.status === "sent" && !["Won", "Lost"].includes(l.crmStage))
  const contacted = new Set(leads.flatMap((l) => l.supplierIds))
  const myCategories = new Set(leads.map((l) => l.categoryId))
  const recommended = suppliers
    .filter((s) => s.status === "active" && s.categoryIds.some((c) => myCategories.has(c)))
    .sort((a, b) => b.rating - a.rating || b.responseRate - a.responseRate)
    .slice(0, 4)
  const supplierName = (id: string) => suppliers.find((s) => s.id === id)?.name ?? "Supplier"

  return (
    <>
      <PageHeader
        title={`Good morning, ${demoBuyer.name.split(" ")[0]} 👋`}
        description={`${demoBuyer.company} · ${demoBuyer.city}`}
        actions={
          <>
            <Button variant="outline" asChild>
              <Link to="/products">
                <Search /> Search products
              </Link>
            </Button>
            <Button asChild className="bg-saffron text-saffron-foreground hover:bg-saffron/90">
              <Link to="/post-requirement">
                <MessageSquarePlus /> Post requirement
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Open enquiries" value={open.length} icon={Inbox} hint="Awaiting quotes or decision" />
        <StatCard label="Quotes received" value={quotes.length} icon={FileText} tone="saffron" hint={`${awaiting.length} awaiting your decision`} />
        <StatCard label="Saved items" value={saved} icon={Heart} tone="rose" hint="Products & suppliers" />
        <StatCard label="Contacted suppliers" value={contacted.size} icon={Building2} tone="success" hint="Across all enquiries" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent enquiries</CardTitle>
              <CardDescription>Track supplier responses in real time</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/buyer/enquiries">
                View all <ArrowRight />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {leads.length === 0 ? (
              <EmptyState
                icon={Inbox}
                title="No enquiries yet"
                body="Post your first requirement and get quotes from verified suppliers."
                className="mx-4 mb-4"
                action={
                  <Button asChild>
                    <Link to="/post-requirement">Post requirement</Link>
                  </Button>
                }
              />
            ) : (
              <ul className="divide-y">
                {leads.slice(0, 5).map((l) => (
                  <li key={l.id}>
                    <Link to={`/buyer/enquiries/${l.id}`} className="flex items-center gap-3 px-4 py-3 transition hover:bg-muted/50">
                      <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                        <FileText className="size-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{l.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {l.id} · {num(l.quantity)} {l.unit} · {timeAgo(l.createdAt)}
                        </p>
                      </div>
                      <div className="hidden text-right sm:block">
                        <p className="text-xs text-muted-foreground">{l.quotes.length} quote(s)</p>
                      </div>
                      <BuyerStatusBadge status={buyerStatus(l)} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Quotes awaiting decision
              {awaiting.length > 0 && (
                <span className="rounded-full bg-saffron/20 px-2 text-xs font-semibold text-amber-700">{awaiting.length}</span>
              )}
            </CardTitle>
            <CardDescription>Compare and accept the best offer</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {awaiting.length === 0 && <p className="text-sm text-muted-foreground">No pending quotations right now.</p>}
            {awaiting.slice(0, 3).map(({ q, l }) => (
              <Link key={q.id} to={`/buyer/enquiries/${l.id}`} className="block rounded-lg border p-3 transition hover:border-primary/40 hover:bg-primary/[0.02]">
                <p className="text-xs text-muted-foreground">{supplierName(q.supplierId)}</p>
                <p className="line-clamp-1 text-sm font-medium">{l.title}</p>
                <div className="mt-2 flex items-end justify-between">
                  <div>
                    <p className="text-lg font-semibold text-brand">{inr(q.pricePerUnit)}</p>
                    <p className="text-[11px] text-muted-foreground">per {l.unit} · total {inr(q.total)}</p>
                  </div>
                  <span className="text-xs font-medium text-primary">Review →</span>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="size-4 text-saffron" /> Top-rated suppliers for you
          </CardTitle>
          <CardDescription>Ranked by rating, response rate and verification in the categories you source</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {recommended.map((s) => (
            <Link key={s.id} to={`/suppliers/${s.id}`} className="flex flex-col gap-2 rounded-xl border p-4 transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-center gap-3">
                <SupplierLogo supplier={s} className="size-10" />
                <div className="min-w-0">
                  <p className="line-clamp-1 text-sm font-semibold">{s.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {s.city} · {s.businessType}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <Rating value={s.rating} count={s.reviews} />
                {s.verified && <VerifiedBadge />}
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{s.responseRate}% response · {s.responseTime.toLowerCase()}</span>
              </div>
              <TrustSeal seal={s.trustSeal} />
            </Link>
          ))}
        </CardContent>
      </Card>
    </>
  )
}
