# TradeSetu — B2B Marketplace Prototype (Phase One)

Interactive, client-presentation prototype for the **B2B Marketplace Phase One** proposal: an Indian
multi-category, multi-supplier marketplace with Buyer, Supplier and Admin panels, a lead CRM,
RFQ/enquiry workflow, WhatsApp touchpoints and a BRICS Trade Hub.

> "TradeSetu" is a placeholder brand name (Setu = bridge) — swap it once the client confirms naming.

## Run it

```bash
cd b2b-marketplace-prototype
npm install
npm run dev        # http://localhost:5173
npm run build      # production build into dist/ (static, deploy anywhere)
```

## Presenting

Use the **Demo view** pill (bottom-left) to jump between the four Phase One experiences:

| View | Who | Start at |
| --- | --- | --- |
| Visitor | Public marketplace website | `/` |
| Buyer | Rohan Mehta · Mehta Retail Solutions, Pune | `/buyer` |
| Supplier | Volta Electronics Pvt. Ltd., Delhi | `/supplier` |
| Admin & CRM | Ananya Rao · marketplace operations | `/admin` |

All four views share one data store (persisted in `localStorage`), so a journey started in one view
shows up in the others. Use **Reset demo data** in the same menu to restore the sample set.

### Suggested end-to-end demo (≈5 min)

1. **Visitor** → search "charger" → open the 65W GaN charger → **Get Quote** → fill demo details → OTP `1234`.
2. **Supplier** → *Leads & Enquiries* → the new lead is in **New** → open it → **Send quotation** → WhatsApp the buyer.
3. **Buyer** → *My Enquiries* → open the enquiry → compare and **Accept** the quotation.
4. **Admin & CRM** → *Leads CRM* → the lead shows as Won with full history; assign / add call remarks.
5. **Visitor** → *BRICS Trade Hub* → pick a country → submit an international enquiry.

## What's real vs simulated

| Area | In this prototype | Production (Phase One) |
| --- | --- | --- |
| Data | Seed data + client-side store (`src/store/app.ts`) | NestJS API + PostgreSQL |
| Auth / OTP | Mock, OTP is always `1234` | SMS gateway / WhatsApp auth templates |
| WhatsApp | Real `wa.me` click-to-chat links; "Send via API" is simulated and logged | WhatsApp Business API with templates & delivery tracking |
| Supplier matching | Rule-based (category → same city → verified → rating) | Same rules server-side; AI matching in Phase Two |
| Notifications | In-app feed per role | Email, SMS, WhatsApp, in-app |
| File uploads | File names only | AWS S3 |
| Images | Curated Unsplash photos | Supplier uploads on S3/CDN |
| Analytics | Sample figures | Platform events + GA4 / Search Console |

## Stack

Vite · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui (Radix) · Lucide · Recharts · Zustand · React Router.
The production recommendation in the proposal is Next.js (SSR/SEO); the components here port directly.

## Structure

```
src/
  data/          seed data (categories, suppliers, products, leads, BRICS, content)
  store/app.ts   shared demo state + business actions (enquiry → match → quote → CRM)
  components/
    ui/          shadcn/ui components
    common/      design-system bits (badges, stat cards, empty states…)
    market/      product/supplier cards, enquiry & WhatsApp dialogs
    leads/       shared lead timeline, notes, requirement summary
    layout/      public layout, panel shell, demo switcher, notifications
  pages/
    public/      marketplace website
    buyer/       buyer panel
    supplier/    supplier panel
    admin/       admin panel + CRM
```
