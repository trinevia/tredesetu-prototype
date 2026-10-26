import {
  BadgeCheck,
  Ban,
  Check,
  ExternalLink,
  FileText,
  MoreHorizontal,
  Play,
  Star,
  X,
} from "lucide-react"
import { useState } from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import { ConfirmAction, FilterSelect, SearchInput, TableCard } from "@/components/admin/ui"
import { EmptyState, PageHeader, Rating, SmartImage, StatusBadge, TrustSeal, VerifiedBadge } from "@/components/common/bits"
import { SupplierLogo } from "@/components/market/cards"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fmtDate, num, priceRange, timeAgo } from "@/lib/format"
import { useApp } from "@/store/app"
import type { BusinessType, Supplier, SupplierStatus } from "@/types"

const businessTypes: BusinessType[] = ["Manufacturer", "Wholesaler", "Distributor", "Exporter", "Trader"]

function useSupplierActions() {
  const setStatus = useApp((s) => s.setSupplierStatus)
  const setVerified = useApp((s) => s.setSupplierVerified)
  const toggleFeatured = useApp((s) => s.toggleSupplierFeatured)
  return {
    approve: (s: Supplier) => {
      setStatus(s.id, "active")
      setVerified(s.id, true)
      toast.success(`${s.name} approved`, { description: "Approval email & WhatsApp sent to the supplier." })
    },
    reject: (s: Supplier) => {
      setStatus(s.id, "rejected")
      toast.error(`${s.name} rejected`)
    },
    status: (s: Supplier, status: SupplierStatus) => {
      setStatus(s.id, status)
      toast.success(status === "suspended" ? `${s.name} suspended — listings hidden` : `${s.name} re-activated`)
    },
    verify: (s: Supplier) => {
      setVerified(s.id, !s.verified)
      toast.success(s.verified ? "Verification removed" : `${s.name} marked GST verified`)
    },
    feature: (s: Supplier) => {
      toggleFeatured(s.id)
      toast.success(s.featured ? "Removed from featured suppliers" : "Now featured on the homepage")
    },
  }
}

