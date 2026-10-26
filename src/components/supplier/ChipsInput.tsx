import { X } from "lucide-react"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"

/** Free-text tag input: Enter or comma adds a chip. */
export function ChipsInput({
  value,
  onChange,
  placeholder = "Type and press Enter",
  suggestions = [],
}: {
  value: string[]
  onChange: (v: string[]) => void
  placeholder?: string
  suggestions?: string[]
}) {
  const [text, setText] = useState("")
  const add = (v: string) => {
    const t = v.trim()
    if (t && !value.includes(t)) onChange([...value, t])
    setText("")
  }
  const remaining = suggestions.filter((s) => !value.includes(s))
  return (
    <div className="grid content-start gap-1.5">
      <div className="flex min-h-9 flex-wrap items-center gap-1.5 rounded-lg border bg-background p-1.5 focus-within:ring-3 focus-within:ring-ring/30">
        {value.map((v) => (
          <Badge key={v} variant="secondary" className="h-6 gap-1 pr-1">
            {v}
            <button type="button" aria-label={`Remove ${v}`} onClick={() => onChange(value.filter((x) => x !== v))}>
              <X className="size-3" />
            </button>
          </Badge>
        ))}
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault()
              add(text)
            } else if (e.key === "Backspace" && !text && value.length) {
              onChange(value.slice(0, -1))
            }
          }}
          onBlur={() => add(text)}
          placeholder={placeholder}
          className="h-6 min-w-28 flex-1 bg-transparent px-1 text-sm outline-none"
        />
      </div>
      {remaining.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {remaining.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => add(s)}
              className="rounded-full border border-dashed px-2 py-0.5 text-[11px] text-muted-foreground hover:border-primary hover:text-primary"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
