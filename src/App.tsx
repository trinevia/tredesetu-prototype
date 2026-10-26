import {
  BarChart3,
  Bell,
  Building2,
  FolderTree,
  Heart,
  Images,
  Inbox,
  KanbanSquare,
  LayoutDashboard,
  MessageCircle,
  MessagesSquare,
  Package,
  PackageCheck,
  Store,
  UserCircle,
  Users,
} from "lucide-react"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import { DemoSwitcher } from "@/components/layout/DemoSwitcher"
import { PanelLayout, type PanelConfig } from "@/components/layout/PanelLayout"
import { PublicLayout } from "@/components/layout/PublicLayout"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { img } from "@/lib/images"
import { DEMO_SUPPLIER_ID, useApp } from "@/store/app"
import AdminAnalytics from "@/pages/admin/Analytics"
import AdminCategories from "@/pages/admin/Categories"
import AdminContent from "@/pages/admin/Content"
import AdminCrm from "@/pages/admin/Crm"
import AdminDashboard from "@/pages/admin/Dashboard"
import AdminProducts from "@/pages/admin/Products"
import AdminSuppliers from "@/pages/admin/Suppliers"
import AdminUsers from "@/pages/admin/Users"
import AdminWhatsApp from "@/pages/admin/WhatsApp"
import BuyerContacted from "@/pages/buyer/Contacted"
import BuyerDashboard from "@/pages/buyer/Dashboard"
import BuyerEnquiries from "@/pages/buyer/Enquiries"
import BuyerEnquiryDetail from "@/pages/buyer/EnquiryDetail"
import BuyerNotifications from "@/pages/buyer/Notifications"
import BuyerProfile from "@/pages/buyer/Profile"
import BuyerSaved from "@/pages/buyer/Saved"
import Brics from "@/pages/public/Brics"
import CmsPage from "@/pages/public/CmsPage"
import Home from "@/pages/public/Home"
import Login from "@/pages/public/Login"
import NotFound from "@/pages/public/NotFound"
import PostRequirement from "@/pages/public/PostRequirement"
import ProductDetail from "@/pages/public/ProductDetail"
import Products from "@/pages/public/Products"
import Register from "@/pages/public/Register"
import Sell from "@/pages/public/Sell"
import SupplierProfile from "@/pages/public/SupplierProfile"
import Suppliers from "@/pages/public/Suppliers"
import SupplierAnalytics from "@/pages/supplier/Analytics"
import SupplierDashboard from "@/pages/supplier/Dashboard"
import SupplierLeads from "@/pages/supplier/Leads"
import SupplierProductForm from "@/pages/supplier/ProductForm"
import SupplierProducts from "@/pages/supplier/Products"
import SupplierProfileEdit from "@/pages/supplier/Profile"

function useBuyerConfig(): PanelConfig {
  const open = useApp((s) => s.leads.filter((l) => l.buyerId === "b1" && !["Won", "Lost"].includes(l.crmStage)).length)
  const saved = useApp((s) => s.savedProductIds.length + s.savedSupplierIds.length)
  return {
    role: "buyer",
    title: "Buyer Panel",
    notificationsLink: "/buyer/notifications",
    user: { name: "Rohan Mehta", sub: "Mehta Retail Solutions", avatar: img("man3", 80, 80), initials: "RM" },
    groups: [
      {
        label: "Sourcing",
        items: [
          { to: "/buyer", label: "Dashboard", icon: LayoutDashboard, end: true },
          { to: "/buyer/enquiries", label: "My Enquiries", icon: Inbox, badge: open },
          { to: "/buyer/saved", label: "Saved & Favourites", icon: Heart, badge: saved },
          { to: "/buyer/suppliers", label: "Contacted Suppliers", icon: Building2 },
        ],
      },
      {
        label: "Account",
        items: [
          { to: "/buyer/notifications", label: "Notifications", icon: Bell },
          { to: "/buyer/profile", label: "Business Profile", icon: UserCircle },
        ],
      },
    ],
  }
}

