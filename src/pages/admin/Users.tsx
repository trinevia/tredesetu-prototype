import { Ban, MoreHorizontal, Play, ShieldCheck, UserPlus, Users as UsersIcon } from "lucide-react"
import { useState, type FormEvent } from "react"
import { toast } from "sonner"
import { FilterSelect, SearchInput, TableCard } from "@/components/admin/ui"
import { EmptyState, PageHeader, StatusBadge, VerifiedBadge } from "@/components/common/bits"
import { Field } from "@/components/market/EnquiryDialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fmtDate, initials } from "@/lib/format"
import { useApp } from "@/store/app"
import type { PlatformUser } from "@/types"

const roles: PlatformUser["role"][] = ["Buyer", "Supplier", "CRM Executive", "Admin", "Super Admin"]
const statuses: PlatformUser["status"][] = ["Active", "Pending", "Suspended"]

const permissions = [
  { group: "Marketplace", items: ["View dashboard", "Approve suppliers", "Moderate products", "Manage categories"] },
  { group: "CRM", items: ["View all leads", "Assign leads", "Change lead status", "Export leads"] },
  { group: "Content", items: ["Manage banners", "Edit CMS pages", "WhatsApp templates"] },
  { group: "Administration", items: ["Manage users", "Roles & permissions", "View analytics"] },
]
const staffRoles = ["Super Admin", "Admin", "CRM Executive", "Content Manager"]
const defaultMatrix = (): Record<string, Record<string, boolean>> => {
  const all = permissions.flatMap((p) => p.items)
  return {
    "Super Admin": Object.fromEntries(all.map((p) => [p, true])),
    Admin: Object.fromEntries(all.map((p) => [p, p !== "Roles & permissions"])),
    "CRM Executive": Object.fromEntries(all.map((p) => [p, ["View dashboard", "View all leads", "Change lead status", "Assign leads"].includes(p)])),
    "Content Manager": Object.fromEntries(all.map((p) => [p, ["View dashboard", "Manage banners", "Edit CMS pages", "WhatsApp templates", "Manage categories"].includes(p)])),
  }
}

const roleTone: Record<string, string> = {
  Buyer: "bg-sky-50 text-sky-700",
  Supplier: "bg-amber-50 text-amber-700",
  "CRM Executive": "bg-violet-50 text-violet-700",
  Admin: "bg-primary/10 text-primary",
  "Super Admin": "bg-brand text-brand-foreground",
}

