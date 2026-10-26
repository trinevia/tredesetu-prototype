import {
  BellRing,
  CheckCircle2,
  ClipboardList,
  FileUp,
  Loader2,
  MessageCircle,
  Paperclip,
  Quote,
  ShieldCheck,
  Shuffle,
  Trophy,
  X,
} from "lucide-react"
import { useMemo, useRef, useState, type FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Rating, VerifiedBadge } from "@/components/common/bits"
import { SupplierLogo } from "@/components/market/cards"
import { Field } from "@/components/market/EnquiryDialog"
import { OtpStep } from "@/components/public/OtpStep"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { demoBuyer } from "@/data/leads"
import { inrCompact } from "@/lib/format"
import { cn } from "@/lib/utils"
import { matchSuppliers, useApp } from "@/store/app"
import type { Lead } from "@/types"

const flow = [
  { icon: ClipboardList, label: "Requirement posted" },
  { icon: Shuffle, label: "Lead created & suppliers matched" },
  { icon: BellRing, label: "Suppliers notified (WhatsApp + email)" },
  { icon: Quote, label: "Quotations arrive in your dashboard" },
  { icon: MessageCircle, label: "Follow-up & negotiate" },
  { icon: Trophy, label: "Deal converted" },
]

export default function PostRequirement() {
  const role = useApp((s) => s.role)
  const setRole = useApp((s) => s.setRole)
  const categories = useApp((s) => s.categories)
  const suppliers = useApp((s) => s.suppliers)
  const submitEnquiry = useApp((s) => s.submitEnquiry)
  const navigate = useNavigate()
  const isBuyer = role === "buyer"
  const fileRef = useRef<HTMLInputElement>(null)

  const [f, setF] = useState({
    title: "",
    categoryId: "",
    quantity: "",
    unit: "Piece",
    budget: "",
    city: isBuyer ? demoBuyer.city : "",
    date: "",
    description: "",
    name: isBuyer ? demoBuyer.name : "",
    company: isBuyer ? demoBuyer.company : "",
    phone: isBuyer ? demoBuyer.phone : "",
    email: isBuyer ? demoBuyer.email : "",
  })
  const [files, setFiles] = useState<string[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [step, setStep] = useState<"form" | "otp" | "done">("form")
  const [busy, setBusy] = useState(false)
  const [lead, setLead] = useState<Lead | null>(null)
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF((x) => ({ ...x, [k]: e.target.value }))
  const category = categories.find((c) => c.id === f.categoryId)

  const preview = useMemo(
    () => (f.categoryId ? matchSuppliers(suppliers, f.categoryId, f.city).map((id) => suppliers.find((s) => s.id === id)!) : []),
    [suppliers, f.categoryId, f.city],
  )

  const validate = () => {
    const e: Record<string, string> = {}
    if (f.title.trim().length < 3) e.title = "Describe the product or service you need"
    if (!f.categoryId) e.categoryId = "Choose a category so we can match suppliers"
    if (!Number(f.quantity) || Number(f.quantity) <= 0) e.quantity = "Enter a valid quantity"
    if (!f.city.trim()) e.city = "Delivery location is required"
    if (f.description.trim().length < 15) e.description = "Add a few details (at least 15 characters)"
    if (!f.name.trim()) e.name = "Required"
    if (!/^[+\d\s-]{10,}$/.test(f.phone)) e.phone = "Enter a valid mobile number"
    if (!/^\S+@\S+\.\S+$/.test(f.email)) e.email = "Enter a valid email"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const create = () => {
    const l = submitEnquiry({
      title: f.title.trim(),
      categoryId: f.categoryId,
      quantity: Number(f.quantity),
      unit: f.unit,
      budget: f.budget ? Number(f.budget) : undefined,
      deliveryLocation: f.city.trim(),
      deliveryDate: f.date || undefined,
      description: f.description.trim(),
      attachments: files,
      buyer: { name: f.name, company: f.company || "Individual Buyer", phone: f.phone, email: f.email, city: f.city },
      source: "Post Requirement",
    })
    setLead(l)
    setStep("done")
    window.scrollTo({ top: 0, behavior: "smooth" })
    toast.success(`Requirement ${l.id} posted`)
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) {
      toast.error("Please fix the highlighted fields")
      return
    }
    setBusy(true)
    setTimeout(() => {
      setBusy(false)
      if (isBuyer) create()
      else setStep("otp")
    }, 700)
  }

  if (step === "done" && lead) {
    const matched = lead.supplierIds.map((id) => suppliers.find((s) => s.id === id)).filter(Boolean)
    return (
      <div className="container-page max-w-3xl py-12">
        <Card className="items-center gap-4 p-8 text-center">
          <span className="grid size-16 place-items-center rounded-full bg-success/12 text-success">
            <CheckCircle2 className="size-9" />
          </span>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Requirement ID {lead.id}</p>
            <h1 className="mt-1 text-2xl font-semibold">Your requirement is live!</h1>
            <p className="mt-2 text-muted-foreground">
              We matched it to {matched.length} verified supplier{matched.length === 1 ? "" : "s"} and alerted them on WhatsApp & email.
            </p>
          </div>
          <div className="grid w-full gap-3 text-left sm:grid-cols-3">
            {matched.map((s) => (
              <div key={s!.id} className="flex items-center gap-3 rounded-xl border p-3">
                <SupplierLogo supplier={s!} className="size-10 text-xs" />
                <div className="min-w-0">
                  <div className="line-clamp-1 text-sm font-medium">{s!.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {s!.city} · <Rating value={s!.rating} />
                  </div>
                </div>
              </div>
            ))}
            {matched.length === 0 && (
              <p className="col-span-full rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                No direct match yet — our trade advisors will source suppliers for you within 24 hours.
              </p>
            )}
          </div>
          <ol className="grid w-full gap-2 text-left sm:grid-cols-2">
            {flow.map((s, i) => (
              <li key={s.label} className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-sm", i < 3 ? "bg-success/8 text-foreground" : "text-muted-foreground")}>
                <s.icon className={cn("size-4", i < 3 ? "text-success" : "")} />
                {s.label}
                {i < 3 && <CheckCircle2 className="ml-auto size-4 text-success" />}
              </li>
            ))}
          </ol>
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            <Button variant="outline" asChild>
              <Link to="/products">Continue browsing</Link>
            </Button>
            <Button
              onClick={() => {
                setRole("buyer")
                navigate(`/buyer/enquiries/${lead.id}`)
              }}
            >
              Track this requirement
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <div className="border-b bg-brand text-white">
        <div className="container-page py-10">
          <p className="text-xs font-semibold uppercase tracking-wider text-saffron">Buyer enquiry / RFQ</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Post your requirement</h1>
          <p className="mt-2 max-w-2xl text-white/70">
            Tell us what you need. We'll match your requirement with verified suppliers and you'll receive competitive quotations — usually
            within a few hours.
          </p>
        </div>
      </div>
      <div className="container-page grid gap-8 py-8 lg:grid-cols-[1fr_360px]">
        <Card className="p-6 sm:p-8">
          {step === "otp" ? (
            <div className="mx-auto w-full max-w-sm py-6">
              <OtpStep destination={f.phone} onVerified={create} onBack={() => setStep("form")} cta="Verify & post requirement" />
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate className="grid gap-6">
              <section className="grid gap-4">
                <h2 className="font-semibold">1. What do you need?</h2>
                <Field label="Product / service required" error={errors.title}>
                  <Input value={f.title} onChange={set("title")} placeholder="e.g. 3 ply corrugated boxes, 12×10×8 inch, 2-colour print" aria-invalid={!!errors.title} />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Category" error={errors.categoryId}>
                    <Select
                      value={f.categoryId}
                      onValueChange={(v) => {
                        const c = categories.find((x) => x.id === v)
                        setF((x) => ({ ...x, categoryId: v, unit: c?.units[0] ?? x.unit }))
                      }}
                    >
                      <SelectTrigger className="w-full" aria-invalid={!!errors.categoryId}>
                        <SelectValue placeholder="Select category" />
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
                  <div className="grid grid-cols-[1fr_120px] gap-2">
                    <Field label="Quantity" error={errors.quantity}>
                      <Input type="number" min={1} value={f.quantity} onChange={set("quantity")} placeholder="e.g. 5000" aria-invalid={!!errors.quantity} />
                    </Field>
                    <Field label="Unit">
                      <Select value={f.unit} onValueChange={(v) => setF((x) => ({ ...x, unit: v }))}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[...new Set([...(category?.units ?? []), "Piece", "Kg", "Metric Ton", "Box", "Unit"])].map((u) => (
                            <SelectItem key={u} value={u}>
                              {u}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>
                  <Field label="Expected budget (₹, total)" hint={f.budget ? `≈ ${inrCompact(Number(f.budget))}` : "Optional — helps suppliers quote accurately"}>
                    <Input type="number" min={0} value={f.budget} onChange={set("budget")} placeholder="e.g. 150000" />
                  </Field>
                  <Field label="Required delivery date">
                    <Input type="date" value={f.date} onChange={set("date")} min={new Date().toISOString().slice(0, 10)} />
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="Delivery location" error={errors.city}>
                      <Input value={f.city} onChange={set("city")} placeholder="City, State" aria-invalid={!!errors.city} />
                    </Field>
                  </div>
                </div>
                <Field label="Requirement description" error={errors.description}>
                  <Textarea
                    rows={4}
                    value={f.description}
                    onChange={set("description")}
                    placeholder="Specifications, quality standard, packaging, branding, payment terms, frequency of orders…"
                    aria-invalid={!!errors.description}
                  />
                </Field>
                <div>
                  <input
                    ref={fileRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      const names = Array.from(e.target.files ?? []).map((x) => x.name)
                      setFiles((x) => [...new Set([...x, ...names])].slice(0, 5))
                      e.target.value = ""
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed p-4 text-sm text-muted-foreground transition hover:border-primary hover:text-primary"
                  >
                    <FileUp className="size-4" /> Attach drawings, specs or reference images (max 5)
                  </button>
                  {files.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {files.map((n) => (
                        <span key={n} className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs">
                          <Paperclip className="size-3" /> {n}
                          <button type="button" aria-label={`Remove ${n}`} onClick={() => setFiles((x) => x.filter((y) => y !== n))}>
                            <X className="size-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </section>
              <section className="grid gap-4 border-t pt-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold">2. Your contact details</h2>
                  {!isBuyer && (
                    <button
                      type="button"
                      className="text-xs font-medium text-primary hover:underline"
                      onClick={() =>
                        setF((x) => ({ ...x, name: demoBuyer.name, company: demoBuyer.company, phone: "+91 98220 41234", email: demoBuyer.email, city: x.city || demoBuyer.city }))
                      }
                    >
                      Fill demo buyer
                    </button>
                  )}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Full name" error={errors.name}>
                    <Input value={f.name} onChange={set("name")} aria-invalid={!!errors.name} />
                  </Field>
                  <Field label="Company name">
                    <Input value={f.company} onChange={set("company")} />
                  </Field>
                  <Field label="Mobile number" error={errors.phone}>
                    <Input value={f.phone} onChange={set("phone")} placeholder="+91" aria-invalid={!!errors.phone} />
                  </Field>
                  <Field label="Business email" error={errors.email}>
                    <Input type="email" value={f.email} onChange={set("email")} aria-invalid={!!errors.email} />
                  </Field>
                </div>
              </section>
              <div className="flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <ShieldCheck className="size-4 text-success" /> Shared only with matched, verified suppliers. No spam.
                </p>
                <Button type="submit" size="lg" className="h-11 px-6" disabled={busy}>
                  {busy && <Loader2 className="animate-spin" />}
                  {isBuyer ? "Post requirement" : "Continue to verify"}
                </Button>
              </div>
            </form>
          )}
        </Card>

        <aside className="space-y-4 lg:sticky lg:top-36 lg:self-start">
          <Card className="gap-4 p-5">
            <h3 className="font-semibold">How matching works</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">1</span>
                Suppliers listed in your selected category are shortlisted.
              </li>
              <li className="flex gap-2">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">2</span>
                Suppliers in or near your delivery city rank higher.
              </li>
              <li className="flex gap-2">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">3</span>
                Verification, Trust Seal and rating break ties — top 3 receive your lead.
              </li>
            </ul>
            <p className="rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
              Phase One uses transparent rule-based matching. AI-powered semantic matching is planned for Phase Two.
            </p>
          </Card>
          <Card className="gap-3 p-5">
            <h3 className="font-semibold">Suppliers who'll receive this</h3>
            {preview.length === 0 ? (
              <p className="text-sm text-muted-foreground">Select a category and delivery city to preview matched suppliers.</p>
            ) : (
              preview.map((s) => (
                <div key={s.id} className="flex items-center gap-3">
                  <SupplierLogo supplier={s} className="size-9 text-[11px]" />
                  <div className="min-w-0 flex-1">
                    <div className="line-clamp-1 text-sm font-medium">{s.name}</div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {s.city} {s.verified && <VerifiedBadge label="" />} <Rating value={s.rating} />
                    </div>
                  </div>
                </div>
              ))
            )}
          </Card>
        </aside>
      </div>
    </div>
  )
}
