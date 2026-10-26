import { BadgeCheck, ChevronRight, MessageSquarePlus, PackageCheck, PackageSearch, SlidersHorizontal } from "lucide-react"
import { useMemo, type ReactNode } from "react"
import { Link } from "react-router-dom"
import { EmptyState } from "@/components/common/bits"
import {
  ActiveChips,
  CategoryTree,
  ChipGroup,
  FilterCard,
  FilterSection,
  OptionRow,
  PriceRange,
  SearchableOptions,
  SwitchRow,
  priceLabel,
  useUrlFilters,
} from "@/components/filters/FilterKit"
import { ProductCard } from "@/components/market/cards"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { useApp } from "@/store/app"
import type { BusinessType, Product, Supplier } from "@/types"

const businessTypes: BusinessType[] = ["Manufacturer", "Wholesaler", "Distributor", "Exporter", "Trader"]
const sorts = [
  ["relevance", "Best match"],
  ["popular", "Most enquired"],
  ["latest", "Newest first"],
  ["price-asc", "Price: low to high"],
  ["price-desc", "Price: high to low"],
] as const
const moqOptions = [
  ["10", "Up to 10 units"],
  ["100", "Up to 100 units"],
  ["500", "Up to 500 units"],
  ["1000", "Up to 1,000 units"],
] as const

type Facet = "category" | "sub" | "city" | "type" | "price" | "moq" | "verified" | "stock" | "q"

function useProductFilters() {
  const f = useUrlFilters()
  const products = useApp((s) => s.products)
  const suppliers = useApp((s) => s.suppliers)
  const state = {
    q: f.get("q").toLowerCase(),
    category: f.get("category"),
    sub: f.get("sub"),
    cities: f.list("city"),
    types: f.list("type"),
    min: Number(f.get("min")) || null,
    max: Number(f.get("max")) || null,
    moq: Number(f.get("moq")) || null,
    verified: f.get("verified") === "1",
    stock: f.get("stock") === "1",
  }

  const pool = useMemo(
    () =>
      products
        .filter((p) => p.status === "active")
        .map((p) => ({ p, s: suppliers.find((x) => x.id === p.supplierId) }))
        .filter((x): x is { p: Product; s: Supplier } => !!x.s && x.s.status === "active"),
    [products, suppliers],
  )

  const matches = ({ p, s }: { p: Product; s: Supplier }, skip?: Facet) => {
    if (skip !== "category" && skip !== "sub" && state.category && p.categoryId !== state.category) return false
    if (skip !== "sub" && skip !== "category" && state.sub && p.subId !== state.sub) return false
    if (skip !== "city" && state.cities.length && !state.cities.includes(p.location)) return false
    if (skip !== "type" && state.types.length && !state.types.includes(s.businessType)) return false
    if (skip !== "price" && ((state.min && p.priceMax < state.min) || (state.max && p.priceMin > state.max))) return false
    if (skip !== "moq" && state.moq && p.moq > state.moq) return false
    if (skip !== "verified" && state.verified && !s.verified) return false
    if (skip !== "stock" && state.stock && p.availableQty <= 0) return false
    if (skip !== "q" && state.q) {
      const hay = [p.name, p.brand, p.description, s.name, ...Object.values(p.specs)].join(" ").toLowerCase()
      if (!state.q.split(/\s+/).every((w) => hay.includes(w))) return false
    }
    return true
  }

  const count = (skip: Facet, pred: (x: { p: Product; s: Supplier }) => boolean) =>
    pool.filter((x) => matches(x, skip) && pred(x)).length

  return { f, state, pool, matches, count }
}

