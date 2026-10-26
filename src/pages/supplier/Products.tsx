import { Eye, EyeOff, MoreHorizontal, Package, Pencil, Plus, Search, Send, Trash2 } from "lucide-react"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { EmptyState, PageHeader, SmartImage, StatusBadge } from "@/components/common/bits"
import { useSupplierProducts } from "@/components/supplier/useSupplierData"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { subName } from "@/data/categories"
import { num, priceRange } from "@/lib/format"
import { useApp } from "@/store/app"
import { StatusTabs } from "@/components/common/StatusTabs"
import type { Product, ProductStatus } from "@/types"

const tabs: { value: "all" | ProductStatus; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "draft", label: "Draft" },
  { value: "inactive", label: "Inactive" },
  { value: "rejected", label: "Rejected" },
]

export default function SupplierProducts() {
  const products = useSupplierProducts()
  const setStatus = useApp((s) => s.setProductStatus)
  const remove = useApp((s) => s.deleteProduct)
  const navigate = useNavigate()
  const [tab, setTab] = useState<(typeof tabs)[number]["value"]>("all")
  const [q, setQ] = useState("")
  const [toDelete, setToDelete] = useState<Product | null>(null)

  const filtered = products.filter(
    (p) => (tab === "all" || p.status === tab) && (!q || `${p.name} ${p.model}`.toLowerCase().includes(q.toLowerCase())),
  )
  const count = (v: (typeof tabs)[number]["value"]) => (v === "all" ? products.length : products.filter((p) => p.status === v).length)

  const change = (p: Product, status: ProductStatus, msg: string) => {
    setStatus(p.id, status)
    toast.success(msg, { description: p.name })
  }

  return (
    <>
      <PageHeader
        title="Products"
        description="Manage listings, pricing, MOQ, stock and visibility. New listings are reviewed within 24 hours."
        actions={
          <Button asChild>
            <Link to="/supplier/products/new">
              <Plus /> Add product
            </Link>
          </Button>
        }
      />
      <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <StatusTabs
          value={tab}
          onChange={setTab}
          tabs={tabs.map((t) => ({ value: t.value, label: t.label, count: count(t.value), highlight: t.value === "pending" }))}
        />
        <div className="relative xl:w-72">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products or model no." className="pl-9" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No products here"
          body={products.length ? "Try a different filter or search term." : "Add your first product to start receiving enquiries."}
          action={
            <Button asChild>
              <Link to="/supplier/products/new">Add product</Link>
            </Button>
          }
        />
      ) : (
        <Card className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Product</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>MOQ</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Enquiries</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="pr-4" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="pl-4">
                      <div className="flex min-w-64 items-center gap-3">
                        <SmartImage src={p.images[0]} alt="" className="size-11 shrink-0 rounded-md" />
                        <div className="min-w-0">
                          <Link to={`/supplier/products/${p.id}/edit`} className="line-clamp-1 font-medium hover:text-primary">
                            {p.name}
                          </Link>
                          <p className="text-xs text-muted-foreground">
                            {subName(p.categoryId, p.subId)} · {p.model}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm">{priceRange(p.priceMin, p.priceMax)}</TableCell>
                    <TableCell className="whitespace-nowrap text-sm">
                      {num(p.moq)} {p.unit}
                    </TableCell>
                    <TableCell className="text-sm">{num(p.availableQty)}</TableCell>
                    <TableCell className="text-sm">{num(p.views)}</TableCell>
                    <TableCell className="text-sm">{p.enquiries}</TableCell>
                    <TableCell>
                      <StatusBadge status={p.status} />
                    </TableCell>
                    <TableCell className="pr-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm" aria-label="Product actions">
                            <MoreHorizontal />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52">
                          <DropdownMenuItem onSelect={() => navigate(`/supplier/products/${p.id}/edit`)}>
                            <Pencil /> Edit product
                          </DropdownMenuItem>
                          {p.status === "active" && (
                            <DropdownMenuItem onSelect={() => navigate(`/product/${p.id}`)}>
                              <Eye /> View live listing
                            </DropdownMenuItem>
                          )}
                          {(p.status === "draft" || p.status === "rejected") && (
                            <DropdownMenuItem onSelect={() => change(p, "pending", "Submitted for approval")}>
                              <Send /> Submit for approval
                            </DropdownMenuItem>
                          )}
                          {p.status === "active" && (
                            <DropdownMenuItem onSelect={() => change(p, "inactive", "Product hidden from marketplace")}>
                              <EyeOff /> Deactivate (hide)
                            </DropdownMenuItem>
                          )}
                          {p.status === "inactive" && (
                            <DropdownMenuItem onSelect={() => change(p, "active", "Product is visible again")}>
                              <Eye /> Activate
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive" onSelect={() => setToDelete(p)}>
                            <Trash2 /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this product?</AlertDialogTitle>
            <AlertDialogDescription>
              “{toDelete?.name}” will be removed from your catalogue and the marketplace. Existing enquiries are kept. Consider deactivating
              instead if you may sell it again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (toDelete) {
                  remove(toDelete.id)
                  toast.success("Product deleted")
                }
                setToDelete(null)
              }}
            >
              Delete product
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