export default function AdminSuppliers() {
  const suppliers = useApp((s) => s.suppliers)
  const products = useApp((s) => s.products)
  const leads = useApp((s) => s.leads)
  const categories = useApp((s) => s.categories)
  const actions = useSupplierActions()
  const [tab, setTab] = useState("all")
  const [q, setQ] = useState("")
  const [type, setType] = useState("all")
  const [cat, setCat] = useState("all")
  const [openId, setOpenId] = useState<string | null>(null)

  const counts = {
    all: suppliers.length,
    pending: suppliers.filter((s) => s.status === "pending").length,
    active: suppliers.filter((s) => s.status === "active").length,
    suspended: suppliers.filter((s) => s.status === "suspended" || s.status === "rejected").length,
  }
  const rows = suppliers.filter(
    (s) =>
      (tab === "all" || s.status === tab || (tab === "suspended" && s.status === "rejected")) &&
      (!q || `${s.name} ${s.city} ${s.gst}`.toLowerCase().includes(q.toLowerCase())) &&
      (type === "all" || s.businessType === type) &&
      (cat === "all" || s.categoryIds.includes(cat)),
  )

  return (
    <>
      <PageHeader title="Supplier management" description="Approve registrations, verify KYC, and manage supplier accounts." />
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-4 h-auto flex-wrap">
          <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
          <TabsTrigger value="pending">
            Pending approval
            {counts.pending > 0 && <Badge className="ml-1 h-4 bg-saffron px-1.5 text-[10px] text-saffron-foreground">{counts.pending}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="active">Active ({counts.active})</TabsTrigger>
          <TabsTrigger value="suspended">Suspended / Rejected ({counts.suspended})</TabsTrigger>
        </TabsList>
      </Tabs>
      <TableCard
        toolbar={
          <>
            <SearchInput value={q} onChange={setQ} placeholder="Search name, city, GSTIN…" />
            <FilterSelect value={type} onChange={setType} placeholder="All business types" options={businessTypes.map((b) => ({ value: b, label: b }))} />
            <FilterSelect value={cat} onChange={setCat} placeholder="All categories" options={categories.map((c) => ({ value: c.id, label: c.name }))} />
          </>
        }
      >
        {rows.length === 0 ? (
          <EmptyState icon={BadgeCheck} title="No suppliers here" body="Nothing matches this view right now." className="m-4" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Supplier</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Verification</TableHead>
                <TableHead className="text-right">Products</TableHead>
                <TableHead className="text-right">Enquiries</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pr-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="pl-4">
                    <button type="button" onClick={() => setOpenId(s.id)} className="flex items-center gap-3 text-left">
                      <SupplierLogo supplier={s} className="size-9 text-xs" />
                      <span>
                        <span className="flex items-center gap-1.5 font-medium hover:text-primary">
                          {s.name}
                          {s.featured && <Star className="size-3.5 fill-saffron text-saffron" />}
                        </span>
                        <span className="block text-xs text-muted-foreground">Joined {fmtDate(s.joinedAt)}</span>
                      </span>
                    </button>
                  </TableCell>
                  <TableCell>{s.businessType}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {s.city}, {s.state}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {s.verified ? <VerifiedBadge label="GST verified" /> : <span className="text-xs text-amber-700">KYC pending</span>}
                      <TrustSeal seal={s.trustSeal} />
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{products.filter((p) => p.supplierId === s.id).length}</TableCell>
                  <TableCell className="text-right">{leads.filter((l) => l.supplierIds.includes(s.id)).length}</TableCell>
                  <TableCell>
                    <StatusBadge status={s.status} />
                  </TableCell>
                  <TableCell className="pr-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {s.status === "pending" && (
                        <>
                          <Button size="icon-sm" variant="outline" aria-label="Reject" onClick={() => actions.reject(s)}>
                            <X className="text-destructive" />
                          </Button>
                          <Button size="sm" onClick={() => actions.approve(s)}>
                            <Check /> Approve
                          </Button>
                        </>
                      )}
                      <SupplierMenu supplier={s} onView={() => setOpenId(s.id)} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </TableCard>
      <SupplierSheet supplierId={openId} onClose={() => setOpenId(null)} />
    </>
  )
}

function SupplierMenu({ supplier: s, onView }: { supplier: Supplier; onView: () => void }) {
  const a = useSupplierActions()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon-sm" variant="ghost" aria-label="More actions">
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem onSelect={onView}>
          <FileText /> View details
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to={`/suppliers/${s.id}`}>
            <ExternalLink /> Public profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => a.verify(s)}>
          <BadgeCheck /> {s.verified ? "Remove verification" : "Mark as verified"}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => a.feature(s)}>
          <Star /> {s.featured ? "Unfeature" : "Feature on homepage"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {s.status === "active" ? (
          <DropdownMenuItem variant="destructive" onSelect={() => a.status(s, "suspended")}>
            <Ban /> Suspend account
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onSelect={() => a.status(s, "active")}>
            <Play /> Activate account
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function SupplierSheet({ supplierId, onClose }: { supplierId: string | null; onClose: () => void }) {
  const s = useApp((st) => st.suppliers.find((x) => x.id === supplierId))
  const allProducts = useApp((st) => st.products)
  const allLeads = useApp((st) => st.leads)
  const products = allProducts.filter((p) => p.supplierId === supplierId)
  const leads = allLeads.filter((l) => supplierId && l.supplierIds.includes(supplierId))
  const a = useSupplierActions()
  const activity = leads
    .flatMap((l) => l.activity.filter((x) => x.by === s?.name || x.kind === "quote" || x.kind === "status").map((x) => ({ ...x, lead: l.id })))
    .sort((x, y) => y.at.localeCompare(x.at))
    .slice(0, 8)

  return (
    <Sheet open={!!supplierId} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full gap-0 overflow-y-auto p-0 sm:max-w-2xl">
        {s && (
          <>
            <div className="relative h-28">
              <SmartImage src={s.cover} alt="" className="size-full" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
            <SheetHeader className="-mt-8 border-b px-5 pb-4">
              <SupplierLogo supplier={s} className="ring-4 ring-background" />
              <SheetTitle className="text-lg">{s.name}</SheetTitle>
              <SheetDescription>{s.tagline}</SheetDescription>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <StatusBadge status={s.status} />
                {s.verified && <VerifiedBadge label="GST verified" />}
                <TrustSeal seal={s.trustSeal} />
                <Rating value={s.rating} count={s.reviews} />
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {s.status === "pending" ? (
                  <>
                    <Button size="sm" onClick={() => a.approve(s)}>
                      <Check /> Approve & verify
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => a.reject(s)}>
                      <X /> Reject
                    </Button>
                  </>
                ) : s.status === "active" ? (
                  <ConfirmAction
                    title={`Suspend ${s.name}?`}
                    description="Their listings will be hidden from the marketplace and they cannot receive new enquiries."
                    confirmLabel="Suspend"
                    destructive
                    onConfirm={() => a.status(s, "suspended")}
                  >
                    <Button size="sm" variant="outline">
                      <Ban /> Suspend
                    </Button>
                  </ConfirmAction>
                ) : (
                  <Button size="sm" onClick={() => a.status(s, "active")}>
                    <Play /> Activate
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={() => a.verify(s)}>
                  <BadgeCheck /> {s.verified ? "Unverify" : "Verify"}
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <Link to={`/suppliers/${s.id}`}>
                    <ExternalLink /> Public profile
                  </Link>
                </Button>
              </div>
            </SheetHeader>
            <Tabs defaultValue="profile" className="p-5">
              <TabsList className="w-full">
                <TabsTrigger value="profile">Profile & KYC</TabsTrigger>
                <TabsTrigger value="products">Products ({products.length})</TabsTrigger>
                <TabsTrigger value="enquiries">Enquiries ({leads.length})</TabsTrigger>
              </TabsList>
              <TabsContent value="profile" className="mt-4 space-y-5">
                <dl className="grid gap-3 sm:grid-cols-2">
                  {[
                    ["Business type", s.businessType],
                    ["Established", String(s.yearEstablished)],
                    ["Contact", s.contactPerson],
                    ["Phone", s.phone],
                    ["Email", s.email],
                    ["Website", s.website],
                    ["GSTIN", s.gst],
                    ["Employees", s.employees],
                    ["Annual turnover", s.turnover],
                    ["Response", `${s.responseRate}% · ${s.responseTime}`],
                  ].map(([k, v]) => (
                    <div key={k} className="rounded-lg bg-muted/60 px-3 py-2">
                      <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">{k}</dt>
                      <dd className="truncate text-sm font-medium">{v}</dd>
                    </div>
                  ))}
                </dl>
                <p className="text-sm text-muted-foreground">{s.address}</p>
                <section>
                  <h4 className="mb-2 text-sm font-semibold">KYC documents</h4>
                  <div className="divide-y rounded-lg border">
                    {[
                      ["GST Registration Certificate", s.verified],
                      ["PAN Card (Company)", s.verified],
                      ["Udyam / MSME Certificate", true],
                      ["Cancelled cheque (bank verification)", s.verified],
                      ...s.certifications.map((c) => [`${c} certificate`, true] as [string, boolean]),
                    ].map(([doc, ok]) => (
                      <div key={String(doc)} className="flex items-center gap-3 px-3 py-2.5 text-sm">
                        <FileText className="size-4 text-muted-foreground" />
                        <span className="flex-1">{doc}</span>
                        <StatusBadge status={ok ? "Approved" : "Pending"} />
                        <Button size="xs" variant="ghost" onClick={() => toast("Document preview is simulated in this prototype")}>
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                </section>
                {s.exportMarkets.length > 0 && (
                  <section>
                    <h4 className="mb-2 text-sm font-semibold">Export markets</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {s.exportMarkets.map((m) => (
                        <Badge key={m} variant="secondary">
                          {m}
                        </Badge>
                      ))}
                    </div>
                  </section>
                )}
              </TabsContent>
              <TabsContent value="products" className="mt-4 space-y-2">
                {products.length === 0 && <p className="text-sm text-muted-foreground">No products listed yet.</p>}
                {products.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 rounded-lg border p-2.5">
                    <SmartImage src={p.images[0]} alt="" className="size-11 shrink-0 rounded-md" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {priceRange(p.priceMin, p.priceMax, p.unit)} · {num(p.views)} views
                      </p>
                    </div>
                    <StatusBadge status={p.status} />
                  </div>
                ))}
              </TabsContent>
              <TabsContent value="enquiries" className="mt-4 space-y-4">
                <div className="space-y-2">
                  {leads.map((l) => (
                    <div key={l.id} className="flex items-center gap-3 rounded-lg border p-2.5">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{l.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {l.id} · {l.buyer.company} · {timeAgo(l.createdAt)}
                        </p>
                      </div>
                      <StatusBadge status={l.supplierStage[s.id] ?? "New"} />
                    </div>
                  ))}
                  {leads.length === 0 && <p className="text-sm text-muted-foreground">No enquiries yet.</p>}
                </div>
                {activity.length > 0 && (
                  <section>
                    <h4 className="mb-2 text-sm font-semibold">Recent supplier activity</h4>
                    <ul className="space-y-1.5 text-sm">
                      {activity.map((x) => (
                        <li key={x.id} className="flex justify-between gap-3">
                          <span>
                            <span className="font-mono text-xs text-muted-foreground">{x.lead}</span> {x.text}
                          </span>
                          <span className="shrink-0 text-xs text-muted-foreground">{timeAgo(x.at)}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
