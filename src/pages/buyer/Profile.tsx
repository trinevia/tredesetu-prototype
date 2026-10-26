import { BadgeCheck, Building2, Loader2, ShieldCheck } from "lucide-react"
import { useState, type FormEvent } from "react"
import { toast } from "sonner"
import { PageHeader } from "@/components/common/bits"
import { Field } from "@/components/market/EnquiryDialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { demoBuyer } from "@/data/leads"
import { img } from "@/lib/images"
import { useApp } from "@/store/app"

const GST_RE = /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/

export default function BuyerProfile() {
  const categories = useApp((s) => s.categories)
  const [busy, setBusy] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [f, setF] = useState({
    name: demoBuyer.name,
    designation: "Director – Procurement",
    company: demoBuyer.company,
    businessType: "Retailer",
    category: "electronics",
    city: demoBuyer.city,
    state: "Maharashtra",
    address: "Office 304, Pentagon Towers, Satara Road, Pune 411037",
    gst: demoBuyer.gst ?? "",
    phone: "+91 98220 41234",
    email: demoBuyer.email,
    website: "www.mehtaretail.in",
    about: "Multi-brand electronics retail chain with 38 stores across Maharashtra, sourcing mobile accessories, audio and smart-home products.",
  })
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF((x) => ({ ...x, [k]: e.target.value }))

  const save = (e: FormEvent) => {
    e.preventDefault()
    const er: Record<string, string> = {}
    if (!f.name.trim()) er.name = "Name is required"
    if (!f.company.trim()) er.company = "Company name is required"
    if (f.gst && !GST_RE.test(f.gst.toUpperCase())) er.gst = "Enter a valid 15-character GSTIN"
    if (!/^\S+@\S+\.\S+$/.test(f.email)) er.email = "Enter a valid email"
    if (!/^[+\d\s-]{10,}$/.test(f.phone)) er.phone = "Enter a valid mobile number"
    setErrors(er)
    if (Object.keys(er).length) {
      toast.error("Please fix the highlighted fields")
      return
    }
    setBusy(true)
    setTimeout(() => {
      setBusy(false)
      toast.success("Business profile updated", { description: "Suppliers will see your updated company details." })
    }, 500)
  }

  return (
    <>
      <PageHeader title="Business profile" description="A complete profile gets faster, more accurate quotes from suppliers." />
      <form onSubmit={save} noValidate className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Contact person</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" error={errors.name}>
                <Input value={f.name} onChange={set("name")} aria-invalid={!!errors.name} />
              </Field>
              <Field label="Designation">
                <Input value={f.designation} onChange={set("designation")} />
              </Field>
              <Field label="Mobile number" error={errors.phone}>
                <div className="relative">
                  <Input value={f.phone} onChange={set("phone")} aria-invalid={!!errors.phone} className="pr-24" />
                  <span className="absolute right-2 top-1/2 inline-flex -translate-y-1/2 items-center gap-1 text-[11px] font-medium text-success">
                    <BadgeCheck className="size-3.5" /> OTP verified
                  </span>
                </div>
              </Field>
              <Field label="Email" error={errors.email}>
                <div className="relative">
                  <Input type="email" value={f.email} onChange={set("email")} aria-invalid={!!errors.email} className="pr-20" />
                  <span className="absolute right-2 top-1/2 inline-flex -translate-y-1/2 items-center gap-1 text-[11px] font-medium text-success">
                    <BadgeCheck className="size-3.5" /> Verified
                  </span>
                </div>
              </Field>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Business information</CardTitle>
              <CardDescription>Used for supplier matching and GST invoicing</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Field label="Company name" error={errors.company}>
                <Input value={f.company} onChange={set("company")} aria-invalid={!!errors.company} />
              </Field>
              <Field label="Business type">
                <Select value={f.businessType} onValueChange={(v) => setF((x) => ({ ...x, businessType: v }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Retailer", "Wholesaler", "Distributor", "Manufacturer", "Importer", "Project / Contractor"].map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Primary business category">
                <Select value={f.category} onValueChange={(v) => setF((x) => ({ ...x, category: v }))}>
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
              <Field label="GSTIN" error={errors.gst} hint="15 characters, e.g. 27AAJCM8812L1ZV">
                <Input value={f.gst} onChange={set("gst")} className="uppercase" aria-invalid={!!errors.gst} />
              </Field>
              <Field label="City">
                <Input value={f.city} onChange={set("city")} />
              </Field>
              <Field label="State">
                <Input value={f.state} onChange={set("state")} />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Registered address">
                  <Input value={f.address} onChange={set("address")} />
                </Field>
              </div>
              <Field label="Website">
                <Input value={f.website} onChange={set("website")} />
              </Field>
              <div className="sm:col-span-2">
                <Field label="About your business">
                  <Textarea rows={3} value={f.about} onChange={set("about")} />
                </Field>
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-end gap-2">
            <Button type="submit" disabled={busy}>
              {busy && <Loader2 className="animate-spin" />} Save changes
            </Button>
          </div>
        </div>
        <div className="space-y-6">
          <Card className="items-center text-center">
            <CardContent className="flex flex-col items-center gap-2 pt-2">
              <Avatar className="size-20">
                <AvatarImage src={img("man3", 160, 160)} alt="" />
                <AvatarFallback>RM</AvatarFallback>
              </Avatar>
              <p className="font-semibold">{f.name}</p>
              <p className="text-sm text-muted-foreground">{f.company}</p>
              <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
                <ShieldCheck className="size-3.5" /> Verified buyer
              </span>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="size-4" /> Verification status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {[
                ["Mobile number", "Verified via OTP"],
                ["Email address", "Verified"],
                ["GSTIN", "Validated with GST portal"],
                ["Business address", "Matched with GST records"],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-2 rounded-lg bg-muted/60 px-3 py-2">
                  <span>{k}</span>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-success">
                    <BadgeCheck className="size-3.5" /> {v}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </form>
    </>
  )
}
