import {
  Award,
  Box,
  Building2,
  CalendarDays,
  ChevronRight,
  FileText,
  MapPin,
  MessageSquareQuote,
  Package,
  PackageSearch,
  Phone,
  Receipt,
  Share2,
  Timer,
  Truck,
} from "lucide-react"
import { useState } from "react"
import { Link, useParams } from "react-router-dom"
import { toast } from "sonner"
import { EmptyState, Rating, SectionHeading, SmartImage, TrustSeal, VerifiedBadge } from "@/components/common/bits"
import { EnquiryDialog } from "@/components/market/EnquiryDialog"
import { ProductCard, SaveButton, SupplierLogo } from "@/components/market/cards"
import { WhatsAppButton } from "@/components/market/WhatsAppDialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { num, priceRange } from "@/lib/format"
import { cn } from "@/lib/utils"
import { useApp, useProduct, useSupplier } from "@/store/app"

export default function ProductDetail() {
  const { id } = useParams()
  const product = useProduct(id)
  const supplier = useSupplier(product?.supplierId)
  const categories = useApp((s) => s.categories)
  const all = useApp((s) => s.products)
  const [active, setActive] = useState(0)

  if (!product || !supplier || product.status !== "active") {
    return (
      <div className="container-page py-20">
        <EmptyState
          icon={PackageSearch}
          title="This product is not available"
          body="It may have been removed or is awaiting approval. Browse similar products instead."
          action={
            <Button asChild>
              <Link to="/products">Browse products</Link>
            </Button>
          }
        />
      </div>
    )
  }

  const category = categories.find((c) => c.id === product.categoryId)
  const sub = category?.subs.find((s) => s.id === product.subId)
  const live = all.filter((p) => p.status === "active" && p.id !== product.id)
  const fromSupplier = live.filter((p) => p.supplierId === supplier.id).slice(0, 4)
  const similar = live.filter((p) => p.categoryId === product.categoryId && p.supplierId !== supplier.id).slice(0, 4)
  const specs = Object.entries({ Brand: product.brand, Model: product.model, ...product.specs })

  const facts = [
    { icon: Box, label: "Minimum order", value: `${num(product.moq)} ${product.unit}` },
    { icon: PackageSearch, label: "Available", value: `${num(product.availableQty)} ${product.unit}` },
    { icon: Truck, label: "Delivery", value: product.delivery },
    { icon: Receipt, label: "GST", value: `${product.gstPct}% extra, GST invoice` },
  ]

  return (
    <div>
      <div className="container-page py-4">
        <nav className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">
            Home
          </Link>
          <ChevronRight className="size-3" />
          <Link to={`/products?category=${category?.id}`} className="hover:text-foreground">
            {category?.name}
          </Link>
          {sub && (
            <>
              <ChevronRight className="size-3" />
              <Link to={`/products?category=${category?.id}&sub=${sub.id}`} className="hover:text-foreground">
                {sub.name}
              </Link>
            </>
          )}
          <ChevronRight className="size-3" />
          <span className="line-clamp-1 text-foreground">{product.name}</span>
        </nav>
      </div>

      <div className="container-page grid gap-8 lg:grid-cols-[1.05fr_1fr_320px]">
        {/* Gallery */}
        <div className="min-w-0">
          <div className="relative aspect-square overflow-hidden rounded-2xl border bg-muted">
            <SmartImage src={product.images[active] ?? product.images[0]} alt={product.name} className="size-full" />
            <SaveButton productId={product.id} className="absolute right-3 top-3 size-10" />
            {product.featured && <Badge className="absolute left-3 top-3 bg-saffron text-saffron-foreground">Featured</Badge>}
          </div>
          {product.images.length > 1 && (
            <div className="mt-3 flex gap-2">
              {product.images.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setActive(i)}
                  className={cn(
                    "size-16 overflow-hidden rounded-lg border-2 transition sm:size-20",
                    i === active ? "border-primary" : "border-transparent opacity-70 hover:opacity-100",
                  )}
                >
                  <SmartImage src={src} alt="" className="size-full" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold leading-tight tracking-tight">{product.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <Rating value={product.rating} count={product.enquiries} />
            <span>·</span>
            <span>{num(product.views)} views</span>
            <span>·</span>
            <span>{product.enquiries} enquiries</span>
          </div>
          <div className="mt-5 rounded-xl border bg-surface p-4">
            <div className="text-2xl font-semibold text-brand">{priceRange(product.priceMin, product.priceMax)}</div>
            <div className="text-sm text-muted-foreground">per {product.unit} · price depends on quantity & customisation</div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {facts.map((f) => (
              <div key={f.label} className="flex gap-2.5 rounded-lg border p-3">
                <f.icon className="mt-0.5 size-4 shrink-0 text-primary" />
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{f.label}</div>
                  <div className="text-sm font-medium">{f.value}</div>
                </div>
              </div>
            ))}
          </div>
          {product.variants.length > 0 && (
            <div className="mt-5">
              <div className="mb-2 text-sm font-medium">Available variants</div>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <span key={v} className="rounded-full border px-3 py-1 text-xs">
                    {v}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="mt-6 flex gap-2">
            <EnquiryDialog product={product}>
              <Button size="lg" className="flex-1 sm:flex-none sm:px-8">
                <MessageSquareQuote /> Request Quote
              </Button>
            </EnquiryDialog>
            <WhatsAppButton supplier={supplier} product={product} size="lg" className="flex-1 sm:flex-none sm:px-6" />
            <Button
              size="icon-lg"
              variant="outline"
              aria-label="Copy product link"
              onClick={() => {
                navigator.clipboard?.writeText(window.location.href).catch(() => {})
                toast.success("Product link copied")
              }}
            >
              <Share2 />
            </Button>
          </div>
          <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground"><Package className="size-3.5" /> {product.packaging}</p>
        </div>

        {/* Supplier card */}
        <aside className="lg:sticky lg:top-36 lg:self-start">
          <Card className="gap-4 p-5">
            <div className="flex gap-3">
              <SupplierLogo supplier={supplier} />
              <div className="min-w-0">
                <Link to={`/suppliers/${supplier.id}`} className="font-semibold leading-snug hover:text-primary">
                  {supplier.name}
                </Link>
                <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="size-3" /> {supplier.city}, {supplier.state}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {supplier.verified && <VerifiedBadge label="GST Verified" />}
              <TrustSeal seal={supplier.trustSeal} />
            </div>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">Business type</dt>
                <dd className="font-medium">{supplier.businessType}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Since</dt>
                <dd className="font-medium">{supplier.yearEstablished}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Response rate</dt>
                <dd className="font-medium text-success">{supplier.responseRate}%</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Responds</dt>
                <dd className="font-medium">{supplier.responseTime}</dd>
              </div>
            </dl>
            <Rating value={supplier.rating} count={supplier.reviews} className="text-sm" />
            <div className="grid gap-2">
              <EnquiryDialog supplier={supplier}>
                <Button variant="outline" className="w-full">
                  <Phone /> Contact Supplier
                </Button>
              </EnquiryDialog>
              <Button variant="ghost" asChild className="w-full">
                <Link to={`/suppliers/${supplier.id}`}>
                  <Building2 /> View company profile
                </Link>
              </Button>
            </div>
          </Card>
        </aside>
      </div>

      <div className="container-page mt-10">
        <Tabs defaultValue="specs">
          <TabsList variant="line">
            <TabsTrigger value="specs">Specifications</TabsTrigger>
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="docs">Documents</TabsTrigger>
          </TabsList>
          <TabsContent value="specs" className="pt-4">
            <dl className="grid overflow-hidden rounded-2xl border bg-card sm:grid-cols-2">
              {[...specs, ["Ships from", `${product.location}, India`] as [string, string]].map(([k, v]) => (
                <div key={k} className="flex gap-4 border-b px-5 py-3.5 text-sm sm:odd:border-r">
                  <dt className="w-36 shrink-0 text-muted-foreground">{k}</dt>
                  <dd className="font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </TabsContent>
          <TabsContent value="description" className="pt-4">
            <p className="max-w-3xl leading-relaxed text-muted-foreground">{product.description}</p>
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              <span className="inline-flex items-center gap-1.5">
                <Timer className="size-4 text-primary" /> {product.delivery}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-4 text-primary" /> Listed {new Date(product.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}
              </span>
              {supplier.certifications.slice(0, 2).map((c) => (
                <span key={c} className="inline-flex items-center gap-1.5">
                  <Award className="size-4 text-primary" /> {c}
                </span>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="docs" className="pt-4">
            {product.documents.length ? (
              <div className="flex flex-wrap gap-3">
                {product.documents.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toast.info(`${d} would download from secure storage (AWS S3) in production`)}
                    className="flex items-center gap-2 rounded-lg border px-4 py-3 text-sm hover:bg-muted"
                  >
                    <FileText className="size-4 text-rose-600" /> {d}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No documents uploaded. Request a catalogue or test certificate via enquiry.</p>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {fromSupplier.length > 0 && (
        <section className="container-page mt-14">
          <SectionHeading
            title={`More from ${supplier.name}`}
            action={
              <Button variant="ghost" asChild>
                <Link to={`/suppliers/${supplier.id}`}>View catalogue</Link>
              </Button>
            }
          />
          <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-4">
            {fromSupplier.map((p) => (
              <ProductCard key={p.id} product={p} compact />
            ))}
          </div>
        </section>
      )}
      {similar.length > 0 && (
        <section className="container-page mt-14">
          <SectionHeading title="Similar products from other suppliers" />
          <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-4">
            {similar.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
