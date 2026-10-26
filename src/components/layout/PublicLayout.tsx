import {
  ChevronDown,
  Globe2,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  MessageSquarePlus,
  Phone,
  Search,
  ShieldCheck,
  Store,
} from "lucide-react"
import { useEffect, useState, type FormEvent } from "react"
import { Link, NavLink, Outlet, useLocation, useNavigate, useSearchParams } from "react-router-dom"
import { DynamicIcon, Logo } from "@/components/common/bits"
import { roleHome } from "@/components/layout/DemoSwitcher"
import { NotificationBell } from "@/components/layout/NotificationBell"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { cities } from "@/data/categories"
import { cn } from "@/lib/utils"
import { useApp } from "@/store/app"

const nav = [
  { to: "/products", label: "Products" },
  { to: "/suppliers", label: "Suppliers" },
  { to: "/brics", label: "BRICS Trade Hub" },
  { to: "/post-requirement", label: "Post Requirement" },
  { to: "/sell", label: "Sell on TradeSetu" },
]

function SearchBar({ className }: { className?: string }) {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const categories = useApp((s) => s.categories)
  const [q, setQ] = useState(params.get("q") ?? "")
  const [cat, setCat] = useState(params.get("category") ?? "all")
  const [mode, setMode] = useState<"products" | "suppliers">("products")

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const sp = new URLSearchParams()
    if (q.trim()) sp.set("q", q.trim())
    if (cat !== "all") sp.set("category", cat)
    navigate(`/${mode}?${sp.toString()}`)
  }

  return (
    <form onSubmit={submit} className={cn("flex h-11 w-full items-center rounded-xl border bg-background shadow-sm focus-within:ring-3 focus-within:ring-ring/30", className)}>
      <Select value={mode} onValueChange={(v) => setMode(v as typeof mode)}>
        <SelectTrigger className="h-full! w-28 shrink-0 rounded-none rounded-l-xl border-0 border-r bg-muted/50 text-xs font-medium shadow-none focus-visible:ring-0">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="products">Products</SelectItem>
          <SelectItem value="suppliers">Suppliers</SelectItem>
        </SelectContent>
      </Select>
      <Search className="ml-3 size-4 shrink-0 text-muted-foreground" />
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={mode === "products" ? "Search chargers, basmati rice, CNC machines…" : "Search manufacturers, exporters…"}
        className="h-full min-w-0 border-0 bg-transparent shadow-none focus-visible:ring-0"
      />
      <Select value={cat} onValueChange={setCat}>
        <SelectTrigger className="hidden h-full! w-44 shrink-0 rounded-none border-0 border-l bg-transparent text-xs shadow-none focus-visible:ring-0 lg:flex">
          <SelectValue placeholder="All categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All categories</SelectItem>
          {categories.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button type="submit" className="m-1 h-9 rounded-lg px-4">
        Search
      </Button>
    </form>
  )
}

