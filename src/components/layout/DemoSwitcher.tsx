import { Building2, ChevronUp, Globe, RotateCcw, ShieldCheck, ShoppingBag } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { useApp } from "@/store/app"
import type { Role } from "@/types"

export const roleHome: Record<Role, string> = { guest: "/", buyer: "/buyer", supplier: "/supplier", admin: "/admin" }

const roles: { role: Role; label: string; sub: string; icon: typeof Globe }[] = [
  { role: "guest", label: "Visitor", sub: "Public marketplace website", icon: Globe },
  { role: "buyer", label: "Buyer", sub: "Rohan Mehta · Mehta Retail", icon: ShoppingBag },
  { role: "supplier", label: "Supplier", sub: "Volta Electronics · Delhi", icon: Building2 },
  { role: "admin", label: "Admin & CRM", sub: "Ananya Rao · Marketplace ops", icon: ShieldCheck },
]

/** Presentation helper: lets the presenter jump between the four Phase One panels. Not part of the product. */
export function DemoSwitcher() {
  const role = useApp((s) => s.role)
  const setRole = useApp((s) => s.setRole)
  const reset = useApp((s) => s.resetDemo)
  const navigate = useNavigate()
  const current = roles.find((r) => r.role === role) ?? roles[0]

  return (
    <div className="fixed bottom-4 right-4 z-50 print:hidden">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex items-center gap-2 rounded-full bg-brand py-1.5 pl-1.5 pr-3 text-xs font-medium text-white shadow-xl ring-1 ring-white/10 transition hover:bg-brand/90"
          >
            <span className="grid size-7 place-items-center rounded-full bg-saffron text-saffron-foreground">
              <current.icon className="size-3.5" />
            </span>
            <span className="hidden sm:inline text-white/60">Demo view:</span>
            {current.label}
            <ChevronUp className="size-3.5 opacity-60" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="end" className="w-72">
          <DropdownMenuLabel className="text-xs text-muted-foreground">Switch prototype view</DropdownMenuLabel>
          {roles.map((r) => (
            <DropdownMenuItem
              key={r.role}
              onSelect={() => {
                setRole(r.role)
                navigate(roleHome[r.role])
              }}
              className={cn("gap-3 py-2", r.role === role && "bg-accent")}
            >
              <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
                <r.icon className="size-4" />
              </span>
              <span className="flex flex-col">
                <span className="font-medium">{r.label}</span>
                <span className="text-xs text-muted-foreground">{r.sub}</span>
              </span>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() => {
              reset()
              toast.success("Demo data reset to the original sample set")
            }}
            className="text-muted-foreground"
          >
            <RotateCcw /> Reset demo data
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
