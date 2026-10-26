import { Building2, ExternalLink, MapPin } from "lucide-react"
import { useState } from "react"
import { Link } from "react-router-dom"
import { useBuyerLeads } from "@/components/buyer/useBuyer"
import { EmptyState, PageHeader, Rating, StatusBadge, TrustSeal, VerifiedBadge } from "@/components/common/bits"
import { SupplierLogo } from "@/components/market/cards"
import { WhatsAppButton } from "@/components/market/WhatsAppDialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { timeAgo } from "@/lib/format"
import { useApp } from "@/store/app"

type Sort = "rating" | "recent" | "response"

export default function BuyerContacted() {
  const leads = useBuyerLeads()
  const suppliers = useApp((s) => s.suppliers)
  const [sort, setSort] = useState<Sort>("rating")

  const rows = suppliers
    .map((s) => {
      const mine = leads.filter((l) => l.supplierIds.includes(s.id))
      return { s, mine, last: mine[0] }
    })
    .filter((r) => r.mine.length > 0)
    .sort((a, b) =>
      sort === "rating"
        ? b.s.rating - a.s.rating
        : sort === "response"
          ? b.s.responseRate - a.s.responseRate
          : +new Date(b.last.createdAt) - +new Date(a.last.createdAt),
    )

  return (
    <>
      <PageHeader
        title="Contacted suppliers"
        description="Suppliers you've sent enquiries to — compare ratings and response before your next order."
        actions={
          <Select value={sort} onValueChange={(v) => setSort(v as Sort)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">Sort: Top rated</SelectItem>
              <SelectItem value="response">Sort: Best response rate</SelectItem>
              <SelectItem value="recent">Sort: Recently contacted</SelectItem>
            </SelectContent>
          </Select>
        }
      />
      {rows.length === 0 ? (
        <EmptyState icon={Building2} title="No suppliers contacted yet" body="Send an enquiry from any product page to start a conversation." />
      ) : (
        <Card className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Supplier</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Response</TableHead>
                  <TableHead>Last enquiry</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead className="pr-4 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map(({ s, mine, last }) => (
                  <TableRow key={s.id}>
                    <TableCell className="pl-4">
                      <div className="flex items-center gap-3">
                        <SupplierLogo supplier={s} className="size-10 text-xs" />
                        <div>
                          <p className="font-medium">{s.name}</p>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="size-3" /> {s.city}
                            </span>
                            {s.verified && <VerifiedBadge />}
                            <TrustSeal seal={s.trustSeal} />
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Rating value={s.rating} count={s.reviews} />
                    </TableCell>
                    <TableCell className="text-xs">
                      <p className="font-medium">{s.responseRate}%</p>
                      <p className="text-muted-foreground">{s.responseTime}</p>
                    </TableCell>
                    <TableCell className="max-w-56">
                      <Link to={`/buyer/enquiries/${last.id}`} className="line-clamp-1 text-sm hover:text-primary">
                        {last.title}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {timeAgo(last.createdAt)} · {mine.length} enquir{mine.length > 1 ? "ies" : "y"}
                      </p>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={last.supplierStage[s.id] ?? "New"} />
                    </TableCell>
                    <TableCell className="pr-4">
                      <div className="flex justify-end gap-2">
                        <WhatsAppButton supplier={s} size="icon-sm" />
                        <Button size="sm" variant="outline" asChild>
                          <Link to={`/suppliers/${s.id}`}>
                            <ExternalLink /> Profile
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </>
  )
}