function CategoryMenu() {
  const categories = useApp((s) => s.categories)
  const [open, setOpen] = useState(false)
  const location = useLocation()
  useEffect(() => {
    setOpen(false)
  }, [location])
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" className="flex items-center gap-1.5 rounded-md py-2 text-sm font-semibold text-foreground hover:text-primary">
          <Menu className="size-4" /> All Categories <ChevronDown className="size-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[min(92vw,56rem)] p-0">
        <div className="grid gap-x-6 gap-y-5 p-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <div key={c.id}>
              <Link to={`/products?category=${c.id}`} className="flex items-center gap-2 font-semibold hover:text-primary">
                <span className="grid size-7 place-items-center rounded-md bg-primary/10 text-primary">
                  <DynamicIcon name={c.icon} className="size-4" />
                </span>
                <span className="text-sm">{c.name}</span>
              </Link>
              <ul className="mt-2 space-y-1 pl-9">
                {c.subs.slice(0, 3).map((s) => (
                  <li key={s.id}>
                    <Link to={`/products?category=${c.id}&sub=${s.id}`} className="text-xs text-muted-foreground hover:text-primary">
                      {s.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

function AccountMenu() {
  const role = useApp((s) => s.role)
  const setRole = useApp((s) => s.setRole)
  const navigate = useNavigate()
  if (role === "guest") {
    return (
      <div className="flex items-center gap-1">
        <Button variant="ghost" asChild className="hidden sm:inline-flex">
          <Link to="/login">Sign in</Link>
        </Button>
        <Button variant="outline" asChild className="hidden md:inline-flex">
          <Link to="/register">Join free</Link>
        </Button>
      </div>
    )
  }
  const label = { buyer: "Rohan Mehta", supplier: "Volta Electronics", admin: "Ananya Rao" }[role]
  return (
    <div className="flex items-center gap-1">
      <NotificationBell role={role} allLink={role === "buyer" ? "/buyer/notifications" : undefined} />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" className="flex items-center gap-2 rounded-full p-0.5 pr-2 hover:bg-muted">
            <Avatar className="size-8">
              <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                {label.split(" ").map((w) => w[0]).join("").slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <span className="hidden whitespace-nowrap text-sm font-medium xl:inline">{label}</span>
            <ChevronDown className="hidden size-3.5 text-muted-foreground xl:inline" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel className="text-xs capitalize text-muted-foreground">{role} account</DropdownMenuLabel>
          <DropdownMenuItem onSelect={() => navigate(roleHome[role])}>
            <LayoutDashboard /> Dashboard
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() => {
              setRole("guest")
              navigate("/")
            }}
          >
            <LogOut /> Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

function Header() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  useEffect(() => {
    setOpen(false)
  }, [location])

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="hidden bg-brand text-[13px] text-white/80 md:block">
        <div className="container-page flex h-9 items-center justify-between">
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-saffron" /> 18,400+ GST-verified suppliers
            </span>
            <Link to="/brics" className="flex items-center gap-1.5 hover:text-white">
              <Globe2 className="size-3.5" /> Trade with BRICS nations
            </Link>
          </div>
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5">
              <Phone className="size-3.5" /> +91 22 4000 1234
            </span>
            <Link to="/page/contact" className="hover:text-white">
              Help Centre
            </Link>
            <Link to="/sell" className="font-medium text-saffron hover:text-saffron/80">
              Sell on TradeSetu
            </Link>
          </div>
        </div>
      </div>
      <div className="container-page flex h-16 items-center gap-3 lg:gap-6">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0">
            <SheetHeader className="border-b">
              <SheetTitle>
                <Logo />
              </SheetTitle>
            </SheetHeader>
            <nav className="grid gap-1 p-3">
              {nav.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  className={({ isActive }) => cn("rounded-md px-3 py-2.5 text-sm font-medium hover:bg-muted", isActive && "bg-accent text-primary")}
                >
                  {n.label}
                </NavLink>
              ))}
              <div className="my-2 border-t" />
              <Link to="/login" className="rounded-md px-3 py-2.5 text-sm hover:bg-muted">
                Sign in
              </Link>
              <Link to="/register" className="rounded-md px-3 py-2.5 text-sm hover:bg-muted">
                Create free account
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
        <Logo />
        <SearchBar className="hidden md:flex" />
        <div className="ml-auto flex items-center gap-2">
          <Button asChild className="hidden bg-saffron text-saffron-foreground hover:bg-saffron/90 sm:inline-flex">
            <Link to="/post-requirement">
              <MessageSquarePlus /> Post Requirement
            </Link>
          </Button>
          <AccountMenu />
        </div>
      </div>
      <div className="container-page pb-3 md:hidden">
        <SearchBar />
      </div>
      <div className="hidden border-t lg:block">
        <div className="container-page flex h-11 items-center gap-6">
          <CategoryMenu />
          <span className="h-5 w-px bg-border" />
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                cn("text-sm text-muted-foreground transition hover:text-foreground", isActive && "font-medium text-primary")
              }
            >
              {n.label}
            </NavLink>
          ))}
        </div>
      </div>
    </header>
  )
}

function Footer() {
  const categories = useApp((s) => s.categories)
  return (
    <footer className="mt-20 bg-brand text-white/70">
      <div className="container-page grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-6">
        <div className="lg:col-span-2">
          <Logo light />
          <p className="mt-4 max-w-sm text-sm leading-relaxed">
            India's B2B marketplace connecting verified manufacturers, wholesalers and exporters with business buyers — at home and
            across BRICS partner nations.
          </p>
          <div className="mt-5 space-y-2 text-sm">
            <p className="flex items-center gap-2">
              <Phone className="size-4 text-saffron" /> +91 22 4000 1234
            </p>
            <p className="flex items-center gap-2">
              <Mail className="size-4 text-saffron" /> support@tradesetu.in
            </p>
          </div>
        </div>
        <FooterCol
          title="For Buyers"
          links={[
            ["Post a requirement", "/post-requirement"],
            ["Browse products", "/products"],
            ["Find suppliers", "/suppliers"],
            ["Buyer dashboard", "/buyer"],
            ["BRICS Trade Hub", "/brics"],
          ]}
        />
        <FooterCol
          title="For Suppliers"
          links={[
            ["Sell on TradeSetu", "/sell"],
            ["Register your company", "/register?type=supplier"],
            ["Supplier dashboard", "/supplier"],
            ["Get Trust Seal", "/sell"],
          ]}
        />
        <FooterCol title="Top Categories" links={categories.slice(0, 6).map((c) => [c.name, `/products?category=${c.id}`])} />
        <FooterCol
          title="Company"
          links={[
            ["About us", "/page/about"],
            ["Contact us", "/page/contact"],
            ["FAQs", "/page/faq"],
            ["Terms & Conditions", "/page/terms"],
            ["Privacy Policy", "/page/privacy"],
          ]}
        />
      </div>
      <div className="border-t border-white/10">
        <div className="container-page py-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/50">Suppliers by city</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
            {cities.map((c) => (
              <Link key={c} to={`/suppliers?city=${encodeURIComponent(c)}`} className="hover:text-white">
                Suppliers in {c}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-5 text-xs sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 TradeSetu Marketplace Pvt. Ltd. · Interactive prototype</span>
          <span className="flex items-center gap-1.5">
            <Store className="size-3.5" /> Made for Bharat, built for BRICS
          </span>
        </div>
      </div>
    </footer>
  )
}

function FooterCol({ title, links }: { title: string; links: string[][] }) {
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-white">{title}</h4>
      <ul className="space-y-2 text-sm">
        {links.map(([label, to]) => (
          <li key={label}>
            <Link to={to} className="hover:text-white">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function PublicLayout() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