function ProductFilters() {
  const { f, state, pool, count } = useProductFilters()
  const categories = useApp((s) => s.categories)
  const catCounts = Object.fromEntries(categories.map((c) => [c.id, count("category", (x) => x.p.categoryId === c.id)]))
  const subCounts = Object.fromEntries(categories.flatMap((c) => c.subs.map((s) => [s.id, count("sub", (x) => x.p.subId === s.id)])))
  const locations = [...new Set(pool.map((x) => x.p.location))]
    .sort()
    .map((l) => ({ value: l, label: l, count: count("city", (x) => x.p.location === l) }))
    .sort((a, b) => b.count - a.count)
  const prices = pool.flatMap((x) => [x.p.priceMin, x.p.priceMax])
  const bounds: [number, number] = [Math.max(1, Math.min(...prices)), Math.max(...prices)]
  const active = activeCount(state)

  return (
    <FilterCard activeCount={active} onReset={() => f.reset(["q", "sort"])}>
      <FilterSection title="Category" badge={state.category ? 1 : 0}>
        <CategoryTree
          categories={categories}
          counts={catCounts}
          subCounts={subCounts}
          category={state.category}
          sub={state.sub}
          onSelect={(category, sub) => f.update({ category, sub })}
        />
      </FilterSection>
      <FilterSection title="Price per unit" badge={state.min || state.max ? 1 : 0} onClear={() => f.update({ min: null, max: null })}>
        <PriceRange
          bounds={bounds}
          value={[state.min, state.max]}
          onCommit={(min, max) => f.update({ min: min ? String(min) : null, max: max ? String(max) : null })}
        />
      </FilterSection>
      <FilterSection title="Supplier location" badge={state.cities.length} onClear={() => f.update({ city: null })}>
        <SearchableOptions options={locations} selected={state.cities} onToggle={(v) => f.toggleIn("city", v)} placeholder="Search city" />
      </FilterSection>
      <FilterSection title="Business type" badge={state.types.length} onClear={() => f.update({ type: null })}>
        <ChipGroup
          options={businessTypes.map((t) => ({ value: t, label: t, count: count("type", (x) => x.s.businessType === t) }))}
          selected={state.types}
          onToggle={(v) => f.toggleIn("type", v)}
        />
      </FilterSection>
      <FilterSection title="Minimum order" badge={state.moq ? 1 : 0} onClear={() => f.update({ moq: null })}>
        <div className="space-y-0.5" role="radiogroup">
          {moqOptions.map(([v, l]) => (
            <OptionRow
              key={v}
              radio
              label={l}
              count={count("moq", (x) => x.p.moq <= Number(v))}
              checked={String(state.moq ?? "") === v}
              onToggle={() => f.update({ moq: String(state.moq ?? "") === v ? null : v })}
            />
          ))}
        </div>
      </FilterSection>
      <FilterSection title="Trust & availability" badge={Number(state.verified) + Number(state.stock)}>
        <div className="space-y-2">
          <SwitchRow
            icon={<BadgeCheck className="size-4" />}
            title="Verified suppliers"
            hint="GST & KYC checked"
            checked={state.verified}
            onChange={(v) => f.update({ verified: v ? "1" : null })}
          />
          <SwitchRow
            icon={<PackageCheck className="size-4" />}
            title="Ready stock"
            hint="Available to dispatch"
            checked={state.stock}
            onChange={(v) => f.update({ stock: v ? "1" : null })}
          />
        </div>
      </FilterSection>
    </FilterCard>
  )
}

function activeCount(s: ReturnType<typeof useProductFilters>["state"]) {
  return (
    (s.category ? 1 : 0) +
    s.cities.length +
    s.types.length +
    (s.min || s.max ? 1 : 0) +
    (s.moq ? 1 : 0) +
    Number(s.verified) +
    Number(s.stock)
  )
}

