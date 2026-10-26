import { Compass, Home, Search } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="container-page flex flex-col items-center py-24 text-center">
      <span className="grid size-16 place-items-center rounded-full bg-primary/10 text-primary">
        <Compass className="size-8" />
      </span>
      <p className="mt-6 text-sm font-semibold text-primary">404</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">We couldn't find that page</h1>
      <p className="mt-2 max-w-md text-muted-foreground">The link may be outdated, or the listing was removed. Try searching the marketplace instead.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        <Button asChild variant="outline">
          <Link to="/">
            <Home /> Back to home
          </Link>
        </Button>
        <Button asChild>
          <Link to="/products">
            <Search /> Browse products
          </Link>
        </Button>
      </div>
    </div>
  )
}
