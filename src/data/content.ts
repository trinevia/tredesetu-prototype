import { img } from "@/lib/images"
import type { AppNotification, Banner, CmsPage, PlatformUser, WhatsAppTemplate } from "@/types"

export const banners: Banner[] = [
  {
    id: "bn1",
    title: "Festive Sourcing Week",
    subtitle: "Up to 18% lower quotes on electronics & gifting from verified manufacturers",
    cta: "Explore deals",
    link: "/products?category=electronics",
    image: img("warehouseYellow", 1400, 600),
    placement: "Homepage Hero",
    active: true,
    starts: "2026-10-15",
    ends: "2026-11-15",
    clicks: 3820,
  },
  {
    id: "bn2",
    title: "Trade with BRICS partners",
    subtitle: "Verified Indian exporters for Brazil, Russia, China, South Africa, UAE & Egypt",
    cta: "Open BRICS Trade Hub",
    link: "/brics",
    image: img("containerShip", 1400, 600),
    placement: "Homepage Hero",
    active: true,
    starts: "2026-10-01",
    ends: "2026-12-31",
    clicks: 2210,
  },
  {
    id: "bn3",
    title: "Go solar with ALMM-listed modules",
    subtitle: "Compare quotes from Gujarat & Rajasthan module makers",
    cta: "View solar suppliers",
    link: "/products?category=solar",
    image: img("solarFarm", 1400, 600),
    placement: "Homepage Strip",
    active: true,
    starts: "2026-10-10",
    ends: "2026-11-30",
    clicks: 940,
  },
  {
    id: "bn4",
    title: "Packaging for D2C brands",
    subtitle: "Custom printed boxes from 2,000 units",
    cta: "Get quotes",
    link: "/products?category=packaging",
    image: img("kraftBoxes", 1400, 600),
    placement: "Category",
    active: false,
    starts: "2026-11-01",
    ends: "2026-11-30",
    clicks: 0,
  },
]

export const testimonials = [
  {
    name: "Rohan Mehta",
    role: "Director, Mehta Retail Solutions",
    city: "Pune",
    avatar: img("man3", 120, 120),
    quote:
      "We posted one requirement for private-label chargers and had three verified manufacturers quoting within a day. The WhatsApp follow-ups made closing the deal effortless.",
  },
  {
    name: "Kavita Sharma",
    role: "Procurement Head, Sharma Infra",
    city: "Jaipur",
    avatar: img("woman1", 120, 120),
    quote:
      "Comparing GST-verified suppliers side by side saved our team weeks. The quotation tracking is exactly what our purchase department needed.",
  },
  {
    name: "Arjun Malhotra",
    role: "Director – Sales, Volta Electronics",
    city: "Delhi",
    avatar: img("man1", 120, 120),
    quote:
      "Leads arrive pre-qualified with quantity, budget and delivery city. Our conversion from marketplace enquiries is now our best channel.",
  },
]

export const platformUsers: PlatformUser[] = [
  { id: "u1", name: "Rohan Mehta", email: "rohan@mehtaretail.in", phone: "+91 98220 41xxx", role: "Buyer", company: "Mehta Retail Solutions", city: "Pune", status: "Active", verified: true, joinedAt: "2026-06-12", lastActive: "Today" },
  { id: "u2", name: "Arjun Malhotra", email: "arjun@voltaelectronics.in", phone: "+91 98100 22xxx", role: "Supplier", company: "Volta Electronics Pvt. Ltd.", city: "Delhi", status: "Active", verified: true, joinedAt: "2024-11-02", lastActive: "Today" },
  { id: "u3", name: "Aisha Khan", email: "aisha@urbancart.in", phone: "+91 99300 22xxx", role: "Buyer", company: "UrbanCart Retail LLP", city: "Mumbai", status: "Active", verified: true, joinedAt: "2026-02-03", lastActive: "Yesterday" },
  { id: "u4", name: "Priya Nair", email: "priya@tradesetu.in", phone: "+91 90000 11xxx", role: "CRM Executive", company: "TradeSetu", city: "Mumbai", status: "Active", verified: true, joinedAt: "2026-01-10", lastActive: "Today" },
  { id: "u5", name: "Vikram Singh", email: "vikram@tradesetu.in", phone: "+91 90000 12xxx", role: "CRM Executive", company: "TradeSetu", city: "Delhi", status: "Active", verified: true, joinedAt: "2026-01-10", lastActive: "Today" },
  { id: "u6", name: "Sneha Kulkarni", email: "sneha@tradesetu.in", phone: "+91 90000 13xxx", role: "CRM Executive", company: "TradeSetu", city: "Pune", status: "Active", verified: true, joinedAt: "2026-03-01", lastActive: "2 days ago" },
  { id: "u7", name: "Ananya Rao", email: "ananya@tradesetu.in", phone: "+91 90000 10xxx", role: "Super Admin", company: "TradeSetu", city: "Mumbai", status: "Active", verified: true, joinedAt: "2025-12-01", lastActive: "Today" },
  { id: "u8", name: "Karthik Raman", email: "karthik@ramandist.com", phone: "+91 94440 18xxx", role: "Buyer", company: "Raman Distributors", city: "Chennai", status: "Active", verified: false, joinedAt: "2026-09-18", lastActive: "3 days ago" },
  { id: "u9", name: "Rahul Deshmukh", email: "rahul@greenleafseeds.in", phone: "+91 97650 34xxx", role: "Supplier", company: "GreenLeaf Seeds & Agritech", city: "Pune", status: "Pending", verified: false, joinedAt: "2026-10-21", lastActive: "Today" },
  { id: "u10", name: "Farhan Ali", email: "farhan@novawearables.in", phone: "+91 99860 77xxx", role: "Supplier", company: "Nova Wearables LLP", city: "Bengaluru", status: "Pending", verified: false, joinedAt: "2026-10-24", lastActive: "Yesterday" },
  { id: "u11", name: "Gurpreet Kaur", email: "gk@ludhianaknit.com", phone: "+91 98140 55xxx", role: "Supplier", company: "Ludhiana Knitwear House", city: "Ludhiana", status: "Active", verified: false, joinedAt: "2025-08-14", lastActive: "1 week ago" },
  { id: "u12", name: "Deepak Verma", email: "deepak@quickmart.in", phone: "+91 98111 90xxx", role: "Buyer", company: "QuickMart Wholesale", city: "Delhi", status: "Suspended", verified: false, joinedAt: "2026-04-22", lastActive: "1 month ago" },
]

