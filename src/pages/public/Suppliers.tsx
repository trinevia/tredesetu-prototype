import { BadgeCheck, Building2, ChevronRight, Globe2, PackageCheck, Search, ShieldCheck, SlidersHorizontal } from "lucide-react"
import { useMemo, useState, type FormEvent } from "react"
import { Link } from "react-router-dom"
import { EmptyState } from "@/components/common/bits"
import {
  ActiveChips,
  CategoryTree,
  ChipGroup,
  FilterCard,
  FilterSection,
  OptionRow,
  SearchableOptions,
  SwitchRow,
  useUrlFilters,
} from "@/components/filters/FilterKit"
import { SupplierCard } from "@/components/market/cards"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useApp } from "@/store/app"
import type { BusinessType, Supplier } from "@/types"

const businessTypes: BusinessType[] = ["Manufacturer", "Wholesaler", "Distributor", "Exporter", "Trader"]
const sorts = [
  ["relevance", "Best match"],
  ["featured", "Featured first"],
  ["popular", "Top rated"],
  ["latest", "Newest"],
  ["location", "Location (A–Z)"],
] as const

type Facet = "category" | "city" | "type" | "rating" | "verified" | "seal" | "brics" | "stock" | "q"

function useSupplierFilters() {
  const f = useUrlFilters()
  const suppliers = useApp((s) => s.suppliers)
  const products = useApp((s) => s.products)
  const state = {
    q: f.get("q").toLowerCase(),
    category: f.get("category"),
    cities: f.list("city"),
    types: f.list("type"),
    rating: Number(f.get("rating")) || null,
    verified: f.get("verified") === "1",
    seal: f.get("seal") === "1",
    brics: f.get("brics") === "1",
    stock: f.get("instock") === "1",
  }
  const pool = useMemo(() => suppliers.filter((s) => s.status === "active"), [suppliers])

  const matches = (s: Supplier, skip?: Facet) => {
    if (skip !== "category" && state.category && !s.categoryIds.includes(state.category)) return false
    if (skip !== "city" && state.cities.length && !state.cities.includes(s.city)) return false
    if (skip !== "type" && state.types.length && !state.types.includes(s.businessType)) return false
    if (skip !== "rating" && state.rating && s.rating < state.rating) return false
    if (skip !== "verified" && state.verified && !s.verified) return false
    if (skip !== "seal" && state.seal && !s.trustSeal) return false
    if (skip !== "brics" && state.brics && !s.bricsReady) return false
    if (skip !== "stock" && state.stock && !products.some((p) => p.supplierId === s.id && p.status === "active" && p.availableQty > 0)) return false
    if (skip !== "q" && state.q) {
      const own = products.filter((p) => p.supplierId === s.id).map((p) => p.name)
      const hay = [s.name, s.tagline, s.city, s.state, ...s.capabilities, ...own].join(" ").toLowerCase()
      if (!hay.includes(state.q)) return false
    }
    return true
  }
  const count = (skip: Facet, pred: (s: Supplier) => boolean) => pool.filter((s) => matches(s, skip) && pred(s)).length
  return { f, state, pool, matches, count }
}

function activeCount(s: ReturnType<typeof useSupplierFilters>["state"]) {
  return (
    (s.category ? 1 : 0) + s.cities.length + s.types.length + (s.rating ? 1 : 0) + Number(s.verified) + Number(s.seal) + Number(s.brics) + Number(s.stock)
  )
}

