import { Check, Eye, EyeOff, Flag, MoreHorizontal, Pencil, Star, Trash2, X } from "lucide-react"
import { useState, type FormEvent } from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import { FilterSelect, SearchInput, TableCard } from "@/components/admin/ui"
import { EmptyState, PageHeader, SmartImage, StatusBadge } from "@/components/common/bits"
import { Field } from "@/components/market/EnquiryDialog"
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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { num, priceRange } from "@/lib/format"
import { useApp } from "@/store/app"
import type { Product, ProductStatus } from "@/types"

const rejectReasons = [
  "Images are low quality or contain watermarks",
  "Incorrect category or missing specifications",
  "Pricing looks unrealistic / not per unit",
  "Possible brand or trademark infringement",
]

export default function AdminProducts() {
  const products = useApp((s) => s.products)
  const suppliers = useApp((s) => s.suppliers)
  const categories = useApp((s) => s.categories)
  const setStatus = useApp((s) => s.setProductStatus)
  const toggleFeatured = useApp((s) => s.toggleProductFeatured)
  const clearReport = useApp((s) => s.clearReport)
  const deleteProduct = useApp((s) => s.deleteProduct)

  const [tab, setTab] = useState("all")
  const [q, setQ] = useState("")
  const [cat, setCat] = useState("all")
  const [rejecting, setRejecting] = useState<Product | null>(null)
  const [editing, setEditing] = useState<Product | null>(null)
  const [deleting, setDeleting] = useState<Product | null>(null)

  const counts: Record<string, number> = {
    all: products.length,
    pending: products.filter((p) => p.status === "pending").length,
    active: products.filter((p) => p.status === "active").length,
    rejected: products.filter((p) => p.status === "rejected").length,
    reported: products.filter((p) => p.reported).length,
  }
  const rows = products.filter((p) => {
    const sup = suppliers.find((s) => s.id === p.supplierId)
    return (
      (tab === "all" || (tab === "reported" ? p.reported : p.status === tab)) &&
      (!q || `${p.name} ${p.brand} ${sup?.name}`.toLowerCase().includes(q.toLowerCase())) &&
      (cat === "all" || p.categoryId === cat)
    )
  })

  const approve = (p: Product) => {
    setStatus(p.id, "active")
    toast.success("Product approved", { description: `${p.name} is now live on the marketplace.` })
  }

  return (
    <>
      <PageHeader title="Product moderation" description="Review new listings, handle reports and curate featured products." />
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-4 h-auto flex-wrap">
          <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
          <TabsTrigger value="pending">
            Pending
            {counts.pending > 0 && <Badge className="ml-1 h-4 bg-saffron px-1.5 text-[10px] text-saffron-foreground">{counts.pending}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="active">Active ({counts.active})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({counts.rejected})</TabsTrigger>
          <TabsTrigger value="reported">
            Reported
            {counts.reported > 0 && <Badge className="ml-1 h-4 bg-rose-500 px-1.5 text-[10px] text-white">{counts.reported}</Badge>}
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <TableCard
        toolbar={
          <>
            <SearchInput value={q} onChange={setQ} placeholder="Search product, brand, supplier…" />
            <FilterSelect value={cat} onChange={setCat} placeholder="All categories" options={categories.map((c) => ({ value: c.id, label: c.name }))} />
          </>
        }
      >
        {rows.length === 0 ? (
          <EmptyState icon={Check} title="Nothing to review" body="No products in this view." className="m-4" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Product</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price / MOQ</TableHead>
                <TableHead className="text-right">Views</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pr-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="pl-4">
                    <div className="flex items-center gap-3">
                      <SmartImage src={p.images[0]} alt="" className="size-10 shrink-0 rounded-md" />
                      <div className="min-w-0 max-w-64">
                        <Link to={`/product/${p.id}`} className="line-clamp-1 font-medium hover:text-primary">
                          {p.name}
                        </Link>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          {p.brand} · {p.model}
                          {p.reported && (
                            <span className="inline-flex items-center gap-0.5 text-rose-600">
                              <Flag className="size-3" /> Reported
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs">{suppliers.find((s) => s.id === p.supplierId)?.name}</TableCell>
                  <TableCell className="whitespace-nowrap text-xs">{categories.find((c) => c.id === p.categoryId)?.name}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="text-sm">{priceRange(p.priceMin, p.priceMax)}</div>
                    <div className="text-xs text-muted-foreground">
                      MOQ {num(p.moq)} {p.unit}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{num(p.views)}</TableCell>
                  <TableCell>
                    <Switch
                      checked={p.featured}
                      onCheckedChange={() => {
                        toggleFeatured(p.id)
                        toast.success(p.featured ? "Removed from featured" : "Added to featured products")
                      }}
                      aria-label="Featured"
                    />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={p.status} />
                  </TableCell>
                  <TableCell className="pr-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {p.status === "pending" && (
                        <>
                          <Button size="icon-sm" variant="outline" aria-label="Reject" onClick={() => setRejecting(p)}>
                            <X className="text-destructive" />
                          </Button>
                          <Button size="sm" onClick={() => approve(p)}>
                            <Check /> Approve
                          </Button>
                        </>
                      )}
                      {p.reported && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            clearReport(p.id)
                            toast.success("Report dismissed")
                          }}
                        >
                          Dismiss report
                        </Button>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon-sm" variant="ghost" aria-label="More">
                            <MoreHorizontal />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onSelect={() => setEditing(p)}>
                            <Pencil /> Edit details
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => toggleFeatured(p.id)}>
                            <Star /> {p.featured ? "Unfeature" : "Feature"}
                          </DropdownMenuItem>
                          {p.status === "active" ? (
                            <DropdownMenuItem
                              onSelect={() => {
                                setStatus(p.id, "inactive")
                                toast("Product hidden from marketplace")
                              }}
                            >
                              <EyeOff /> Hide
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onSelect={() => approve(p)}>
                              <Eye /> Approve & show
                            </DropdownMenuItem>
                          )}
                          {p.status !== "rejected" && p.status !== "pending" && (
                            <DropdownMenuItem onSelect={() => setRejecting(p)}>
                              <X /> Reject
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive" onSelect={() => setDeleting(p)}>
                            <Trash2 /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </TableCard>

      <RejectDialog
        product={rejecting}
        onClose={() => setRejecting(null)}
        onReject={(p, reason) => {
          setStatus(p.id, "rejected")
          toast.error("Product rejected", { description: `Supplier notified: “${reason}”` })
        }}
      />
      <EditDialog product={editing} onClose={() => setEditing(null)} />
      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this product?</AlertDialogTitle>
            <AlertDialogDescription>
              “{deleting?.name}” will be permanently removed from the catalogue. Existing enquiries keep their history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => {
                if (deleting) deleteProduct(deleting.id)
                toast.success("Product deleted")
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function RejectDialog({
  product,
  onClose,
  onReject,
}: {
  product: Product | null
  onClose: () => void
  onReject: (p: Product, reason: string) => void
}) {
  const [reason, setReason] = useState(rejectReasons[0])
  const [other, setOther] = useState("")
  return (
    <Dialog open={!!product} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject listing</DialogTitle>
          <DialogDescription>The supplier will be notified with your reason so they can fix and resubmit.</DialogDescription>
        </DialogHeader>
        <RadioGroup value={reason} onValueChange={setReason} className="gap-2">
          {[...rejectReasons, "Other"].map((r) => (
            <Label key={r} className="flex items-center gap-2 rounded-lg border p-2.5 font-normal has-data-[state=checked]:border-primary has-data-[state=checked]:bg-primary/5">
              <RadioGroupItem value={r} /> {r}
            </Label>
          ))}
        </RadioGroup>
        {reason === "Other" && <Textarea placeholder="Describe the issue…" value={other} onChange={(e) => setOther(e.target.value)} />}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={reason === "Other" && !other.trim()}
            onClick={() => {
              if (product) onReject(product, reason === "Other" ? other : reason)
              onClose()
            }}
          >
            Reject listing
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function EditDialog({ product, onClose }: { product: Product | null; onClose: () => void }) {
  return (
    <Dialog open={!!product} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>{product && <EditForm key={product.id} product={product} onClose={onClose} />}</DialogContent>
    </Dialog>
  )
}

function EditForm({ product, onClose }: { product: Product; onClose: () => void }) {
  const upsert = useApp((s) => s.upsertProduct)
  const [f, setF] = useState({
    name: product.name,
    priceMin: String(product.priceMin),
    priceMax: String(product.priceMax),
    moq: String(product.moq),
    status: product.status,
  })
  const [error, setError] = useState("")
  const submit = (e: FormEvent) => {
    e.preventDefault()
    const min = Number(f.priceMin)
    const max = Number(f.priceMax)
    if (!f.name.trim()) return setError("Name is required")
    if (!(min > 0) || !(max >= min)) return setError("Max price must be ≥ min price, both above zero")
    if (!(Number(f.moq) > 0)) return setError("MOQ must be at least 1")
    upsert({ ...product, name: f.name.trim(), priceMin: min, priceMax: max, moq: Number(f.moq), status: f.status })
    toast.success("Product updated")
    onClose()
  }
  return (
    <form onSubmit={submit} className="grid gap-4">
      <DialogHeader>
        <DialogTitle>Edit product</DialogTitle>
        <DialogDescription>Admin edits are logged and visible to the supplier.</DialogDescription>
      </DialogHeader>
      <Field label="Product name">
        <Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
      </Field>
      <div className="grid grid-cols-3 gap-3">
        <Field label="Min price (₹)">
          <Input type="number" value={f.priceMin} onChange={(e) => setF({ ...f, priceMin: e.target.value })} />
        </Field>
        <Field label="Max price (₹)">
          <Input type="number" value={f.priceMax} onChange={(e) => setF({ ...f, priceMax: e.target.value })} />
        </Field>
        <Field label={`MOQ (${product.unit})`}>
          <Input type="number" value={f.moq} onChange={(e) => setF({ ...f, moq: e.target.value })} />
        </Field>
      </div>
      <Field label="Status">
        <Select value={f.status} onValueChange={(v) => setF({ ...f, status: v as ProductStatus })}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(["active", "pending", "inactive", "rejected", "draft"] as ProductStatus[]).map((s) => (
              <SelectItem key={s} value={s} className="capitalize">
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">Save changes</Button>
      </DialogFooter>
    </form>
  )
}
