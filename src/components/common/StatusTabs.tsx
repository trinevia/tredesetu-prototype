import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

export interface StatusTab<T extends string> {
  value: T
  label: string
  count: number
  /** Needs-attention tabs (e.g. pending approval) show the count as a saffron badge. */
  highlight?: boolean
}

/** Status filter tabs used across panel list pages: "All (6)", "Pending [1]", "Active (5)". */
export function StatusTabs<T extends string>({
  tabs,
  value,
  onChange,
  className,
}: {
  tabs: StatusTab<T>[]
  value: T
  onChange: (v: T) => void
  className?: string
}) {
  return (
    <div className={cn("scrollbar-none max-w-full overflow-x-auto", className)}>
      <Tabs value={value} onValueChange={(v) => onChange(v as T)}>
        <TabsList>
          {tabs.map((t) => (
            <TabsTrigger key={t.value} value={t.value} className="gap-1.5 px-3.5">
              {t.label}
              {t.highlight ? (
                t.count > 0 && <Badge className="h-[18px] min-w-[18px] bg-saffron px-1.5 text-[10px] text-saffron-foreground">{t.count}</Badge>
              ) : (
                <span className="tabular-nums">({t.count})</span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  )
}
