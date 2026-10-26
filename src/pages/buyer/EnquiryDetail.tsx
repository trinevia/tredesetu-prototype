import { ArrowLeft, Check, CheckCircle2, Clock, FileSearch, MessageCircle, RefreshCcw, Trophy } from "lucide-react"
import { Link, useParams } from "react-router-dom"
import { toast } from "sonner"
import { BuyerStatusBadge } from "@/components/buyer/BuyerStatusBadge"
import { buyerStatus } from "@/components/buyer/useBuyer"
import { EmptyState, PageHeader, Rating, StatusBadge, VerifiedBadge } from "@/components/common/bits"
import { ActivityTimeline, RequirementGrid } from "@/components/leads/LeadShared"
import { SupplierLogo } from "@/components/market/cards"
import { WhatsAppDialog } from "@/components/market/WhatsAppDialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { fmtDate, fmtDateTime, inr } from "@/lib/format"
import { cn } from "@/lib/utils"
import { useApp } from "@/store/app"
import type { Lead } from "@/types"

function progressStep(l: Lead) {
  const stages = Object.values(l.supplierStage)
  if (l.crmStage === "Won" || l.crmStage === "Lost" || l.quotes.some((q) => q.status !== "sent")) return 4
  if (l.quotes.length) return 3
  if (stages.some((s) => s !== "New") || l.assignedTo) return 2
  if (l.supplierIds.length) return 1
  return 0
}

const steps = ["Submitted", "Matched", "Supplier responded", "Quotation", "Decision"]

