import { Plus } from "lucide-react"
import { useState, type FormEvent } from "react"
import { toast } from "sonner"
import { Field } from "@/components/market/EnquiryDialog"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { crmUsers } from "@/data/leads"
import { DEMO_ADMIN, useApp } from "@/store/app"
import type { LeadSource } from "@/types"

const sources: LeadSource[] = ["Phone Call", "WhatsApp", "BRICS Desk", "Post Requirement"]

const empty = {
  name: "",
  company: "",
  phone: "",
  email: "",
  city: "",
  title: "",
  categoryId: "",
  quantity: "",
  unit: "Piece",
  budget: "",
  description: "",
  source: "Phone Call" as LeadSource,
  assignTo: "",
}

export function CreateLeadDialog({ onCreated }: { onCreated?: (id: string) => void }) {
  const categories = useApp((s) => s.categories)
  const submitEnquiry = useApp((s) => s.submitEnquiry)
  const assignLead = useApp((s) => s.assignLead)
  const [open, setOpen] = useState(false)
  const [f, setF] = useState(empty)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const set = (k: keyof typeof empty) => (v: string) => setF((x) => ({ ...x, [k]: v }))
  const units = categories.find((c) => c.id === f.categoryId)?.units ?? ["Piece"]

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const err: Record<string, string> = {}
    if (!f.name.trim()) err.name = "Required"
    if (!/^[+\d\s-]{10,}$/.test(f.phone)) err.phone = "Valid mobile required"
    if (!f.city.trim()) err.city = "Required"
    if (!f.title.trim()) err.title = "Describe the requirement"
    if (!f.categoryId) err.categoryId = "Choose a category"
    if (!(Number(f.quantity) > 0)) err.quantity = "Enter quantity"
    setErrors(err)
    if (Object.keys(err).length) return
    const lead = submitEnquiry({
      title: f.title,
      categoryId: f.categoryId,
      quantity: Number(f.quantity),
      unit: f.unit,
      budget: f.budget ? Number(f.budget) : undefined,
      deliveryLocation: f.city,
      description: f.description || `Lead captured by ${DEMO_ADMIN.name} via ${f.source.toLowerCase()}.`,
      attachments: [],
      buyer: { name: f.name, company: f.company || "Individual Buyer", phone: f.phone, email: f.email || "—", city: f.city },
      source: f.source,
    })
    if (f.assignTo) assignLead(lead.id, f.assignTo, DEMO_ADMIN.name)
    toast.success(`Lead ${lead.id} created`, { description: `Auto-matched to ${lead.supplierIds.length} supplier(s).` })
    setOpen(false)
    setF(empty)
    onCreated?.(lead.id)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus /> Create lead
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Create lead manually</DialogTitle>
          <DialogDescription>Capture an enquiry received by phone, WhatsApp or the BRICS desk. Suppliers are matched automatically.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4" noValidate>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Buyer name" error={errors.name}>
              <Input value={f.name} onChange={(e) => set("name")(e.target.value)} aria-invalid={!!errors.name} />
            </Field>
            <Field label="Company">
              <Input value={f.company} onChange={(e) => set("company")(e.target.value)} />
            </Field>
            <Field label="Mobile" error={errors.phone}>
              <Input value={f.phone} onChange={(e) => set("phone")(e.target.value)} placeholder="+91" aria-invalid={!!errors.phone} />
            </Field>
            <Field label="Email">
              <Input type="email" value={f.email} onChange={(e) => set("email")(e.target.value)} />
            </Field>
          </div>
          <Field label="Requirement" error={errors.title}>
            <Input value={f.title} onChange={(e) => set("title")(e.target.value)} placeholder="e.g. 500 kg green cardamom" aria-invalid={!!errors.title} />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Category" error={errors.categoryId}>
              <Select value={f.categoryId} onValueChange={(v) => setF((x) => ({ ...x, categoryId: v, unit: categories.find((c) => c.id === v)?.units[0] ?? "Piece" }))}>
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
            <Field label="Delivery city" error={errors.city}>
              <Input value={f.city} onChange={(e) => set("city")(e.target.value)} aria-invalid={!!errors.city} />
            </Field>
            <div className="grid grid-cols-[1fr_7rem] gap-2">
              <Field label="Quantity" error={errors.quantity}>
                <Input type="number" min={1} value={f.quantity} onChange={(e) => set("quantity")(e.target.value)} aria-invalid={!!errors.quantity} />
              </Field>
              <Field label="Unit">
                <Select value={f.unit} onValueChange={set("unit")}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map((u) => (
                      <SelectItem key={u} value={u}>
                        {u}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <Field label="Budget (₹, optional)">
              <Input type="number" min={0} value={f.budget} onChange={(e) => set("budget")(e.target.value)} />
            </Field>
            <Field label="Lead source">
              <Select value={f.source} onValueChange={(v) => set("source")(v)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sources.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Assign to">
              <Select value={f.assignTo} onValueChange={set("assignTo")}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Leave unassigned" />
                </SelectTrigger>
                <SelectContent>
                  {crmUsers.map((u) => (
                    <SelectItem key={u} value={u}>
                      {u}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
          <Field label="Call remarks / details">
            <Textarea rows={3} value={f.description} onChange={(e) => set("description")(e.target.value)} />
          </Field>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create lead</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
