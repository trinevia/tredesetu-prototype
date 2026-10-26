import { ExternalLink, LogOut, type LucideIcon } from "lucide-react"
import { useEffect } from "react"
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom"
import { Logo } from "@/components/common/bits"
import { NotificationBell } from "@/components/layout/NotificationBell"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { useApp } from "@/store/app"
import type { Role } from "@/types"

export interface PanelNavItem {
  to: string
  label: string
  icon: LucideIcon
  badge?: number
  end?: boolean
}

export interface PanelConfig {
  role: Exclude<Role, "guest">
  title: string
  groups: { label: string; items: PanelNavItem[] }[]
  user: { name: string; sub: string; avatar?: string; initials: string }
  notificationsLink?: string
}

function CloseOnNavigate() {
  const { setOpenMobile } = useSidebar()
  const { pathname } = useLocation()
  useEffect(() => {
    setOpenMobile(false)
    document.querySelector("[data-slot=sidebar-inset]")?.scrollTo(0, 0)
    window.scrollTo(0, 0)
  }, [pathname, setOpenMobile])
  return null
}

export function PanelLayout({ config }: { config: PanelConfig }) {
  const setRole = useApp((s) => s.setRole)
  const navigate = useNavigate()
  const { pathname } = useLocation()

  // Visiting a panel URL directly switches the demo to that role.
  const role = useApp((s) => s.role)
  useEffect(() => {
    if (role !== config.role) setRole(config.role)
  }, [role, config.role, setRole])

  const all = config.groups.flatMap((g) => g.items)
  const current =
    all.filter((i) => (i.end ? pathname === i.to : pathname.startsWith(i.to))).sort((a, b) => b.to.length - a.to.length)[0] ?? all[0]

  return (
    <SidebarProvider>
      <CloseOnNavigate />
      <Sidebar collapsible="icon">
        <SidebarHeader className="h-16 justify-center border-b px-4 group-data-[collapsible=icon]:px-2">
          <div className="flex items-center gap-2 overflow-hidden">
            <Logo />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <div className="px-4 pb-1 pt-4 group-data-[collapsible=icon]:hidden">
            <span className="rounded-md bg-primary/10 px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
              {config.title}
            </span>
          </div>
          {config.groups.map((g) => (
            <SidebarGroup key={g.label}>
              <SidebarGroupLabel>{g.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {g.items.map((item) => (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton asChild isActive={item === current} tooltip={item.label}>
                        <NavLink to={item.to} end={item.end}>
                          <item.icon />
                          <span>{item.label}</span>
                        </NavLink>
                      </SidebarMenuButton>
                      {!!item.badge && <SidebarMenuBadge className="bg-primary/10 text-primary">{item.badge}</SidebarMenuBadge>}
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>
        <SidebarFooter className="border-t">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="View marketplace">
                <Link to="/">
                  <ExternalLink />
                  <span>View marketplace</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Sign out"
                onClick={() => {
                  setRole("guest")
                  navigate("/")
                }}
              >
                <LogOut />
                <span>Sign out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="min-w-0 bg-surface">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur sm:px-6">
          <SidebarTrigger />
          <span className="h-5 w-px bg-border" />
          <span className="truncate text-sm font-medium">{current?.label}</span>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="sm" asChild className="hidden sm:inline-flex">
              <Link to="/">
                <ExternalLink /> Marketplace
              </Link>
            </Button>
            <NotificationBell role={config.role} allLink={config.notificationsLink} />
            <div className="flex items-center gap-2 pl-1">
              <Avatar className="size-8">
                {config.user.avatar && <AvatarImage src={config.user.avatar} alt="" />}
                <AvatarFallback className="bg-primary text-xs text-primary-foreground">{config.user.initials}</AvatarFallback>
              </Avatar>
              <div className="hidden leading-tight md:block">
                <div className="text-sm font-medium">{config.user.name}</div>
                <div className="text-xs text-muted-foreground">{config.user.sub}</div>
              </div>
            </div>
          </div>
        </header>
        <div className="mx-auto w-full max-w-7xl flex-1 p-4 pb-24 sm:p-6 sm:pb-24 lg:p-8 lg:pb-24">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
