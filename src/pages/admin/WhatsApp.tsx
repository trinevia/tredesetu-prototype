import { CheckCheck, CircleCheck, Eye, LayoutDashboard, MessageCircle, Package, Plus, Send, Store, Zap } from "lucide-react"
import { useState, type FormEvent } from "react"
import { toast } from "sonner"
import { SearchInput, TableCard } from "@/components/admin/ui"
import { PageHeader, SimulatedNote, StatCard, StatusBadge } from "@/components/common/bits"
import { Field } from "@/components/market/EnquiryDialog"
import { WhatsAppIcon } from "@/components/market/WhatsAppDialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { fmtDateTime, num } from "@/lib/format"
import { useApp, type WhatsAppMessage } from "@/store/app"
import type { WhatsAppTemplate } from "@/types"

const seededLog: WhatsAppMessage[] = [
  { id: "w1", to: "919800000210", toName: "Volta Electronics", body: "Hi Volta Electronics, you have a new enquiry on TradeSetu for *20000 mAh power banks* — Qty 600 from Pune.", at: "2026-10-25T05:40:00.000Z", direction: "outbound", status: "read", leadId: "ENQ-24114" },
  { id: "w2", to: "919822041000", toName: "Rohan Mehta", body: "Hello Rohan, Volta Electronics has sent you a quotation of ₹715/unit for 65W GaN chargers.", at: "2026-10-23T09:30:00.000Z", direction: "outbound", status: "read", leadId: "ENQ-24107" },
  { id: "w3", to: "919930022000", toName: "Aisha Khan", body: "Can you share the speaker catalogue with festive combo pricing?", at: "2026-10-24T08:12:00.000Z", direction: "inbound", status: "read", leadId: "ENQ-24128" },
  { id: "w4", to: "919800000210", toName: "Volta Electronics", body: "Reminder: follow-up due today for enquiry ENQ-24128 (UrbanCart Retail).", at: "2026-10-26T04:00:00.000Z", direction: "outbound", status: "delivered" },
  { id: "w5", to: "201000007721", toName: "Ahmed Saleh", body: "Hello Ahmed, your enquiry for Paracetamol 650 mg was shared with 1 WHO-GMP verified supplier.", at: "2026-10-25T10:02:00.000Z", direction: "outbound", status: "sent" },
]

const placements = [
  { icon: Package, title: "Product detail page", body: "“WhatsApp” button next to Get Quote with product-prefilled message", on: true },
  { icon: Store, title: "Supplier profile & catalogue", body: "Click-to-chat with the supplier's verified business number", on: true },
  { icon: LayoutDashboard, title: "Buyer & supplier dashboards", body: "Chat on any enquiry/lead; messages logged to lead history", on: true },
  { icon: Zap, title: "Automated lead alerts", body: "New-enquiry, quotation and follow-up templates sent automatically", on: true },
  { icon: MessageCircle, title: "Floating site chat widget", body: "Marketplace helpdesk number on all public pages", on: false },
]

