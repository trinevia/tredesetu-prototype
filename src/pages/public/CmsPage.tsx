import { FileText } from "lucide-react"
import { Link, NavLink, useParams } from "react-router-dom"
import { fmtDate } from "@/lib/format"
import { cn } from "@/lib/utils"
import { useApp } from "@/store/app"
import NotFound from "./NotFound"

export default function CmsPage() {
  const { slug } = useParams()
  const pages = useApp((s) => s.pages)
  const page = pages.find((p) => p.slug === slug)
  if (!page) return <NotFound />

  return (
    <div>
      <div className="border-b bg-surface">
        <div className="container-page py-10">
          <p className="text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground">
              Home
            </Link>{" "}
            / {page.title}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">{page.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Last updated {fmtDate(page.updatedAt)}</p>
        </div>
      </div>
      <div className="container-page grid gap-10 py-10 lg:grid-cols-[220px_1fr]">
        <nav className="flex gap-1 overflow-x-auto lg:flex-col">
          {pages.map((p) => (
            <NavLink
              key={p.slug}
              to={`/page/${p.slug}`}
              className={({ isActive }) =>
                cn("flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted", isActive && "bg-accent font-medium text-primary")
              }
            >
              <FileText className="size-4" /> {p.title}
            </NavLink>
          ))}
        </nav>
        <article className="max-w-3xl space-y-4 leading-relaxed text-muted-foreground">
          {page.status === "Draft" && (
            <p className="rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-800">This page is a draft and visible only in the prototype preview.</p>
          )}
          {page.body.split(/\n\n+/).map((para, i) => (
            <p key={i} className="whitespace-pre-line">
              {para}
            </p>
          ))}
        </article>
      </div>
    </div>
  )
}
