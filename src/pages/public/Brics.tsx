import { Anchor, ArrowRight, CheckCircle2, FileBadge, Globe2, Loader2, Users } from "lucide-react"
import { useState, type FormEvent } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { toast } from "sonner"
import { DynamicIcon, SectionHeading, SimulatedNote, SmartImage } from "@/components/common/bits"
import { SupplierCard } from "@/components/market/cards"
import { Field } from "@/components/market/EnquiryDialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { bricsCountries, bricsServices, bricsTradeLeads } from "@/data/brics"
import { demoBuyer } from "@/data/leads"
import { cn } from "@/lib/utils"
import { useApp } from "@/store/app"
import type { Lead } from "@/types"

const incoterms = ["FOB", "CIF", "CFR", "EXW", "DAP"]

export default function Brics() {
  const [params, setParams] = useSearchParams()
  const selectedId = params.get("country") ?? "russia"
  const country = bricsCountries.find((c) => c.id === selectedId) ?? bricsCountries[1]
  const allSuppliers = useApp((s) => s.suppliers)
  const suppliers = allSuppliers.filter((x) => x.bricsReady && x.status === "active")
  const categories = useApp((s) => s.categories)
  const role = useApp((s) => s.role)
  const setRole = useApp((s) => s.setRole)
  const submitEnquiry = useApp((s) => s.submitEnquiry)
  const navigate = useNavigate()
  const [leadFilter, setLeadFilter] = useState<"all" | "Buy" | "Sell">("all")

  const [f, setF] = useState({
    country: "brazil",
    incoterm: "CIF",
    categoryId: "",
    product: "",
    qty: "",
    unit: "Piece",
    name: role === "buyer" ? demoBuyer.name : "",
    company: role === "buyer" ? demoBuyer.company : "",
    email: role === "buyer" ? demoBuyer.email : "",
    phone: role === "buyer" ? demoBuyer.phone : "",
    notes: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState<Lead | null>(null)
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF((x) => ({ ...x, [k]: e.target.value }))

  const marketSuppliers = suppliers.filter((s) => s.exportMarkets.some((m) => m.toLowerCase() === country.name.toLowerCase()))
  const leads = bricsTradeLeads.filter((l) => leadFilter === "all" || l.type === leadFilter)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!f.product.trim()) errs.product = "Required"
    if (!f.categoryId) errs.categoryId = "Required"
    if (!Number(f.qty)) errs.qty = "Enter quantity"
    if (!f.name.trim()) errs.name = "Required"
    if (!/^\S+@\S+\.\S+$/.test(f.email)) errs.email = "Valid email required"
    setErrors(errs)
    if (Object.keys(errs).length) return
    const c = bricsCountries.find((x) => x.id === f.country)!
    setBusy(true)
    setTimeout(() => {
      const lead = submitEnquiry({
        title: f.product.trim(),
        categoryId: f.categoryId,
        quantity: Number(f.qty),
        unit: f.unit,
        deliveryLocation: c.name,
        description: f.notes.trim() || `International requirement for ${c.name} on ${f.incoterm} basis via BRICS Trade Desk.`,
        attachments: [],
        buyer: { name: f.name, company: f.company || "Overseas buyer", phone: f.phone || "—", email: f.email, city: c.name },
        source: "BRICS Desk",
        international: { country: c.name, incoterm: `${f.incoterm} ${c.ports[0]}` },
      })
      setBusy(false)
      setDone(lead)
      toast.success(`BRICS enquiry ${lead.id} sent to the Trade Desk`)
    }, 700)
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand text-white">
        <SmartImage src={country.image} alt="" className="absolute inset-0 size-full opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand via-brand/90 to-brand/40" />
        <div className="container-page relative py-14 lg:py-20">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs ring-1 ring-white/15">
            <Globe2 className="size-3.5 text-saffron" /> BRICS Trade Hub
          </span>
          <h1 className="mt-4 max-w-3xl text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
            Your gateway to trade with <span className="text-saffron">BRICS & partner nations</span>
          </h1>
          <p className="mt-4 max-w-2xl text-white/75">
            Connect Indian exporters with verified importers across Brazil, Russia, China, South Africa, UAE, Egypt, Ethiopia, Iran and
            Indonesia — with documentation, compliance, logistics and trade-finance support from our Trade Desk.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild size="lg" className="h-11 bg-saffron px-5 text-saffron-foreground hover:bg-saffron/90">
              <a href="#enquiry">Post international enquiry</a>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-11 border-white/25 bg-white/5 px-5 text-white hover:bg-white/15 hover:text-white">
              <a href="#leads">Browse trade leads</a>
            </Button>
          </div>
          <div className="mt-10 grid max-w-2xl grid-cols-3 gap-4">
            {[
              [bricsCountries.reduce((a, c) => a + c.buyers, 0).toLocaleString("en-IN"), "Verified overseas buyers"],
              [bricsCountries.reduce((a, c) => a + c.openRequests, 0), "Open trade requests"],
              [suppliers.length * 140 + 40, "Export-ready suppliers"],
            ].map(([v, l]) => (
              <div key={l}>
                <div className="text-2xl font-semibold">{v}</div>
                <div className="text-xs text-white/60">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Countries */}
      <section className="container-page py-14">
        <SectionHeading eyebrow="Markets" title="Choose a market to explore" />
        <div className="scrollbar-none -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-5 sm:overflow-visible sm:px-0">
          {bricsCountries.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setParams({ country: c.id }, { replace: true, preventScrollReset: true })}
              className={cn(
                "min-w-36 rounded-xl border bg-card p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md",
                c.id === country.id && "border-primary ring-2 ring-primary/20",
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-3xl">{c.flag}</span>
                <Badge variant="secondary" className="text-[10px]">
                  {c.member}
                </Badge>
              </div>
              <div className="mt-2 font-semibold">{c.name}</div>
              <div className="text-xs text-muted-foreground">{c.openRequests} open requests</div>
            </button>
          ))}
        </div>

        <Card className="mt-6 gap-0 overflow-hidden p-0 lg:grid lg:grid-cols-[1fr_1.4fr]">
          <div className="relative min-h-56">
            <SmartImage src={country.image} alt={country.name} className="absolute inset-0 size-full" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-0 p-5 text-white">
              <div className="text-4xl">{country.flag}</div>
              <h3 className="mt-1 text-2xl font-semibold">{country.name}</h3>
              <p className="text-sm text-white/75">
                {country.member} {country.member === "Partner" ? "nation" : "BRICS member"} · Currency {country.currency}
              </p>
            </div>
          </div>
          <div className="grid gap-5 p-6 sm:grid-cols-2">
            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Top demand from India</h4>
              <ul className="space-y-1.5 text-sm">
                {country.demand.map((d) => (
                  <li key={d} className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-success" /> {d}
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <FileBadge className="size-3.5" /> Compliance
                </h4>
                <p className="text-sm">{country.compliance}</p>
              </div>
              <div>
                <h4 className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Anchor className="size-3.5" /> Key ports
                </h4>
                <p className="text-sm">{country.ports.join(", ")}</p>
              </div>
              <div>
                <h4 className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Users className="size-3.5" /> On TradeSetu
                </h4>
                <p className="text-sm">
                  {country.buyers} verified buyers · {country.openRequests} open requests
                </p>
              </div>
            </div>
            <div className="sm:col-span-2">
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Indian suppliers exporting here</h4>
              {marketSuppliers.length ? (
                <div className="flex flex-wrap gap-2">
                  {marketSuppliers.map((s) => (
                    <Link key={s.id} to={`/suppliers/${s.id}`} className="rounded-full border px-3 py-1 text-xs font-medium hover:border-primary hover:text-primary">
                      {s.name}
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Be the first — our Trade Desk can help you enter this market.</p>
              )}
            </div>
          </div>
        </Card>
      </section>

      {/* Services */}
      <section className="border-y bg-surface py-14">
        <div className="container-page">
          <SectionHeading eyebrow="Trade Desk services" title="Everything you need to trade across borders" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {bricsServices.map((s) => (
              <div key={s.title} className="rounded-xl border bg-card p-5">
                <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
                  <DynamicIcon name={s.icon} className="size-5" />
                </span>
                <h3 className="mt-4 font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trade leads */}
      <section id="leads" className="container-page scroll-mt-32 py-14">
        <SectionHeading
          eyebrow="International trade leads"
          title="Live buy & sell requests"
          action={
            <div className="flex rounded-lg border p-0.5 text-xs">
              {(["all", "Buy", "Sell"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setLeadFilter(t)}
                  className={cn("rounded-md px-3 py-1.5 font-medium", leadFilter === t ? "bg-primary text-primary-foreground" : "text-muted-foreground")}
                >
                  {t === "all" ? "All" : `${t} requests`}
                </button>
              ))}
            </div>
          }
        />
        <div className="overflow-hidden rounded-xl border">
          {leads.map((l) => {
            const c = bricsCountries.find((x) => x.id === l.country)!
            return (
              <div key={l.id} className="flex flex-col gap-3 border-b bg-card p-4 last:border-b-0 sm:flex-row sm:items-center">
                <span className="text-2xl">{c.flag}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={l.type === "Buy" ? "bg-success/12 text-success" : "bg-violet-100 text-violet-700"}>{l.type}</Badge>
                    <span className="font-medium">{l.title}</span>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {l.id} · {c.name} · Qty {l.qty} · {l.posted}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setF((x) => ({ ...x, country: l.country, product: l.title }))
                      document.getElementById("enquiry")?.scrollIntoView({ behavior: "smooth" })
                    }}
                  >
                    Post similar
                  </Button>
                  <Button size="sm" onClick={() => toast.success(`Interest registered for ${l.id}`, { description: "The Trade Desk will verify the buyer and connect you within 24 hrs." })}>
                    Respond
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Suppliers */}
      <section className="container-page pb-14">
        <SectionHeading
          eyebrow="Export-ready"
          title="BRICS-ready Indian suppliers"
          action={
            <Button variant="ghost" asChild>
              <Link to="/suppliers?brics=1">
                View all <ArrowRight />
              </Link>
            </Button>
          }
        />
        <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-4">
          {suppliers.slice(0, 4).map((s) => (
            <SupplierCard key={s.id} supplier={s} />
          ))}
        </div>
      </section>

      {/* Enquiry form */}
      <section id="enquiry" className="scroll-mt-32 bg-surface py-14">
        <div className="container-page grid gap-8 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-primary">BRICS Trade Desk</p>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Post an international enquiry</h2>
            <p className="mt-3 text-muted-foreground">
              Importing from India or exporting to a BRICS market? Share the details — our Trade Desk qualifies the requirement, matches
              export-ready suppliers and helps with Incoterms, documentation and freight.
            </p>
            <ul className="mt-6 space-y-2 text-sm">
              {["Dedicated trade advisor for every enquiry", "Buyer & supplier verification before introduction", "CIF/FOB freight comparison from partner forwarders"].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-success" /> {t}
                </li>
              ))}
            </ul>
          </div>
          <Card className="p-6">
            {done ? (
              <div className="grid justify-items-center gap-3 py-6 text-center">
                <CheckCircle2 className="size-12 text-success" />
                <h3 className="text-lg font-semibold">Enquiry {done.id} received</h3>
                <p className="max-w-sm text-sm text-muted-foreground">
                  Routed to {done.supplierIds.length} export-ready supplier(s). A trade advisor will reach out within 24 hours.
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setDone(null)}>
                    Post another
                  </Button>
                  <Button
                    onClick={() => {
                      setRole("buyer")
                      navigate(`/buyer/enquiries/${done.id}`)
                    }}
                  >
                    Track enquiry
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={submit} noValidate className="grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Destination / origin country">
                    <Select value={f.country} onValueChange={(v) => setF((x) => ({ ...x, country: v }))}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {bricsCountries
                          .filter((c) => c.id !== "india")
                          .map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.flag} {c.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Incoterm">
                    <Select value={f.incoterm} onValueChange={(v) => setF((x) => ({ ...x, incoterm: v }))}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {incoterms.map((i) => (
                          <SelectItem key={i} value={i}>
                            {i}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
                <Field label="Product" error={errors.product}>
                  <Input value={f.product} onChange={set("product")} placeholder="e.g. 1121 basmati rice, 25 kg bags" aria-invalid={!!errors.product} />
                </Field>
                <div className="grid gap-4 sm:grid-cols-[1.3fr_1fr_110px]">
                  <Field label="Category" error={errors.categoryId}>
                    <Select value={f.categoryId} onValueChange={(v) => setF((x) => ({ ...x, categoryId: v, unit: categories.find((c) => c.id === v)?.units[0] ?? x.unit }))}>
                      <SelectTrigger className="w-full" aria-invalid={!!errors.categoryId}>
                        <SelectValue placeholder="Select" />
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
                  <Field label="Quantity" error={errors.qty}>
                    <Input type="number" min={1} value={f.qty} onChange={set("qty")} aria-invalid={!!errors.qty} />
                  </Field>
                  <Field label="Unit">
                    <Input value={f.unit} onChange={set("unit")} />
                  </Field>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Your name" error={errors.name}>
                    <Input value={f.name} onChange={set("name")} aria-invalid={!!errors.name} />
                  </Field>
                  <Field label="Company">
                    <Input value={f.company} onChange={set("company")} />
                  </Field>
                  <Field label="Email" error={errors.email}>
                    <Input type="email" value={f.email} onChange={set("email")} aria-invalid={!!errors.email} />
                  </Field>
                  <Field label="Phone / WhatsApp">
                    <Input value={f.phone} onChange={set("phone")} placeholder="With country code" />
                  </Field>
                </div>
                <Field label="Additional details">
                  <Textarea rows={3} value={f.notes} onChange={set("notes")} placeholder="Certifications needed, packaging, payment terms (LC / TT), target price…" />
                </Field>
                <Button type="submit" size="lg" disabled={busy}>
                  {busy && <Loader2 className="animate-spin" />} Send to BRICS Trade Desk
                </Button>
                <SimulatedNote>Overseas buyer verification and freight quotes are handled manually by the Trade Desk in Phase One.</SimulatedNote>
              </form>
            )}
          </Card>
        </div>
      </section>
    </div>
  )
}