function useSupplierConfig(): PanelConfig {
  const newLeads = useApp((s) => s.leads.filter((l) => l.supplierStage[DEMO_SUPPLIER_ID] === "New").length)
  return {
    role: "supplier",
    title: "Supplier Panel",
    user: { name: "Arjun Malhotra", sub: "Volta Electronics", avatar: img("man1", 80, 80), initials: "AM" },
    groups: [
      {
        label: "Business",
        items: [
          { to: "/supplier", label: "Dashboard", icon: LayoutDashboard, end: true },
          { to: "/supplier/leads", label: "Leads & Enquiries", icon: KanbanSquare, badge: newLeads },
          { to: "/supplier/products", label: "Products", icon: Package },
          { to: "/supplier/analytics", label: "Performance", icon: BarChart3 },
        ],
      },
      { label: "Company", items: [{ to: "/supplier/profile", label: "Company Profile", icon: Store }] },
    ],
  }
}

function useAdminConfig(): PanelConfig {
  const pendingSuppliers = useApp((s) => s.suppliers.filter((x) => x.status === "pending").length)
  const pendingProducts = useApp((s) => s.products.filter((x) => x.status === "pending" || x.reported).length)
  const newLeads = useApp((s) => s.leads.filter((l) => l.crmStage === "New").length)
  return {
    role: "admin",
    title: "Admin & CRM",
    user: { name: "Ananya Rao", sub: "Super Admin", avatar: img("woman1", 80, 80), initials: "AR" },
    groups: [
      {
        label: "Overview",
        items: [
          { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
          { to: "/admin/analytics", label: "Analytics & Reports", icon: BarChart3 },
        ],
      },
      {
        label: "CRM",
        items: [{ to: "/admin/crm", label: "Leads CRM", icon: MessagesSquare, badge: newLeads }],
      },
      {
        label: "Marketplace",
        items: [
          { to: "/admin/suppliers", label: "Suppliers", icon: Building2, badge: pendingSuppliers },
          { to: "/admin/products", label: "Products", icon: PackageCheck, badge: pendingProducts },
          { to: "/admin/categories", label: "Categories", icon: FolderTree },
          { to: "/admin/users", label: "Users & Roles", icon: Users },
        ],
      },
      {
        label: "Engagement",
        items: [
          { to: "/admin/content", label: "Banners & CMS", icon: Images },
          { to: "/admin/whatsapp", label: "WhatsApp", icon: MessageCircle },
        ],
      },
    ],
  }
}

function BuyerPanel() {
  return <PanelLayout config={useBuyerConfig()} />
}
function SupplierPanel() {
  return <PanelLayout config={useSupplierConfig()} />
}
function AdminPanel() {
  return <PanelLayout config={useAdminConfig()} />
}

export default function App() {
  return (
    <BrowserRouter>
      <TooltipProvider delayDuration={200}>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path="products" element={<Products />} />
            <Route path="product/:id" element={<ProductDetail />} />
            <Route path="suppliers" element={<Suppliers />} />
            <Route path="suppliers/:id" element={<SupplierProfile />} />
            <Route path="post-requirement" element={<PostRequirement />} />
            <Route path="brics" element={<Brics />} />
            <Route path="sell" element={<Sell />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="page/:slug" element={<CmsPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route path="buyer" element={<BuyerPanel />}>
            <Route index element={<BuyerDashboard />} />
            <Route path="enquiries" element={<BuyerEnquiries />} />
            <Route path="enquiries/:id" element={<BuyerEnquiryDetail />} />
            <Route path="saved" element={<BuyerSaved />} />
            <Route path="suppliers" element={<BuyerContacted />} />
            <Route path="notifications" element={<BuyerNotifications />} />
            <Route path="profile" element={<BuyerProfile />} />
          </Route>
          <Route path="supplier" element={<SupplierPanel />}>
            <Route index element={<SupplierDashboard />} />
            <Route path="leads" element={<SupplierLeads />} />
            <Route path="products" element={<SupplierProducts />} />
            <Route path="products/new" element={<SupplierProductForm />} />
            <Route path="products/:id/edit" element={<SupplierProductForm />} />
            <Route path="analytics" element={<SupplierAnalytics />} />
            <Route path="profile" element={<SupplierProfileEdit />} />
          </Route>
          <Route path="admin" element={<AdminPanel />}>
            <Route index element={<AdminDashboard />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="crm" element={<AdminCrm />} />
            <Route path="suppliers" element={<AdminSuppliers />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="content" element={<AdminContent />} />
            <Route path="whatsapp" element={<AdminWhatsApp />} />
          </Route>
        </Routes>
        <DemoSwitcher />
        <Toaster position="top-right" richColors={false} />
      </TooltipProvider>
    </BrowserRouter>
  )
}
