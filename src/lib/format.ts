const inrFmt = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })

export const inr = (n: number) => inrFmt.format(n)

/** Indian short-scale: ₹14.3 L, ₹2.4 Cr. */
export function inrCompact(n: number) {
  if (n >= 1e7) return `₹${trim(n / 1e7)} Cr`
  if (n >= 1e5) return `₹${trim(n / 1e5)} L`
  if (n >= 1e3) return `₹${trim(n / 1e3)}K`
  return inr(n)
}

const trim = (n: number) => (Math.round(n * 10) / 10).toString()

export const num = (n: number) => n.toLocaleString("en-IN")

export function priceRange(min: number, max: number, unit?: string) {
  const range = min === max ? inr(min) : `${inr(min)} – ${inr(max)}`
  return unit ? `${range} / ${unit}` : range
}

export function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 60) return "just now"
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`
  const days = Math.floor(diff / 86400)
  if (days < 30) return `${days} day${days > 1 ? "s" : ""} ago`
  return fmtDate(iso)
}

export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })

export const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })

export const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase()

/** Click-to-WhatsApp deep link (wa.me). Production adds WhatsApp Business API delivery & tracking. */
export const waLink = (phone: string, text: string) => `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`