function SupplierFilters() {
  const { f, state, pool, count } = useSupplierFilters()
  const categories = useApp((s) => s.categories)
  const catCounts = Object.fromEntries(categories.map((c) => [c.id, count("category", (s) => s.categoryIds.includes(c.id))]))
  const locations = [...new Set(pool.map((s) => s.city))]
    .map((c) => ({ value: c, label: c, count: count("city", (s) => s.city === c) }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))

  return (
    <FilterCard activeCount={activeCount(state)} onReset={() => f.reset(["q", "sort"])}>
      <FilterSection title="Category" badge={state.category ? 1 : 0}>
        <CategoryTree
          categories={categories.map((c) => ({ ...c, subs: [] }))}
          counts={catCounts}
          subCounts={{}}
          category={state.category}
          sub=""
          onSelect={(category) => f.update({ category })}
        />
      </FilterSection>
      <FilterSection title="Location" badge={state.cities.length} onClear={() => f.update({ city: null })}>
        <SearchableOptions options={locations} selected={state.cities} onToggle={(v) => f.toggleIn("city", v)} placeholder="Search city" />
      </FilterSection>
      <FilterSection title="Business type" badge={state.types.length} onClear={() => f.update({ type: null })}>
        <ChipGroup
          options={businessTypes.map((t) => ({ value: t, label: t, count: count("type", (s) => s.businessType === t) }))}
          selected={state.types}
          onToggle={(v) => f.toggleIn("type", v)}
        />
      </FilterSection>
      <FilterSection title="Buyer rating" badge={state.rating ? 1 : 0} onClear={() => f.update({ rating: null })}>
        <div className="space-y-0.5" role="radiogroup">
          {["4.5", "4", "3.5"].map((r) => (
            <OptionRow
              key={r}
              radio
              label={`${r} ★ & above`}
              count={count("rating", (s) => s.rating >= Number(r))}
              checked={String(state.rating ?? "") === r}
              onToggle={() => f.update({ rating: String(state.rating ?? "") === r ? null : r })}
            />
          ))}
        </div>
      </FilterSection>
      <FilterSection title="Trust & capability" badge={Number(state.verified) + Number(state.seal) + Number(state.brics) + Number(state.stock)}>
        <div className="space-y-2">
          <SwitchRow icon={<BadgeCheck className="size-4" />} title="GST verified" hint="KYC & GST checked" checked={state.verified} onChange={(v) => f.update({ verified: v ? "1" : null })} />
          <SwitchRow icon={<ShieldCheck className="size-4" />} title="Trust Seal" hint="Physically verified" checked={state.seal} onChange={(v) => f.update({ seal: v ? "1" : null })} />
          <SwitchRow icon={<Globe2 className="size-4" />} title="BRICS export-ready" hint="Ships internationally" checked={state.brics} onChange={(v) => f.update({ brics: v ? "1" : null })} />
          <SwitchRow icon={<PackageCheck className="size-4" />} title="Products in stock" checked={state.stock} onChange={(v) => f.update({ instock: v ? "1" : null })} />
        </div>
      </FilterSection>
    </FilterCard>
  )
}