export const whatsappTemplates: WhatsAppTemplate[] = [
  {
    id: "wt1",
    name: "new_enquiry_supplier",
    category: "Utility",
    audience: "Supplier",
    body: "Hi {{1}}, you have a new enquiry on TradeSetu for *{{2}}* — Qty {{3}} from {{4}}. Respond quickly to improve your response score: {{5}}",
    status: "Approved",
    sent: 4820,
    readRate: 91,
  },
  {
    id: "wt2",
    name: "quote_received_buyer",
    category: "Utility",
    audience: "Buyer",
    body: "Hello {{1}}, {{2}} has sent you a quotation of ₹{{3}}/unit for {{4}}. View & compare quotes: {{5}}",
    status: "Approved",
    sent: 2310,
    readRate: 88,
  },
  {
    id: "wt3",
    name: "followup_reminder",
    category: "Utility",
    audience: "Supplier",
    body: "Reminder: follow-up due today for enquiry {{1}} ({{2}}). Tap to update the lead status: {{3}}",
    status: "Approved",
    sent: 1290,
    readRate: 79,
  },
  {
    id: "wt4",
    name: "otp_login",
    category: "Authentication",
    audience: "Buyer",
    body: "{{1}} is your TradeSetu verification code. Do not share it with anyone.",
    status: "Approved",
    sent: 9120,
    readRate: 97,
  },
  {
    id: "wt5",
    name: "festive_sourcing_week",
    category: "Marketing",
    audience: "Buyer",
    body: "🎉 Festive Sourcing Week is live! Get up to 18% lower quotes from verified manufacturers. Post your requirement: {{1}}",
    status: "Pending",
    sent: 0,
    readRate: 0,
  },
]

export const seedNotifications: AppNotification[] = [
  { id: "nt1", role: "buyer", title: "New quotation received", body: "Volta Electronics quoted ₹715/unit for 65W GaN chargers.", at: "2026-10-23T09:30:00.000Z", read: false, channel: "whatsapp", link: "/buyer/enquiries" },
  { id: "nt2", role: "buyer", title: "Enquiry assigned to a trade advisor", body: "Vikram Singh will help you with ENQ-24114 (power banks).", at: "2026-10-25T06:10:00.000Z", read: false, channel: "in-app", link: "/buyer/enquiries" },
  { id: "nt3", role: "buyer", title: "Deal marked as won", body: "PackRight Industries confirmed your order of 20,000 boxes.", at: "2026-10-16T11:00:00.000Z", read: true, channel: "email" },
  { id: "nt4", role: "supplier", title: "New enquiry: 20000 mAh power banks", body: "Rohan Mehta (Pune) needs 600 pcs. Respond within 2 hrs to keep your response badge.", at: "2026-10-25T05:40:00.000Z", read: false, channel: "whatsapp", link: "/supplier/leads" },
  { id: "nt5", role: "supplier", title: "Product submitted for approval", body: "Braided USB-C Cable 60W is under review by the marketplace team.", at: "2026-10-24T10:20:00.000Z", read: false, channel: "in-app", link: "/supplier/products" },
  { id: "nt6", role: "supplier", title: "Follow-up due tomorrow", body: "UrbanCart Retail — Bluetooth speakers (ENQ-24121).", at: "2026-10-26T04:00:00.000Z", read: true, channel: "whatsapp", link: "/supplier/leads" },
  { id: "nt7", role: "admin", title: "2 suppliers awaiting approval", body: "GreenLeaf Seeds & Agritech and Nova Wearables LLP submitted KYC.", at: "2026-10-24T08:00:00.000Z", read: false, channel: "in-app", link: "/admin/suppliers" },
  { id: "nt8", role: "admin", title: "Product reported", body: "Lightweight Running Shoes was reported for possible brand infringement.", at: "2026-10-23T13:15:00.000Z", read: false, channel: "email", link: "/admin/products" },
  { id: "nt9", role: "admin", title: "High-value lead received", body: "₹2.4 Cr solar module requirement from Patel Infra Projects.", at: "2026-10-26T05:00:00.000Z", read: false, channel: "in-app", link: "/admin/crm" },
]

