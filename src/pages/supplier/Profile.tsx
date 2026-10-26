import { BadgeCheck, CheckCircle2, Circle, ExternalLink, Globe2, Loader2, ShieldCheck, X } from "lucide-react"
import { useState, type ReactNode } from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import { PageHeader, SmartImage, TrustSeal } from "@/components/common/bits"
import { Field } from "@/components/market/EnquiryDialog"
import { ChipsInput } from "@/components/supplier/ChipsInput"
import { profileChecklist } from "@/components/supplier/useSupplierData"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { img, type ImageKey } from "@/lib/images"
import { cn } from "@/lib/utils"
import { DEMO_SUPPLIER_ID, useApp, useSupplier } from "@/store/app"
import type { BusinessType, Supplier } from "@/types"

const covers: ImageKey[] = ["engineerDesk", "labAutomation", "warehouseAisle", "towers", "office"]
const galleryChoices: ImageKey[] = ["labAutomation", "engineerDesk", "warehouseAisle", "warehouseYellow", "teamMeeting", "officeTeam", "rackStorage"]
const logoColors = ["#2547c9", "#0f766e", "#b45309", "#be185d", "#7c3aed", "#0f172a"]
const businessTypes: BusinessType[] = ["Manufacturer", "Wholesaler", "Distributor", "Exporter", "Trader"]
const bricsMarkets = ["Brazil", "Russia", "China", "South Africa", "UAE", "Egypt", "Ethiopia", "Iran", "Indonesia"]

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

export default function SupplierProfileEdit() {
  const supplier = useSupplier(DEMO_SUPPLIER_ID)
  if (!supplier) return null
  return <ProfileForm supplier={supplier} />
}

