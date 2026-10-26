import {
  BellRing,
  CalendarClock,
  CircleDot,
  FileText,
  Mail,
  MessageCircle,
  NotebookPen,
  PhoneCall,
  Shuffle,
  Sparkles,
  UserPlus,
  type LucideIcon,
} from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { fmtDateTime, inr, num } from "@/lib/format"
import { cn } from "@/lib/utils"
import { useApp } from "@/store/app"
import type { Lead, LeadActivity, LeadNote } from "@/types"

const activityIcon: Record<LeadActivity["kind"], LucideIcon> = {
  created: Sparkles,
  matched: Shuffle,
  assigned: UserPlus,
  status: CircleDot,
  whatsapp: MessageCircle,
  email: Mail,
  quote: FileText,
  note: NotebookPen,
  followup: CalendarClock,
  viewed: BellRing,
}

export function ActivityTimeline({ activity }: { activity: LeadActivity[] }) {
  return (
    <ol className="relative space-y-4 border-l pl-5">
      {activity.map((a) => {
        const Icon = activityIcon[a.kind]
        return (
          <li key={a.id} className="relative">
            <span
              className={cn(
                "absolute -left-[31px] grid size-6 place-items-center rounded-full ring-4 ring-background",
                a.kind === "whatsapp" ? "bg-whatsapp/15 text-whatsapp" : a.kind === "quote" ? "bg-saffron/20 text-amber-700" : "bg-primary/10 text-primary",
              )}
            >
              <Icon className="size-3" />
            </span>
            <p className="text-sm">{a.text}</p>
            <p className="text-xs text-muted-foreground">
              {a.by} · {fmtDateTime(a.at)}
            </p>
          </li>
        )
      })}
    </ol>
  )
}

const noteKinds: { value: LeadNote["kind"]; label: string }[] = [
  { value: "note", label: "Note" },
  { value: "call", label: "Call remark" },
  { value: "internal", label: "Internal" },
]

export function NotesPanel({ lead, author, allowInternal = false }: { lead: Lead; author: string; allowInternal?: boolean }) {
  const addNote = useApp((s) => s.addNote)
  const setFollowUp = useApp((s) => s.setFollowUp)
  const [text, setText] = useState("")
  const [kind, setKind] = useState<LeadNote["kind"]>("note")
  const [follow, setFollow] = useState(lead.followUpAt ? lead.followUpAt.slice(0, 16) : "")

  return (
    <div className="space-y-5">
      <div className="space-y-2 rounded-lg border p-3">
        <ToggleGroup type="single" size="sm" variant="outline" value={kind} onValueChange={(v) => v && setKind(v as LeadNote["kind"])}>
          {noteKinds
            .filter((k) => allowInternal || k.value !== "internal")
            .map((k) => (
              <ToggleGroupItem key={k.value} value={k.value} className="text-xs">
                {k.label}
              </ToggleGroupItem>
            ))}
        </ToggleGroup>
        <Textarea
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={kind === "call" ? "e.g. Spoke to buyer, wants samples by Friday" : "Add a note…"}
        />
        <div className="flex justify-end">
          <Button
            size="sm"
            disabled={!text.trim()}
            onClick={() => {
              addNote(lead.id, { by: author, text: text.trim(), kind })
              setText("")
              toast.success("Saved to lead history")
            }}
          >
            Save
          </Button>
        </div>
      </div>
      <div className="flex flex-wrap items-end gap-2 rounded-lg border p-3">
        <div className="grid flex-1 gap-1.5">
          <span className="text-xs font-medium">Next follow-up</span>
          <Input type="datetime-local" value={follow} onChange={(e) => setFollow(e.target.value)} className="min-w-52" />
        </div>
        <Button
          size="sm"
          variant="outline"
          disabled={!follow}
          onClick={() => {
            setFollowUp(lead.id, new Date(follow).toISOString(), author)
            toast.success("Follow-up scheduled", { description: "A WhatsApp & in-app reminder will be sent." })
          }}
        >
          <CalendarClock /> Schedule
        </Button>
      </div>
      <div className="space-y-3">
        {lead.notes.length === 0 && <p className="text-sm text-muted-foreground">No notes yet.</p>}
        {lead.notes.map((n) => (
          <div key={n.id} className={cn("rounded-lg border p-3", n.kind === "internal" && "border-amber-200 bg-amber-50/60")}>
            <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
              {n.kind === "call" ? <PhoneCall className="size-3" /> : <NotebookPen className="size-3" />}
              <span className="font-medium text-foreground">{n.by}</span>
              <span>· {fmtDateTime(n.at)}</span>
              {n.kind !== "note" && <span className="ml-auto capitalize">{n.kind === "call" ? "Call remark" : "Internal"}</span>}
            </div>
            <p className="text-sm">{n.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export function RequirementGrid({ lead }: { lead: Lead }) {
  const rows: [string, string][] = [
    ["Quantity", `${num(lead.quantity)} ${lead.unit}`],
    ["Budget", lead.budget ? inr(lead.budget) : "Not specified"],
    ["Delivery to", lead.deliveryLocation],
    ["Required by", lead.deliveryDate ? new Date(lead.deliveryDate).toLocaleDateString("en-IN", { dateStyle: "medium" }) : "Flexible"],
    ["Source", lead.source],
    ["Received", fmtDateTime(lead.createdAt)],
  ]
  if (lead.international) rows.push(["Destination", `${lead.international.country} · ${lead.international.incoterm}`])
  return (
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {rows.map(([k, v]) => (
        <div key={k} className="rounded-lg bg-muted/60 px-3 py-2">
          <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">{k}</dt>
          <dd className="text-sm font-medium">{v}</dd>
        </div>
      ))}
    </dl>
  )
}
