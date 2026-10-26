import { CalendarRange, ExternalLink, FileText, ImagePlus, MousePointerClick, Pencil, Plus, Trash2 } from "lucide-react"
import { useState, type FormEvent } from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import { ConfirmAction, TableCard } from "@/components/admin/ui"
import { PageHeader, SmartImage, StatusBadge } from "@/components/common/bits"
import { Field } from "@/components/market/EnquiryDialog"
import { SupplierLogo } from "@/components/market/cards"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { fmtDate, num } from "@/lib/format"
import { img, type ImageKey } from "@/lib/images"
import { cn } from "@/lib/utils"
import { useApp } from "@/store/app"
import type { Banner, CmsPage } from "@/types"

const placements: Banner["placement"][] = ["Homepage Hero", "Homepage Strip", "Category", "BRICS"]
const imageChoices: ImageKey[] = ["warehouseYellow", "containerShip", "solarFarm", "kraftBoxes", "port", "teamMeeting", "spices", "autoAssembly"]

export default function AdminContent() {
  return (
    <>
      <PageHeader title="Banners, content & notifications" description="Promotional banners, featured sections, static CMS pages and notification rules." />
      <Tabs defaultValue="banners">
        <TabsList className="mb-4 h-auto flex-wrap">
          <TabsTrigger value="banners">Banners</TabsTrigger>
          <TabsTrigger value="featured">Featured sections</TabsTrigger>
          <TabsTrigger value="pages">CMS pages</TabsTrigger>
          <TabsTrigger value="notifications">Notification rules</TabsTrigger>
        </TabsList>
        <TabsContent value="banners">
          <Banners />
        </TabsContent>
        <TabsContent value="featured">
          <Featured />
        </TabsContent>
        <TabsContent value="pages">
          <Pages />
        </TabsContent>
        <TabsContent value="notifications">
          <NotificationRules />
        </TabsContent>
      </Tabs>
    </>
  )
}

