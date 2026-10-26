import { BadgeCheck, MessageCircle, ShieldCheck } from "lucide-react"
import type { ReactNode } from "react"
import { SmartImage } from "@/components/common/bits"
import { img } from "@/lib/images"
import { cn } from "@/lib/utils"

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="container-page grid gap-10 py-10 lg:grid-cols-2 lg:py-16">
      <div className="relative hidden overflow-hidden rounded-2xl bg-brand p-10 text-white lg:block">
        <SmartImage src={img("warehouseAisle", 900, 1100)} alt="" className="absolute inset-0 size-full opacity-20" />
        <div className="relative flex h-full flex-col">
          <h2 className="text-3xl font-semibold leading-tight">
            One account for <span className="text-saffron">buying, selling</span> and growing your trade.
          </h2>
          <ul className="mt-8 space-y-5 text-sm text-white/80">
            {[
              [BadgeCheck, "GST-verified businesses only", "Every company is KYC and GST checked before going live."],
              [MessageCircle, "WhatsApp-first communication", "Enquiries, quotes and follow-ups reach you instantly."],
              [ShieldCheck, "Your data stays private", "Contact details are shared only with matched partners."],
            ].map(([Icon, t, b]) => {
              const I = Icon as typeof BadgeCheck
              return (
                <li key={t as string} className="flex gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white/10">
                    <I className="size-4 text-saffron" />
                  </span>
                  <span>
                    <span className="block font-medium text-white">{t as string}</span>
                    {b as string}
                  </span>
                </li>
              )
            })}
          </ul>
          <p className="mt-auto pt-10 text-xs text-white/50">Trusted by 18,400+ suppliers and 1.2 lakh+ business buyers.</p>
        </div>
      </div>
      <div className="mx-auto w-full max-w-md self-center">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        <div className="mt-8">{children}</div>
      </div>
    </div>
  )
}

export function RoleToggle<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T
  onChange: (v: T) => void
  options: { value: T; label: string; sub: string }[]
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded-xl border p-3 text-left transition",
            value === o.value ? "border-primary bg-primary/5 ring-2 ring-primary/15" : "hover:border-primary/40",
          )}
        >
          <span className="block text-sm font-semibold">{o.label}</span>
          <span className="text-xs text-muted-foreground">{o.sub}</span>
        </button>
      ))}
    </div>
  )
}
