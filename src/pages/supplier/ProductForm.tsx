import { ArrowDown, ArrowLeft, ArrowUp, FileUp, ImagePlus, Loader2, Plus, Send, Star, Trash2, Upload, X } from "lucide-react"
import { useRef, useState, type ReactNode } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"
import { EmptyState, PageHeader, SimulatedNote, SmartImage, StatusBadge } from "@/components/common/bits"
import { Field } from "@/components/market/EnquiryDialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { num, priceRange } from "@/lib/format"
import { img, type ImageKey } from "@/lib/images"
import { cn } from "@/lib/utils"
import { DEMO_SUPPLIER_ID, useApp } from "@/store/app"
import type { Product } from "@/types"

const presetImages: ImageKey[] = ["charger", "powerBank", "headphones", "speaker", "smartwatch", "phone", "laptop", "smartLock", "kraftBox", "steelBottle"]

const blank = (): Product => ({
  id: `p-${Date.now().toString(36)}`,
  name: "",
  supplierId: DEMO_SUPPLIER_ID,
  categoryId: "electronics",
  subId: "",
  childId: undefined,
  images: [],
  description: "",
  specs: {},
  brand: "Volta",
  model: "",
  moq: 100,
  unit: "Piece",
  priceMin: 0,
  priceMax: 0,
  availableQty: 0,
  variants: [],
  packaging: "",
  delivery: "",
  location: "Delhi",
  gstPct: 18,
  documents: [],
  status: "draft",
  featured: false,
  trending: false,
  views: 0,
  enquiries: 0,
  rating: 0,
  createdAt: new Date().toISOString().slice(0, 10),
})

function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="grid gap-4">{children}</CardContent>
    </Card>
  )
}

