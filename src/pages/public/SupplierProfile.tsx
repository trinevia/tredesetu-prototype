import {
  Award,
  Building2,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Eye,
  Globe,
  Globe2,
  Mail,
  MapPin,
  Package,
  Phone,
  Receipt,
  Timer,
  Truck,
  Users,
  Wallet,
} from "lucide-react"
import { useState } from "react"
import { Link, useParams } from "react-router-dom"
import { toast } from "sonner"
import { EmptyState, Rating, SmartImage, TrustSeal, VerifiedBadge } from "@/components/common/bits"
import { EnquiryDialog } from "@/components/market/EnquiryDialog"
import { ProductCard, SaveButton, SupplierLogo } from "@/components/market/cards"
import { WhatsAppButton } from "@/components/market/WhatsAppDialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { num } from "@/lib/format"
import { cn } from "@/lib/utils"
import { useApp, useSupplier } from "@/store/app"

export default function SupplierProfile() {
  const { id } = useParams()
  const supplier = useSupplier(id)
  const allProducts = useApp((s) => s.products)
  const categories = useApp((s) => s.categories)
  const [cat, setCat] = useState("all")
  const [revealed, setRevealed] = useState(false)

  if (!supplier || supplier.status !== "active") {
    return (
      <div className="container-page py-20">
        <EmptyState
          icon={Building2}
          title="Supplier profile not available"
          body="This company may be under verification or no longer listed."
          action={
            <Button asChild>
              <Link to="/suppliers">Browse suppliers</Link>
            </Button>
          }
        />
      </div>
    )
  }

  const products = allProducts
    .filter((p) => p.supplierId === supplier.id && p.status === "active")
    .sort((a, b) => Number(b.featured) - Number(a.featured))
  const subIds = [...new Set(products.map((p) => p.subId))]
  const subLabel = (sid: string) => categories.flatMap((c) => c.subs).find((s) => s.id === sid)?.name ?? sid
  const shown = cat === "all" ? products : products.filter((p) => p.subId === cat)

  const details: [typeof Building2, string, string][] = [
    [Building2, "Business type", supplier.businessType],
    [CalendarDays, "Year established", String(supplier.yearEstablished)],
    [Receipt, "GSTIN", supplier.gst],
    [Users, "Employees", supplier.employees],
    [Wallet, "Annual turnover", supplier.turnover],
    [Timer, "Response time", supplier.responseTime],
  ]

  return (
    <div className="pb-24 lg:pb-0">
      <div className="relative h-44 overflow-hidden sm:h-60">
        <SmartImage src={supplier.cover} alt="" className="size-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/10" />
      </div>
      <div className="container-page">
        <div className="relative -mt-14 flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-sm sm:flex-row sm:items-end sm:p-6">
          <SupplierLogo supplier={supplier} className="size-20 text-xl ring-4 ring-card" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">{supplier.name}</h1>
              <TrustSeal seal={supplier.trustSeal} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{supplier.tagline}</p>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3.5" /> {supplier.city}, {supplier.state}
              </span>
              <Rating value={supplier.rating} count={supplier.reviews} className="text-sm" />
              {supplier.verified && <VerifiedBadge label="GST & KYC verified" className="text-sm" />}
              <span className="inline-flex items-center gap-1">
                <Eye className="size-3.5" /> {num(supplier.profileViews)} profile views
              </span>
              {supplier.bricsReady && (
                <span className="inline-flex items-center gap-1 text-primary">
                  <Globe2 className="size-3.5" /> BRICS export-ready
                </span>
              )}
            </div>
          </div>
          <div className="hidden shrink-0 items-center gap-2 lg:flex">
            <SaveButton supplierId={supplier.id} className="size-10 bg-muted" />
            <WhatsAppButton supplier={supplier} size="lg" />
            <EnquiryDialog supplier={supplier}>
              <Button size="lg">Send Enquiry</Button>
            </EnquiryDialog>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["Products", products.length],
            ["Response rate", `${supplier.responseRate}%`],
            ["Years in business", 2026 - supplier.yearEstablished],
            ["Export markets", supplier.exportMarkets.length || "India"],
          ].map(([l, v]) => (
            <div key={l} className="rounded-xl border bg-surface p-4">
              <div className="text-xl font-semibold">{v}</div>
              <div className="text-xs text-muted-foreground">{l}</div>
            </div>
          ))}
        </div>

        <Tabs defaultValue="products" className="mt-8">
          <TabsList variant="line" className="scrollbar-none overflow-x-auto overflow-y-hidden">
            <TabsTrigger value="products">Products ({products.length})</TabsTrigger>
            <TabsTrigger value="overview">Company overview</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="pt-5">
            {subIds.length > 1 && (
              <div className="mb-5 flex flex-wrap gap-2">
                {["all", ...subIds].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setCat(s)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-medium transition",
                      cat === s ? "border-primary bg-primary text-primary-foreground" : "hover:border-primary hover:text-primary",
                    )}
                  >
                    {s === "all" ? `All (${products.length})` : subLabel(s)}
                  </button>
                ))}
              </div>
            )}
            {shown.length === 0 ? (
              <EmptyState icon={Package} title="No products listed yet" body="Send an enquiry to request the full catalogue." />
            ) : (
              <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-4">
                {shown.map((p) => (
                  <ProductCard key={p.id} product={p} compact />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="overview" className="pt-5">
            <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
              <div className="space-y-6">
                <section>
                  <h2 className="mb-2 text-lg font-semibold">About {supplier.name}</h2>
                  <p className="leading-relaxed text-muted-foreground">{supplier.description}</p>
                </section>
                <section>
                  <h3 className="mb-3 font-semibold">Business capabilities</h3>
                  <div className="flex flex-wrap gap-2">
                    {supplier.capabilities.map((c) => (
                      <span key={c} className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
                        <CheckCircle2 className="size-3.5" /> {c}
                      </span>
                    ))}
                  </div>
                </section>
                <section>
                  <h3 className="mb-3 font-semibold">Factory & office gallery</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {supplier.gallery.map((g) => (
                      <SmartImage key={g} src={g} alt="" className="aspect-[4/3] w-full rounded-lg" />
                    ))}
                  </div>
                </section>
                <section className="grid gap-3 sm:grid-cols-2">
                  <InfoBlock icon={Package} title="Minimum order" body={supplier.minOrderInfo} />
                  <InfoBlock icon={Truck} title="Delivery" body={supplier.deliveryInfo} />
                  <InfoBlock icon={CreditCard} title="Payment terms" body={supplier.paymentTerms.join(" · ")} />
                  <InfoBlock
                    icon={Globe2}
                    title="Export markets"
                    body={supplier.exportMarkets.length ? supplier.exportMarkets.join(", ") : "Domestic (Pan-India)"}
                  />
                </section>
              </div>
              <div className="space-y-4">
                <Card className="gap-0 p-0">
                  <div className="border-b px-5 py-3 font-semibold">Business details</div>
                  <dl className="divide-y">
                    {details.map(([Icon, k, v]) => (
                      <div key={k} className="flex items-center gap-3 px-5 py-3 text-sm">
                        <Icon className="size-4 text-muted-foreground" />
                        <dt className="text-muted-foreground">{k}</dt>
                        <dd className="ml-auto text-right font-medium">{v}</dd>
                      </div>
                    ))}
                  </dl>
                </Card>
                <Card className="gap-3 p-5">
                  <div className="font-semibold">Certifications</div>
                  <div className="flex flex-wrap gap-2">
                    {supplier.certifications.map((c) => (
                      <Badge key={c} variant="outline" className="gap-1">
                        <Award className="size-3" /> {c}
                      </Badge>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="contact" className="pt-5">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="gap-4 p-6">
                <h3 className="font-semibold">Contact details</h3>
                <ContactRow icon={Users} label="Contact person" value={supplier.contactPerson} />
                <ContactRow icon={MapPin} label="Address" value={supplier.address} />
                <ContactRow
                  icon={Phone}
                  label="Phone"
                  value={
                    revealed ? (
                      supplier.phone
                    ) : (
                      <button
                        type="button"
                        className="font-medium text-primary hover:underline"
                        onClick={() => {
                          setRevealed(true)
                          toast.success("Number revealed — the supplier has been notified of your interest")
                        }}
                      >
                        +91 98XXX XXXXX · View number
                      </button>
                    )
                  }
                />
                <ContactRow icon={Mail} label="Email" value={revealed ? supplier.email : "Shared after enquiry"} />
                <ContactRow icon={Globe} label="Website" value={supplier.website} />
              </Card>
              <Card className="gap-4 bg-surface p-6">
                <h3 className="font-semibold">Get a quick quote</h3>
                <p className="text-sm text-muted-foreground">
                  Share your requirement and {supplier.name} will respond {supplier.responseTime.toLowerCase()}. Your enquiry is tracked in your
                  buyer dashboard.
                </p>
                <div className="flex flex-wrap gap-2">
                  <EnquiryDialog supplier={supplier}>
                    <Button>Send Enquiry</Button>
                  </EnquiryDialog>
                  <WhatsAppButton supplier={supplier} label="Chat on WhatsApp" />
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Sticky mobile CTAs */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex gap-2 border-t bg-background/95 p-3 pr-36 backdrop-blur lg:hidden">
        <WhatsAppButton supplier={supplier} className="flex-1" />
        <EnquiryDialog supplier={supplier}>
          <Button className="flex-1">Send Enquiry</Button>
        </EnquiryDialog>
      </div>
    </div>
  )
}

function InfoBlock({ icon: Icon, title, body }: { icon: typeof Package; title: string; body: string }) {
  return (
    <div className="rounded-xl border p-4">
      <div className="mb-1 flex items-center gap-2 text-sm font-semibold">
        <Icon className="size-4 text-primary" /> {title}
      </div>
      <p className="text-sm text-muted-foreground">{body}</p>
    </div>
  )
}

function ContactRow({ icon: Icon, label, value }: { icon: typeof Package; label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-3 text-sm">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div>{value}</div>
      </div>
    </div>
  )
}