export default function AdminWhatsApp() {
  const templates = useApp((s) => s.templates)
  const log = useApp((s) => s.whatsappLog)
  const [q, setQ] = useState("")
  const [ctas, setCtas] = useState(placements.map((p) => p.on))
  const messages = [...log, ...seededLog]
    .filter((m) => !q || `${m.toName} ${m.body}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => b.at.localeCompare(a.at))
  const sent = templates.reduce((a, t) => a + t.sent, 0) + log.length
  const approved = templates.filter((t) => t.status === "Approved")
  const readRate = approved.length ? Math.round(approved.reduce((a, t) => a + t.readRate, 0) / approved.length) : 0

  return (
    <>
      <PageHeader title="WhatsApp Business" description="Templates, automated notifications and conversation log for buyer & supplier communication." actions={<NewTemplateDialog />} />

      <Card className="mb-6 flex-row flex-wrap items-center gap-4 p-5">
        <span className="grid size-12 place-items-center rounded-xl bg-whatsapp/15 text-whatsapp">
          <WhatsAppIcon className="size-6" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold">TradeSetu Marketplace</h3>
            <Badge className="bg-success/12 text-success">
              <CircleCheck /> Connected
            </Badge>
            <Badge variant="outline">Official Business Account</Badge>
          </div>
          <p className="text-sm text-muted-foreground">+91 90000 00000 · Cloud API · Quality rating: <span className="font-medium text-success">High</span> · Messaging limit: 10K/day</p>
        </div>
        <Button variant="outline" onClick={() => toast("Webhook test event received ✔", { description: "Simulated in prototype" })}>
          Test webhook
        </Button>
        <SimulatedNote className="basis-full">
          WhatsApp Business API connection is simulated in this prototype. Production connects through Meta Cloud API or a BSP (e.g. Gupshup / Interakt), with delivery & read receipts via webhooks.
        </SimulatedNote>
      </Card>

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Messages sent (30d)" value={num(sent)} icon={Send} />
        <StatCard label="Delivered" value="98.4%" icon={CheckCheck} tone="success" />
        <StatCard label="Read rate" value={`${readRate}%`} icon={Eye} tone="violet" />
        <StatCard label="Approved templates" value={`${approved.length}/${templates.length}`} icon={MessageCircle} tone="saffron" />
      </div>

      <Tabs defaultValue="templates">
        <TabsList className="mb-4 h-auto flex-wrap">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="log">Message log</TabsTrigger>
          <TabsTrigger value="placements">CTA placements</TabsTrigger>
        </TabsList>
        <TabsContent value="templates">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {templates.map((t) => (
              <Card key={t.id} className="gap-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-mono text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.category} · to {t.audience}s
                    </p>
                  </div>
                  <StatusBadge status={t.status} />
                </div>
                <div className="rounded-lg bg-[#efeae2] p-3">
                  <p className="rounded-lg rounded-tl-none bg-white p-2.5 text-xs leading-relaxed shadow-sm">{t.body}</p>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{num(t.sent)} sent</span>
                  <span>{t.readRate ? `${t.readRate}% read` : "—"}</span>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="log">
          <TableCard toolbar={<SearchInput value={q} onChange={setQ} placeholder="Search contact or message…" />}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Contact</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Lead</TableHead>
                  <TableHead>Direction</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="pr-4 text-right">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {messages.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="whitespace-nowrap pl-4">
                      <div className="font-medium">{m.toName}</div>
                      <div className="text-xs text-muted-foreground">+{m.to}</div>
                    </TableCell>
                    <TableCell className="max-w-96">
                      <p className="line-clamp-2 text-xs">{m.body}</p>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{m.leadId ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={m.direction === "inbound" ? "text-primary" : ""}>
                        {m.direction === "inbound" ? "Incoming" : "Outgoing"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs capitalize">
                      <span className="inline-flex items-center gap-1">
                        <CheckCheck className={m.status === "read" ? "size-3.5 text-sky-500" : "size-3.5 text-muted-foreground"} /> {m.status}
                      </span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap pr-4 text-right text-xs text-muted-foreground">{fmtDateTime(m.at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableCard>
        </TabsContent>
        <TabsContent value="placements">
          <Card className="gap-0 divide-y p-0">
            {placements.map((p, i) => (
              <div key={p.title} className="flex items-center gap-4 p-4">
                <span className="grid size-10 place-items-center rounded-lg bg-whatsapp/12 text-whatsapp">
                  <p.icon className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{p.title}</p>
                  <p className="text-sm text-muted-foreground">{p.body}</p>
                </div>
                <Switch
                  checked={ctas[i]}
                  onCheckedChange={(v) => {
                    setCtas((c) => c.map((x, j) => (j === i ? v : x)))
                    toast.success(`${p.title}: WhatsApp CTA ${v ? "enabled" : "disabled"}`)
                  }}
                  aria-label={p.title}
                />
              </div>
            ))}
          </Card>
        </TabsContent>
      </Tabs>
    </>
  )
}

function NewTemplateDialog() {
  const upsert = useApp((s) => s.upsertTemplate)
  const [open, setOpen] = useState(false)
  const [t, setT] = useState({ name: "", category: "Utility" as WhatsAppTemplate["category"], audience: "Buyer" as WhatsAppTemplate["audience"], body: "" })
  const [err, setErr] = useState("")
  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!/^[a-z0-9_]{3,}$/.test(t.name)) return setErr("Name must be lowercase letters, numbers and underscores")
    if (t.body.trim().length < 10) return setErr("Message body is too short")
    upsert({ id: `wt-${Date.now()}`, ...t, status: "Pending", sent: 0, readRate: 0 })
    toast.success("Template submitted to Meta for approval", { description: "Usually approved within 24 hours." })
    setOpen(false)
    setT({ name: "", category: "Utility", audience: "Buyer", body: "" })
    setErr("")
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus /> New template
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={submit} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>New message template</DialogTitle>
            <DialogDescription>Use {"{{1}}"}, {"{{2}}"} … for variables such as buyer name or product.</DialogDescription>
          </DialogHeader>
          <Field label="Template name">
            <Input value={t.name} onChange={(e) => setT({ ...t, name: e.target.value })} placeholder="e.g. sample_request_update" className="font-mono" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Category">
              <Select value={t.category} onValueChange={(v) => setT({ ...t, category: v as WhatsAppTemplate["category"] })}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(["Utility", "Marketing", "Authentication"] as const).map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Audience">
              <Select value={t.audience} onValueChange={(v) => setT({ ...t, audience: v as WhatsAppTemplate["audience"] })}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Buyer">Buyer</SelectItem>
                  <SelectItem value="Supplier">Supplier</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
          <Field label="Message body">
            <Textarea rows={4} value={t.body} onChange={(e) => setT({ ...t, body: e.target.value })} placeholder="Hi {{1}}, your sample for {{2}} has been dispatched…" />
          </Field>
          {err && <p className="text-sm text-destructive">{err}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Submit for approval</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
