import { Building2, Heart } from "lucide-react"
import { Link } from "react-router-dom"
import { EmptyState, PageHeader } from "@/components/common/bits"
import { ProductCard, SupplierCard } from "@/components/market/cards"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useApp } from "@/store/app"

export default function BuyerSaved() {
  const savedP = useApp((s) => s.savedProductIds)
  const savedS = useApp((s) => s.savedSupplierIds)
  const allProducts = useApp((s) => s.products)
  const allSuppliers = useApp((s) => s.suppliers)
  const products = allProducts.filter((p) => savedP.includes(p.id))
  const suppliers = allSuppliers.filter((x) => savedS.includes(x.id))

  return (
    <>
      <PageHeader title="Saved & favourites" description="Shortlist products and suppliers to compare and contact later." />
      <Tabs defaultValue="products">
        <TabsList>
          <TabsTrigger value="products" className="px-3">
            Products <span className="text-xs text-muted-foreground">{products.length}</span>
          </TabsTrigger>
          <TabsTrigger value="suppliers" className="px-3">
            Suppliers <span className="text-xs text-muted-foreground">{suppliers.length}</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="products" className="mt-4">
          {products.length === 0 ? (
            <EmptyState
              icon={Heart}
              title="No saved products"
              body="Tap the heart on any product to shortlist it here."
              action={
                <Button asChild>
                  <Link to="/products">Browse products</Link>
                </Button>
              }
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="suppliers" className="mt-4">
          {suppliers.length === 0 ? (
            <EmptyState
              icon={Building2}
              title="No saved suppliers"
              body="Save suppliers you trust to reach them faster."
              action={
                <Button asChild>
                  <Link to="/suppliers">Find suppliers</Link>
                </Button>
              }
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {suppliers.map((s) => (
                <SupplierCard key={s.id} supplier={s} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </>
  )
}
