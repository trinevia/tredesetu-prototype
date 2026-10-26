import { Check, ChevronDown, RotateCcw, Search, X } from "lucide-react"
import { useEffect, useState, type ReactNode } from "react"
import { useSearchParams } from "react-router-dom"
import { DynamicIcon } from "@/components/common/bits"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { inrCompact } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Category } from "@/types"

/** URL-backed filter state shared by the listing pages. */
export function useUrlFilters() {
  const [params, setParams] = useSearchParams()
  const get = (k: string) => params.get(k) ?? ""
  const list = (k: string) => get(k).split(",").filter(Boolean)
  const update = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params)
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v)
      else next.delete(k)
    }
    setParams(next, { replace: true })
  }
  const toggleIn = (k: string, value: string) => {
    const cur = list(k)
    const next = cur.includes(value) ? cur.filter((x) => x !== value) : [...cur, value]
    update({ [k]: next.join(",") || null })
  }
  const reset = (keep: string[] = []) => {
    const next = new URLSearchParams()
    for (const k of keep) if (params.get(k)) next.set(k, params.get(k)!)
    setParams(next, { replace: true })
  }
  return { params, get, list, update, toggleIn, reset }
}

export function FilterCard({
  activeCount,
  onReset,
  children,
  className,
}: {
  activeCount: number
  onReset: () => void
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn("overflow-hidden rounded-2xl border bg-card shadow-sm", className)}>
      <div className="flex items-center justify-between border-b px-5 py-4">
        <div className="flex items-center gap-2">
          <h3 className="text-[15px] font-semibold">Filters</h3>
          {activeCount > 0 && (
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground">
              {activeCount}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onReset}
          disabled={activeCount === 0}
          className="inline-flex items-center gap-1 text-xs font-medium text-primary transition hover:text-primary/80 disabled:pointer-events-none disabled:text-muted-foreground/60"
        >
          <RotateCcw className="size-3" /> Reset all
        </button>
      </div>
      <div className="divide-y">{children}</div>
    </div>
  )
}

export function FilterSection({
  title,
  badge,
  defaultOpen = true,
  onClear,
  children,
}: {
  title: string
  badge?: number
  defaultOpen?: boolean
  onClear?: () => void
  children: ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <section className="px-5 py-4">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex flex-1 items-center gap-2 text-left text-[13px] font-semibold uppercase tracking-wide text-foreground/80"
          aria-expanded={open}
        >
          {title}
          {!!badge && <span className="rounded-full bg-primary/10 px-1.5 py-px text-[11px] font-semibold normal-case text-primary">{badge}</span>}
          <ChevronDown className={cn("ml-auto size-4 text-muted-foreground transition-transform", !open && "-rotate-90")} />
        </button>
        {onClear && !!badge && (
          <button type="button" onClick={onClear} className="text-xs text-muted-foreground hover:text-foreground">
            Clear
          </button>
        )}
      </div>
      {open && <div className="mt-3">{children}</div>}
    </section>
  )
}

/** Checkbox-style option row with a facet count. */
export function OptionRow({
  label,
  count,
  checked,
  onToggle,
  radio = false,
  icon,
}: {
  label: string
  count?: number
  checked: boolean
  onToggle: () => void
  radio?: boolean
  icon?: ReactNode
}) {
  const disabled = count === 0 && !checked
  return (
    <button
      type="button"
      role={radio ? "radio" : "checkbox"}
      aria-checked={checked}
      onClick={onToggle}
      disabled={disabled}
      className={cn(
        "group flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm transition-colors hover:bg-muted/70 disabled:cursor-not-allowed disabled:opacity-45",
        checked && "bg-primary/[0.06]",
      )}
    >
      <span
        className={cn(
          "grid size-[18px] shrink-0 place-items-center border bg-background shadow-xs transition-colors",
          radio ? "rounded-full" : "rounded-[5px]",
          checked ? "border-primary bg-primary text-primary-foreground" : "border-input group-hover:border-foreground/30",
        )}
      >
        {checked && (radio ? <span className="size-1.5 rounded-full bg-white" /> : <Check className="size-3" strokeWidth={3} />)}
      </span>
      {icon}
      <span className={cn("min-w-0 flex-1 truncate", checked ? "font-medium text-foreground" : "text-foreground/85")}>{label}</span>
      {count !== undefined && <span className="text-xs tabular-nums text-muted-foreground">{count}</span>}
    </button>
  )
}