export default function BuyerEnquiryDetail() {
  const { id } = useParams()
  const lead = useApp((s) => s.leads.find((l) => l.id === id))
  const suppliers = useApp((s) => s.suppliers)
  const respond = useApp((s) => s.respondToQuote)

  if (!lead) {
    return (
      <EmptyState
        icon={FileSearch}
        title="Enquiry not found"
        body="This enquiry may have been removed or the link is incorrect."
        action={
          <Button asChild>
            <Link to="/buyer/enquiries">Back to enquiries</Link>
          </Button>
        }
      />
    )
  }

  const step = progressStep(lead)
  const decided = lead.crmStage === "Won" || lead.quotes.some((q) => q.status === "accepted")
  const sortedQuotes = [...lead.quotes].sort((a, b) => a.pricePerUnit - b.pricePerUnit)
  const lowest = sortedQuotes[0]?.pricePerUnit

  return (
    <>
      <Link to="/buyer/enquiries" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> All enquiries
      </Link>
      <PageHeader
        title={lead.title}
        description={`${lead.id} · submitted ${fmtDateTime(lead.createdAt)}${lead.assignedTo ? ` · Trade advisor: ${lead.assignedTo}` : ""}`}
        actions={<BuyerStatusBadge status={buyerStatus(lead)} className="h-7 px-3 text-xs" />}
      />

      <Card className="mb-6 p-4 sm:p-5">
        <ol className="grid grid-cols-5 gap-1">
          {steps.map((s, i) => (
            <li key={s} className="flex flex-col items-center gap-2 text-center">
              <div className="flex w-full items-center">
                <span className={cn("h-0.5 flex-1", i === 0 ? "bg-transparent" : i <= step ? "bg-primary" : "bg-border")} />
                <span
                  className={cn(
                    "grid size-8 shrink-0 place-items-center rounded-full text-xs font-semibold",
                    i < step ? "bg-primary text-primary-foreground" : i === step ? "bg-primary/15 text-primary ring-2 ring-primary" : "bg-muted text-muted-foreground",
                  )}
                >
                  {i < step ? <Check className="size-4" /> : i + 1}
                </span>
                <span className={cn("h-0.5 flex-1", i === steps.length - 1 ? "bg-transparent" : i < step ? "bg-primary" : "bg-border")} />
              </div>
              <span className={cn("text-[11px] leading-tight sm:text-xs", i <= step ? "font-medium" : "text-muted-foreground")}>{s}</span>
            </li>
          ))}
        </ol>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Quotations</CardTitle>
              <CardDescription>
                {lead.quotes.length ? `${lead.quotes.length} quotation(s) received — sorted by price` : "Suppliers usually respond within a few hours."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {lead.quotes.length === 0 && (
                <div className="flex items-center gap-3 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                  <Clock className="size-5 text-saffron" /> Waiting for suppliers to quote. You'll be notified on WhatsApp and email.
                </div>
              )}
              {sortedQuotes.map((q) => {
                const s = suppliers.find((x) => x.id === q.supplierId)
                return (
                  <div
                    key={q.id}
                    className={cn(
                      "rounded-xl border p-4",
                      q.status === "accepted" && "border-success/50 bg-success/[0.04]",
                      q.status === "declined" && "opacity-70",
                    )}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {s && <SupplierLogo supplier={s} className="size-10" />}
                        <div>
                          <p className="font-medium">{s?.name}</p>
                          <p className="text-xs text-muted-foreground">Quoted {fmtDateTime(q.at)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-semibold text-brand">
                          {inr(q.pricePerUnit)}
                          <span className="text-xs font-normal text-muted-foreground"> / {lead.unit}</span>
                        </p>
                        {q.pricePerUnit === lowest && lead.quotes.length > 1 && (
                          <span className="text-[11px] font-semibold text-success">Lowest price</span>
                        )}
                      </div>
                    </div>
                    <dl className="mt-3 grid grid-cols-3 gap-2 text-sm">
                      <div className="rounded-lg bg-muted/60 px-3 py-2">
                        <dt className="text-[11px] text-muted-foreground">Total value</dt>
                        <dd className="font-medium">{inr(q.total)}</dd>
                      </div>
                      <div className="rounded-lg bg-muted/60 px-3 py-2">
                        <dt className="text-[11px] text-muted-foreground">Lead time</dt>
                        <dd className="font-medium">{q.leadTime}</dd>
                      </div>
                      <div className="rounded-lg bg-muted/60 px-3 py-2">
                        <dt className="text-[11px] text-muted-foreground">Valid till</dt>
                        <dd className="font-medium">{fmtDate(q.validTill)}</dd>
                      </div>
                    </dl>
                    <p className="mt-3 text-sm text-muted-foreground">“{q.message}”</p>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      {q.status === "sent" && !decided && (
                        <>
                          <Button
                            onClick={() => {
                              respond(lead.id, q.id, true)
                              toast.success("Quotation accepted", { description: `${s?.name} has been notified to proceed with your order.` })
                            }}
                          >
                            <CheckCircle2 /> Accept quotation
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              respond(lead.id, q.id, false)
                              toast.success("Revision requested", { description: "The supplier will send an updated offer." })
                            }}
                          >
                            <RefreshCcw /> Request revision
                          </Button>
                        </>
                      )}
                      {q.status === "accepted" && (
                        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-success">
                          <Trophy className="size-4" /> Accepted — supplier is processing your order
                        </span>
                      )}
                      {q.status === "declined" && <span className="text-sm text-muted-foreground">Revision requested</span>}
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Requirement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RequirementGrid lead={lead} />
              <p className="text-sm leading-relaxed text-muted-foreground">{lead.description}</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Matched suppliers</CardTitle>
              <CardDescription>Shared via category & location matching</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {lead.supplierIds.map((sid) => {
                const s = suppliers.find((x) => x.id === sid)
                if (!s) return null
                return (
                  <div key={sid} className="rounded-lg border p-3">
                    <div className="flex items-start gap-3">
                      <SupplierLogo supplier={s} className="size-9 text-xs" />
                      <div className="min-w-0 flex-1">
                        <Link to={`/suppliers/${s.id}`} className="line-clamp-1 text-sm font-medium hover:text-primary">
                          {s.name}
                        </Link>
                        <div className="mt-0.5 flex flex-wrap items-center gap-2">
                          <Rating value={s.rating} />
                          {s.verified && <VerifiedBadge />}
                        </div>
                      </div>
                      <StatusBadge status={lead.supplierStage[sid] ?? "New"} />
                    </div>
                    <WhatsAppDialog
                      toName={s.name}
                      phone={s.whatsapp}
                      leadId={lead.id}
                      defaultMessage={`Hi ${s.name}, following up on my enquiry ${lead.id} for ${lead.title} (${lead.quantity} ${lead.unit}). Could you share an update?`}
                      quickReplies={["Can you share product samples?", "Please confirm the delivery timeline.", "Is there a better price for a larger quantity?"]}
                    >
                      <Button size="sm" variant="outline" className="mt-3 w-full border-whatsapp/40 text-whatsapp hover:bg-whatsapp/10 hover:text-whatsapp">
                        <MessageCircle /> WhatsApp supplier
                      </Button>
                    </WhatsAppDialog>
                  </div>
                )
              })}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityTimeline activity={lead.activity} />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
