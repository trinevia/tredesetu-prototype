import { Building2, CalendarClock, Check, FileText, Mail, MapPin, MessageCircle, Phone } from "lucide-react"
import { toast } from "sonner"
import { StatusBadge } from "@/components/common/bits"
import { ActivityTimeline, NotesPanel, RequirementGrid } from "@/components/leads/LeadShared"
import { WhatsAppDialog } from "@/components/market/WhatsAppDialog"
import { QuoteDialog } from "@/components/supplier/QuoteDialog"
import { SUPPLIER_STAGES, stageOf } from "@/components/supplier/useSupplierData"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fmtDate, fmtDateTime, inr } from "@/lib/format"
import { DEMO_SUPPLIER_ID, useApp } from "@/store/app"
import { cn } from "@/lib/utils"
import type { SupplierStage } from "@/types"

const PATH: SupplierStage[] = ["New", "Contacted", "In Discussion", "Quotation Sent", "Negotiation", "Won"]

/** Clickable progress along the main deal path; Lost / Follow-up show as a side state. */
function StageStepper({ stage, onChange }: { stage: SupplierStage; onChange: (s: SupplierStage) => void }) {
  const idx = PATH.indexOf(stage)
  const off = idx === -1
  return (
    <div className="mt-3">
      <div className="flex items-center">
        {PATH.map((st, i) => {
          const done = !off && i < idx
          const current = !off && i === idx
          return (
            <div key={st} className="flex flex-1 items-center last:flex-none">
              <button
                type="button"
                onClick={() => onChange(st)}
                title={`Move to ${st}`}
                className={cn(
                  "grid size-7 shrink-0 place-items-center rounded-full border-2 text-[11px] font-semibold transition",
                  done && "border-primary bg-primary text-primary-foreground",
                  current && (st === "Won" ? "border-emerald-500 bg-emerald-500 text-white" : "border-primary bg-background text-primary ring-4 ring-primary/15"),
                  !done && !current && "border-border bg-background text-muted-foreground hover:border-primary/50",
                )}
              >
                {done ? <Check className="size-3.5" strokeWidth={3} /> : i + 1}
              </button>
              {i < PATH.length - 1 && <span className={cn("mx-1 h-0.5 flex-1 rounded-full", done ? "bg-primary" : "bg-border")} />}
            </div>
          )
        })}
      </div>
      <div className="mt-1.5 flex justify-between text-[10px] font-medium text-muted-foreground">
        {PATH.map((st) => (
          <span key={st} className={cn("w-7 text-center leading-tight", st === stage && "text-primary")}>
            {st === "In Discussion" ? "Discuss" : st === "Quotation Sent" ? "Quote" : st === "Negotiation" ? "Negotiate" : st}
          </span>
        ))}
      </div>
      {off && (
        <p className={cn("mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-medium", stage === "Lost" ? "bg-zinc-100 text-zinc-600" : "bg-rose-50 text-rose-700")}>
          Current stage: {stage}
        </p>
      )}
    </div>
  )
}

const AUTHOR = "Arjun Malhotra"

