import {
  ArrowRight,
  BarChart3,
  BellRing,
  Check,
  Globe2,
  KanbanSquare,
  MessageCircle,
  Package,
  ShieldCheck,
  Store,
  Users,
} from "lucide-react"
import { Link } from "react-router-dom"
import { SectionHeading, SimulatedNote, SmartImage } from "@/components/common/bits"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { img } from "@/lib/images"
import { cn } from "@/lib/utils"

const benefits = [
  { icon: Users, title: "Genuine buyer leads", body: "Every enquiry comes with quantity, budget, delivery city and a verified mobile number." },
  { icon: MessageCircle, title: "Leads on WhatsApp", body: "Get instant alerts and reply to buyers with one tap using approved templates." },
  { icon: KanbanSquare, title: "Built-in lead CRM", body: "Track New → Contacted → Quotation → Won, set follow-ups and never miss a deal." },
  { icon: Store, title: "Company microsite", body: "A professional, SEO-friendly profile and product catalogue that ranks on Google." },
  { icon: BarChart3, title: "Performance insights", body: "See product views, enquiries and conversion — know what sells." },
  { icon: Globe2, title: "BRICS export leads", body: "Reach importers in Brazil, Russia, UAE, Egypt and more through the Trade Desk." },
]

const plans = [
  {
    name: "Free Listing",
    price: "₹0",
    period: "forever",
    features: ["Company profile & 20 products", "Buyer enquiries by email", "Basic lead management", "Standard search placement"],
    cta: "Start free",
  },
  {
    name: "Gold Supplier",
    price: "₹2,499",
    period: "per month",
    popular: true,
    features: ["Unlimited products", "WhatsApp lead alerts", "Full CRM with follow-up reminders", "Priority placement in search & category pages", "Gold Trust Seal after verification"],
    cta: "Choose Gold",
  },
  {
    name: "Trust Seal Export",
    price: "₹5,999",
    period: "per month",
    features: ["Everything in Gold", "On-site factory audit & Trust Seal", "BRICS Trade Desk leads", "Featured homepage slots", "Dedicated account manager"],
    cta: "Talk to sales",
  },
]

const faqs = [
  ["Is it really free to list my products?", "Yes. The Free plan lets you create your company profile, list up to 20 products and receive buyer enquiries at no cost."],
  ["How are leads assigned to me?", "Buyers can contact you directly from your product pages and profile. Posted requirements are matched to suppliers by category and location, with verified and high-rated suppliers ranked first."],
  ["What documents do I need for verification?", "Your GSTIN, PAN and a cancelled cheque or bank statement. Trust Seal suppliers additionally receive a video or on-site factory verification."],
  ["Can I respond to enquiries on WhatsApp?", "Yes — lead alerts arrive on WhatsApp and you can reply with one tap. All communication is logged in your lead's history."],
  ["How long does approval take?", "Most supplier accounts are verified within 24 hours. New products are moderated within a few hours."],
]