export const cmsPages: CmsPage[] = [
  {
    slug: "about",
    title: "About TradeSetu",
    updatedAt: "2026-10-02",
    status: "Published",
    body:
      "TradeSetu is India's B2B marketplace connecting verified manufacturers, wholesalers and exporters with business buyers across India and BRICS partner nations.\n\nOur mission is to make sourcing transparent: every supplier is GST-verified, every enquiry is tracked from requirement to conversion, and every buyer gets competitive quotes without endless phone calls.\n\nHeadquartered in Mumbai, with trade advisors in Delhi, Pune and Ahmedabad.",
  },
  {
    slug: "contact",
    title: "Contact Us",
    updatedAt: "2026-09-18",
    status: "Published",
    body:
      "Buyer helpdesk: +91 22 4000 1234 (Mon–Sat, 9:30 am – 7 pm)\nSupplier onboarding: suppliers@tradesetu.in\nBRICS Trade Desk: brics@tradesetu.in\nWhatsApp: +91 90000 00000\n\nRegistered office: 7th Floor, Trade Centre, Bandra Kurla Complex, Mumbai 400051.",
  },
  {
    slug: "terms",
    title: "Terms & Conditions",
    updatedAt: "2026-08-30",
    status: "Published",
    body:
      "These terms govern the use of the TradeSetu marketplace by buyers, suppliers and visitors. TradeSetu acts as an intermediary that facilitates discovery and communication; contracts for sale are entered into directly between buyers and suppliers.\n\nSuppliers are responsible for the accuracy of listings, pricing and compliance with applicable law including GST and BIS requirements.",
  },
  {
    slug: "privacy",
    title: "Privacy Policy",
    updatedAt: "2026-08-30",
    status: "Published",
    body:
      "We collect business contact information to match buyers with suppliers. Contact details are shared with matched suppliers only when a buyer submits an enquiry. We comply with the Digital Personal Data Protection Act, 2023.",
  },
  {
    slug: "faq",
    title: "Frequently Asked Questions",
    updatedAt: "2026-10-12",
    status: "Draft",
    body:
      "Is it free for buyers? Yes — posting requirements and contacting suppliers is free.\n\nHow are suppliers verified? We validate GST, business registration and conduct video/physical verification for Trust Seal suppliers.\n\nCan I source internationally? Yes — use the BRICS Trade Hub to connect with exporters and importers in partner nations.",
  },
]

export const analytics = {
  monthly: [
    { month: "May", enquiries: 820, registrations: 310, conversions: 96 },
    { month: "Jun", enquiries: 1040, registrations: 380, conversions: 128 },
    { month: "Jul", enquiries: 1310, registrations: 452, conversions: 171 },
    { month: "Aug", enquiries: 1580, registrations: 520, conversions: 214 },
    { month: "Sep", enquiries: 1920, registrations: 610, conversions: 268 },
    { month: "Oct", enquiries: 2360, registrations: 744, conversions: 341 },
  ],
  sources: [
    { source: "Product Page", leads: 1120 },
    { source: "Post Requirement", leads: 640 },
    { source: "WhatsApp", leads: 380 },
    { source: "Supplier Profile", leads: 150 },
    { source: "BRICS Desk", leads: 70 },
  ],
  cities: [
    { city: "Delhi NCR", leads: 512 },
    { city: "Mumbai", leads: 468 },
    { city: "Ahmedabad", leads: 301 },
    { city: "Pune", leads: 254 },
    { city: "Chennai", leads: 198 },
    { city: "Bengaluru", leads: 176 },
  ],
  supplierViews: [
    { day: "Mon", views: 420, enquiries: 18 },
    { day: "Tue", views: 510, enquiries: 24 },
    { day: "Wed", views: 480, enquiries: 21 },
    { day: "Thu", views: 620, enquiries: 31 },
    { day: "Fri", views: 700, enquiries: 36 },
    { day: "Sat", views: 560, enquiries: 27 },
    { day: "Sun", views: 390, enquiries: 15 },
  ],
}
