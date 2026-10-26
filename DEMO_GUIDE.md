# TradeSetu — Client Demo Guide

India's B2B marketplace, with Buyer, Supplier and Admin/CRM panels, WhatsApp touchpoints and a BRICS Trade Hub (Phase One prototype).

```bash
cd b2b-marketplace-prototype && npm install && npm run dev   # http://localhost:5173
```

---

## Logins & demo access

| Role | How to sign in | Who you are |
|---|---|---|
| **Buyer** | `/login` → *I'm a buyer* → **Use demo buyer account** → OTP `1234` | Rohan Mehta · Mehta Retail Solutions, Pune |
| **Supplier** | `/login` → *I'm a supplier* → **Use demo supplier account** → OTP `1234` | Arjun Malhotra · Volta Electronics, Delhi |
| **Admin & CRM** | Open `/admin` (or use the Demo view switcher) | Ananya Rao · Super Admin |
| **Visitor** | Just open `/` | Not signed in |

- **OTP everywhere:** `1234` (login, registration, enquiry, post requirement)
- **Demo view switcher:** the dark pill at the **bottom-right**. It jumps between Visitor / Buyer / Supplier / Admin in one click.
- **Reset demo data:** the same pill → *Reset demo data*. Do this before every client meeting.
- **Fill buttons:** forms have **"Fill demo details"** links, so you never type during a demo.

---

## 5-minute demo story (recommended)

The story to tell: **"One buyer requirement becomes a closed deal."**

| # | View | Do this | Say this |
|---|---|---|---|
| 1 | Visitor | Home → search **"charger"** → filter by *Verified* | "Buyers find verified suppliers in seconds." |
| 2 | Visitor | Open **65W GaN Charger** → **Request Quote** → *Fill demo buyer details* → OTP `1234` | "One enquiry, verified by OTP, goes straight to the supplier." |
| 3 | Supplier | **Leads & Enquiries**: the new lead appears in **New** | "The supplier is alerted on WhatsApp and email instantly." |
| 4 | Supplier | Open the lead → **Send quotation** → **WhatsApp** the buyer | "Quote, chat and follow-up from one screen, all logged." |
| 5 | Buyer | **My Enquiries** → open it → **Accept quotation** | "Buyers compare quotes and decide." |
| 6 | Admin | **Leads CRM**: the lead shows **Won** with its full history | "Operations sees every deal, owner and follow-up." |
| 7 | Visitor | **BRICS Trade Hub** → pick Russia/Brazil → international enquiry | "Ready for cross-border trade from day one." |

---

## Feature map (what to show where)

### Public marketplace (Visitor)
- **Home:** search, promo banners, categories, featured/trending products, suppliers, trust section, testimonials
- **Products:** filters (category tree, price slider, city, business type, MOQ, verified, ready stock) with live counts
- **Product page:** gallery, specs, MOQ and price, supplier card, **Request Quote**, **WhatsApp**
- **Suppliers & company profile:** GST / Trust Seal badges, catalogue, response rate
- **Post Requirement (RFQ):** live "suppliers who'll receive this" preview, using rule-based matching
- **BRICS Trade Hub:** 10 countries, trade leads, export services, international enquiry
- **Register / Login:** buyer or supplier, OTP, GSTIN check

### Buyer panel
Dashboard · My Enquiries (status tabs) · quote comparison with Accept / Request revision · Saved items · Contacted suppliers · Notifications (email / WhatsApp / SMS preferences) · Business profile

### Supplier panel
Dashboard (KPIs, profile strength) · **Leads & Enquiries:**
- 8-stage board with drag & drop
- pipeline overview
- quotes, WhatsApp, notes and follow-ups

Also: Products (add/edit, submit for approval) · Company profile editor · Performance analytics

### Admin & CRM
Dashboard KPIs & approvals queue · **Leads CRM:**
- assign
- status flow New → Won/Lost
- call remarks
- charts by supplier, category, location and source

Also: Supplier & product moderation · Categories (3 levels) · Users & roles · Banners & CMS pages · WhatsApp console · Analytics + CSV export

---

## Presenting tips
- Start with **Reset demo data**. Present at **desktop width**, then shrink the window to show it's **mobile-ready**.
- Keep two browser tabs open (Buyer and Supplier) to show the real-time flow side by side.
- If asked "is this live?", answer: **"Interactive prototype: the workflows are real, the data is sample data."**

## What's simulated (be upfront)
| Area | Prototype | Production |
|---|---|---|
| Data & login | Browser storage, OTP `1234` | Backend + SMS/WhatsApp OTP |
| WhatsApp | Real `wa.me` links; "Send via API" is simulated | WhatsApp Business API |
| Uploads / images | File names, stock photos | AWS S3 |
| Analytics | Sample numbers | Live events + Google Analytics |
| Matching | Rule-based (category → city → verified → rating) | Same; AI matching in Phase Two |

> "TradeSetu" is a placeholder brand name.