export default function Suppliers() {
  const { f, state, pool, matches } = useSupplierFilters()
  const categories = useApp((s) => s.categories)
  const [q, setQ] = useState(f.get("q"))
  const sort = f.get("sort") || "relevance"

  const results = useMemo(() => {
    const list = pool.filter((s) => matches(s))
    return list.sort((a, b) => {
      switch (sort) {
        case "latest":
          return b.joinedAt.localeCompare(a.joinedAt)
        case "popular":
          return b.rating * b.reviews - a.rating * a.reviews
        case "featured":
          return Number(b.featured) - Number(a.featured) || b.rating - a.rating
        case "location":
          return a.city.localeCompare(b.city)
        default:
          return (b.trustSeal ? 2 : 0) + (b.verified ? 1 : 0) + b.rating - ((a.trustSeal ? 2 : 0) + (a.verified ? 1 : 0) + a.rating)
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool, f.params.toString()])

  const submit = (e: FormEvent) => {
    e.preventDefault()
    f.update({ q: q.trim() || null })
  }

  const category = categories.find((c) => c.id === state.category)
  const chips = [
    ...(f.get("q") ? [{ key: "q", label: `“${f.get("q")}”`, onRemove: () => (setQ(""), f.update({ q: null })) }] : []),
    ...(category ? [{ key: "cat", label: category.name, onRemove: () => f.update({ category: null }) }] : []),
    ...state.cities.map((c) => ({ key: `c-${c}`, label: c, onRemove: () => f.toggleIn("city", c) })),
    ...state.types.map((t) => ({ key: `t-${t}`, label: t, onRemove: () => f.toggleIn("type", t) })),
    ...(state.rating ? [{ key: "r", label: `${state.rating}★ & above`, onRemove: () => f.update({ rating: null }) }] : []),
    ...(state.verified ? [{ key: "v", label: "GST verified", onRemove: () => f.update({ verified: null }) }] : []),
    ...(state.seal ? [{ key: "s", label: "Trust Seal", onRemove: () => f.update({ seal: null }) }] : []),
    ...(state.brics ? [{ key: "b", label: "BRICS export-ready", onRemove: () => f.update({ brics: null }) }] : []),
    ...(state.stock ? [{ key: "st", label: "In stock", onRemove: () => f.update({ instock: null }) }] : []),
  ]
  const active = activeCount(state)
  const title = state.cities.length === 1 ? `Verified suppliers in ${state.cities[0]}` : category ? `${category.name} suppliers` : "Find verified suppliers"

  return (
    <div className="bg-surface">
      <div className="border-b bg-background">
        <div className="container-page py-7">
          <nav className="flex items-center gap-1 text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground">
              Home
            </Link>
            <ChevronRight className="size-3" />
            <span className="text-foreground">Suppliers</span>
          </nav>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-[2rem]">{title}</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Manufacturers, wholesalers, distributors and exporters — ranked by trust and responsiveness.
          </p>
          <form onSubmit={submit} className="mt-5 flex max-w-2xl gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Company name, product or city…" className="h-11 pl-10" />
            </div>
            <Button type="submit" size="lg">
              Search
            </Button>
          </form>
        </div>
      </div>

      <div className="container-page grid gap-6 py-6 lg:grid-cols-[290px_minmax(0,1fr)] lg:gap-8 lg:py-8">
        <aside className="hidden lg:block">
          <div className="scrollbar-none sticky top-36 max-h-[calc(100svh-10rem)] overflow-y-auto pb-6">
            <SupplierFilters />
          </div>
        </aside>
        <div className="min-w-0 space-y-4">
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border bg-card px-4 py-3 shadow-sm">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden">
                  <SlidersHorizontal /> Filters
                  {active > 0 && (
                    <span className="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1.5 text-[11px] text-primary-foreground">{active}</span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[22rem] max-w-[92vw] gap-0 bg-surface p-0">
                <SheetHeader className="border-b bg-background">
                  <SheetTitle>Filter suppliers</SheetTitle>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto p-4">
                  <SupplierFilters />
                </div>
                <SheetFooter className="border-t bg-background">
                  <SheetClose asChild>
                    <Button size="lg" className="w-full">
                      Show {results.length} suppliers
                    </Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>
            <p className="order-last w-full text-sm text-muted-foreground sm:order-none sm:w-auto">
              <span className="font-semibold text-foreground">{results.length}</span> of {pool.length} suppliers
            </p>
            <div className="ml-auto flex items-center gap-2">
              <span className="hidden text-sm text-muted-foreground sm:inline">Sort by</span>
              <Select value={sort} onValueChange={(v) => f.update({ sort: v === "relevance" ? null : v })}>
                <SelectTrigger className="w-40 sm:w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align="end">
                  {sorts.map(([v, l]) => (
                    <SelectItem key={v} value={v}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <ActiveChips
            chips={chips}
            onClearAll={() => {
              setQ("")
              f.reset(["sort"])
            }}
          />
          {results.length === 0 ? (
            <EmptyState
              icon={Building2}
              className="bg-card"
              title="No suppliers found"
              body="Try a broader search — or post a requirement and we'll match you with suppliers."
              action={
                <Button asChild>
                  <Link to="/post-requirement">Post requirement</Link>
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 min-[520px]:grid-cols-2 xl:grid-cols-3">
              {results.map((s) => (
                <SupplierCard key={s.id} supplier={s} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
