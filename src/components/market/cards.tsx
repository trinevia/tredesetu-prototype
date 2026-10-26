import { Heart, MapPin, MessageSquareQuote, Package, Timer } from "lucide-react"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import { Rating, SmartImage, TrustSeal, VerifiedBadge } from "@/components/common/bits"
import { EnquiryDialog } from "@/components/market/EnquiryDialog"
import { WhatsAppButton } from "@/components/market/WhatsAppDialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { num, priceRange } from "@/lib/format"
import { cn } from "@/lib/utils"
import { useApp, useSupplier } from "@/store/app"
import type { Product, Supplier } from "@/types"

export function SaveButton({ productId, supplierId, className }: { productId?: string; supplierId?: string; className?: string }) {
  const saved = useApp((s) =>
    productId ? s.savedProductIds.includes(productId) : supplierId ? s.savedSupplierIds.includes(supplierId) : false,
  )
  const toggleP = useApp((s) => s.toggleSaveProduct)
  const toggleS = useApp((s) => s.toggleSaveSupplier)
  return (
    <button
      type="button"
      aria-label={saved ? "Remove from saved" : "Save"}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        if (productId) toggleP(productId)
        if (supplierId) toggleS(supplierId)
        toast.success(saved ? "Removed from saved" : "Saved to your favourites")
      }}
      className={cn(
        "grid size-8 place-items-center rounded-full bg-white/90 shadow-sm ring-1 ring-black/5 backdrop-blur transition hover:scale-105",
        className,
      )}
    >
      <Heart className={cn("size-4", saved ? "fill-rose-500 text-rose-500" : "text-slate-600")} />
    </button>
  )
}

export function ProductCard({ product, compact = false }: { product: Product; compact?: boolean }) {
  const supplier = useSupplier(product.supplierId)
  return (
    <Card className="group relative gap-0 overflow-hidden p-0 transition hover:-translate-y-0.5 hover:shadow-lg hover:ring-primary/20">
      <Link to={`/product/${product.id}`} className="relative block aspect-[4/3] overflow-hidden bg-muted">
        <SmartImage src={product.images[0]} alt={product.name} className="size-full transition duration-500 group-hover:scale-105" />
        <div className="absolute left-2 top-2 flex gap-1">
          {product.featured && <Badge className="bg-saffron text-saffron-foreground">Featured</Badge>}
          {product.trending && !product.featured && <Badge className="bg-brand text-brand-foreground">Trending</Badge>}
        </div>
        <SaveButton productId={product.id} className="absolute right-2 top-2" />
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-3.5">
        <Link to={`/product/${product.id}`} className="line-clamp-2 min-h-10 text-sm font-medium leading-snug hover:text-primary">
          {product.name}
        </Link>
        <div>
          <div className="text-base font-semibold text-brand">{priceRange(product.priceMin, product.priceMax)}</div>
          <div className="text-xs text-muted-foreground">
            per {product.unit} · MOQ {num(product.moq)} {product.unit}
          </div>
        </div>
        {!compact && supplier && (
          <div className="mt-auto space-y-1 border-t pt-2.5">
            <Link to={`/suppliers/${supplier.id}`} className="line-clamp-1 text-xs font-medium hover:text-primary">
              {supplier.name}
            </Link>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3" /> {product.location}
              </span>
              {supplier.verified && <VerifiedBadge />}
              <Rating value={supplier.rating} />
            </div>
          </div>
        )}
        {!compact && (
          <div className="mt-2 grid grid-cols-[1fr_auto] gap-2">
            <EnquiryDialog product={product}>
              <Button size="sm" className="w-full">
                <MessageSquareQuote /> Get Quote
              </Button>
            </EnquiryDialog>
            {supplier && <WhatsAppButton supplier={supplier} product={product} size="icon-sm" />}
          </div>
        )}
      </div>
    </Card>
  )
}

export function SupplierLogo({ supplier, className }: { supplier: Supplier; className?: string }) {
  return (
    <span
      className={cn("grid size-12 shrink-0 place-items-center rounded-xl text-sm font-bold text-white shadow-sm", className)}
      style={{ background: supplier.logoColor }}
    >
      {supplier.logo}
    </span>
  )
}

export function SupplierCard({ supplier }: { supplier: Supplier }) {
  const productCount = useApp((s) => s.products.filter((p) => p.supplierId === supplier.id && p.status === "active").length)
  return (
    <Card className="group gap-0 overflow-hidden p-0 transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative h-28 overflow-hidden">
        <SmartImage src={supplier.cover} alt="" className="size-full transition duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <SaveButton supplierId={supplier.id} className="absolute right-2 top-2" />
      </div>
      <div className="flex flex-1 flex-col p-4 pt-0">
        <div className="relative z-10 -mt-7 mb-2.5 flex items-end justify-between">
          <SupplierLogo supplier={supplier} className="ring-4 ring-card" />
          <TrustSeal seal={supplier.trustSeal} />
        </div>
        <Link to={`/suppliers/${supplier.id}`} className="font-semibold leading-snug hover:text-primary">
          {supplier.name}
        </Link>
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{supplier.tagline}</p>
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3" /> {supplier.city}, {supplier.state}
          </span>
          <Rating value={supplier.rating} count={supplier.reviews} />
          {supplier.verified && <VerifiedBadge label="GST Verified" />}
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 rounded-lg bg-muted/60 p-2 text-center text-[11px]">
          <div>
            <div className="font-semibold text-foreground">{supplier.businessType}</div>
            <div className="text-muted-foreground">Type</div>
          </div>
          <div>
            <div className="inline-flex items-center gap-0.5 font-semibold text-foreground">
              <Package className="size-3" />
              {productCount}
            </div>
            <div className="text-muted-foreground">Products</div>
          </div>
          <div>
            <div className="inline-flex items-center gap-0.5 font-semibold text-foreground">
              <Timer className="size-3" />
              {supplier.responseRate}%
            </div>
            <div className="text-muted-foreground">Response</div>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
          <EnquiryDialog supplier={supplier}>
            <Button size="sm" variant="outline" className="w-full">
              Contact Supplier
            </Button>
          </EnquiryDialog>
          <WhatsAppButton supplier={supplier} size="icon-sm" />
        </div>
      </div>
    </Card>
  )
}
