import { CheckCheck, ExternalLink, MessageCircle, Send } from "lucide-react"
import { useState, type ReactNode } from "react"
import { toast } from "sonner"
import { SimulatedNote } from "@/components/common/bits"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { waLink } from "@/lib/format"
import { cn } from "@/lib/utils"
import { useApp } from "@/store/app"
import type { Product, Supplier } from "@/types"

export function WhatsAppIcon({ className }: { className?: string }) {
  return <MessageCircle className={className} />
}

interface Props {
  toName: string
  phone: string
  defaultMessage: string
  quickReplies?: string[]
  leadId?: string
  children: ReactNode
}

/** Click-to-WhatsApp with a predefined template. In production this is backed by the WhatsApp Business API. */
export function WhatsAppDialog({ toName, phone, defaultMessage, quickReplies = [], leadId, children }: Props) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState(defaultMessage)
  const [sent, setSent] = useState(false)
  const log = useApp((s) => s.logWhatsApp)

  const send = () => {
    log({ to: phone, toName, body: text, leadId, direction: "outbound" })
    setSent(true)
    toast.success(`WhatsApp message delivered to ${toName}`, { description: "Logged to the lead's communication history." })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (o) {
          setText(defaultMessage)
          setSent(false)
        }
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-md">
        <DialogHeader className="flex-row items-center gap-3 space-y-0 bg-[#075e54] px-5 py-4 text-white">
          <span className="grid size-10 place-items-center rounded-full bg-white/15">
            <WhatsAppIcon className="size-5" />
          </span>
          <div className="text-left">
            <DialogTitle className="text-white">{toName}</DialogTitle>
            <DialogDescription className="text-xs text-white/70">WhatsApp Business · usually replies within 1 hr</DialogDescription>
          </div>
        </DialogHeader>
        <div className="space-y-3 bg-[#efeae2] p-4">
          <div className="ml-auto max-w-[88%] rounded-lg rounded-tr-none bg-[#d9fdd3] px-3 py-2 text-sm shadow-sm">
            <p className="whitespace-pre-line">{text || "…"}</p>
            <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-slate-500">
              {new Date().toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}
              {sent && <CheckCheck className="size-3.5 text-sky-500" />}
            </div>
          </div>
          {sent && (
            <div className="max-w-[80%] rounded-lg rounded-tl-none bg-white px-3 py-2 text-sm shadow-sm">
              Thank you for reaching out! Our sales team will share the details shortly. 🙏
              <div className="mt-1 text-right text-[10px] text-slate-500">Auto-reply</div>
            </div>
          )}
        </div>
        <div className="space-y-3 p-4">
          {quickReplies.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {quickReplies.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setText(q)}
                  className="rounded-full border px-2.5 py-1 text-xs transition hover:border-whatsapp hover:text-whatsapp"
                >
                  {q.length > 38 ? `${q.slice(0, 38)}…` : q}
                </button>
              ))}
            </div>
          )}
          <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} aria-label="Message" />
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" asChild>
              <a href={waLink(phone, text)} target="_blank" rel="noreferrer">
                <ExternalLink /> Open WhatsApp
              </a>
            </Button>
            <Button className="bg-whatsapp text-white hover:bg-whatsapp/90" onClick={send} disabled={!text.trim()}>
              <Send /> Send via API
            </Button>
          </div>
          <SimulatedNote>
            “Send via API” is simulated in this prototype. Production uses approved WhatsApp Business API templates with delivery/read tracking.
          </SimulatedNote>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function WhatsAppButton({
  supplier,
  product,
  size = "default",
  label,
  className,
}: {
  supplier: Supplier
  product?: Product
  size?: "default" | "sm" | "lg" | "icon-sm" | "icon"
  label?: string
  className?: string
}) {
  const msg = product
    ? `Hi ${supplier.name}, I found your product “${product.name}” on TradeSetu. Please share your best price for ${product.moq} ${product.unit} delivered to my city.`
    : `Hi ${supplier.name}, I found your company on TradeSetu and would like to discuss a bulk requirement.`
  const iconOnly = size.startsWith("icon")
  return (
    <WhatsAppDialog
      toName={supplier.name}
      phone={supplier.whatsapp}
      defaultMessage={msg}
      quickReplies={[
        "Please share your latest price list and catalogue.",
        "Can you do private label / custom branding?",
        "What are your payment terms and delivery time?",
      ]}
    >
      <Button
        size={size}
        variant="outline"
        aria-label="Chat on WhatsApp"
        className={cn("border-whatsapp/40 text-whatsapp hover:bg-whatsapp/10 hover:text-whatsapp", className)}
      >
        <WhatsAppIcon />
        {!iconOnly && (label ?? "WhatsApp")}
      </Button>
    </WhatsAppDialog>
  )
}
