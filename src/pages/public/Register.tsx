import { CheckCircle2, Clock, Loader2 } from "lucide-react"
import { useState, type FormEvent } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { toast } from "sonner"
import { Field } from "@/components/market/EnquiryDialog"
import { AuthShell, RoleToggle } from "@/components/public/AuthShell"
import { OtpStep } from "@/components/public/OtpStep"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useApp } from "@/store/app"

type AccountType = "buyer" | "supplier"
type Step = "account" | "otp" | "business" | "done"
const steps: { id: Step; label: string }[] = [
  { id: "account", label: "Account" },
  { id: "otp", label: "Verify" },
  { id: "business", label: "Business info" },
]
const GST_RE = /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/

export default function Register() {
  const [params] = useSearchParams()
  const setRole = useApp((s) => s.setRole)
  const categories = useApp((s) => s.categories)
  const navigate = useNavigate()
  const [type, setType] = useState<AccountType>(params.get("type") === "supplier" ? "supplier" : "buyer")
  const [step, setStep] = useState<Step>("account")
  const [busy, setBusy] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [f, setF] = useState({
    name: "",
    phone: "",
    email: "",
    company: "",
    category: "",
    businessType: "Manufacturer",
    city: "",
    state: "",
    gst: "",
    designation: "",
    agree: false,
  })
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF((x) => ({ ...x, [k]: e.target.value }))

  const submitAccount = (e: FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!f.name.trim()) errs.name = "Required"
    if (!/^[+\d\s-]{10,}$/.test(f.phone)) errs.phone = "Enter a valid mobile number"
    if (!/^\S+@\S+\.\S+$/.test(f.email)) errs.email = "Enter a valid email"
    setErrors(errs)
    if (Object.keys(errs).length) return
    setBusy(true)
    setTimeout(() => {
      setBusy(false)
      setStep("otp")
    }, 500)
  }

  const submitBusiness = (e: FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!f.company.trim()) errs.company = "Required"
    if (!f.category) errs.category = "Choose a category"
    if (!f.city.trim()) errs.city = "Required"
    if (type === "supplier" && !GST_RE.test(f.gst.trim().toUpperCase())) errs.gst = "Enter a valid 15-character GSTIN (e.g. 27AAJCM8812L1ZV)"
    if (type === "buyer" && f.gst && !GST_RE.test(f.gst.trim().toUpperCase())) errs.gst = "GSTIN format looks incorrect"
    if (!f.agree) errs.agree = "Please accept the terms to continue"
    setErrors(errs)
    if (Object.keys(errs).length) return
    setBusy(true)
    setTimeout(() => {
      setBusy(false)
      if (type === "buyer") {
        setRole("buyer")
        toast.success("Account created — welcome to TradeSetu!")
        navigate("/buyer")
      } else setStep("done")
    }, 800)
  }

  const fillDemo = () =>
    setF((x) => ({
      ...x,
      company: type === "buyer" ? "Mehta Retail Solutions Pvt. Ltd." : "Shakti Polymers Pvt. Ltd.",
      category: type === "buyer" ? "electronics" : "packaging",
      city: type === "buyer" ? "Pune" : "Vapi",
      state: type === "buyer" ? "Maharashtra" : "Gujarat",
      gst: type === "buyer" ? "27AAJCM8812L1ZV" : "24AAKCS7781M1Z3",
      designation: "Director",
    }))

  if (step === "done") {
    return (
      <AuthShell title="Registration submitted" subtitle="Your supplier account is almost ready.">
        <div className="grid gap-5 rounded-2xl border p-6">
          <span className="grid size-12 place-items-center rounded-full bg-amber-100 text-amber-700">
            <Clock className="size-6" />
          </span>
          <div>
            <h3 className="text-lg font-semibold">Pending verification</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Our team is verifying <span className="font-medium text-foreground">{f.company}</span> (GSTIN {f.gst.toUpperCase()}). This usually takes
              under 24 hours. Meanwhile you can set up your company profile and add products — they go live once approved.
            </p>
          </div>
          <ul className="space-y-2 text-sm">
            {["Mobile verified", "Business details received", "GST & KYC verification (in progress)", "Profile goes live"].map((s, i) => (
              <li key={s} className={cn("flex items-center gap-2", i > 1 && "text-muted-foreground")}>
                {i < 2 ? <CheckCircle2 className="size-4 text-success" /> : <Clock className="size-4" />} {s}
              </li>
            ))}
          </ul>
          <Button
            size="lg"
            onClick={() => {
              setRole("supplier")
              navigate("/supplier")
            }}
          >
            Go to supplier dashboard
          </Button>
          <p className="text-xs text-muted-foreground">Prototype note: the dashboard opens the demo supplier account (Volta Electronics).</p>
        </div>
      </AuthShell>
    )
  }

  const idx = steps.findIndex((s) => s.id === step)

  return (
    <AuthShell
      title={type === "supplier" ? "Start selling on TradeSetu" : "Create your buyer account"}
      subtitle={type === "supplier" ? "List products, get genuine leads and manage them in one place — free to start." : "Post requirements, compare quotes and track suppliers — always free for buyers."}
    >
      <ol className="mb-6 flex items-center gap-2">
        {steps.map((s, i) => (
          <li key={s.id} className="flex flex-1 items-center gap-2">
            <span
              className={cn(
                "grid size-6 shrink-0 place-items-center rounded-full text-xs font-semibold",
                i < idx ? "bg-success text-white" : i === idx ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
              )}
            >
              {i < idx ? "✓" : i + 1}
            </span>
            <span className={cn("text-xs", i === idx ? "font-medium" : "text-muted-foreground")}>{s.label}</span>
            {i < steps.length - 1 && <span className="h-px flex-1 bg-border" />}
          </li>
        ))}
      </ol>

      {step === "account" && (
        <form onSubmit={submitAccount} noValidate className="grid gap-4">
          <RoleToggle
            value={type}
            onChange={setType}
            options={[
              { value: "buyer", label: "Buyer", sub: "I want to source" },
              { value: "supplier", label: "Supplier", sub: "I want to sell" },
            ]}
          />
          <Field label="Full name" error={errors.name}>
            <Input value={f.name} onChange={set("name")} aria-invalid={!!errors.name} />
          </Field>
          <Field label="Mobile number" error={errors.phone} hint="We'll send an OTP to verify">
            <Input type="tel" value={f.phone} onChange={set("phone")} placeholder="+91" aria-invalid={!!errors.phone} />
          </Field>
          <Field label="Business email" error={errors.email}>
            <Input type="email" value={f.email} onChange={set("email")} aria-invalid={!!errors.email} />
          </Field>
          <Button type="submit" size="lg" className="h-11" disabled={busy}>
            {busy && <Loader2 className="animate-spin" />} Continue
          </Button>
          <button
            type="button"
            className="text-xs font-medium text-primary hover:underline"
            onClick={() =>
              setF((x) => ({
                ...x,
                name: type === "buyer" ? "Rohan Mehta" : "Vivek Shah",
                phone: "+91 98220 41234",
                email: type === "buyer" ? "rohan@mehtaretail.in" : "vivek@shaktipolymers.in",
              }))
            }
          >
            Fill demo details
          </button>
          <p className="text-center text-sm text-muted-foreground">
            Already registered?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      )}

      {step === "otp" && <OtpStep destination={f.phone} onVerified={() => setStep("business")} onBack={() => setStep("account")} cta="Verify mobile" />}

      {step === "business" && (
        <form onSubmit={submitBusiness} noValidate className="grid gap-4">
          <Field label="Company name" error={errors.company}>
            <Input value={f.company} onChange={set("company")} aria-invalid={!!errors.company} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={type === "supplier" ? "Primary category" : "Business category"} error={errors.category}>
              <Select value={f.category} onValueChange={(v) => setF((x) => ({ ...x, category: v }))}>
                <SelectTrigger className="w-full" aria-invalid={!!errors.category}>
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
            {type === "supplier" ? (
              <Field label="Business type">
                <Select value={f.businessType} onValueChange={(v) => setF((x) => ({ ...x, businessType: v }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Manufacturer", "Wholesaler", "Distributor", "Exporter", "Trader"].map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            ) : (
              <Field label="Your designation">
                <Input value={f.designation} onChange={set("designation")} placeholder="e.g. Purchase Manager" />
              </Field>
            )}
            <Field label="City" error={errors.city}>
              <Input value={f.city} onChange={set("city")} aria-invalid={!!errors.city} />
            </Field>
            <Field label="State">
              <Input value={f.state} onChange={set("state")} />
            </Field>
          </div>
          <Field label={type === "supplier" ? "GSTIN" : "GSTIN (optional)"} error={errors.gst} hint="Used to verify your business. Never shown publicly in full.">
            <Input value={f.gst} onChange={(e) => setF((x) => ({ ...x, gst: e.target.value.toUpperCase() }))} placeholder="22AAAAA0000A1Z5" maxLength={15} aria-invalid={!!errors.gst} />
          </Field>
          <Label className="flex items-start gap-2 text-xs font-normal leading-relaxed text-muted-foreground">
            <Checkbox checked={f.agree} onCheckedChange={(c) => setF((x) => ({ ...x, agree: !!c }))} className="mt-0.5" />
            <span>
              I agree to the{" "}
              <Link to="/page/terms" className="text-primary hover:underline">
                Terms
              </Link>{" "}
              and{" "}
              <Link to="/page/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>{" "}
              and consent to receive enquiry updates on WhatsApp.
            </span>
          </Label>
          {errors.agree && <p className="-mt-2 text-xs text-destructive">{errors.agree}</p>}
          <Button type="submit" size="lg" className="h-11" disabled={busy}>
            {busy && <Loader2 className="animate-spin" />} {type === "supplier" ? "Submit for verification" : "Create account"}
          </Button>
          <button type="button" className="text-xs font-medium text-primary hover:underline" onClick={fillDemo}>
            Fill demo business details
          </button>
        </form>
      )}
    </AuthShell>
  )
}
