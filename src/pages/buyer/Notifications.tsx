import { Bell, BellOff, Mail, MessageCircle, Smartphone } from "lucide-react"
import { useState } from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import { EmptyState, PageHeader } from "@/components/common/bits"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fmtDateTime } from "@/lib/format"
import { cn } from "@/lib/utils"
import { useApp } from "@/store/app"
import type { AppNotification } from "@/types"

const channelIcon = { "in-app": Bell, email: Mail, whatsapp: MessageCircle, sms: Smartphone }
const channels: AppNotification["channel"][] = ["in-app", "email", "whatsapp", "sms"]
const channelLabel = { "in-app": "In-app", email: "Email", whatsapp: "WhatsApp", sms: "SMS" }
const events = [
  { id: "registration", label: "Registration & account", hint: "Welcome, verification and security alerts" },
  { id: "enquiry", label: "Enquiry submission", hint: "Confirmation when your requirement is shared" },
  { id: "response", label: "Supplier responses", hint: "New quotations and supplier messages" },
  { id: "status", label: "Status updates", hint: "Follow-ups, order confirmations and closures" },
]

export default function BuyerNotifications() {
  const notifications = useApp((s) => s.notifications)
  const all = notifications.filter((n) => n.role === "buyer")
  const markAll = useApp((s) => s.markNotificationsRead)
  const markOne = useApp((s) => s.markNotificationRead)
  const [filter, setFilter] = useState<"all" | AppNotification["channel"]>("all")
  const [prefs, setPrefs] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(events.flatMap((e) => channels.map((c) => [`${e.id}:${c}`, c !== "sms" || e.id === "registration"]))),
  )
  const items = all.filter((n) => filter === "all" || n.channel === filter)

  return (
    <>
      <PageHeader
        title="Notifications"
        description="Updates on your enquiries across in-app, email, WhatsApp and SMS."
        actions={
          <Button variant="outline" onClick={() => markAll("buyer")}>
            Mark all as read
          </Button>
        }
      />
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <div className="mb-3 max-w-full overflow-x-auto scrollbar-none">
            <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
              <TabsList>
                <TabsTrigger value="all" className="px-3">
                  All
                </TabsTrigger>
                {channels.map((c) => (
                  <TabsTrigger key={c} value={c} className="px-3">
                    {channelLabel[c]}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
          {items.length === 0 ? (
            <EmptyState icon={BellOff} title="Nothing here" body="No notifications on this channel yet." />
          ) : (
            <Card className="gap-0 p-0">
              {items.map((n) => {
                const Icon = channelIcon[n.channel]
                const inner = (
                  <div className={cn("flex gap-3 border-b px-4 py-4 last:border-0", !n.read && "bg-primary/[0.03]")}>
                    <span
                      className={cn(
                        "grid size-9 shrink-0 place-items-center rounded-full",
                        n.channel === "whatsapp" ? "bg-whatsapp/12 text-whatsapp" : "bg-primary/10 text-primary",
                      )}
                    >
                      <Icon className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium">{n.title}</p>
                        {!n.read && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />}
                      </div>
                      <p className="text-sm text-muted-foreground">{n.body}</p>
                      <p className="mt-1 text-xs text-muted-foreground/80">
                        {fmtDateTime(n.at)} · via {channelLabel[n.channel]}
                      </p>
                    </div>
                  </div>
                )
                return n.link ? (
                  <Link key={n.id} to={n.link} onClick={() => markOne(n.id)} className="block transition hover:bg-muted/40">
                    {inner}
                  </Link>
                ) : (
                  <button key={n.id} type="button" onClick={() => markOne(n.id)} className="block w-full text-left transition hover:bg-muted/40">
                    {inner}
                  </button>
                )
              })}
            </Card>
          )}
        </div>
        <Card className="h-fit lg:col-span-2">
          <CardHeader>
            <CardTitle>Notification preferences</CardTitle>
            <CardDescription>Choose how you hear about each event</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="grid grid-cols-[1fr_repeat(4,2.75rem)] items-center gap-1 pb-2 text-center text-[11px] font-medium text-muted-foreground">
              <span />
              {channels.map((c) => {
                const Icon = channelIcon[c]
                return (
                  <span key={c} className="flex flex-col items-center gap-0.5">
                    <Icon className="size-3.5" />
                    {channelLabel[c]}
                  </span>
                )
              })}
            </div>
            {events.map((e) => (
              <div key={e.id} className="grid grid-cols-[1fr_repeat(4,2.75rem)] items-center gap-1 border-t py-3">
                <div className="pr-2">
                  <p className="text-sm font-medium">{e.label}</p>
                  <p className="text-xs text-muted-foreground">{e.hint}</p>
                </div>
                {channels.map((c) => (
                  <span key={c} className="flex justify-center">
                    <Switch
                      size="sm"
                      checked={prefs[`${e.id}:${c}`]}
                      onCheckedChange={(v) => setPrefs((p) => ({ ...p, [`${e.id}:${c}`]: v }))}
                      aria-label={`${e.label} via ${channelLabel[c]}`}
                    />
                  </span>
                ))}
              </div>
            ))}
            <Button className="mt-3 w-full" onClick={() => toast.success("Notification preferences saved")}>
              Save preferences
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
