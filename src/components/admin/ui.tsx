import { Search } from "lucide-react"
import type { ReactNode } from "react"
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

/** Card wrapper for data tables: header slot + horizontally scrollable body on small screens. */
export function TableCard({
  title,
  description,
  actions,
  toolbar,
  children,
  className,
}: {
  title?: string
  description?: string
  actions?: ReactNode
  toolbar?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <Card className={cn("min-w-0 gap-0 p-0", className)}>
      {(title || actions) && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
          <div>
            {title && <h3 className="font-semibold">{title}</h3>}
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
      )}
      {toolbar && <div className="flex flex-wrap items-center gap-2 border-b bg-muted/30 px-4 py-3">{toolbar}</div>}
      <div className="min-w-0 overflow-x-auto">{children}</div>
    </Card>
  )
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search…",
  className,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  className?: string
}) {
  return (
    <div className={cn("relative w-full sm:w-64", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="pl-9" />
    </div>
  )
}

export function FilterSelect({
  value,
  onChange,
  options,
  placeholder,
  className,
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  placeholder: string
  className?: string
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={cn("w-auto min-w-36", className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{placeholder}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export function ChartCard({
  title,
  description,
  children,
  className,
  action,
}: {
  title: string
  description?: string
  children: ReactNode
  className?: string
  action?: ReactNode
}) {
  return (
    <Card className={cn("min-w-0", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
        {action}
      </CardHeader>
      <div className="px-4">{children}</div>
    </Card>
  )
}

/** Horizontal ranked bar chart for "X-wise" breakdowns. */
export function RankBars({
  data,
  labelKey,
  valueKey,
  color = "var(--chart-1)",
  label = "Leads",
  height = 220,
}: {
  data: Record<string, string | number>[]
  labelKey: string
  valueKey: string
  color?: string
  label?: string
  height?: number
}) {
  const config: ChartConfig = { [valueKey]: { label, color } }
  return (
    <ChartContainer config={config} className="w-full" style={{ height }}>
      <BarChart data={data} layout="vertical" margin={{ left: 4, right: 16 }}>
        <CartesianGrid horizontal={false} strokeDasharray="3 3" />
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey={labelKey}
          width={170}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11 }}
          tickFormatter={(v: string) => (v.length > 26 ? `${v.slice(0, 25)}…` : v)}
        />
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        <Bar dataKey={valueKey} fill={`var(--color-${valueKey})`} radius={6} barSize={18}>
          <LabelList dataKey={valueKey} position="right" offset={8} className="fill-foreground" fontSize={12} fontWeight={600} />
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}

export function ConfirmAction({
  title,
  description,
  confirmLabel = "Confirm",
  destructive = false,
  onConfirm,
  children,
}: {
  title: string
  description: string
  confirmLabel?: string
  destructive?: boolean
  onConfirm: () => void
  children: ReactNode
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={destructive ? "bg-destructive text-white hover:bg-destructive/90" : undefined}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

/** Count items by key, returned sorted desc as chart rows. */
export function countBy<T>(items: T[], key: (t: T) => string, labelKey = "name", valueKey = "leads") {
  const m = new Map<string, number>()
  for (const i of items) m.set(key(i), (m.get(key(i)) ?? 0) + 1)
  return [...m.entries()].sort((a, b) => b[1] - a[1]).map(([k, v]) => ({ [labelKey]: k, [valueKey]: v }))
}
