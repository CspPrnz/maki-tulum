# Maki Tulum — Product Idea

> A direct-booking site for the Maki compound in Tulum. Owner-controlled, story-first, OTA-independent. This document captures the *concept*, not the implementation.

---

## 1. Positioning

**One-line:** A direct-booking home for Maki Tulum District — a small compound of villas and apartments in the Tulum jungle — that feels like a travel magazine with a hidden booking engine, not a booking engine with a magazine skin.

**Why it exists:**
- Reclaim margin and guest relationship from Airbnb / Booking.com (independent properties lose ~61% of bookings to OTAs vs. ~35% for branded chains; price-parity + direct perks are the lever).
- Tell the Maki story at a depth OTAs structurally cannot.
- Run the compound as a tiny, sharp hospitality operation — multiple roles, one source of truth.

**Audience (from most to least important):**
1. **Conscious luxury travelers, 30–50, US / EU** — 5–10 night stays, mix of wellness + food + cenote days; repeat Tulum visitors who are OTA-fatigued.
2. **German-speaking travelers (DE / AT / CH)** — an underserved Tulum segment and the owner's native-language advantage.
3. **Small groups / families / yoga retreats** — multi-unit bookings (rent 2+ units in the compound together).

**What we're explicitly not:**
- A party/spring-break rental. A budget short-stay. A clone of Booking.com's UX patterns ("1 other person looking now," scarcity timers). Tulum luxury = calm confidence.

---

## 2. Brand direction (anchored in the existing identity)

The old site already has the raw material: a warm gold/bronze **serif + script** wordmark, biophilic architecture (white plaster, wood, stone), jungle and plunge-pool photography, a Mayan-inspired emblem.

- **Palette:** warm gold/bronze `~#B08040`, off-white `~#F7F3EC`, jungle green `~#3E4A2E`, terracotta accent, deep night for contrast. Natural, earthy, zero neon.
- **Type:** display serif (Maki wordmark) + a human script for captions + clean sans for body.
- **Imagery:** ambient video loops (jungle birds, pool reflections, the hammock at dusk) over stills. No stock. Dates on photos where relevant.
- **Voice:** first-person owner voice, German directness with Mexican warmth. No hospitality-generic ("luxury sanctuary", "hidden gem"). Name the people (the housekeeper, the yoga teacher, the chef).

---

## 3. Core narrative architecture

The site is structured as a **journey**, not a listings grid. Navigation is not "Rooms / Rates / Gallery" but something closer to:

- **The Compound** — the story of Maki, the neighborhood (Aldea Zama), the design intent.
- **The Stays** — each villa/apartment as its own editorial page (not a row in a table).
- **The Days** — what a day at Maki looks like: mornings (yoga, breakfast), days (cenotes, beach clubs, ruins), nights (chef dinners, Mayan ceremony — credentialed, named practitioners only).
- **The Guide** — a public, SEO-rich Tulum guidebook (cenotes, restaurants, beach clubs, transport, water safety, seasons). Doubles as proof-of-hosting *before* booking and as a long-tail SEO moat.
- **Book** — the transactional surface, but reachable from every story page via a persistent, soft date-picker strip.

