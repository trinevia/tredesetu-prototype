import { ChevronRight, CornerDownRight, FolderPlus, Plus, Tag, X } from "lucide-react"
import { useState, type FormEvent } from "react"
import { toast } from "sonner"
import { DynamicIcon, PageHeader, SmartImage } from "@/components/common/bits"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useApp } from "@/store/app"

function InlineAdd({ placeholder, onAdd, className }: { placeholder: string; onAdd: (name: string) => void; className?: string }) {
  const [v, setV] = useState("")
  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!v.trim()) return
    onAdd(v.trim())
    setV("")
  }
  return (
    <form onSubmit={submit} className={cn("flex gap-2", className)}>
      <Input value={v} onChange={(e) => setV(e.target.value)} placeholder={placeholder} className="h-8" />
      <Button type="submit" size="sm" variant="outline" disabled={!v.trim()}>
        <Plus /> Add
      </Button>
    </form>
  )
}

function Chips({ items, onChange, placeholder }: { items: string[]; onChange: (v: string[]) => void; placeholder: string }) {
  const [v, setV] = useState("")
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {items.map((i) => (
        <Badge key={i} variant="secondary" className="gap-1 pr-1">
          {i}
          <button type="button" aria-label={`Remove ${i}`} onClick={() => onChange(items.filter((x) => x !== i))} className="rounded-full hover:bg-foreground/10">
            <X className="size-3" />
          </button>
        </Badge>
      ))}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (v.trim() && !items.includes(v.trim())) onChange([...items, v.trim()])
          setV("")
        }}
      >
        <Input value={v} onChange={(e) => setV(e.target.value)} placeholder={placeholder} className="h-6 w-28 text-xs" />
      </form>
    </div>
  )
}

export default function AdminCategories() {
  const categories = useApp((s) => s.categories)
  const products = useApp((s) => s.products)
  const addCategory = useApp((s) => s.addCategory)
  const addSub = useApp((s) => s.addSubCategory)
  const addChild = useApp((s) => s.addChildCategory)
  const [selected, setSelected] = useState(categories[0]?.id)
  const [openSubs, setOpenSubs] = useState<Record<string, boolean>>({})
  const [attrs, setAttrs] = useState<Record<string, { attributes: string[]; units: string[] }>>({})

  const cat = categories.find((c) => c.id === selected) ?? categories[0]
  const meta = cat ? attrs[cat.id] ?? { attributes: cat.attributes, units: cat.units } : { attributes: [], units: [] }
  const countFor = (pred: (p: (typeof products)[number]) => boolean) => products.filter(pred).length

  return (
    <>
      <PageHeader
        title="Categories & attributes"
        description="Three-level taxonomy (main → sub → child) with attributes, units and specification templates."
      />
      <div className="grid gap-6 lg:grid-cols-[20rem_1fr]">
        <Card className="h-fit gap-0 p-0">
          <div className="border-b px-4 py-3">
            <h3 className="font-semibold">Main categories</h3>
            <p className="text-xs text-muted-foreground">{categories.length} categories</p>
          </div>
          <ul className="max-h-[32rem] divide-y overflow-y-auto">
            {categories.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => setSelected(c.id)}
                  className={cn("flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-muted/60", c.id === cat?.id && "bg-primary/5")}
                >
                  <span className={cn("grid size-8 place-items-center rounded-lg bg-muted text-muted-foreground", c.id === cat?.id && "bg-primary/10 text-primary")}>
                    <DynamicIcon name={c.icon} className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{c.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {c.subs.length} sub · {countFor((p) => p.categoryId === c.id)} products
                    </span>
                  </span>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </button>
              </li>
            ))}
          </ul>
          <div className="border-t p-3">
            <InlineAdd
              placeholder="New main category"
              onAdd={(n) => {
                addCategory(n)
                toast.success(`Category “${n}” created`)
              }}
            />
          </div>
        </Card>

        {cat && (
          <div className="min-w-0 space-y-6">
            <Card className="gap-0 overflow-hidden p-0">
              <div className="flex items-center gap-4 p-4">
                <SmartImage src={cat.image} alt="" className="size-16 shrink-0 rounded-xl" />
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold">{cat.name}</h2>
                  <p className="text-sm text-muted-foreground">{cat.tagline}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    URL: <span className="font-mono">/products?category={cat.id}</span>
                  </p>
                </div>
              </div>
              <div className="grid gap-4 border-t bg-muted/30 p-4 md:grid-cols-2">
                <div>
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <Tag className="size-3" /> Product attributes
                  </p>
                  <Chips
                    items={meta.attributes}
                    placeholder="+ attribute"
                    onChange={(v) => setAttrs((a) => ({ ...a, [cat.id]: { ...meta, attributes: v } }))}
                  />
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Units</p>
                  <Chips items={meta.units} placeholder="+ unit" onChange={(v) => setAttrs((a) => ({ ...a, [cat.id]: { ...meta, units: v } }))} />
                </div>
              </div>
            </Card>

            <Card className="gap-0 p-0">
              <div className="flex items-center justify-between border-b px-4 py-3">
                <div>
                  <h3 className="font-semibold">Sub & child categories</h3>
                  <p className="text-xs text-muted-foreground">e.g. Electronics → Mobile Accessories → Chargers</p>
                </div>
              </div>
              <div className="divide-y">
                {cat.subs.length === 0 && <p className="px-4 py-8 text-center text-sm text-muted-foreground">No sub-categories yet. Add the first one below.</p>}
                {cat.subs.map((s) => {
                  const isOpen = openSubs[s.id] ?? true
                  return (
                    <div key={s.id} className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setOpenSubs((o) => ({ ...o, [s.id]: !isOpen }))}
                        className="flex w-full items-center gap-2 text-left"
                      >
                        <ChevronRight className={cn("size-4 text-muted-foreground transition", isOpen && "rotate-90")} />
                        <FolderPlus className="size-4 text-primary" />
                        <span className="flex-1 text-sm font-medium">{s.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {s.children.length} child · {countFor((p) => p.subId === s.id)} products
                        </span>
                      </button>
                      {isOpen && (
                        <div className="ml-6 mt-2 space-y-1.5 border-l pl-4">
                          {s.children.map((ch) => (
                            <div key={ch.id} className="flex items-center gap-2 text-sm">
                              <CornerDownRight className="size-3.5 text-muted-foreground" />
                              <span className="flex-1">{ch.name}</span>
                              <span className="text-xs text-muted-foreground">{countFor((p) => p.childId === ch.id)} products</span>
                            </div>
                          ))}
                          <InlineAdd
                            className="max-w-sm pt-1"
                            placeholder={`Add child under ${s.name}`}
                            onAdd={(n) => {
                              addChild(cat.id, s.id, n)
                              toast.success(`“${n}” added under ${s.name}`)
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
              <div className="border-t p-4">
                <InlineAdd
                  className="max-w-md"
                  placeholder={`New sub-category in ${cat.name}`}
                  onAdd={(n) => {
                    addSub(cat.id, n)
                    toast.success(`Sub-category “${n}” created`)
                  }}
                />
              </div>
            </Card>
          </div>
        )}
      </div>
    </>
  )
}
