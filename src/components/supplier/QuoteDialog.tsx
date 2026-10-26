import { FileText, Loader2 } from "lucide-react"
import { useState, type FormEvent, type ReactNode } from "react"
import { toast } from "sonner"
import { Field } from "@/components/market/EnquiryDialog"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { inr, num } from "@/lib/format"
import { DEMO_SUPPLIER_ID, useApp } from "@/store/app"
import type { Lead } from "@/types"

export function QuoteDialog({ lead, children }: { lead: Lead; children: ReactNode }) {
  const product = useApp((s) => s.products.find((p) => p.id === lead.productId))
  const sendQuote = useApp((s) => s.sendQuote)
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const init = () => ({
    price: String(product?.priceMin ?? ""),
    qty: String(lead.quantity),
    leadTime: "10–12 working days",
    validTill: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
    message: `Dear ${lead.buyer.name.split(" ")[0]}, thank you for your enquiry. Please find our best price for ${num(lead.quantity)} ${lead.unit} delivered to ${lead.deliveryLocation}, inclusive of standard packaging. GST extra as applicable. Payment: 30% advance, balance before dispatch.`,
  })
  const [f, setF] = useState(init)
  const total = (Number(f.price) || 0) * (Number(f.qty) || 0)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const er: Record<string, string> = {}
    if (!Number(f.price) || Number(f.price) <= 0) er.price = "Enter a price per unit"
    if (!Number(f.qty) || Number(f.qty) <= 0) er.qty = "Enter quantity"
    if (!f.leadTime.trim()) er.leadTime = "Required"
    if (!f.validTill) er.validTill = "Required"
    setErrors(er)
    if (Object.keys(er).length) return
    setBusy(true)
    setTimeout(() => {
      sendQuote(lead.id, {
        supplierId: DEMO_SUPPLIER_ID,
        pricePerUnit: Number(f.price),
        total,
        message: f.message,
        leadTime: f.leadTime,
        validTill: f.validTill,
      })
      setBusy(false)
      setOpen(false)
      toast.success("Quotation sent", { description: `${lead.buyer.name} has been notified on WhatsApp & email.` })
    }, 500)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (o) {
          setF(init())
          setErrors({})
        }
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="size-4 text-primary" /> Send quotation
          </DialogTitle>
          <DialogDescription>
            {lead.id} · {lead.buyer.company}
            {product && ` · your list price ${inr(product.priceMin)}–${inr(product.priceMax)}`}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4" noValidate>
          <div className="grid grid-cols-2 gap-3">
            <Field label={`Price per ${lead.unit} (₹)`} error={errors.price}>
              <Input type="number" min={0} value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} aria-invalid={!!errors.price} />
            </Field>
            <Field label={`Quantity (${lead.unit})`} error={errors.qty}>
              <Input type="number" min={1} value={f.qty} onChange={(e) => setF({ ...f, qty: e.target.value })} aria-invalid={!!errors.qty} />
            </Field>
            <Field label="Lead time" error={errors.leadTime}>
              <Input value={f.leadTime} onChange={(e) => setF({ ...f, leadTime: e.target.value })} aria-invalid={!!errors.leadTime} />
            </Field>
            <Field label="Valid till" error={errors.validTill}>
              <Input type="date" value={f.validTill} onChange={(e) => setF({ ...f, validTill: e.target.value })} aria-invalid={!!errors.validTill} />
            </Field>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-primary/5 px-4 py-3">
            <span className="text-sm text-muted-foreground">Quotation total (excl. GST)</span>
            <span className="text-lg font-semibold text-brand">{inr(total)}</span>
          </div>
          <Field label="Message to buyer">
            <Textarea rows={4} value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} />
          </Field>
          <Button type="submit" disabled={busy}>
            {busy && <Loader2 className="animate-spin" />} Send quotation
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
