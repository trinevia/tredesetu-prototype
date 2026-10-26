import { Bell, Mail, MessageCircle, MessageSquare, Smartphone } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { timeAgo } from "@/lib/format"
import { cn } from "@/lib/utils"
import { useApp } from "@/store/app"
import type { AppNotification } from "@/types"

const channelIcon = { "in-app": Bell, email: Mail, whatsapp: MessageCircle, sms: Smartphone }

export function NotificationBell({ role, allLink }: { role: AppNotification["role"]; allLink?: string }) {
  const all = useApp((s) => s.notifications)
  const markAll = useApp((s) => s.markNotificationsRead)
  const markOne = useApp((s) => s.markNotificationRead)
  const items = all.filter((n) => n.role === role)
  const unread = items.filter((n) => !n.read).length

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="size-5" />
          {unread > 0 && (
            <span className="absolute right-1 top-1 grid min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold leading-4 text-white">
              {unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[22rem] p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <span className="font-semibold">Notifications</span>
          <button type="button" className="text-xs font-medium text-primary hover:underline" onClick={() => markAll(role)}>
            Mark all read
          </button>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {items.length === 0 && (
            <div className="flex flex-col items-center gap-2 px-4 py-10 text-sm text-muted-foreground">
              <MessageSquare className="size-6" /> You're all caught up
            </div>
          )}
          {items.slice(0, 8).map((n) => {
            const Icon = channelIcon[n.channel]
            const body = (
              <div className={cn("flex gap-3 border-b px-4 py-3 text-left transition hover:bg-muted/60", !n.read && "bg-primary/[0.03]")}>
                <span
                  className={cn(
                    "mt-0.5 grid size-8 shrink-0 place-items-center rounded-full",
                    n.channel === "whatsapp" ? "bg-whatsapp/12 text-whatsapp" : "bg-primary/10 text-primary",
                  )}
                >
                  <Icon className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-start justify-between gap-2">
                    <span className="text-sm font-medium leading-snug">{n.title}</span>
                    {!n.read && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{n.body}</span>
                  <span className="mt-1 block text-[11px] capitalize text-muted-foreground/80">
                    {timeAgo(n.at)} · via {n.channel}
                  </span>
                </span>
              </div>
            )
            return n.link ? (
              <Link key={n.id} to={n.link} onClick={() => markOne(n.id)} className="block">
                {body}
              </Link>
            ) : (
              <div key={n.id} onClick={() => markOne(n.id)}>
                {body}
              </div>
            )
          })}
        </div>
        {allLink && (
          <Link to={allLink} className="block px-4 py-2.5 text-center text-xs font-medium text-primary hover:underline">
            View all notifications
          </Link>
        )}
      </PopoverContent>
    </Popover>
  )
}