export default function Products() {
  const { f, state, pool, matches } = useProductFilters()
  const categories = useApp((s) => s.categories)
  const sort = f.get("sort") || "relevance"

  const results = useMemo(() => {
    const list = pool.filter((x) => matches(x)).map((x) => x.p)
    const score = (p: Product) => (p.featured ? 3 : 0) + (p.trending ? 1 : 0) + p.rating + (state.q && p.name.toLowerCase().includes(state.q) ? 5 : 0)
    return list.sort((a, b) => {
      switch (sort) {
        case "latest":
          return b.createdAt.localeCompare(a.createdAt)
        case "popular":
          return b.enquiries - a.enquiries
        case "price-asc":
          return a.priceMin - b.priceMin
        case "price-desc":
          return b.priceMin - a.priceMin
        default:
          return score(b) - score(a)
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool, f.params.toString()])

  const category = categories.find((c) => c.id === state.category)
  const sub = category?.subs.find((s) => s.id === state.sub)
  const chips = [
    ...(f.get("q") ? [{ key: "q", label: `“${f.get("q")}”`, onRemove: () => f.update({ q: null }) }] : []),
    ...(category ? [{ key: "cat", label: sub ? sub.name : category.name, onRemove: () => f.update(sub ? { sub: null } : { category: null, sub: null }) }] : []),
    ...state.cities.map((c) => ({ key: `city-${c}`, label: c, onRemove: () => f.toggleIn("city", c) })),
    ...state.types.map((t) => ({ key: `type-${t}`, label: t, onRemove: () => f.toggleIn("type", t) })),
    ...(state.min || state.max ? [{ key: "price", label: priceLabel(state.min, state.max), onRemove: () => f.update({ min: null, max: null }) }] : []),
    ...(state.moq ? [{ key: "moq", label: `MOQ ≤ ${state.moq.toLocaleString("en-IN")}`, onRemove: () => f.update({ moq: null }) }] : []),
    ...(state.verified ? [{ key: "v", label: "Verified only", onRemove: () => f.update({ verified: null }) }] : []),
    ...(state.stock ? [{ key: "s", label: "Ready stock", onRemove: () => f.update({ stock: null }) }] : []),
  ]
  const active = activeCount(state)

  return (
    <div className="bg-surface">
      <div className="border-b bg-background">
        <div className="container-page py-7">
          <nav className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground">
              Home
            </Link>
            <ChevronRight className="size-3" />
            <Link to="/products" className="hover:text-foreground">
              Products
            </Link>
            {category && (
              <>
                <ChevronRight className="size-3" />
                <button type="button" onClick={() => f.update({ sub: null })} className="hover:text-foreground">
                  {category.name}
                </button>
              </>
            )}
            {sub && (
              <>
                <ChevronRight className="size-3" />
                <span className="text-foreground">{sub.name}</span>
              </>
            )}
          </nav>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-[2rem]">
            {f.get("q") ? `Results for “${f.get("q")}”` : sub ? sub.name : category ? category.name : "All products"}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {category?.tagline ?? "Compare prices, MOQ and verified suppliers across India."}
          </p>
          {category && category.subs.length > 0 && (
            <div className="scrollbar-none -mx-4 mt-5 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
              <SubPill active={!sub} onClick={() => f.update({ sub: null })}>
                All {category.name.split(" ")[0]}
              </SubPill>
              {category.subs.map((s) => (
                <SubPill key={s.id} active={sub?.id === s.id} onClick={() => f.update({ sub: s.id })}>
                  {s.name}
                </SubPill>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="container-page grid gap-6 py-6 lg:grid-cols-[290px_minmax(0,1fr)] lg:gap-8 lg:py-8">
        <aside className="hidden lg:block">
          <div className="scrollbar-none sticky top-36 max-h-[calc(100svh-10rem)] overflow-y-auto pb-6">
            <ProductFilters />
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
                  <SheetTitle>Filter products</SheetTitle>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto p-4">
                  <ProductFilters />
                </div>
                <SheetFooter className="border-t bg-background">
                  <SheetClose asChild>
                    <Button size="lg" className="w-full">
                      Show {results.length} products
                    </Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>
            <p className="order-last w-full text-sm text-muted-foreground sm:order-none sm:w-auto">
              <span className="font-semibold text-foreground">{results.length}</span> of {pool.length} products
            </p>
            <div className="ml-auto flex items-center gap-2">
              <span className="hidden text-sm text-muted-foreground sm:inline">Sort by</span>
              <Select value={sort} onValueChange={(v) => f.update({ sort: v === "relevance" ? null : v })}>
                <SelectTrigger className="w-40 sm:w-48">
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

          <ActiveChips chips={chips} onClearAll={() => f.reset(["sort"])} />

          {results.length === 0 ? (
            <EmptyState
              icon={PackageSearch}
              className="bg-card"
              title="No products match your filters"
              body="Try removing a filter — or post your requirement and let verified suppliers come to you with quotes."
              action={
                <div className="flex flex-wrap justify-center gap-2">
                  <Button variant="outline" onClick={() => f.reset(["sort"])}>
                    Clear filters
                  </Button>
                  <Button asChild>
                    <Link to="/post-requirement">
                      <MessageSquarePlus /> Post requirement
                    </Link>
                  </Button>
                </div>
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 min-[520px]:grid-cols-2 xl:grid-cols-3">
              {results.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          {results.length > 0 && (
            <div className="mt-6 flex flex-col items-center gap-4 rounded-2xl border bg-card p-6 text-center shadow-sm sm:flex-row sm:text-left">
              <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-saffron/15 text-amber-700">
                <MessageSquarePlus className="size-6" />
              </span>
              <div className="flex-1">
                <h3 className="font-semibold">Didn't find exactly what you need?</h3>
                <p className="text-sm text-muted-foreground">Post one requirement and get quotes from up to 3 matched suppliers.</p>
              </div>
              <Button asChild size="lg">
                <Link to="/post-requirement">Post requirement</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function SubPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-9 shrink-0 rounded-full border px-4 text-[13px] font-medium transition-colors",
        active ? "border-brand bg-brand text-white shadow-sm" : "bg-background text-foreground/75 hover:border-primary/40 hover:text-primary",
      )}
    >
      {children}
    </button>
  )
}