export default function AdminUsers() {
  const users = useApp((s) => s.users)
  const setUserStatus = useApp((s) => s.setUserStatus)
  const [q, setQ] = useState("")
  const [role, setRole] = useState("all")
  const [status, setStatus] = useState("all")
  const [invited, setInvited] = useState<PlatformUser[]>([])
  const [matrix, setMatrix] = useState(defaultMatrix)

  const all = [...invited, ...users]
  const rows = all.filter(
    (u) =>
      (!q || `${u.name} ${u.email} ${u.company}`.toLowerCase().includes(q.toLowerCase())) &&
      (role === "all" || u.role === role) &&
      (status === "all" || u.status === status),
  )

  const change = (u: PlatformUser, s: PlatformUser["status"]) => {
    if (invited.some((i) => i.id === u.id)) setInvited((list) => list.map((i) => (i.id === u.id ? { ...i, status: s } : i)))
    else setUserStatus(u.id, s)
    toast.success(`${u.name} is now ${s.toLowerCase()}`)
  }

  return (
    <>
      <PageHeader
        title="Users & roles"
        description="Buyers, suppliers, CRM executives and admin users — with role-based permissions."
        actions={<InviteDialog onInvite={(u) => setInvited((l) => [u, ...l])} />}
      />
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-5">
        {roles.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRole(role === r ? "all" : r)}
            className={`rounded-xl border bg-card p-3 text-left transition hover:border-primary/40 ${role === r ? "border-primary ring-2 ring-primary/20" : ""}`}
          >
            <div className="text-xs text-muted-foreground">{r}s</div>
            <div className="text-xl font-semibold">{all.filter((u) => u.role === r).length}</div>
          </button>
        ))}
      </div>
      <Tabs defaultValue="users">
        <TabsList className="mb-4">
          <TabsTrigger value="users">All users</TabsTrigger>
          <TabsTrigger value="roles">Roles & permissions</TabsTrigger>
        </TabsList>
        <TabsContent value="users">
          <TableCard
            toolbar={
              <>
                <SearchInput value={q} onChange={setQ} placeholder="Search name, email, company…" />
                <FilterSelect value={role} onChange={setRole} placeholder="All roles" options={roles.map((r) => ({ value: r, label: r }))} />
                <FilterSelect value={status} onChange={setStatus} placeholder="All statuses" options={statuses.map((r) => ({ value: r, label: r }))} />
              </>
            }
          >
            {rows.length === 0 ? (
              <EmptyState icon={UsersIcon} title="No users found" className="m-4" />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4">User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Verification</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Last active</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="pr-4" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="pl-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8">
                            <AvatarFallback className="text-xs">{initials(u.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{u.name}</div>
                            <div className="text-xs text-muted-foreground">{u.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={roleTone[u.role]}>{u.role}</Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {u.company}
                        <div className="text-xs text-muted-foreground">{u.city}</div>
                      </TableCell>
                      <TableCell>
                        {u.verified ? <VerifiedBadge label="Email & mobile" /> : <span className="text-xs text-amber-700">Unverified</span>}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-xs">{fmtDate(u.joinedAt)}</TableCell>
                      <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{u.lastActive}</TableCell>
                      <TableCell>
                        <StatusBadge status={u.status} />
                      </TableCell>
                      <TableCell className="pr-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon-sm" variant="ghost" aria-label="Actions">
                              <MoreHorizontal />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {u.status !== "Active" && (
                              <DropdownMenuItem onSelect={() => change(u, "Active")}>
                                <Play /> Activate
                              </DropdownMenuItem>
                            )}
                            {u.status !== "Suspended" && (
                              <DropdownMenuItem variant="destructive" onSelect={() => change(u, "Suspended")}>
                                <Ban /> Suspend
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onSelect={() => toast.success(`Password reset link sent to ${u.email}`)}>
                              <ShieldCheck /> Send reset link
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TableCard>
        </TabsContent>
        <TabsContent value="roles">
          <TableCard
            title="Permission matrix"
            description="Staff roles for the marketplace operator. Buyer & supplier permissions are fixed by account type."
            actions={
              <Button size="sm" onClick={() => toast.success("Permissions saved")}>
                Save changes
              </Button>
            }
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Permission</TableHead>
                  {staffRoles.map((r) => (
                    <TableHead key={r} className="text-center">
                      {r}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {permissions.map((g) => [
                  <TableRow key={g.group} className="bg-muted/40 hover:bg-muted/40">
                    <TableCell colSpan={staffRoles.length + 1} className="pl-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {g.group}
                    </TableCell>
                  </TableRow>,
                  ...g.items.map((p) => (
                    <TableRow key={p}>
                      <TableCell className="pl-4">{p}</TableCell>
                      {staffRoles.map((r) => (
                        <TableCell key={r} className="text-center">
                          <Checkbox
                            checked={matrix[r][p]}
                            disabled={r === "Super Admin"}
                            onCheckedChange={(c) => setMatrix((m) => ({ ...m, [r]: { ...m[r], [p]: !!c } }))}
                            aria-label={`${r}: ${p}`}
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  )),
                ])}
              </TableBody>
            </Table>
          </TableCard>
        </TabsContent>
      </Tabs>
    </>
  )
}

function InviteDialog({ onInvite }: { onInvite: (u: PlatformUser) => void }) {
  const [open, setOpen] = useState(false)
  const [f, setF] = useState({ name: "", email: "", role: "CRM Executive" as PlatformUser["role"] })
  const [err, setErr] = useState("")
  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!f.name.trim()) return setErr("Name is required")
    if (!/^\S+@\S+\.\S+$/.test(f.email)) return setErr("Enter a valid email")
    onInvite({
      id: `inv-${Date.now()}`,
      name: f.name.trim(),
      email: f.email.trim(),
      phone: "—",
      role: f.role,
      company: "TradeSetu",
      city: "—",
      status: "Pending",
      verified: false,
      joinedAt: new Date().toISOString().slice(0, 10),
      lastActive: "Invite sent",
    })
    toast.success(`Invitation sent to ${f.email}`)
    setOpen(false)
    setF({ name: "", email: "", role: "CRM Executive" })
    setErr("")
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus /> Invite user
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={submit} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>Invite a team member</DialogTitle>
            <DialogDescription>They'll receive an email to set a password and enable 2-step login.</DialogDescription>
          </DialogHeader>
          <Field label="Full name">
            <Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
          </Field>
          <Field label="Work email">
            <Input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
          </Field>
          <Field label="Role">
            <Select value={f.role} onValueChange={(v) => setF({ ...f, role: v as PlatformUser["role"] })}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(["CRM Executive", "Admin", "Super Admin"] as const).map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          {err && <p className="text-sm text-destructive">{err}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Send invite</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
