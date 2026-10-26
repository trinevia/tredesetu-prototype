import { CheckCircle2, Loader2, ShieldCheck } from "lucide-react"
import { useState, type FormEvent, type ReactNode } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { SimulatedNote } from "@/components/common/bits"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { demoBuyer } from "@/data/leads"
import { num } from "@/lib/format"
import { useApp } from "@/store/app"
import type { Lead, Product, Supplier } from "@/types"

interface Props {
  product?: Product
  supplier?: Supplier
  children: ReactNode
}

type Step = "form" | "otp" | "done"

export function EnquiryDialog({ product, supplier, children }: Props) {
  const role = useApp((s) => s.role)
  const setRole = useApp((s) => s.setRole)
  const submitEnquiry = useApp((s) => s.submitEnquiry)
  const target = useApp((s) => s.suppliers.find((x) => x.id === (supplier?.id ?? product?.supplierId)))
  const navigate = useNavigate()
  const isBuyer = role === "buyer"

  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<Step>("form")
  const [busy, setBusy] = useState(false)
  const [otp, setOtp] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [created, setCreated] = useState<Lead | null>(null)
  const initial = () => ({
    title: product ? product.name : "",
    quantity: String(product?.moq ?? ""),
    budget: "",
    city: isBuyer ? demoBuyer.city : "",
    date: "",
    description: "",
    name: isBuyer ? demoBuyer.name : "",
    company: isBuyer ? demoBuyer.company : "",
    phone: isBuyer ? demoBuyer.phone : "",
    email: isBuyer ? demoBuyer.email : "",
  })
  const [f, setF] = useState(initial)
  const set = (k: keyof ReturnType<typeof initial>) => (e: { target: { value: string } }) =>
    setF((x) => ({ ...x, [k]: e.target.value }))

  const validate = () => {
    const e: Record<string, string> = {}
    if (!f.title.trim()) e.title = "Tell suppliers what you need"
    if (!Number(f.quantity) || Number(f.quantity) <= 0) e.quantity = "Enter a valid quantity"
    if (!f.city.trim()) e.city = "Delivery city is required"
    if (!isBuyer) {
      if (!f.name.trim()) e.name = "Required"
      if (!/^[+\d\s-]{10,}$/.test(f.phone)) e.phone = "Enter a valid mobile number"
      if (!/^\S+@\S+\.\S+$/.test(f.email)) e.email = "Enter a valid email"
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const create = () => {
    const lead = submitEnquiry({
      title: f.title,
      categoryId: product?.categoryId ?? target?.categoryIds[0] ?? "electronics",
      productId: product?.id,
      supplierId: supplier?.id,
      quantity: Number(f.quantity),
      unit: product?.unit ?? "Piece",
      budget: f.budget ? Number(f.budget) : undefined,
      deliveryLocation: f.city,
      deliveryDate: f.date || undefined,
      description: f.description || `Please share your best quotation for ${f.title}.`,
      attachments: [],
      buyer: { name: f.name, company: f.company || "Individual Buyer", phone: f.phone, email: f.email, city: f.city },
      source: product ? "Product Page" : "Supplier Profile",
    })
    setCreated(lead)
    setStep("done")
    toast.success("Enquiry sent", { description: `${lead.id} shared with ${target?.name ?? "the supplier"}.` })
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setBusy(true)
    setTimeout(() => {
      setBusy(false)
      if (isBuyer) create()
      else setStep("otp")
    }, 600)
  }

  const verifyOtp = (e: FormEvent) => {
    e.preventDefault()
    if (otp !== "1234") {
      setErrors({ otp: "Incorrect code. Use 1234 in this demo." })
      return
    }
    create()
  }

  const belowMoq = product && Number(f.quantity) > 0 && Number(f.quantity) < product.moq

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (o) {
          setF(initial())
          setStep("form")
          setErrors({})
          setOtp("")
        }
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
        {step === "form" && (
          <>
            <DialogHeader>
              <DialogTitle>Request a quotation</DialogTitle>
              <DialogDescription>
                {target ? (
                  <>
                    Your requirement goes directly to <span className="font-medium text-foreground">{target.name}</span>. Typical response:{" "}
                    {target.responseTime.toLowerCase()}.
                  </>
                ) : (
                  "Share your requirement and get quotes from verified suppliers."
                )}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={onSubmit} className="grid gap-4" noValidate>
              <Field label="Product / service required" error={errors.title}>
                <Input value={f.title} onChange={set("title")} placeholder="e.g. 65W GaN fast chargers" aria-invalid={!!errors.title} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label={`Quantity${product ? ` (${product.unit})` : ""}`} error={errors.quantity}>
                  <Input type="number" min={1} value={f.quantity} onChange={set("quantity")} aria-invalid={!!errors.quantity} />
                </Field>
                <Field label="Budget (₹, optional)">
                  <Input type="number" min={0} value={f.budget} onChange={set("budget")} placeholder="Total budget" />
                </Field>
              </div>
              {belowMoq && (
                <p className="-mt-2 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  Supplier's MOQ is {num(product.moq)} {product.unit}. You can still enquire — they may offer a sample order.
                </p>
              )}
              <div className="grid grid-cols-2 gap-3">
                <Field label="Delivery city" error={errors.city}>
                  <Input value={f.city} onChange={set("city")} placeholder="e.g. Pune" aria-invalid={!!errors.city} />
                </Field>
                <Field label="Required by">
                  <Input type="date" value={f.date} onChange={set("date")} />
                </Field>
              </div>
              <Field label="Requirement details">
                <Textarea value={f.description} onChange={set("description")} rows={3} placeholder="Specifications, packaging, branding, payment terms…" />
              </Field>
              {!isBuyer && (
                <div className="grid gap-3 rounded-lg border bg-muted/40 p-3">
                  <p className="text-xs font-medium text-muted-foreground">Your contact details</p>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Full name" error={errors.name}>
                      <Input value={f.name} onChange={set("name")} aria-invalid={!!errors.name} />
                    </Field>
                    <Field label="Company">
                      <Input value={f.company} onChange={set("company")} />
                    </Field>
                    <Field label="Mobile" error={errors.phone}>
                      <Input value={f.phone} onChange={set("phone")} placeholder="+91" aria-invalid={!!errors.phone} />
                    </Field>
                    <Field label="Email" error={errors.email}>
                      <Input type="email" value={f.email} onChange={set("email")} aria-invalid={!!errors.email} />
                    </Field>
                  </div>
                  <button
                    type="button"
                    className="justify-self-start text-xs font-medium text-primary hover:underline"
                    onClick={() =>
                      setF((x) => ({ ...x, name: demoBuyer.name, company: demoBuyer.company, phone: "+91 98220 41234", email: demoBuyer.email, city: x.city || demoBuyer.city }))
                    }
                  >
                    Fill demo buyer details
                  </button>
                </div>
              )}
              <Button type="submit" size="lg" disabled={busy}>
                {busy && <Loader2 className="animate-spin" />}
                {isBuyer ? "Send enquiry" : "Continue"}
              </Button>
              <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <ShieldCheck className="size-3.5 text-success" /> Your number is shared only with matched, verified suppliers.
              </p>
            </form>
          </>
        )}
        {step === "otp" && (
          <form onSubmit={verifyOtp} className="grid gap-4">
            <DialogHeader>
              <DialogTitle>Verify your mobile</DialogTitle>
              <DialogDescription>We sent a 4-digit code to {f.phone} via SMS & WhatsApp.</DialogDescription>
            </DialogHeader>
            <Input
              autoFocus
              inputMode="numeric"
              maxLength={4}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              className="h-12 text-center text-2xl tracking-[0.6em]"
              aria-invalid={!!errors.otp}
            />
            {errors.otp && <p className="-mt-2 text-xs text-destructive">{errors.otp}</p>}
            <Button type="submit" size="lg" disabled={otp.length !== 4}>
              Verify & send enquiry
            </Button>
            <SimulatedNote>Demo OTP is 1234. Production sends OTP through an SMS gateway / WhatsApp authentication template.</SimulatedNote>
          </form>
        )}
        {step === "done" && created && (
          <div className="grid justify-items-center gap-3 py-4 text-center">
            <span className="grid size-14 place-items-center rounded-full bg-success/12 text-success">
              <CheckCircle2 className="size-8" />
            </span>
            <h3 className="text-lg font-semibold">Enquiry {created.id} submitted</h3>
            <p className="max-w-sm text-sm text-muted-foreground">
              {target?.name ?? "Matched suppliers"} has been notified on WhatsApp and email. You'll get quotes in your dashboard.
            </p>
            <div className="mt-2 flex gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Keep browsing
              </Button>
              <Button
                onClick={() => {
                  setRole("buyer")
                  setOpen(false)
                  navigate(`/buyer/enquiries/${created.id}`)
                }}
              >
                Track enquiry
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export function Field({ label, error, children, hint }: { label: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <div className="grid content-start gap-1.5">
      <Label title={label} className="block truncate text-[13px] leading-5 font-medium text-foreground/80">{label}</Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  )
}