export default function Sell() {
  return (
    <div>
      <section className="relative overflow-hidden bg-brand text-white">
        <div className="bg-grid absolute inset-0 opacity-50" />
        <div className="container-page relative grid gap-10 py-14 lg:grid-cols-2 lg:items-center lg:py-20">
          <div>
            <Badge className="bg-saffron text-saffron-foreground">For manufacturers, wholesalers & exporters</Badge>
            <h1 className="mt-4 text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">Grow your B2B sales with leads that actually convert</h1>
            <p className="mt-4 max-w-xl text-white/75">
              Join 18,400+ verified suppliers getting daily enquiries from retailers, distributors, project buyers and international importers.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild size="lg" className="h-11 bg-saffron px-5 text-saffron-foreground hover:bg-saffron/90">
                <Link to="/register?type=supplier">
                  Register your company free <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-11 border-white/25 bg-white/5 px-5 text-white hover:bg-white/15 hover:text-white">
                <Link to="/supplier">See the supplier dashboard</Link>
              </Button>
            </div>
            <div className="mt-10 grid max-w-lg grid-cols-3 gap-4">
              {[
                ["9,800+", "Enquiries / month"],
                ["2 hrs", "Avg. first response"],
                ["34%", "Lead-to-quote rate"],
              ].map(([v, l]) => (
                <div key={l}>
                  <div className="text-2xl font-semibold">{v}</div>
                  <div className="text-xs text-white/60">{l}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <SmartImage src={img("labAutomation", 900, 700)} alt="" className="aspect-[4/3] w-full rounded-2xl shadow-2xl" />
            <Card className="absolute -bottom-6 left-4 w-64 gap-2 p-4 text-foreground shadow-xl sm:left-[-1.5rem]">
              <div className="flex items-center gap-2 text-xs font-medium text-whatsapp">
                <BellRing className="size-3.5" /> New enquiry · just now
              </div>
              <div className="text-sm font-semibold">2,000 × 65W GaN chargers</div>
              <div className="text-xs text-muted-foreground">Mehta Retail Solutions, Pune · Budget ₹15 L</div>
            </Card>
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <SectionHeading eyebrow="Why sell on TradeSetu" title="Everything you need to win more B2B business" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((b) => (
            <div key={b.title} className="rounded-xl border bg-card p-5">
              <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
                <b.icon className="size-5" />
              </span>
              <h3 className="mt-4 font-semibold">{b.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{b.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y bg-surface py-16">
        <div className="container-page">
          <SectionHeading eyebrow="How leads work" title="From listing to won deal" />
          <ol className="grid gap-4 md:grid-cols-4">
            {[
              [Store, "Create profile", "Add company details, GST and certifications. Get verified in 24 hrs."],
              [Package, "List products", "Upload images, specs, price range and MOQ. Approved within hours."],
              [BellRing, "Receive enquiries", "Matched buyer requirements arrive on WhatsApp, email and your dashboard."],
              [ShieldCheck, "Quote & convert", "Send quotations, follow up from the CRM and mark deals won."],
            ].map(([Icon, t, b], i) => {
              const I = Icon as typeof Store
              return (
                <li key={t as string} className="relative rounded-xl border bg-card p-5">
                  <span className="text-xs font-semibold text-primary">Step {i + 1}</span>
                  <I className="mt-3 size-6 text-primary" />
                  <h3 className="mt-3 font-semibold">{t as string}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{b as string}</p>
                </li>
              )
            })}
          </ol>
        </div>
      </section>

      <section className="container-page py-16">
        <SectionHeading eyebrow="Plans" title="Start free. Upgrade when leads grow." />
        <div className="grid gap-4 lg:grid-cols-3">
          {plans.map((p) => (
            <Card key={p.name} className={cn("gap-5 p-6", p.popular && "ring-2 ring-primary")}>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{p.name}</h3>
                {p.popular && <Badge>Most popular</Badge>}
              </div>
              <div>
                <span className="text-3xl font-semibold">{p.price}</span> <span className="text-sm text-muted-foreground">{p.period}</span>
              </div>
              <ul className="flex-1 space-y-2 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-success" /> {f}
                  </li>
                ))}
              </ul>
              <Button asChild variant={p.popular ? "default" : "outline"}>
                <Link to="/register?type=supplier">{p.cta}</Link>
              </Button>
            </Card>
          ))}
        </div>
        <SimulatedNote className="mt-4 justify-center">Plan names and pricing are placeholders for discussion — final monetisation to be agreed with the client.</SimulatedNote>
      </section>

      <section className="container-page max-w-3xl pb-6">
        <SectionHeading eyebrow="FAQ" title="Questions from suppliers" />
        <Accordion type="single" collapsible className="rounded-xl border px-4">
          {faqs.map(([q, a]) => (
            <AccordionItem key={q} value={q}>
              <AccordionTrigger className="text-left">{q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <div className="mt-10 rounded-2xl bg-primary p-8 text-center text-primary-foreground">
          <h3 className="text-2xl font-semibold">Ready to get your first lead?</h3>
          <p className="mt-2 text-sm text-white/75">Registration takes less than 5 minutes.</p>
          <Button asChild className="mt-5 bg-white text-primary hover:bg-white/90">
            <Link to="/register?type=supplier">
              Register as supplier <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
