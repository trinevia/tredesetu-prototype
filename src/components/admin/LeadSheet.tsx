import { Building2, CircleCheckBig, CircleX, Globe2, Mail, MapPin, Phone } from "lucide-react"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import { StatusBadge } from "@/components/common/bits"
import { ActivityTimeline, NotesPanel, RequirementGrid } from "@/components/leads/LeadShared"
import { SupplierLogo } from "@/components/market/cards"
import { WhatsAppDialog, WhatsAppIcon } from "@/components/market/WhatsAppDialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { crmUsers } from "@/data/leads"
import { fmtDate, inr } from "@/lib/format"
import { DEMO_ADMIN, useApp } from "@/store/app"
import type { CrmStage } from "@/types"

export const crmStages: CrmStage[] = ["New", "Assigned", "Contacted", "Qualified", "Quotation", "Negotiation", "Won", "Lost"]

export function LeadSheet({ leadId, onOpenChange }: { leadId: string | null; onOpenChange: (open: boolean) => void }) {
  const lead = useApp((s) => s.leads.find((l) => l.id === leadId))
  const suppliers = useApp((s) => s.suppliers)
  const categories = useApp((s) => s.categories)
  const assignLead = useApp((s) => s.assignLead)
  const setCrmStage = useApp((s) => s.setCrmStage)
  const me = DEMO_ADMIN.name

  return (
    <Sheet open={!!leadId} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 overflow-y-auto p-0 sm:max-w-2xl">
        {lead && (
          <>
            <SheetHeader className="border-b p-5 pr-12">
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="font-mono">{lead.id}</span>
                <StatusBadge status={lead.crmStage} />
                <Badge variant="outline" className={lead.priority === "High" ? "border-rose-200 text-rose-700" : ""}>
                  {lead.priority} priority
                </Badge>
                {lead.international && (
                  <Badge variant="outline" className="border-primary/30 text-primary">
                    <Globe2 /> BRICS · {lead.international.country}
                  </Badge>
                )}
              </div>
              <SheetTitle className="text-lg leading-snug">{lead.title}</SheetTitle>
              <SheetDescription>
                {categories.find((c) => c.id === lead.categoryId)?.name} · {lead.source}
              </SheetDescription>
            </SheetHeader>

            <div className="grid gap-3 border-b bg-muted/30 p-5 sm:grid-cols-2">
              <div className="grid content-start gap-1.5">
                <span className="text-xs font-medium">Assigned to</span>
                <Select
                  value={lead.assignedTo ?? ""}
                  onValueChange={(v) => {
                    assignLead(lead.id, v, me)
                    toast.success(`Lead assigned to ${v}`, { description: "They've been notified in-app and on WhatsApp." })
                  }}
                >
                  <SelectTrigger className="w-full bg-background">
                    <SelectValue placeholder="Unassigned" />
                  </SelectTrigger>
                  <SelectContent>
                    {crmUsers.map((u) => (
                      <SelectItem key={u} value={u}>
                        {u}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid content-start gap-1.5">
                <span className="text-xs font-medium">Lead status</span>
                <Select
                  value={lead.crmStage}
                  onValueChange={(v) => {
                    setCrmStage(lead.id, v as CrmStage, me)
                    toast.success(`Status changed to ${v}`)
                  }}
                >
                  <SelectTrigger className="w-full bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {crmStages.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-wrap gap-2 sm:col-span-2">
                <Button
                  size="sm"
                  className="bg-success text-success-foreground hover:bg-success/90"
                  disabled={lead.crmStage === "Won"}
                  onClick={() => {
                    setCrmStage(lead.id, "Won", me)
                    toast.success("Marked as Won 🎉")
                  }}
                >
                  <CircleCheckBig /> Mark Won
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={lead.crmStage === "Lost"}
                  onClick={() => {
                    setCrmStage(lead.id, "Lost", me)
                    toast("Marked as Lost")
                  }}
                >
                  <CircleX /> Mark Lost
                </Button>
                <WhatsAppDialog
                  toName={lead.buyer.name}
                  phone={lead.buyer.phone}
                  leadId={lead.id}
                  defaultMessage={`Hi ${lead.buyer.name.split(" ")[0]}, this is ${me} from TradeSetu regarding your enquiry ${lead.id} for “${lead.title}”. We have shortlisted verified suppliers — can we schedule a quick call?`}
                  quickReplies={[
                    "Could you confirm the exact specifications and quantity?",
                    "Suppliers have shared quotes — please check your dashboard.",
                    "Is your delivery timeline flexible by a week?",
                  ]}
                >
                  <Button size="sm" variant="outline" className="border-whatsapp/40 text-whatsapp hover:bg-whatsapp/10 hover:text-whatsapp">
                    <WhatsAppIcon /> WhatsApp buyer
                  </Button>
                </WhatsAppDialog>
              </div>
            </div>

            <Tabs defaultValue="overview" className="p-5">
              <TabsList className="w-full">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="notes">Notes & follow-up</TabsTrigger>
                <TabsTrigger value="history">History ({lead.activity.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-4 space-y-5">
                <RequirementGrid lead={lead} />
                <p className="rounded-lg border p-3 text-sm leading-relaxed">{lead.description}</p>

                <section>
                  <h4 className="mb-2 text-sm font-semibold">Buyer</h4>
                  <div className="grid gap-2 rounded-lg border p-3 text-sm sm:grid-cols-2">
                    <span className="font-medium">
                      {lead.buyer.name}
                      <span className="block text-xs font-normal text-muted-foreground">{lead.buyer.company}</span>
                    </span>
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <MapPin className="size-3.5" /> {lead.buyer.city}
                    </span>
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Phone className="size-3.5" /> {lead.buyer.phone}
                    </span>
                    <span className="flex items-center gap-1.5 truncate text-muted-foreground">
                      <Mail className="size-3.5" /> {lead.buyer.email}
                    </span>
                  </div>
                </section>

                <section>
                  <h4 className="mb-2 text-sm font-semibold">Matched suppliers ({lead.supplierIds.length})</h4>
                  <div className="divide-y rounded-lg border">
                    {lead.supplierIds.map((id) => {
                      const s = suppliers.find((x) => x.id === id)
                      if (!s) return null
                      return (
                        <div key={id} className="flex items-center gap-3 p-3">
                          <SupplierLogo supplier={s} className="size-9 text-xs" />
                          <div className="min-w-0 flex-1">
                            <Link to={`/suppliers/${s.id}`} className="truncate text-sm font-medium hover:text-primary">
                              {s.name}
                            </Link>
                            <p className="text-xs text-muted-foreground">
                              {s.city} · responds {s.responseTime.toLowerCase()}
                            </p>
                          </div>
                          <StatusBadge status={lead.supplierStage[id] ?? "New"} />
                        </div>
                      )
                    })}
                    {lead.supplierIds.length === 0 && (
                      <p className="flex items-center gap-2 p-3 text-sm text-muted-foreground">
                        <Building2 className="size-4" /> No supplier matched yet — assign manually.
                      </p>
                    )}
                  </div>
                </section>

                <section>
                  <h4 className="mb-2 text-sm font-semibold">Quotations ({lead.quotes.length})</h4>
                  {lead.quotes.length === 0 ? (
                    <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">No quotations yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {lead.quotes.map((q) => (
                        <div key={q.id} className="rounded-lg border p-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-sm font-medium">{suppliers.find((s) => s.id === q.supplierId)?.name}</span>
                            <StatusBadge status={q.status === "accepted" ? "Won" : q.status === "declined" ? "Lost" : "Quotation Sent"} />
                          </div>
                          <p className="mt-1 text-sm">
                            <span className="font-semibold text-brand">{inr(q.pricePerUnit)}</span>/unit · Total {inr(q.total)} · Lead time{" "}
                            {q.leadTime} · Valid till {fmtDate(q.validTill)}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">{q.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </TabsContent>

              <TabsContent value="notes" className="mt-4">
                <NotesPanel lead={lead} author={me} allowInternal />
              </TabsContent>

              <TabsContent value="history" className="mt-4 pl-2">
                <ActivityTimeline activity={lead.activity} />
              </TabsContent>
            </Tabs>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