export function LeadSheet({ leadId, onClose }: { leadId: string | null; onClose: () => void }) {
  const lead = useApp((s) => s.leads.find((l) => l.id === leadId))
  const setStage = useApp((s) => s.setSupplierStage)
  const myQuotes = lead?.quotes.filter((q) => q.supplierId === DEMO_SUPPLIER_ID) ?? []

  return (
    <Sheet open={!!lead} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full gap-0 overflow-y-auto p-0 data-[side=right]:sm:max-w-2xl">
        {lead && (
          <>
            <SheetHeader className="gap-1.5 border-b bg-surface p-5 pr-12">
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="font-mono">{lead.id}</span>
                <span>·</span>
                <span>{lead.source}</span>
                <span
                  className={`rounded-full px-2 py-0.5 font-medium ${lead.priority === "High" ? "bg-rose-50 text-rose-700" : "bg-muted text-muted-foreground"}`}
                >
                  {lead.priority} priority
                </span>
              </div>
              <SheetTitle className="text-lg leading-snug">{lead.title}</SheetTitle>
              <SheetDescription>Received {fmtDateTime(lead.createdAt)}</SheetDescription>
              <StageStepper
                stage={stageOf(lead)}
                onChange={(v) => {
                  setStage(lead.id, DEMO_SUPPLIER_ID, v, AUTHOR)
                  toast.success(`Moved to “${v}”`)
                }}
              />
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <QuoteDialog lead={lead}>
                  <Button>
                    <FileText /> Send quotation
                  </Button>
                </QuoteDialog>
                <WhatsAppDialog
                  toName={lead.buyer.name}
                  phone={lead.buyer.phone}
                  leadId={lead.id}
                  defaultMessage={`Hello ${lead.buyer.name.split(" ")[0]}, this is Arjun from Volta Electronics regarding your TradeSetu enquiry ${lead.id} for ${lead.title}. When would be a good time to discuss your requirement?`}
                  quickReplies={[
                    `We can supply ${lead.quantity} ${lead.unit}. Sharing our quotation shortly.`,
                    "Could you confirm the exact specifications and branding requirement?",
                    "Sharing our product catalogue and price list.",
                    "Following up on our quotation — happy to discuss pricing.",
                  ]}
                >
                  <Button variant="outline" className="border-whatsapp/40 text-whatsapp hover:bg-whatsapp/10 hover:text-whatsapp">
                    <MessageCircle /> WhatsApp
                  </Button>
                </WhatsAppDialog>
                <Button variant="outline" asChild>
                  <a href={`tel:${lead.buyer.phone}`}>
                    <Phone /> Call
                  </a>
                </Button>
                <Select
                  value={stageOf(lead)}
                  onValueChange={(v) => {
                    setStage(lead.id, DEMO_SUPPLIER_ID, v as SupplierStage, AUTHOR)
                    toast.success(`Moved to “${v}”`)
                  }}
                >
                  <SelectTrigger className="ml-auto w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPLIER_STAGES.map((st) => (
                      <SelectItem key={st} value={st}>
                        {st}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </SheetHeader>

            <div className="space-y-6 p-5">
              <section className="rounded-2xl border bg-card p-4 shadow-xs">
                <div className="flex items-start gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {lead.buyer.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{lead.buyer.name}</p>
                    <p className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Building2 className="size-3.5" /> {lead.buyer.company}
                    </p>
                  </div>
                  {lead.international && (
                    <span className="rounded-full bg-saffron/15 px-2 py-0.5 text-xs font-medium text-amber-700">BRICS · {lead.international.country}</span>
                  )}
                </div>
                <div className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
                  <a href={`tel:${lead.buyer.phone}`} className="flex items-center gap-1.5 text-muted-foreground hover:text-primary">
                    <Phone className="size-3.5" /> {lead.buyer.phone}
                  </a>
                  <a href={`mailto:${lead.buyer.email}`} className="flex min-w-0 items-center gap-1.5 truncate text-muted-foreground hover:text-primary">
                    <Mail className="size-3.5 shrink-0" /> <span className="truncate">{lead.buyer.email}</span>
                  </a>
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <MapPin className="size-3.5" /> {lead.buyer.city}
                  </span>
                </div>
                {lead.followUpAt && (
                  <p className="mt-3 flex items-center gap-1.5 rounded-md bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
                    <CalendarClock className="size-3.5" /> Follow-up scheduled {fmtDateTime(lead.followUpAt)}
                  </p>
                )}
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-semibold">Requirement</h3>
                <RequirementGrid lead={lead} />
                <p className="text-sm leading-relaxed text-muted-foreground">{lead.description}</p>
              </section>

              {myQuotes.length > 0 && (
                <section className="space-y-2">
                  <h3 className="text-sm font-semibold">Your quotations</h3>
                  {myQuotes.map((q) => (
                    <div key={q.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3 text-sm">
                      <div>
                        <p className="font-semibold text-brand">
                          {inr(q.pricePerUnit)} / {lead.unit} · {inr(q.total)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {q.leadTime} · valid till {fmtDate(q.validTill)}
                        </p>
                      </div>
                      <StatusBadge status={q.status === "accepted" ? "Won" : q.status === "declined" ? "Negotiation" : "Quotation Sent"} />
                    </div>
                  ))}
                </section>
              )}

              <Tabs defaultValue="notes">
                <TabsList>
                  <TabsTrigger value="notes" className="px-3">
                    Notes & follow-up
                  </TabsTrigger>
                  <TabsTrigger value="history" className="px-3">
                    Communication history
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="notes" className="mt-4">
                  <NotesPanel key={lead.id} lead={lead} author={AUTHOR} />
                </TabsContent>
                <TabsContent value="history" className="mt-4">
                  <ActivityTimeline activity={lead.activity} />
                </TabsContent>
              </Tabs>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