The best direct-booking sites (Aman, Our Habitas, The Thinking Traveller, Plum Guide, onefinestay) all front-load story before the date picker. Small Luxury Hotels measured a 38% direct-book uplift from exactly this shift. ([Aman / Inviqa case study](https://inviqa.com/case-studies/aman), [Our Habitas Tulum](https://www.ourhabitas.com/tulum/))

---

## 4. User roles

Four roles, each with a dashboard that shows *only its lane*. Role-based dashboards are documented to lift operational efficiency ~24% because each role avoids noise from the others. ([Cloudbeds PMS](https://www.cloudbeds.com/property-management-system/))

| Role | Primary jobs | Explicitly not shown |
|---|---|---|
| **Guest** | Browse, book, pay, pre-arrival boarding pass (WiFi, lock code, guide, chat), upsells, checkout, post-stay review | Anyone else's data |
| **Owner** (you) | Weekly revenue + 30-day occupancy + action items, channel performance, payout status, personal-use calendar block | Daily ops noise, cleaner check-ins |
| **Property manager** (local) | Live calendar, guest WhatsApp thread, expense log, maintenance tickets, key handoffs | Financial P&L, payouts |
| **Housekeeping** | Today + tomorrow's turnovers, checklists with photo proof, supply-low flag, one-tap "done" | Guest PII beyond first name + party size |
| *(Maintenance contractor)* | Ticket-only access with photo attach | Calendar, guest data |
| **Admin** (founder) | Everything, plus role/permission management, audit log | — |

Design principle: the owner dashboard defaults to **"weekly revenue + next 30-day occupancy + 3 action items."** Not a wall of charts. Most owner-operators check their phone from a beach chair.

---

## 5. Must-have feature set (v1)

**Booking engine**
- Per-unit rates, seasonal pricing, minimum-night rules (high season 5–7, shoulder 3), length-of-stay discounts shown up-front ("book 7+, save 15%").
- Radical fee transparency: cleaning, deposit, and **Quintana Roo Saneamiento** itemized on the first rate display, not step 3. Visitax (≈$13 USD/person, state-collected) disclosed with a "you'll pay this separately on arrival" note. ([Saneamiento breakdown](https://www.reportequintanaroo.com/que-es-el-derecho-de-saneamiento-ambiental-y-cuanto-debes-pagar/))
- **30% deposit at booking, 70% balance 30 days before arrival** (boutique-hotel norm; reduces sticker shock on a ~$5k week).
- Tiered cancellation: Flex (+10–15%, full refund ≤14d) / Standard (50% refund ≤30d) / Non-refundable (−15%). ([Mews cancellation guide](https://www.mews.com/en/blog/hotel-cancellation-policy))
- Multi-currency display (USD / EUR / MXN), locale-aware; trilingual UI **EN / ES / DE** with proper hreflang. Language switcher, no IP redirect.

**Calendar & channel**
- Direct site is the **source of truth**; push availability out to Airbnb / VRBO / Booking via API (Hostaway or Hospitable class) — never the reverse. iCal polling is too slow for a tiny compound where a double-booking is catastrophic. ([Hostaway sync guide](https://www.hostaway.com/blog/how-to-sync-your-airbnb-calendar-with-vrbo-and-booking-com/))
- Auto-discount orphan gaps (1–2 night unsellable gaps) by 15–20%. ([PriceLabs on orphan gaps](https://hello.pricelabs.co/how-to-use-orphan-gaps-for-increasing-revenue/))
- Owner personal-use blocks are a first-class calendar state, visible to the manager.

**Payments (Mexico context)**
- Stripe as primary rail. MercadoPago as optional secondary for MX-domestic guests (SPEI, OXXO, meses sin intereses).
- OXXO is cash-voucher only and **cannot be refunded or disputed** — offer only on non-refundable rates. ([Stripe OXXO docs](https://docs.stripe.com/payments/oxxo))
- Klarna / Afterpay "pay in 3" enabled for shoulder-season under-30 guests.

**Trust layer**
- Aggregated reviews pulled from Airbnb / Google / TripAdvisor, displayed with source logos and freshness dates.
- **ID verification + damage waiver** (Superhog/Truvi-class) in lieu of a hold. Waivers convert better than refundable deposits. ([Truvi/Superhog](https://ensoconnect.com/superhog/))
- Chekin-class FMM guest registration (Mexican-government-mandated) handled silently behind the scenes.
- Named owner + manager with faces + response-time promise ("WhatsApp reply in < 15 min during daytime CST").

**Guest comms & pre-arrival**
- **WhatsApp-first** is non-negotiable for LATAM (≈98% open rate, 5× email). Email as a secondary channel. ([Bookboost on WhatsApp](https://www.bookboost.io/post/whatsapp-hotel-guest-communication))
- **Boarding-pass PWA** (Enso Connect-class) with lock code, WiFi, guide, chat, upsells. Accessible without an app install.
- Smart lock for self-check-in, *plus* optional in-person greeting or WhatsApp video walkthrough on arrival.

**Admin & ops**
- Role-based dashboards (above).
- Maintenance tickets with photo attach.
- Housekeeping turnover checklist with photo proof, supply-low alerts.
- Expense log per booking → clean owner P&L.
- Audit log of sensitive actions.

**SEO & content**
- Schema.org `LodgingBusiness` + `Hotel` + `HotelRoom` + `Offer` on every relevant page. ([Schema.org LodgingBusiness](https://schema.org/LodgingBusiness))
- Don't chase "Tulum villa." Win **long-tail micro-geo** ("boutique villa Aldea Zama cenote," "5-bedroom Tulum jungle villa chef included," German: "Tulum Villa mit Koch mieten").
- `/guide/*` destination content is the SEO moat and internal-link engine.

---

## 6. State-of-the-art / immersive experiences (what makes this feel 2026, not 2018)

These are the disproportionately-high-ROI bets. If we build only three, build **Matterport + WhatsApp + aggregated reviews**.

- **3D walkthroughs (Matterport-class).** Vacasa measured ~12% booking lift and 3× time-on-listing from 3D tours. For a single compound, this is an outsized trust-builder — guests can place themselves in the pool and kitchen before committing. ([Matterport / Vacasa](https://matterport.com/news/vacasa-sees-near-12-boost-vacation-rental-bookings-powered-matterport))
- **Ambient video hero.** Muted auto-play loops (pool, jungle, hammock-at-dusk) over stills. Tulum's buy is 80% vibe.
- **AI concierge that can transact, not just answer.** "The villa's free March 12–18, want me to add a chef for night 2 at $180 and a cenote day for 2 at $220?" 41% of travelers want AI itinerary help; doing it *before* booking removes the "what will we actually do there?" anxiety. ([SiteMinder on AI travel agents](https://www.siteminder.com/r/ai-travel-agent/))
- **Itinerary/bundle builder.** Tulum stays are really "villa + cenote day + chef dinner + yoga + airport transfer." Surface bundles on the rate page, not as post-booking upsells — proven 10–30% revenue lift across STR operators. ([PriceLabs on STR upsells](https://hello.pricelabs.co/blog/short-term-rental-upsells/))
- **Journey-based navigation** ("Mornings / Days / Nights" or "Wellness / Food / Adventure") instead of "Rooms / Rates / Gallery." Aman and Eleven Experience both do this.
- **"Hold these dates, no card" exit-intent.** A soft 24-hour hold beats a discount pop-up — converts ≈43% and doesn't cheapen the brand. ([Revinate on cart abandonment](https://www.revinate.com/blog/hotel-cart-abandonment-recovery/))
- **Live compound map.** An interactive SVG/3D site-plan of the compound — click a villa, see availability, open its story. Works better than a listings grid for a shared-grounds property.
- **Post-stay re-engagement** — 3-week email with a returning-guest code + "bring a friend" referral. A loyalty program without a loyalty program.
- **Human follow-up on abandoned carts.** At ~1–2 abandonments/day, the owner can send a personal WhatsApp nudge (consent-gated). Beats any automation at this scale.

**Explicitly not building** (anti-patterns for luxury indies): "5 people are looking now," countdown timers, fake scarcity, pop-up discount coupons, IP-based language redirects. These work on Booking.com and damage a boutique brand.

---

## 7. Trust & authenticity signals (the Tulum-specific moat)

Tulum's conscious-traveler audience is allergic to greenwashing — the town is under scrutiny for it locally. Vague "eco-friendly" copy backfires. Specificity wins:

- **Sustainability, measured:** "Solar 8.4 kWp," "greywater → irrigation," "cenote water tested quarterly — [latest report PDF]."
- **Local partners, named and photographed:** yoga with Name from Chemuyil; Mayan chef Name, recipes from his grandmother in Coba.
- **Cultural respect, not extraction:** no stock-photo temazcal ceremonies. If offered, led by a credentialed local practitioner, named, fairly compensated, disclosed.
- **Opt-in carbon offset per booking** (Patch / Cloverly / local Yucatán reforestation partner) with a visible on-property ledger of trees planted.
- **"We are not for everyone" page:** honest disclosure of what the villa *isn't* — not party-friendly, not toddler-proofed, mosquitoes exist, sand has steps. Builds more trust than another "sanctuary" paragraph. Plum Guide and The Thinking Traveller both do versions of this.
- **Accessibility page:** honest step counts, bathroom widths, beach-chair transfer realities. WCAG 2.2 AA as the baseline.

---

## 8. Core user journeys

1. **Dreamer → Booker.** Lands on an editorial story (Instagram ad / guide post), scrolls, watches the ambient loop, opens the compound map, picks a villa, checks dates, is shown all-in price with tax/fee transparency, pays 30% deposit, gets WhatsApp confirmation in < 5 min.
2. **Repeat guest.** One-tap re-book via the post-stay email, pre-filled preferences (same villa, same chef, same yoga teacher).
3. **Group / multi-unit.** Can hold 2+ units in one cart for a yoga retreat / family reunion, with a manual-quote path above a threshold (e.g., 3+ units).
4. **Owner personal stay.** Block dates in one tap; calendar reflects across all channels within minutes.
5. **Manager ops day.** Sees arrivals/departures, taps through WhatsApp threads, logs expenses, acks maintenance tickets.
6. **Housekeeping turnover.** Sees today's turnovers, opens checklist, attaches photos, taps done.
7. **Pre-arrival guest.** Gets boarding-pass PWA 7 days out: guide, lock code (released day-of), WiFi, chat, bundle upsell offers.
8. **Post-stay.** Review prompt (public + private feedback), then a 3-week re-engagement email.

---

## 9. Success metrics (what we'll watch)

- **Share of bookings coming direct** (target: 40%+ within 12 months — industry-achievable for content-led indie sites).
- **Conversion rate** (date-picker interaction → paid booking).
- **Cart abandonment recovery rate** (email + WhatsApp).
- **Guest NPS and repeat-guest rate.**
- **WhatsApp first-response time.**
- **Average bundle attach rate** (chef, cenote, yoga, transfer).
- **Organic traffic on German long-tail queries** (unique moat).

---

## 10. Open questions / decisions before build

- **Scope of compound**: how many units total, which are ours vs. which do we manage for neighbors? Does the site list neighbor units (revenue-share) or only our own?
- **Dual-listing vs. exclusive**: do we stay on Airbnb / Booking during ramp, or go direct-only after 6 months?
- **Owner operations**: is there a named on-site property manager today, or are we hiring one as part of this launch?
- **Channel manager choice** (Hostaway / Hospitable / Lodgify / build-your-own) — only relevant if dual-listing; shapes the ops tier.
- **Guest-app build vs. buy** (Enso Connect / Touch Stay / custom): buy for v1 unless we have a specific reason to build.
- **Yoga/chef/cenote partners**: who are they, and are they exclusive to us or shared across Tulum?
- **Languages at launch**: all three (EN/ES/DE) or EN + DE, with ES following?
- **Legal entity and payments**: Mexican RFC entity or EU entity invoicing? Affects Stripe account and tax flow.

---

## 11. One-paragraph pitch (for the top of the site or an investor email)

> Maki Tulum is a small compound of villas hidden in the Aldea Zama jungle. It exists because its owners wanted to host the way their favorite places host — slowly, personally, in three languages, with the yoga teacher and the chef on a first-name basis. You can book any villa direct, watch the hammock move in the wind, hold your dates without a credit card, and plan the week with us over WhatsApp. We're not on Booking.com because the conversation starts better here.

---

## Appendix — key sources

- [Mews — Direct bookings 2026](https://www.mews.com/en/blog/increase-hotel-direct-bookings)
- [Triptease — 2025 direct booking playbook](https://www.triptease.com/the-2025-direct-booking-playbook-webinar)
- [EHL — Direct booking strategies](https://hospitalityinsights.ehl.edu/hotel-direct-booking-strategies)
- [Skift — Future of hotel loyalty](https://research.skift.com/reports/the-future-of-hotel-loyalty-personalization-direct-booking-and-the-rise-of-experience-led-travel/)
- [Matterport / Vacasa case study](https://matterport.com/news/vacasa-sees-near-12-boost-vacation-rental-bookings-powered-matterport)
- [Voiceflow — hotel booking chatbots 2026](https://www.voiceflow.com/blog/hotel-booking-chatbot)
- [SiteMinder — AI travel agents](https://www.siteminder.com/r/ai-travel-agent/)
- [PriceLabs — STR upsells](https://hello.pricelabs.co/blog/short-term-rental-upsells/)
- [PriceLabs — orphan gaps](https://hello.pricelabs.co/how-to-use-orphan-gaps-for-increasing-revenue/)
- [Hostaway — iCal / channel sync](https://www.hostaway.com/blog/how-to-sync-your-airbnb-calendar-with-vrbo-and-booking-com/)
- [Enso Connect — guest PWA](https://ensoconnect.com/)
- [Bookboost — WhatsApp for hotels 2025](https://www.bookboost.io/post/whatsapp-hotel-guest-communication)
- [Truvi / Superhog — ID + damage waiver](https://ensoconnect.com/superhog/)
- [Stripe — OXXO payments](https://docs.stripe.com/payments/oxxo)
- [Stripe — Meses Sin Intereses](https://docs.stripe.com/payments/mx-installments)
- [Quintana Roo Saneamiento rates 2026](https://www.reportequintanaroo.com/que-es-el-derecho-de-saneamiento-ambiental-y-cuanto-debes-pagar/)
- [Visitax 2026](https://www.travelandtourworld.com/news/article/no-increase-in-visitax-for-2026-what-this-means-for-travelers-visiting-cancun-riviera-maya-and-tulum/)
- [Mews — cancellation policy guide](https://www.mews.com/en/blog/hotel-cancellation-policy)
- [Revinate — cart abandonment recovery](https://www.revinate.com/blog/hotel-cart-abandonment-recovery/)
- [Schema.org — LodgingBusiness](https://schema.org/LodgingBusiness)
- [Google — multi-regional sites](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites)
- [Travel & Tour World — Tulum sustainable tourism plan](https://www.travelandtourworld.com/news/article/tulums-new-sustainable-tourism-plan-aims-to-balance-growth-and-heritage-protection-in-mexico-get-the-details-here/)
- [Tulum Times — environmental fee](https://tulumtimes.com/environmental-fee-the-hidden-cost-of-paradise-that-few-tourists-understand/)
- [Aman digital case study — Inviqa](https://inviqa.com/case-studies/aman)
- [The Thinking Traveller — how to book](https://www.thethinkingtraveller.com/booking-your-holiday)
- [Our Habitas Tulum](https://www.ourhabitas.com/tulum/)
- [Plum Guide](https://www.plumguide.com/)
