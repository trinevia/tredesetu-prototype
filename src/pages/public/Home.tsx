import {
  ArrowRight,
  BadgeCheck,
  Building2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Globe2,
  Handshake,
  MessageCircle,
  MessageSquarePlus,
  Quote,
  Search,
  ShieldCheck,
  Shuffle,
  Timer,
  TrendingUp,
} from "lucide-react"
import { useEffect, useMemo, useState, type FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import { DynamicIcon, SectionHeading, SmartImage } from "@/components/common/bits"
import { ProductCard, SupplierCard } from "@/components/market/cards"
import { Button } from "@/components/ui/button"
import { bricsCountries } from "@/data/brics"
import { testimonials } from "@/data/content"
import { img } from "@/lib/images"
import { cn } from "@/lib/utils"
import { useApp } from "@/store/app"

const popularSearches = ["GaN chargers", "1121 basmati rice", "Corrugated boxes", "Solar panels", "CNC lathe", "Cotton fabric"]

function Hero() {
  const navigate = useNavigate()
  const allBanners = useApp((s) => s.banners)
  const banners = allBanners.filter((b) => b.placement === "Homepage Hero" && b.active)
  const [i, setI] = useState(0)
  const [q, setQ] = useState("")
  useEffect(() => {
    if (banners.length < 2) return
    const t = setInterval(() => setI((x) => (x + 1) % banners.length), 6000)
    return () => clearInterval(t)
  }, [banners.length])
  const banner = banners[i % Math.max(banners.length, 1)]

  const submit = (e: FormEvent) => {
    e.preventDefault()
    navigate(`/products${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ""}`)
  }

  return (
    <section className="relative overflow-hidden bg-brand text-white">
      <div className="bg-grid absolute inset-0 opacity-60" />
      <div className="absolute -right-40 -top-40 size-[32rem] rounded-full bg-primary/40 blur-3xl" />
      <div className="container-page relative grid gap-10 py-12 lg:grid-cols-[1.1fr_1fr] lg:py-16">
        <div className="flex flex-col justify-center">
          <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium ring-1 ring-white/15">
            <ShieldCheck className="size-3.5 text-saffron" /> Every supplier GST-verified before listing
          </span>
          <h1 className="text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
            Source smarter from <span className="text-saffron">India's verified</span> manufacturers & exporters
          </h1>
          <p className="mt-4 max-w-xl text-base text-white/70">
            Search 2.4 lakh+ products, post one requirement and get competitive quotes from matched suppliers — then close the deal on
            WhatsApp.
          </p>
          <form onSubmit={submit} className="mt-7 flex max-w-xl items-center rounded-xl bg-white p-1.5 shadow-2xl">
            <Search className="ml-3 size-5 shrink-0 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="What are you sourcing today?"
              className="h-11 min-w-0 flex-1 bg-transparent px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
            <Button type="submit" size="lg" className="h-11 px-5">
              Search
            </Button>
          </form>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-white/50">Popular:</span>
            {popularSearches.map((s) => (
              <Link
                key={s}
                to={`/products?q=${encodeURIComponent(s.split(" ")[0])}`}
                className="rounded-full bg-white/10 px-2.5 py-1 text-white/80 ring-1 ring-white/10 transition hover:bg-white/20"
              >
                {s}
              </Link>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="h-11 bg-saffron px-5 text-saffron-foreground hover:bg-saffron/90">
              <Link to="/post-requirement">
                <MessageSquarePlus /> Post your requirement — free
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-11 border-white/25 bg-white/5 px-5 text-white hover:bg-white/15 hover:text-white">
              <Link to="/sell">
                <Building2 /> Register as supplier
              </Link>
            </Button>
          </div>
        </div>

        {banner && (
          <div className="relative min-h-80 overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/10 lg:min-h-[26rem]">
            {banners.map((b, idx) => (
              <SmartImage
                key={b.id}
                src={b.image}
                alt=""
                className={cn("absolute inset-0 size-full transition-opacity duration-700", idx === i % banners.length ? "opacity-100" : "opacity-0")}
              />
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6">
              <span className="mb-2 inline-block rounded-md bg-saffron px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-saffron-foreground">
                Promoted
              </span>
              <h3 className="text-2xl font-semibold">{banner.title}</h3>
              <p className="mt-1 max-w-md text-sm text-white/80">{banner.subtitle}</p>
              <div className="mt-4 flex items-center justify-between gap-3">
                <Button asChild variant="secondary" className="bg-white text-slate-900 hover:bg-white/90">
                  <Link to={banner.link}>
                    {banner.cta} <ArrowRight />
                  </Link>
                </Button>
                {banners.length > 1 && (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      aria-label="Previous banner"
                      onClick={() => setI((x) => (x - 1 + banners.length) % banners.length)}
                      className="grid size-8 place-items-center rounded-full bg-white/15 hover:bg-white/25"
                    >
                      <ChevronLeft className="size-4" />
                    </button>
                    <button
                      type="button"
                      aria-label="Next banner"
                      onClick={() => setI((x) => (x + 1) % banners.length)}
                      className="grid size-8 place-items-center rounded-full bg-white/15 hover:bg-white/25"
                    >
                      <ChevronRight className="size-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="relative border-t border-white/10 bg-black/10">
        <div className="container-page grid grid-cols-2 gap-4 py-5 sm:grid-cols-4">
          {[
            ["18,400+", "Verified suppliers"],
            ["2.4 lakh+", "Products listed"],
            ["9,800+", "Enquiries every month"],
            ["10", "BRICS & partner nations"],
          ].map(([v, l]) => (
            <div key={l}>
              <div className="text-xl font-semibold sm:text-2xl">{v}</div>
              <div className="text-xs text-white/60">{l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Categories() {
  const categories = useApp((s) => s.categories)
  const products = useApp((s) => s.products)
  return (
    <section className="container-page py-14">
      <SectionHeading
        eyebrow="Browse the marketplace"
        title="Popular categories"
        action={
          <Button variant="ghost" asChild>
            <Link to="/products">
              All products <ArrowRight />
            </Link>
          </Button>
        }
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {categories.map((c) => (
          <Link
            key={c.id}
            to={`/products?category=${c.id}`}
            className="group relative overflow-hidden rounded-xl border bg-card transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="relative h-24 overflow-hidden">
              <SmartImage src={c.image} alt="" className="size-full transition duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <span className="absolute bottom-2 left-2 grid size-8 place-items-center rounded-lg bg-white/95 text-primary shadow">
                <DynamicIcon name={c.icon} className="size-4" />
              </span>
            </div>
            <div className="p-3">
              <div className="line-clamp-1 text-sm font-semibold group-hover:text-primary">{c.name}</div>
              <div className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{c.tagline}</div>
              <div className="mt-1.5 text-[11px] font-medium text-primary">
                {products.filter((p) => p.categoryId === c.id && p.status === "active").length * 412 + 180} products
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

function HowItWorks() {
  const steps = [
    { icon: ClipboardList, title: "Post requirement", body: "Tell us product, quantity, budget and delivery city in under a minute." },
    { icon: Shuffle, title: "Matched suppliers", body: "Rules match your enquiry to verified suppliers by category & location." },
    { icon: Quote, title: "Compare quotes", body: "Receive and compare quotations, MOQ and lead times in your dashboard." },
    { icon: MessageCircle, title: "Talk on WhatsApp", body: "Negotiate instantly with click-to-WhatsApp — every message is tracked." },
    { icon: Handshake, title: "Close the deal", body: "Accept the best quote. Trade advisors help with follow-ups." },
  ]
  return (
    <section className="border-y bg-surface py-14">
      <div className="container-page">
        <SectionHeading eyebrow="How TradeSetu works" title="From requirement to deal in five simple steps" />
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {steps.map((s, idx) => (
            <li key={s.title} className="relative rounded-xl border bg-card p-5">
              <span className="absolute right-4 top-4 text-3xl font-bold text-muted/90">{idx + 1}</span>
              <span className="grid size-10 place-items-center rounded-lg bg-primary text-primary-foreground">
                <s.icon className="size-5" />
              </span>
              <h3 className="mt-4 font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function CtaPair() {
  return (
    <section className="container-page grid gap-4 py-14 md:grid-cols-2">
      <div className="relative overflow-hidden rounded-2xl bg-primary p-8 text-primary-foreground">
        <div className="absolute -right-10 -top-10 size-48 rounded-full bg-white/10" />
        <p className="text-xs font-semibold uppercase tracking-wider text-white/70">For buyers</p>
        <h3 className="mt-2 text-2xl font-semibold">Tell us what you need. Get quotes in hours.</h3>
        <p className="mt-2 max-w-md text-sm text-white/75">One requirement reaches up to 3 best-matched verified suppliers. Free for buyers, always.</p>
        <Button asChild className="mt-6 bg-white text-primary hover:bg-white/90">
          <Link to="/post-requirement">
            Post requirement <ArrowRight />
          </Link>
        </Button>
      </div>
      <div className="relative overflow-hidden rounded-2xl bg-saffron p-8 text-saffron-foreground">
        <div className="absolute -right-10 -top-10 size-48 rounded-full bg-white/20" />
        <p className="text-xs font-semibold uppercase tracking-wider opacity-70">For suppliers</p>
        <h3 className="mt-2 text-2xl font-semibold">Get genuine B2B leads every day.</h3>
        <p className="mt-2 max-w-md text-sm opacity-80">Create your company profile & catalogue, receive enquiries on WhatsApp and manage them in a built-in CRM.</p>
        <Button asChild className="mt-6 bg-brand text-white hover:bg-brand/90">
          <Link to="/register?type=supplier">
            Start selling free <ArrowRight />
          </Link>
        </Button>
      </div>
    </section>
  )
}

function Trust() {
  const items = [
    { icon: BadgeCheck, title: "GST & KYC verified", body: "GSTIN, PAN and business registration validated for every supplier before go-live." },
    { icon: ShieldCheck, title: "Trust Seal audits", body: "Gold & Silver seal suppliers pass video or on-site factory verification." },
    { icon: Timer, title: "Response-rate scoring", body: "Suppliers are ranked by how quickly and reliably they respond to buyers." },
    { icon: TrendingUp, title: "Ratings from real deals", body: "Only buyers with a tracked enquiry can rate a supplier." },
  ]
  return (
    <section className="container-page py-14">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-center">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-primary">Trust & verification</p>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Trade with confidence, not guesswork</h2>
          <p className="mt-3 text-muted-foreground">
            B2B buying in India runs on trust. TradeSetu verifies who you're dealing with and keeps every conversation on record — so
            procurement teams can source faster with less risk.
          </p>
          <div className="mt-6 overflow-hidden rounded-xl">
            <SmartImage src={img("handshake", 900, 500)} alt="Business handshake" className="h-48 w-full" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((it) => (
            <div key={it.title} className="rounded-xl border bg-card p-5">
              <span className="grid size-10 place-items-center rounded-lg bg-success/12 text-success">
                <it.icon className="size-5" />
              </span>
              <h3 className="mt-4 font-semibold">{it.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{it.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function BricsTeaser() {
  return (
    <section className="relative overflow-hidden bg-brand py-14 text-white">
      <div className="bg-grid absolute inset-0 opacity-50" />
      <div className="container-page relative grid gap-8 lg:grid-cols-[1fr_1.3fr] lg:items-center">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs ring-1 ring-white/15">
            <Globe2 className="size-3.5 text-saffron" /> BRICS Trade Hub
          </span>
          <h2 className="mt-4 text-2xl font-semibold sm:text-3xl">Take your business across BRICS & partner nations</h2>
          <p className="mt-3 text-white/70">
            Meet verified importers in Brazil, Russia, China, South Africa, UAE, Egypt and more. Get help with documentation, compliance,
            freight and trade finance.
          </p>
          <Button asChild className="mt-6 bg-saffron text-saffron-foreground hover:bg-saffron/90">
            <Link to="/brics">
              Explore international trade <ArrowRight />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {bricsCountries.map((c) => (
            <Link
              key={c.id}
              to={`/brics?country=${c.id}`}
              className="rounded-xl bg-white/5 p-3 ring-1 ring-white/10 transition hover:bg-white/10"
            >
              <div className="text-2xl">{c.flag}</div>
              <div className="mt-1 text-sm font-medium">{c.name}</div>
              <div className="text-[11px] text-white/50">{c.openRequests} open requests</div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

function Testimonials() {
  return (
    <section className="container-page py-14">
      <SectionHeading eyebrow="Customer stories" title="Trusted by buyers and suppliers across India" />
      <div className="grid gap-4 md:grid-cols-3">
        {testimonials.map((t) => (
          <figure key={t.name} className="flex flex-col rounded-xl border bg-card p-6">
            <Quote className="size-6 text-saffron" />
            <blockquote className="mt-3 flex-1 text-sm leading-relaxed">“{t.quote}”</blockquote>
            <figcaption className="mt-5 flex items-center gap-3">
              <SmartImage src={t.avatar} alt={t.name} className="size-10 rounded-full" />
              <div>
                <div className="text-sm font-semibold">{t.name}</div>
                <div className="text-xs text-muted-foreground">
                  {t.role} · {t.city}
                </div>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}

export default function Home() {
  const products = useApp((s) => s.products)
  const suppliers = useApp((s) => s.suppliers)
  const strip = useApp((s) => s.banners.find((b) => b.placement === "Homepage Strip" && b.active))
  const active = useMemo(() => products.filter((p) => p.status === "active"), [products])
  const featured = active.filter((p) => p.featured).slice(0, 8)
  const trending = active.filter((p) => p.trending).sort((a, b) => b.views - a.views).slice(0, 4)
  const latest = [...active].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4)
  const topSuppliers = suppliers.filter((s) => s.status === "active" && s.featured).slice(0, 4)

  return (
    <>
      <Hero />
      <Categories />
      <section className="container-page pb-14">
        <SectionHeading
          eyebrow="Hand-picked by our team"
          title="Featured products"
          action={
            <Button variant="ghost" asChild>
              <Link to="/products?sort=popular">
                View all <ArrowRight />
              </Link>
            </Button>
          }
        />
        <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
      <HowItWorks />
      <section className="container-page py-14">
        <SectionHeading
          eyebrow="Recommended companies"
          title="Featured suppliers"
          action={
            <Button variant="ghost" asChild>
              <Link to="/suppliers">
                All suppliers <ArrowRight />
              </Link>
            </Button>
          }
        />
        <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-4">
          {topSuppliers.map((s) => (
            <SupplierCard key={s.id} supplier={s} />
          ))}
        </div>
      </section>
      {strip && (
        <section className="container-page">
          <Link to={strip.link} className="group relative block overflow-hidden rounded-2xl">
            <SmartImage src={strip.image} alt="" className="h-44 w-full transition duration-700 group-hover:scale-[1.02] sm:h-40" />
            <div className="absolute inset-0 flex flex-col justify-center bg-gradient-to-r from-black/80 via-black/50 to-transparent p-6 text-white sm:p-10">
              <h3 className="text-xl font-semibold sm:text-2xl">{strip.title}</h3>
              <p className="mt-1 max-w-md text-sm text-white/80">{strip.subtitle}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-saffron">
                {strip.cta} <ArrowRight className="size-4" />
              </span>
            </div>
          </Link>
        </section>
      )}
      <section className="container-page grid gap-10 py-14 lg:grid-cols-2">
        <div>
          <SectionHeading eyebrow="Most enquired this week" title="Trending products" />
          <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2">
            {trending.map((p) => (
              <ProductCard key={p.id} product={p} compact />
            ))}
          </div>
        </div>
        <div>
          <SectionHeading eyebrow="Freshly listed" title="Latest products" />
          <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2">
            {latest.map((p) => (
              <ProductCard key={p.id} product={p} compact />
            ))}
          </div>
        </div>
      </section>
      <CtaPair />
      <Trust />
      <BricsTeaser />
      <Testimonials />
    </>
  )
}
