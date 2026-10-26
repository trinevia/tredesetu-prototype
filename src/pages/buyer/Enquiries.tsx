import { ChevronRight, Inbox, MessageSquarePlus, Search } from "lucide-react"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { BuyerStatusBadge } from "@/components/buyer/BuyerStatusBadge"
import { buyerStatus, useBuyerLeads, type BuyerStatus } from "@/components/buyer/useBuyer"
import { EmptyState, PageHeader } from "@/components/common/bits"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { categoryById } from "@/data/categories"
import { fmtDate, inr, num } from "@/lib/format"
import { useApp } from "@/store/app"
import { StatusTabs } from "@/components/common/StatusTabs"

const tabs: ("All" | BuyerStatus)[] = ["All", "Open", "Quoted", "Won", "Closed"]

export default function BuyerEnquiries() {
  const leads = useBuyerLeads()
  const suppliers = useApp((s) => s.suppliers)
  const navigate = useNavigate()
  const [tab, setTab] = useState<(typeof tabs)[number]>("All")
  const [q, setQ] = useState("")

  const filtered = leads.filter(
    (l) =>
      (tab === "All" || buyerStatus(l) === tab) &&
      (!q || `${l.title} ${l.id}`.toLowerCase().includes(q.toLowerCase())),
  )
  const count = (t: (typeof tabs)[number]) => (t === "All" ? leads.length : leads.filter((l) => buyerStatus(l) === t).length)

  return (
    <>
      <PageHeader
        title="My enquiries"
        description="Every requirement you've sent, with supplier responses and quotations."
        actions={
          <Button asChild>
            <Link to="/post-requirement">
              <MessageSquarePlus /> New requirement
            </Link>
          </Button>
        }
      />
      <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <StatusTabs value={tab} onChange={setTab} tabs={tabs.map((t) => ({ value: t, label: t, count: count(t), highlight: t === "Quoted" }))} />
        <div className="relative xl:w-72">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by product or ID" className="pl-9" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={leads.length ? "No enquiries match your filters" : "You haven't sent any enquiries yet"}
          body="Post a requirement once and receive quotes from multiple verified suppliers."
          action={
            <Button asChild>
              <Link to="/post-requirement">Post requirement</Link>
            </Button>
          }
        />
      ) : (
        <Card className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Requirement</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Suppliers</TableHead>
                  <TableHead>Best quote</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((l) => {
                  const best = l.quotes.length ? Math.min(...l.quotes.map((x) => x.pricePerUnit)) : undefined
                  return (
                    <TableRow key={l.id} className="cursor-pointer" onClick={() => navigate(`/buyer/enquiries/${l.id}`)}>
                      <TableCell className="max-w-72 pl-4">
                        <p className="truncate font-medium">{l.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {l.id} · {categoryById(l.categoryId)?.name}
                        </p>
                      </TableCell>
                      <TableCell>
                        {num(l.quantity)} {l.unit}
                      </TableCell>
                      <TableCell className="max-w-48 truncate text-xs">
                        {l.supplierIds.map((id) => suppliers.find((s) => s.id === id)?.name).join(", ")}
                      </TableCell>
                      <TableCell>
                        {best ? (
                          <span className="font-medium text-brand">
                            {inr(best)}
                            <span className="text-xs font-normal text-muted-foreground">/{l.unit}</span>
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">Awaiting</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{fmtDate(l.createdAt)}</TableCell>
                      <TableCell>
                        <BuyerStatusBadge status={buyerStatus(l)} />
                      </TableCell>
                      <TableCell>
                        <ChevronRight className="size-4 text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </>
  )
}