function ProfileForm({ supplier }: { supplier: Supplier }) {
  const categories = useApp((s) => s.categories)
  const update = useApp((s) => s.updateSupplier)
  const [s, setS] = useState<Supplier>(() => structuredClone(supplier))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)
  const upd = <K extends keyof Supplier>(k: K, v: Supplier[K]) => setS((x) => ({ ...x, [k]: v }))
  const text = (k: keyof Supplier) => (e: { target: { value: string } }) => setS((x) => ({ ...x, [k]: e.target.value }))

  const checklist = profileChecklist(s)
  const completion = Math.round((checklist.filter((c) => c.done).length / checklist.length) * 100)

  const save = () => {
    const er: Record<string, string> = {}
    if (!s.name.trim()) er.name = "Company name is required"
    if (s.description.trim().length < 60) er.description = "Describe your business in at least 60 characters"
    if (!/^\S+@\S+\.\S+$/.test(s.email)) er.email = "Enter a valid email"
    if (s.categoryIds.length === 0) er.categories = "Select at least one category"
    if (s.yearEstablished < 1900 || s.yearEstablished > 2026) er.year = "Enter a valid year"
    setErrors(er)
    if (Object.keys(er).length) {
      toast.error("Please fix the highlighted fields")
      return
    }
    setBusy(true)
    setTimeout(() => {
      update(supplier.id, s)
      setBusy(false)
      toast.success("Company profile saved", { description: "Your public profile and catalogue are updated." })
    }, 500)
  }

  return (
    <>
      <PageHeader
        title="Company profile"
        description="This is what buyers see on your public profile and product pages."
        actions={
          <>
            <Button variant="outline" asChild>
              <Link to={`/suppliers/${supplier.id}`}>
                <ExternalLink /> View public profile
              </Link>
            </Button>
            <Button onClick={save} disabled={busy}>
              {busy && <Loader2 className="animate-spin" />} Save changes
            </Button>
          </>
        }
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="gap-0 overflow-hidden p-0">
            <div className="relative h-36 sm:h-44">
              <SmartImage src={s.cover} alt="" className="size-full" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-3 left-4 flex items-end gap-3">
                <span className="grid size-16 place-items-center rounded-xl text-lg font-bold text-white shadow-lg ring-4 ring-white" style={{ background: s.logoColor }}>
                  {s.logo}
                </span>
                <div className="pb-1 text-white">
                  <p className="font-semibold">{s.name}</p>
                  <p className="text-xs text-white/80">
                    {s.city}, {s.state}
                  </p>
                </div>
              </div>
            </div>
            <div className="grid gap-4 p-4 sm:grid-cols-2">
              <Field label="Cover image">
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {covers.map((k) => {
                    const src = img(k, 1600, 500)
                    return (
                      <button
                        key={k}
                        type="button"
                        onClick={() => upd("cover", src)}
                        className={cn("h-12 w-20 shrink-0 overflow-hidden rounded-md ring-2", s.cover === src ? "ring-primary" : "ring-transparent")}
                      >
                        <SmartImage src={img(k, 200, 120)} alt="" className="size-full" />
                      </button>
                    )
                  })}
                </div>
              </Field>
              <div className="grid grid-cols-[6rem_1fr] gap-3">
                <Field label="Logo initials">
                  <Input value={s.logo} maxLength={3} onChange={(e) => upd("logo", e.target.value.toUpperCase())} />
                </Field>
                <Field label="Brand colour">
                  <div className="flex h-9 items-center gap-1.5">
                    {logoColors.map((c) => (
                      <button
                        key={c}
                        type="button"
                        aria-label={`Colour ${c}`}
                        onClick={() => upd("logoColor", c)}
                        className={cn("size-7 rounded-full ring-2 ring-offset-2", s.logoColor === c ? "ring-primary" : "ring-transparent")}
                        style={{ background: c }}
                      />
                    ))}
                  </div>
                </Field>
              </div>
            </div>
          </Card>

          <Section title="About the company">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Company name" error={errors.name}>
                <Input value={s.name} onChange={text("name")} aria-invalid={!!errors.name} />
              </Field>
              <Field label="Tagline">
                <Input value={s.tagline} onChange={text("tagline")} />
              </Field>
              <Field label="Business type">
                <Select value={s.businessType} onValueChange={(v) => upd("businessType", v as BusinessType)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {businessTypes.map((b) => (
                      <SelectItem key={b} value={b}>
                        {b}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Year established" error={errors.year}>
                <Input type="number" value={s.yearEstablished} onChange={(e) => upd("yearEstablished", Number(e.target.value))} aria-invalid={!!errors.year} />
              </Field>
              <Field label="Employees">
                <Input value={s.employees} onChange={text("employees")} />
              </Field>
              <Field label="Annual turnover">
                <Input value={s.turnover} onChange={text("turnover")} />
              </Field>
            </div>
            <Field label="Company description" error={errors.description} hint={`${s.description.length} characters`}>
              <Textarea rows={5} value={s.description} onChange={text("description")} aria-invalid={!!errors.description} />
            </Field>
            <Field label="Product categories" error={errors.categories}>
              <div className="grid gap-2 sm:grid-cols-2">
                {categories.map((c) => (
                  <label key={c.id} className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
                    <Checkbox
                      checked={s.categoryIds.includes(c.id)}
                      onCheckedChange={(v) => upd("categoryIds", v ? [...s.categoryIds, c.id] : s.categoryIds.filter((x) => x !== c.id))}
                    />
                    {c.name}
                  </label>
                ))}
              </div>
            </Field>
          </Section>

          <Section title="Location & contact">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field label="Address">
                  <Input value={s.address} onChange={text("address")} />
                </Field>
              </div>
              <Field label="City">
                <Input value={s.city} onChange={text("city")} />
              </Field>
              <Field label="State">
                <Input value={s.state} onChange={text("state")} />
              </Field>
              <Field label="Contact person">
                <Input value={s.contactPerson} onChange={text("contactPerson")} />
              </Field>
              <Field label="Phone">
                <Input value={s.phone} onChange={text("phone")} />
              </Field>
              <Field label="WhatsApp Business number" hint="Used for click-to-WhatsApp and lead alerts">
                <Input value={s.whatsapp} onChange={text("whatsapp")} />
              </Field>
              <Field label="Email" error={errors.email}>
                <Input type="email" value={s.email} onChange={text("email")} aria-invalid={!!errors.email} />
              </Field>
              <Field label="Website">
                <Input value={s.website} onChange={text("website")} />
              </Field>
              <Field label="LinkedIn / social">
                <Input placeholder="linkedin.com/company/…" defaultValue="linkedin.com/company/volta-electronics" />
              </Field>
            </div>
          </Section>

          <Section title="Business & trade terms">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="GSTIN">
                <div className="relative">
                  <Input value={s.gst} onChange={text("gst")} className="pr-24 uppercase" />
                  <span className="absolute right-2 top-1/2 inline-flex -translate-y-1/2 items-center gap-1 text-[11px] font-medium text-success">
                    <BadgeCheck className="size-3.5" /> Validated
                  </span>
                </div>
              </Field>
              <Field label="Minimum order information">
                <Input value={s.minOrderInfo} onChange={text("minOrderInfo")} />
              </Field>
            </div>
            <Field label="Certifications">
              <ChipsInput value={s.certifications} onChange={(v) => upd("certifications", v)} suggestions={["ISO 14001", "BIS", "CE", "RoHS", "ZED Certified"]} />
            </Field>
            <Field label="Business capabilities">
              <ChipsInput value={s.capabilities} onChange={(v) => upd("capabilities", v)} suggestions={["Export Packing", "Drop Shipping", "Sample Orders"]} />
            </Field>
            <Field label="Payment terms">
              <ChipsInput value={s.paymentTerms} onChange={(v) => upd("paymentTerms", v)} suggestions={["Credit (30 days)", "UPI / NEFT", "Cash on Delivery"]} />
            </Field>
            <Field label="Delivery information">
              <Textarea rows={2} value={s.deliveryInfo} onChange={text("deliveryInfo")} />
            </Field>
          </Section>

          <Section title="Company photos" description="Factory, warehouse, team and certifications — up to 8 photos">
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {s.gallery.map((src) => (
                <div key={src} className="group relative aspect-[4/3] overflow-hidden rounded-lg border">
                  <SmartImage src={src} alt="" className="size-full" />
                  <button
                    type="button"
                    aria-label="Remove photo"
                    onClick={() => upd("gallery", s.gallery.filter((x) => x !== src))}
                    className="absolute right-1.5 top-1.5 grid size-6 place-items-center rounded-full bg-black/60 text-white"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {galleryChoices
                .map((k) => ({ k, src: img(k, 800, 600) }))
                .filter(({ src }) => !s.gallery.includes(src))
                .map(({ k, src }) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => upd("gallery", [...s.gallery, src].slice(0, 8))}
                    className="relative h-14 w-20 shrink-0 overflow-hidden rounded-md opacity-80 ring-1 ring-border transition hover:opacity-100"
                  >
                    <SmartImage src={img(k, 200, 140)} alt="" className="size-full" />
                    <span className="absolute inset-0 grid place-items-center bg-black/30 text-lg font-semibold text-white">+</span>
                  </button>
                ))}
            </div>
          </Section>

          <Section title="International trade" description="Get discovered by importers on the BRICS Trade Hub">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-start gap-3">
                <Globe2 className="mt-0.5 size-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">BRICS-ready exporter</p>
                  <p className="text-xs text-muted-foreground">Show my company on BRICS country pages and accept international enquiries</p>
                </div>
              </div>
              <Switch checked={s.bricsReady} onCheckedChange={(v) => upd("bricsReady", v)} />
            </div>
            <Field label="Export markets">
              <ChipsInput value={s.exportMarkets} onChange={(v) => upd("exportMarkets", v)} suggestions={bricsMarkets} />
            </Field>
          </Section>

          <div className="flex justify-end">
            <Button onClick={save} disabled={busy}>
              {busy && <Loader2 className="animate-spin" />} Save changes
            </Button>
          </div>
        </div>

        <div className="space-y-6 lg:sticky lg:top-20 lg:self-start">
          <Card>
            <CardHeader>
              <CardTitle>Profile strength</CardTitle>
              <CardDescription>Updates live as you edit</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-end justify-between">
                <span className="text-3xl font-semibold">{completion}%</span>
                <span className="text-xs text-muted-foreground">{completion >= 80 ? "Strong" : "Needs work"}</span>
              </div>
              <Progress value={completion} />
              <ul className="space-y-1.5 pt-1 text-sm">
                {checklist.map((c) => (
                  <li key={c.label} className="flex items-center gap-2">
                    {c.done ? <CheckCircle2 className="size-4 text-success" /> : <Circle className="size-4 text-muted-foreground" />}
                    <span className={c.done ? "text-muted-foreground" : ""}>{c.label}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-success" /> Verification status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <TrustSeal seal={supplier.trustSeal} />
              {[
                ["GST verification", supplier.verified],
                ["Business registration (MSME/CIN)", true],
                ["Physical / video verification", supplier.trustSeal !== null],
                ["Bank account", true],
              ].map(([k, ok]) => (
                <div key={String(k)} className="flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2">
                  <span>{k}</span>
                  {ok ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-success">
                      <BadgeCheck className="size-3.5" /> Verified
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-amber-700">Pending</span>
                  )}
                </div>
              ))}
              <p className="text-xs text-muted-foreground">Verified on 14 Nov 2024 by TradeSetu field team. Renewal due Nov 2026.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