export default function SupplierProductForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const existing = useApp((s) => s.products.find((p) => p.id === id))
  const categories = useApp((s) => s.categories)
  const upsert = useApp((s) => s.upsertProduct)
  const setStatus = useApp((s) => s.setProductStatus)
  const isEdit = !!id

  const [p, setP] = useState<Product>(() => (existing ? structuredClone(existing) : blank()))
  const [specRows, setSpecRows] = useState<[string, string][]>(() => {
    const rows = Object.entries(existing?.specs ?? {})
    return rows.length ? rows : [["", ""]]
  })
  const [variantInput, setVariantInput] = useState("")
  const [visible, setVisible] = useState(existing ? existing.status !== "inactive" : true)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState<"draft" | "submit" | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const docRef = useRef<HTMLInputElement>(null)

  const category = categories.find((c) => c.id === p.categoryId)
  const sub = category?.subs.find((s) => s.id === p.subId)
  const upd = <K extends keyof Product>(k: K, v: Product[K]) => setP((x) => ({ ...x, [k]: v }))
  const suggested = (category?.attributes ?? []).filter((a) => !specRows.some(([k]) => k.toLowerCase() === a.toLowerCase()))

  if (isEdit && !existing) {
    return (
      <EmptyState
        icon={ImagePlus}
        title="Product not found"
        action={
          <Button asChild>
            <Link to="/supplier/products">Back to products</Link>
          </Button>
        }
      />
    )
  }

  const validate = (strict: boolean) => {
    const e: Record<string, string> = {}
    if (!p.name.trim()) e.name = "Product name is required"
    else if (p.name.trim().length < 8) e.name = "Use a descriptive name (8+ characters)"
    if (strict) {
      if (!p.subId) e.subId = "Choose a sub-category"
      if (p.images.length === 0) e.images = "Add at least one product image"
      if (p.description.trim().length < 40) e.description = "Write at least 40 characters so buyers understand the product"
      if (!p.priceMin || p.priceMin <= 0) e.priceMin = "Enter a minimum price"
      if (p.priceMax < p.priceMin) e.priceMax = "Max price must be ≥ min price"
      if (!p.moq || p.moq <= 0) e.moq = "MOQ must be at least 1"
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const save = (mode: "draft" | "submit") => {
    if (!validate(mode === "submit")) {
      toast.error("Please fix the highlighted fields")
      return
    }
    setBusy(mode)
    setTimeout(() => {
      const specs = Object.fromEntries(specRows.filter(([k, v]) => k.trim() && v.trim()))
      const keepLive = isEdit && existing?.status === "active" && mode === "submit"
      const status = mode === "draft" ? "draft" : keepLive ? (visible ? "active" : "inactive") : "pending"
      const product: Product = { ...p, specs, priceMax: p.priceMax || p.priceMin, status: mode === "draft" ? "draft" : p.status }
      upsert(product)
      if (mode === "submit") setStatus(product.id, status)
      setBusy(null)
      toast.success(
        mode === "draft" ? "Saved as draft" : keepLive ? "Changes published" : "Submitted for approval",
        { description: mode === "submit" && !keepLive ? "Our moderation team reviews new listings within 24 hours." : product.name },
      )
      navigate("/supplier/products")
    }, 500)
  }

  const addVariant = () => {
    const v = variantInput.trim()
    if (v && !p.variants.includes(v)) upd("variants", [...p.variants, v])
    setVariantInput("")
  }
  const moveImage = (i: number, d: -1 | 1) => {
    const imgs = [...p.images]
    const j = i + d
    if (j < 0 || j >= imgs.length) return
    ;[imgs[i], imgs[j]] = [imgs[j], imgs[i]]
    upd("images", imgs)
  }

  return (
    <>
      <Link to="/supplier/products" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Products
      </Link>
      <PageHeader
        title={isEdit ? "Edit product" : "Add a new product"}
        description="Complete listings with images, specifications and pricing rank higher in search."
        actions={existing && <StatusBadge status={existing.status} className="h-7 px-3 text-xs" />}
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Section title="Basic information">
            <Field label="Product name" error={errors.name}>
              <Input value={p.name} onChange={(e) => upd("name", e.target.value)} placeholder="e.g. 65W GaN Fast Charger, Dual USB-C" aria-invalid={!!errors.name} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Category">
                <Select
                  value={p.categoryId}
                  onValueChange={(v) => setP((x) => ({ ...x, categoryId: v, subId: "", childId: undefined, unit: categories.find((c) => c.id === v)?.units[0] ?? x.unit }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Sub-category" error={errors.subId}>
                <Select value={p.subId} onValueChange={(v) => setP((x) => ({ ...x, subId: v, childId: undefined }))}>
                  <SelectTrigger className="w-full" aria-invalid={!!errors.subId}>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {category?.subs.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Child category">
                <Select value={p.childId ?? ""} onValueChange={(v) => upd("childId", v)} disabled={!sub || sub.children.length === 0}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={sub && sub.children.length === 0 ? "None" : "Select"} />
                  </SelectTrigger>
                  <SelectContent>
                    {sub?.children.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Brand">
                <Input value={p.brand} onChange={(e) => upd("brand", e.target.value)} />
              </Field>
              <Field label="Model number">
                <Input value={p.model} onChange={(e) => upd("model", e.target.value)} placeholder="e.g. VG-65X" />
              </Field>
            </div>
          </Section>

          <Section title="Images" description="First image is the cover. Up to 8 images, 1:1 ratio recommended.">
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {p.images.map((src, i) => (
                <div key={src + i} className="group relative aspect-square overflow-hidden rounded-lg border">
                  <SmartImage src={src} alt="" className="size-full" />
                  {i === 0 && (
                    <Badge className="absolute left-1.5 top-1.5 bg-brand text-brand-foreground">
                      <Star /> Cover
                    </Badge>
                  )}
                  <div className="absolute inset-x-1.5 bottom-1.5 flex justify-between gap-1 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
                    <div className="flex gap-1">
                      <Button type="button" size="icon-xs" variant="secondary" aria-label="Move left" onClick={() => moveImage(i, -1)}>
                        <ArrowUp className="-rotate-90" />
                      </Button>
                      <Button type="button" size="icon-xs" variant="secondary" aria-label="Move right" onClick={() => moveImage(i, 1)}>
                        <ArrowDown className="-rotate-90" />
                      </Button>
                    </div>
                    <Button type="button" size="icon-xs" variant="secondary" aria-label="Remove image" onClick={() => upd("images", p.images.filter((_, j) => j !== i))}>
                      <X />
                    </Button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className={cn(
                  "flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed text-xs text-muted-foreground transition hover:border-primary hover:text-primary",
                  errors.images && "border-destructive/60",
                )}
              >
                <Upload className="size-5" /> Upload
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  const files = Array.from(e.target.files ?? [])
                  upd("images", [...p.images, ...files.map((f) => URL.createObjectURL(f))].slice(0, 8))
                  e.target.value = ""
                }}
              />
            </div>
            {errors.images && <p className="-mt-2 text-xs text-destructive">{errors.images}</p>}
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">Or pick from your media library</p>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {presetImages.map((k) => {
                  const src = img(k, 900, 900)
                  const on = p.images.includes(src)
                  return (
                    <button
                      key={k}
                      type="button"
                      onClick={() => upd("images", on ? p.images.filter((x) => x !== src) : [...p.images, src].slice(0, 8))}
                      className={cn("relative size-16 shrink-0 overflow-hidden rounded-md ring-2 transition", on ? "ring-primary" : "ring-transparent hover:ring-border")}
                    >
                      <SmartImage src={img(k, 160, 160)} alt="" className="size-full" />
                    </button>
                  )
                })}
              </div>
            </div>
            <SimulatedNote>Uploads stay in your browser for this demo. Production stores images on AWS S3 with automatic compression.</SimulatedNote>
          </Section>

          <Section title="Description & specifications">
            <Field label="Description" error={errors.description} hint={`${p.description.length} characters`}>
              <Textarea
                rows={5}
                value={p.description}
                onChange={(e) => upd("description", e.target.value)}
                placeholder="Key features, applications, certifications, customisation options…"
                aria-invalid={!!errors.description}
              />
            </Field>
            <div className="grid gap-2">
              <span className="text-xs font-medium">Specifications</span>
              {specRows.map(([k, v], i) => (
                <div key={i} className="grid grid-cols-[1fr_1.4fr_auto] gap-2">
                  <Input value={k} placeholder="Attribute" onChange={(e) => setSpecRows((r) => r.map((x, j) => (j === i ? [e.target.value, x[1]] : x)))} />
                  <Input value={v} placeholder="Value" onChange={(e) => setSpecRows((r) => r.map((x, j) => (j === i ? [x[0], e.target.value] : x)))} />
                  <Button type="button" variant="ghost" size="icon" aria-label="Remove row" onClick={() => setSpecRows((r) => (r.length > 1 ? r.filter((_, j) => j !== i) : [["", ""]]))}>
                    <Trash2 />
                  </Button>
                </div>
              ))}
              <div className="flex flex-wrap items-center gap-1.5">
                <Button type="button" variant="outline" size="sm" onClick={() => setSpecRows((r) => [...r, ["", ""]])}>
                  <Plus /> Add row
                </Button>
                {suggested.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setSpecRows((r) => [...r.filter(([k, v]) => k || v), [a, ""]])}
                    className="rounded-full border border-dashed px-2.5 py-1 text-xs text-muted-foreground hover:border-primary hover:text-primary"
                  >
                    + {a}
                  </button>
                ))}
              </div>
            </div>
          </Section>

          <Section title="Pricing & inventory">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Min price (₹)" error={errors.priceMin}>
                <Input type="number" min={0} value={p.priceMin || ""} onChange={(e) => upd("priceMin", Number(e.target.value))} aria-invalid={!!errors.priceMin} />
              </Field>
              <Field label="Max price (₹)" error={errors.priceMax}>
                <Input type="number" min={0} value={p.priceMax || ""} onChange={(e) => upd("priceMax", Number(e.target.value))} aria-invalid={!!errors.priceMax} />
              </Field>
              <Field label="Unit">
                <Select value={p.unit} onValueChange={(v) => upd("unit", v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from(new Set([...(category?.units ?? []), p.unit])).map((u) => (
                      <SelectItem key={u} value={u}>
                        {u}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Minimum order (MOQ)" error={errors.moq}>
                <Input type="number" min={1} value={p.moq || ""} onChange={(e) => upd("moq", Number(e.target.value))} aria-invalid={!!errors.moq} />
              </Field>
              <Field label="Available quantity">
                <Input type="number" min={0} value={p.availableQty || ""} onChange={(e) => upd("availableQty", Number(e.target.value))} />
              </Field>
              <Field label="GST rate">
                <Select value={String(p.gstPct)} onValueChange={(v) => upd("gstPct", Number(v))}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[0, 5, 12, 18, 28].map((g) => (
                      <SelectItem key={g} value={String(g)}>
                        {g}%
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <Field label="Variants" hint="Colours, sizes or configurations — press Enter to add">
              <div className="flex flex-wrap items-center gap-1.5 rounded-lg border p-1.5">
                {p.variants.map((v) => (
                  <Badge key={v} variant="secondary" className="h-6 gap-1 pr-1">
                    {v}
                    <button type="button" aria-label={`Remove ${v}`} onClick={() => upd("variants", p.variants.filter((x) => x !== v))}>
                      <X className="size-3" />
                    </button>
                  </Badge>
                ))}
                <input
                  value={variantInput}
                  onChange={(e) => setVariantInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault()
                      addVariant()
                    }
                  }}
                  onBlur={addVariant}
                  placeholder="Add variant"
                  className="h-6 min-w-24 flex-1 bg-transparent px-1 text-sm outline-none"
                />
              </div>
            </Field>
          </Section>

          <Section title="Packaging, delivery & documents">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Packaging details">
                <Input value={p.packaging} onChange={(e) => upd("packaging", e.target.value)} placeholder="e.g. Retail box, 50 pcs per carton" />
              </Field>
              <Field label="Delivery information">
                <Input value={p.delivery} onChange={(e) => upd("delivery", e.target.value)} placeholder="e.g. Dispatch in 48 hours" />
              </Field>
              <Field label="Dispatch location">
                <Input value={p.location} onChange={(e) => upd("location", e.target.value)} />
              </Field>
            </div>
            <div className="grid gap-2">
              <span className="text-xs font-medium">Product documents (brochure, test certificates, BIS licence)</span>
              <div className="flex flex-wrap gap-2">
                {p.documents.map((d) => (
                  <Badge key={d} variant="outline" className="h-7 gap-1.5 pr-1.5">
                    <FileUp className="size-3" /> {d}
                    <button type="button" aria-label={`Remove ${d}`} onClick={() => upd("documents", p.documents.filter((x) => x !== d))}>
                      <X className="size-3" />
                    </button>
                  </Badge>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => docRef.current?.click()}>
                  <Upload /> Upload document
                </Button>
                <input
                  ref={docRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    upd("documents", [...p.documents, ...Array.from(e.target.files ?? []).map((f) => f.name)])
                    e.target.value = ""
                  }}
                />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Visible on marketplace</p>
                <p className="text-xs text-muted-foreground">Turn off to hide the listing without deleting it</p>
              </div>
              <Switch checked={visible} onCheckedChange={setVisible} />
            </div>
          </Section>
        </div>

        <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <Card className="gap-0 overflow-hidden p-0">
            <div className="border-b px-4 py-2.5 text-xs font-medium text-muted-foreground">Live preview</div>
            <div className="aspect-[4/3] bg-muted">
              {p.images[0] ? (
                <SmartImage src={p.images[0]} alt="" className="size-full" />
              ) : (
                <div className="grid size-full place-items-center text-muted-foreground">
                  <ImagePlus className="size-8" />
                </div>
              )}
            </div>
            <div className="space-y-1.5 p-4">
              <p className="line-clamp-2 text-sm font-medium">{p.name || "Your product name"}</p>
              <p className="text-base font-semibold text-brand">{p.priceMin ? priceRange(p.priceMin, Math.max(p.priceMax, p.priceMin)) : "₹ —"}</p>
              <p className="text-xs text-muted-foreground">
                per {p.unit} · MOQ {num(p.moq || 0)} {p.unit}
              </p>
              {p.variants.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {p.variants.map((v) => (
                    <Badge key={v} variant="outline">
                      {v}
                    </Badge>
                  ))}
                </div>
              )}
              <p className="pt-1 text-xs text-muted-foreground">Volta Electronics Pvt. Ltd. · {p.location}</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="grid gap-2">
              <Button onClick={() => save("submit")} disabled={!!busy}>
                {busy === "submit" ? <Loader2 className="animate-spin" /> : <Send />}
                {isEdit && existing?.status === "active" ? "Save & publish" : "Submit for approval"}
              </Button>
              <Button variant="outline" onClick={() => save("draft")} disabled={!!busy}>
                {busy === "draft" && <Loader2 className="animate-spin" />} Save as draft
              </Button>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              New and rejected listings are reviewed by the TradeSetu moderation team before going live.
            </p>
          </Card>
        </div>
      </div>
    </>
  )
}