function Banners() {
  const banners = useApp((s) => s.banners)
  const upsert = useApp((s) => s.upsertBanner)
  const remove = useApp((s) => s.deleteBanner)
  const [editing, setEditing] = useState<Banner | null>(null)
  const blank = (): Banner => ({
    id: `bn-${Date.now()}`,
    title: "",
    subtitle: "",
    cta: "Explore",
    link: "/products",
    image: img("warehouseYellow", 1400, 600),
    placement: "Homepage Hero",
    active: true,
    starts: new Date().toISOString().slice(0, 10),
    ends: "2026-12-31",
    clicks: 0,
  })

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setEditing(blank())}>
          <Plus /> New banner
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {banners.map((b) => (
          <Card key={b.id} className={cn("gap-0 overflow-hidden p-0", !b.active && "opacity-70")}>
            <div className="relative aspect-[21/8] overflow-hidden">
              <SmartImage src={b.image} alt="" className="size-full" />
              <div className="absolute inset-0 bg-gradient-to-r from-brand/90 via-brand/60 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-center p-5 text-white">
                <p className="max-w-[70%] text-lg font-semibold leading-tight">{b.title}</p>
                <p className="mt-1 line-clamp-2 max-w-[70%] text-xs text-white/80">{b.subtitle}</p>
                <span className="mt-3 w-fit rounded-md bg-saffron px-2.5 py-1 text-xs font-medium text-saffron-foreground">{b.cta}</span>
              </div>
              <Badge className="absolute right-3 top-3 bg-white/90 text-foreground">{b.placement}</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 p-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <CalendarRange className="size-3.5" /> {fmtDate(b.starts)} – {fmtDate(b.ends)}
              </span>
              <span className="inline-flex items-center gap-1">
                <MousePointerClick className="size-3.5" /> {num(b.clicks)} clicks
              </span>
              <div className="ml-auto flex items-center gap-2">
                <Switch
                  checked={b.active}
                  onCheckedChange={(v) => {
                    upsert({ ...b, active: v })
                    toast.success(v ? "Banner is live" : "Banner paused")
                  }}
                  aria-label="Active"
                />
                <Button size="icon-sm" variant="ghost" aria-label="Edit" onClick={() => setEditing(b)}>
                  <Pencil />
                </Button>
                <ConfirmAction title="Delete banner?" description={`“${b.title}” will be removed from all placements.`} confirmLabel="Delete" destructive onConfirm={() => { remove(b.id); toast.success("Banner deleted") }}>
                  <Button size="icon-sm" variant="ghost" aria-label="Delete">
                    <Trash2 className="text-destructive" />
                  </Button>
                </ConfirmAction>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-xl">
          {editing && (
            <BannerForm
              key={editing.id}
              banner={editing}
              isNew={!banners.some((b) => b.id === editing.id)}
              onSave={(b) => {
                upsert(b)
                toast.success("Banner saved")
                setEditing(null)
              }}
              onCancel={() => setEditing(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

function BannerForm({ banner, isNew, onSave, onCancel }: { banner: Banner; isNew: boolean; onSave: (b: Banner) => void; onCancel: () => void }) {
  const [b, setB] = useState(banner)
  const [err, setErr] = useState("")
  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!b.title.trim()) return setErr("Title is required")
    if (b.ends < b.starts) return setErr("End date must be after start date")
    onSave(b)
  }
  return (
    <form onSubmit={submit} className="grid gap-4">
      <DialogHeader>
        <DialogTitle>{isNew ? "New banner" : "Edit banner"}</DialogTitle>
        <DialogDescription>Images upload to AWS S3 in production; pick a sample image here.</DialogDescription>
      </DialogHeader>
      <div className="grid grid-cols-4 gap-2">
        {imageChoices.map((k) => {
          const src = img(k, 1400, 600)
          return (
            <button
              key={k}
              type="button"
              onClick={() => setB({ ...b, image: src })}
              className={cn("overflow-hidden rounded-md ring-2 ring-transparent", b.image === src && "ring-primary")}
            >
              <SmartImage src={img(k, 300, 140)} alt="" className="aspect-[2/1] w-full" />
            </button>
          )
        })}
      </div>
      <Field label="Title">
        <Input value={b.title} onChange={(e) => setB({ ...b, title: e.target.value })} />
      </Field>
      <Field label="Subtitle">
        <Textarea rows={2} value={b.subtitle} onChange={(e) => setB({ ...b, subtitle: e.target.value })} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Button text">
          <Input value={b.cta} onChange={(e) => setB({ ...b, cta: e.target.value })} />
        </Field>
        <Field label="Link">
          <Input value={b.link} onChange={(e) => setB({ ...b, link: e.target.value })} />
        </Field>
        <Field label="Placement">
          <Select value={b.placement} onValueChange={(v) => setB({ ...b, placement: v as Banner["placement"] })}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {placements.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <div className="flex items-end gap-2 pb-1.5 text-sm">
          <Switch checked={b.active} onCheckedChange={(v) => setB({ ...b, active: v })} id="banner-active" />
          <label htmlFor="banner-active">Active</label>
        </div>
        <Field label="Starts">
          <Input type="date" value={b.starts} onChange={(e) => setB({ ...b, starts: e.target.value })} />
        </Field>
        <Field label="Ends">
          <Input type="date" value={b.ends} onChange={(e) => setB({ ...b, ends: e.target.value })} />
        </Field>
      </div>
      {err && <p className="text-sm text-destructive">{err}</p>}
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          <ImagePlus /> Save banner
        </Button>
      </DialogFooter>
    </form>
  )
}

function Featured() {
  const products = useApp((s) => s.products)
  const suppliers = useApp((s) => s.suppliers)
  const toggleP = useApp((s) => s.toggleProductFeatured)
  const toggleS = useApp((s) => s.toggleSupplierFeatured)
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <TableCard title="Featured products" description={`${products.filter((p) => p.featured).length} shown on the homepage`}>
        <div className="max-h-[28rem] divide-y overflow-y-auto">
          {products
            .filter((p) => p.status === "active")
            .map((p) => (
              <label key={p.id} className="flex cursor-pointer items-center gap-3 px-4 py-2.5 hover:bg-muted/40">
                <SmartImage src={p.images[0]} alt="" className="size-9 shrink-0 rounded-md" />
                <span className="min-w-0 flex-1 truncate text-sm">{p.name}</span>
                <Switch checked={p.featured} onCheckedChange={() => toggleP(p.id)} aria-label={`Feature ${p.name}`} />
              </label>
            ))}
        </div>
      </TableCard>
      <TableCard title="Featured suppliers" description={`${suppliers.filter((s) => s.featured).length} shown on the homepage`}>
        <div className="max-h-[28rem] divide-y overflow-y-auto">
          {suppliers
            .filter((s) => s.status === "active")
            .map((s) => (
              <label key={s.id} className="flex cursor-pointer items-center gap-3 px-4 py-2.5 hover:bg-muted/40">
                <SupplierLogo supplier={s} className="size-9 text-xs" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm">{s.name}</span>
                  <span className="text-xs text-muted-foreground">{s.city}</span>
                </span>
                <Switch checked={s.featured} onCheckedChange={() => toggleS(s.id)} aria-label={`Feature ${s.name}`} />
              </label>
            ))}
        </div>
      </TableCard>
    </div>
  )
}

function Pages() {
  const pages = useApp((s) => s.pages)
  const update = useApp((s) => s.updatePage)
  const [slug, setSlug] = useState(pages[0]?.slug)
  const page = pages.find((p) => p.slug === slug)
  return (
    <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
      <Card className="h-fit gap-0 p-0">
        <ul className="divide-y">
          {pages.map((p) => (
            <li key={p.slug}>
              <button
                type="button"
                onClick={() => setSlug(p.slug)}
                className={cn("flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted/50", p.slug === slug && "bg-primary/5")}
              >
                <FileText className="size-4 text-muted-foreground" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{p.title}</span>
                  <span className="text-xs text-muted-foreground">Updated {fmtDate(p.updatedAt)}</span>
                </span>
                <StatusBadge status={p.status} />
              </button>
            </li>
          ))}
        </ul>
      </Card>
      {page && <PageEditor key={page.slug} page={page} onSave={(patch) => update(page.slug, patch)} />}
    </div>
  )
}

function PageEditor({ page, onSave }: { page: CmsPage; onSave: (p: Partial<CmsPage>) => void }) {
  const [title, setTitle] = useState(page.title)
  const [body, setBody] = useState(page.body)
  const dirty = title !== page.title || body !== page.body
  return (
    <Card className="gap-4 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-xs text-muted-foreground">/page/{page.slug}</span>
        <Button variant="ghost" size="sm" asChild>
          <Link to={`/page/${page.slug}`}>
            <ExternalLink /> Preview
          </Link>
        </Button>
      </div>
      <Field label="Page title">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </Field>
      <Field label="Content" hint="Basic CMS — paragraphs separated by blank lines. Rich-text editor in production.">
        <Textarea rows={12} value={body} onChange={(e) => setBody(e.target.value)} className="font-mono text-xs leading-relaxed" />
      </Field>
      <div className="flex flex-wrap justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => {
            onSave({ title, body, status: "Draft" })
            toast.success("Saved as draft")
          }}
        >
          Save draft
        </Button>
        <Button
          onClick={() => {
            onSave({ title, body, status: "Published" })
            toast.success(`“${title}” published`)
          }}
          disabled={!dirty && page.status === "Published"}
        >
          Publish
        </Button>
      </div>
    </Card>
  )
}

const channels = ["Email", "In-app", "SMS", "WhatsApp"] as const
const events: { audience: string; items: string[] }[] = [
  { audience: "Buyer", items: ["Registration confirmation", "Enquiry submitted", "Supplier response / quotation", "Enquiry status update"] },
  { audience: "Supplier", items: ["New enquiry received", "Account approval", "Product approval / rejection", "Follow-up reminder"] },
  { audience: "Admin", items: ["New supplier registration", "New product submitted", "New enquiry", "Reported content"] },
]
const defaults: Record<string, (typeof channels)[number][]> = {
  "Registration confirmation": ["Email", "SMS"],
  "Enquiry submitted": ["Email", "In-app", "WhatsApp"],
  "Supplier response / quotation": ["Email", "In-app", "WhatsApp"],
  "Enquiry status update": ["In-app"],
  "New enquiry received": ["Email", "In-app", "WhatsApp"],
  "Account approval": ["Email", "SMS"],
  "Product approval / rejection": ["Email", "In-app"],
  "Follow-up reminder": ["In-app", "WhatsApp"],
  "New supplier registration": ["In-app", "Email"],
  "New product submitted": ["In-app"],
  "New enquiry": ["In-app"],
  "Reported content": ["In-app", "Email"],
}

function NotificationRules() {
  const [rules, setRules] = useState(() =>
    Object.fromEntries(events.flatMap((g) => g.items.map((i) => [`${g.audience}:${i}`, defaults[i] ?? []]))),
  )
  return (
    <TableCard
      title="Notification rules"
      description="Which channel each event is delivered on. SMS/OTP via gateway; WhatsApp via approved Business API templates."
      actions={
        <Button size="sm" onClick={() => toast.success("Notification rules saved")}>
          Save rules
        </Button>
      }
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="pl-4">Event</TableHead>
            {channels.map((c) => (
              <TableHead key={c} className="text-center">
                {c}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((g) => [
            <TableRow key={g.audience} className="bg-muted/40 hover:bg-muted/40">
              <TableCell colSpan={5} className="pl-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {g.audience} notifications
              </TableCell>
            </TableRow>,
            ...g.items.map((i) => {
              const key = `${g.audience}:${i}`
              return (
                <TableRow key={key}>
                  <TableCell className="pl-4">{i}</TableCell>
                  {channels.map((c) => (
                    <TableCell key={c} className="text-center">
                      <Checkbox
                        checked={rules[key].includes(c)}
                        onCheckedChange={(v) =>
                          setRules((r) => ({ ...r, [key]: v ? [...r[key], c] : r[key].filter((x) => x !== c) }))
                        }
                        aria-label={`${i} via ${c}`}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              )
            }),
          ])}
        </TableBody>
      </Table>
    </TableCard>
  )
}