export function CategoryTree({
  categories,
  counts,
  subCounts,
  category,
  sub,
  onSelect,
}: {
  categories: Category[]
  counts: Record<string, number>
  subCounts: Record<string, number>
  category: string
  sub: string
  onSelect: (category: string | null, sub: string | null) => void
}) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0)
  return (
    <div className="space-y-0.5">
      <TreeRow label="All categories" count={total} active={!category} onClick={() => onSelect(null, null)} />
      {categories.map((c) => {
        const open = category === c.id
        return (
          <div key={c.id}>
            <TreeRow
              label={c.name}
              count={counts[c.id] ?? 0}
              active={open && !sub}
              expanded={open}
              hasChildren={c.subs.length > 0}
              icon={<DynamicIcon name={c.icon} className="size-4" />}
              onClick={() => onSelect(open && !sub ? null : c.id, null)}
            />
            {open && c.subs.length > 0 && (
              <div className="relative mb-1 ml-[1.15rem] mt-0.5 space-y-0.5 border-l border-dashed pl-3">
                {c.subs.map((s) => (
                  <TreeRow
                    key={s.id}
                    small
                    label={s.name}
                    count={subCounts[s.id] ?? 0}
                    active={sub === s.id}
                    onClick={() => onSelect(c.id, sub === s.id ? null : s.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function TreeRow({
  label,
  count,
  active,
  expanded,
  hasChildren,
  icon,
  small,
  onClick,
}: {
  label: string
  count: number
  active: boolean
  expanded?: boolean
  hasChildren?: boolean
  icon?: ReactNode
  small?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex w-full items-center gap-2.5 rounded-lg px-2 text-left transition-colors",
        small ? "py-1.5 text-[13px]" : "py-2 text-sm",
        active ? "bg-primary text-primary-foreground shadow-sm" : expanded ? "bg-muted/70 font-medium" : "text-foreground/85 hover:bg-muted/70",
      )}
    >
      {icon && (
        <span
          className={cn(
            "grid size-6 shrink-0 place-items-center rounded-md transition-colors [&_svg]:size-3.5",
            active ? "bg-white/15 text-white" : "bg-primary/8 text-primary group-hover:bg-primary/12",
          )}
        >
          {icon}
        </span>
      )}
      <span className={cn("min-w-0 flex-1 leading-snug", active && "font-medium")}>{label}</span>
      <span
        className={cn(
          "rounded-full px-1.5 text-[11px] font-medium tabular-nums",
          active ? "bg-white/20 text-white" : "bg-muted text-muted-foreground",
        )}
      >
        {count}
      </span>
      {hasChildren && (
        <ChevronDown className={cn("size-3.5 shrink-0 opacity-60 transition-transform", !expanded && "-rotate-90")} />
      )}
    </button>
  )
}

/** Searchable checklist that collapses long lists behind “Show more”. */
export function SearchableOptions({
  options,
  selected,
  onToggle,
  placeholder = "Search…",
  initial = 6,
}: {
  options: { value: string; label: string; count: number }[]
  selected: string[]
  onToggle: (value: string) => void
  placeholder?: string
  initial?: number
}) {
  const [term, setTerm] = useState("")
  const [all, setAll] = useState(false)
  const filtered = options.filter((o) => o.label.toLowerCase().includes(term.toLowerCase()))
  const shown = all || term ? filtered : filtered.slice(0, initial)
  return (
    <div className="space-y-2">
      {options.length > initial && (
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input value={term} onChange={(e) => setTerm(e.target.value)} placeholder={placeholder} className="h-9 pl-8 text-sm" />
        </div>
      )}
      <div className="space-y-0.5">
        {shown.map((o) => (
          <OptionRow key={o.value} label={o.label} count={o.count} checked={selected.includes(o.value)} onToggle={() => onToggle(o.value)} />
        ))}
        {shown.length === 0 && <p className="px-2 py-2 text-xs text-muted-foreground">No matches</p>}
      </div>
      {!term && filtered.length > initial && (
        <button type="button" onClick={() => setAll((a) => !a)} className="px-2 text-xs font-medium text-primary hover:underline">
          {all ? "Show less" : `Show ${filtered.length - initial} more`}
        </button>
      )}
    </div>
  )
}

/** Dual-thumb price slider with editable ₹ inputs; commits on release / blur. */
export function PriceRange({
  bounds,
  value,
  onCommit,
}: {
  bounds: [number, number]
  value: [number | null, number | null]
  onCommit: (min: number | null, max: number | null) => void
}) {
  const [lo, hi] = bounds
  const current: [number, number] = [value[0] ?? lo, value[1] ?? hi]
  const [draft, setDraft] = useState<[number, number]>(current)
  const key = `${value[0]}-${value[1]}-${lo}-${hi}`
  useEffect(() => {
    setDraft([value[0] ?? lo, value[1] ?? hi])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  // Log scale so ₹9 boxes and ₹24 lakh machines share one slider.
  const toPos = (v: number) => (Math.log10(Math.max(v, 1)) - Math.log10(Math.max(lo, 1))) / (Math.log10(hi) - Math.log10(Math.max(lo, 1))) * 100
  const fromPos = (p: number) => {
    const v = 10 ** (Math.log10(Math.max(lo, 1)) + (p / 100) * (Math.log10(hi) - Math.log10(Math.max(lo, 1))))
    return v < 100 ? Math.round(v) : v < 10000 ? Math.round(v / 10) * 10 : Math.round(v / 1000) * 1000
  }
  const commit = (d: [number, number]) => onCommit(d[0] <= lo ? null : d[0], d[1] >= hi ? null : d[1])

  const presets: [string, number | null, number | null][] = [
    ["Under ₹500", null, 500],
    ["₹500 – ₹5K", 500, 5000],
    ["₹5K – ₹1L", 5000, 100000],
    ["₹1L+", 100000, null],
  ]

  return (
    <div className="space-y-4">
      <Slider
        min={0}
        max={100}
        step={0.5}
        value={[toPos(draft[0]), toPos(draft[1])]}
        onValueChange={([a, b]) => setDraft([fromPos(a), fromPos(b)])}
        onValueCommit={([a, b]) => commit([fromPos(a), fromPos(b)])}
        className="px-1"
      />
      <div className="flex items-center gap-2">
        <PriceInput label="Min" value={draft[0]} onChange={(v) => setDraft([v, draft[1]])} onBlur={() => commit(draft)} />
        <span className="h-px w-3 shrink-0 bg-border" />
        <PriceInput label="Max" value={draft[1]} onChange={(v) => setDraft([draft[0], v])} onBlur={() => commit(draft)} />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {presets.map(([label, a, b]) => {
          const active = value[0] === a && value[1] === b
          return (
            <button
              key={label}
              type="button"
              onClick={() => onCommit(active ? null : a, active ? null : b)}
              className={cn(
                "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                active ? "border-primary bg-primary text-primary-foreground" : "bg-background text-foreground/75 hover:border-primary/40 hover:text-primary",
              )}
            >
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function PriceInput({ label, value, onChange, onBlur }: { label: string; value: number; onChange: (v: number) => void; onBlur: () => void }) {
  return (
    <label className="flex h-10 min-w-0 flex-1 items-center gap-1 rounded-lg border bg-background px-3 shadow-xs transition focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/30">
      <span className="text-[11px] font-medium uppercase text-muted-foreground">{label}</span>
      <span className="ml-auto text-sm text-muted-foreground">₹</span>
      <input
        inputMode="numeric"
        value={value.toLocaleString("en-IN")}
        onChange={(e) => onChange(Number(e.target.value.replace(/\D/g, "")) || 0)}
        onBlur={onBlur}
        onKeyDown={(e) => e.key === "Enter" && onBlur()}
        className="w-full min-w-0 bg-transparent text-right text-sm font-medium tabular-nums outline-none"
        aria-label={`${label} price`}
      />
    </label>
  )
}

export function ChipGroup({
  options,
  selected,
  onToggle,
}: {
  options: { value: string; label: string; count?: number }[]
  selected: string[]
  onToggle: (value: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = selected.includes(o.value)
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={active}
            onClick={() => onToggle(o.value)}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[13px] font-medium transition-colors",
              active
                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                : "bg-background text-foreground/80 hover:border-primary/40 hover:text-primary",
            )}
          >
            {active && <Check className="size-3.5" strokeWidth={3} />}
            {o.label}
            {o.count !== undefined && <span className={cn("text-[11px]", active ? "text-white/75" : "text-muted-foreground")}>{o.count}</span>}
          </button>
        )
      })}
    </div>
  )
}

export function SwitchRow({
  icon,
  title,
  hint,
  checked,
  onChange,
}: {
  icon: ReactNode
  title: string
  hint?: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors",
        checked ? "border-primary/30 bg-primary/[0.04]" : "hover:bg-muted/50",
      )}
    >
      <span className={cn("grid size-9 shrink-0 place-items-center rounded-lg", checked ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium">{title}</span>
        {hint && <span className="block text-xs text-muted-foreground">{hint}</span>}
      </span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </label>
  )
}

export function ActiveChips({
  chips,
  onClearAll,
}: {
  chips: { key: string; label: string; onRemove: () => void }[]
  onClearAll: () => void
}) {
  if (chips.length === 0) return null
  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((c) => (
        <span
          key={c.key}
          className="inline-flex h-8 items-center gap-1.5 rounded-full border border-primary/20 bg-primary/[0.06] pl-3 pr-1 text-[13px] font-medium text-primary"
        >
          {c.label}
          <button
            type="button"
            onClick={c.onRemove}
            aria-label={`Remove ${c.label}`}
            className="grid size-6 place-items-center rounded-full transition hover:bg-primary/15"
          >
            <X className="size-3.5" />
          </button>
        </span>
      ))}
      <button type="button" onClick={onClearAll} className="ml-1 text-[13px] font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
        Clear all
      </button>
    </div>
  )
}

export const priceLabel = (min: number | null, max: number | null) =>
  min && max ? `${inrCompact(min)} – ${inrCompact(max)}` : min ? `Above ${inrCompact(min)}` : max ? `Under ${inrCompact(max)}` : ""
