# Maki Tulum — Product Idea v3

> A direct-booking brand for a small jungle compound in Aldea Zama, Tulum. We use OTAs to acquire first-time guests and use **makitulum.com** to earn — and keep — the second stay. This document captures the concept. Implementation lives elsewhere.

---

## 1. Thesis

Most independent properties treat OTAs as both acquisition and retention. That is the mistake.

**Maki treats OTAs as customer-acquisition channels and the direct site as the relationship and repeat-booking channel.**

The loop:

1. Guest discovers Maki on Airbnb / Booking.com / VRBO / Instagram / Google.
2. They book wherever trust is highest for trip one.
3. Maki delivers a stay that is better-hosted than any platform experience alone can be.
4. They leave with a direct relationship to the property, not just to a listing.
5. Trip two happens on `makitulum.com`.

The business question is not *"can we replace OTAs immediately?"*. It is **"can we make direct the obvious choice for stay #2?"**

This is the organizing idea. Every feature, page, and operational choice has to answer: *does this drive the second stay?*

Data backdrop: independent properties lose ~61% of bookings to OTAs vs. ~35% for branded chains — the gap is almost entirely price parity and loyalty. Direct conversion can triple when price-parity is held visibly, and direct-book perks outperform discounts for boutique properties. ([Triptease 2025](https://www.triptease.com/the-2025-direct-booking-playbook-webinar), [EHL](https://hospitalityinsights.ehl.edu/hotel-direct-booking-strategies))

---

## 2. Positioning

**One-line:** Maki Tulum is a small, design-led jungle compound in Aldea Zama where guests can first discover the stay anywhere, but the best way to return is direct.

**Primary ICP (launch):** Design-conscious couples and small groups, 30–50, from **US + DACH** (Germany/Austria/Switzerland), wanting a calmer, more thoughtful Tulum week and likely to return if hosted well.

**Secondary ICP (wedge #2):** Retreats and multi-unit groups (yoga retreats, family reunions) booking 2+ units together. Not the launch message.

**Not for us:** party-travel, spring-break, budget short-stays, guests looking for Airbnb-clone UX.

**Why this is a good idea:**
- Repeat direct bookings materially improve margins and compound over time.
- Small compounds benefit disproportionately from trust and narrative — features OTAs structurally cannot provide.
- Tulum is a high-emotion destination where planning help is the buy.
- A multilingual owner-led brand feels more human than a platform listing.
- The owner has a credible **German-language wedge** in a market where it's uncommon.

---

## 3. The four guest promises

Every product decision rolls up to one of these four.

1. **Confidence** — guests know exactly what they're booking, what it costs (all fees itemized, no surprises at step 3), who's hosting them, and what the property is and isn't.
2. **Taste** — site, photography, recommendations, copy communicate discernment. Curated, not generic. No "luxury sanctuary" stock copy.
3. **Care** — fast replies, human warmth, remembered preferences, smooth pre-arrival. WhatsApp response < 15 min during daytime CST.
4. **Continuity** — the relationship persists past checkout, so the second booking is easier than the first.

---

## 4. Brand direction

The existing Maki identity already has strong raw material — we keep it and modernize the execution.

- **Wordmark:** serif + script in warm gold/bronze. Mayan-inspired emblem.
- **Palette:** gold/bronze `~#B08040`, off-white `~#F7F3EC`, jungle green `~#3E4A2E`, terracotta accent, deep night for contrast. Natural, earthy, zero neon.
- **Type:** display serif (the wordmark) + human script for captions + clean sans for body.
- **Imagery:** ambient video loops (jungle birds, pool reflections, hammock at dusk) over stills. No stock. All dates on photos.
- **Voice:** first-person owner voice. German directness with Mexican warmth. Name the people — housekeeper, yoga teacher, chef, neighbor.

---

## 5. Business truth — what we need to know *before* building

The idea cannot be properly scoped without these numbers. We document them first:

- Number of units in scope (ours vs. neighbors we manage).
- Current occupancy by season.
- ADR by season and by channel.
- Current OTA mix (Airbnb vs. Booking vs. VRBO vs. direct).
- Repeat-guest rate today.
- Average stay length.
- Contribution margin by channel (after OTA commission, cleaning, ops).
- Media assets already in hand vs. needs to be shot.

Without these we can't tell a Matterport from a regret.

---

## 6. Scope — build, buy, avoid

We build the **guest-facing direct brand and the retention loop**. We buy everything else. We avoid custom back-office ambition.

### Build in v1
- Premium marketing site — editorial narrative, unit pages, compound story, guidebook.
- Direct booking flow with all-in pricing transparency.
- Persistent booking CTA on every story page.
- Review aggregation (Airbnb / Google / TripAdvisor pulled in with source logos + freshness dates).
- Trilingual **EN / ES / DE** with proper hreflang, no IP-redirect. Human-translated marketing copy.
- WhatsApp-first guest communication surface.
- Repeat-guest capture at checkout + post-stay sequence.
- Thin owner dashboard: weekly revenue + 30-day occupancy + 3 action items, pulled from the ops stack's APIs.

### Buy in v1 (named)
- **PMS / channel manager:** Hostaway or Hospitable (API-based push to Airbnb/VRBO/Booking; direct site stays source of truth). Not iCal polling — the 1–4h window is too wide for a single-unit owner.
- **Payments:** Stripe (primary). MercadoPago as secondary for MX-domestic.
- **Guest verification + damage waiver:** Truvi (ex-Superhog) or Autohost. Waivers convert better than refundable deposits.
- **Mexican FMM guest registration:** Chekin (handles this silently).
- **Smart lock + self check-in:** Igloohome or August, integrated via Hostaway.
- **Housekeeping workflow:** Breezeway or the built-in in Hostaway.
- **Pre-arrival guest PWA:** Enso Connect (boarding pass, lock code, WiFi, guide, chat, upsells). Touch Stay as the budget alternative.
- **Review pulls:** Revyoos or custom API.
- **WhatsApp Business API:** via Bookboost, Runnr.ai, or directly through Twilio.

### Avoid in v1
- Custom multi-role back office (the PMS covers roles natively).
- Custom channel-sync engine.
- Bespoke loyalty system.
- AI concierge with transactional logic.
- Hand-rolled housekeeping tooling.

Rule: if a tool covers 80% of the need, we buy it. Build only where Maki is genuinely differentiated — the guest experience, the direct-booking flow, the repeat loop.

---

## 7. Site narrative architecture

The site is structured as a journey, not a listings grid.

- **The Compound** — Maki's story, Aldea Zama, the design intent.
- **The Stays** — each villa/apartment as its own editorial page.
- **The Days** — what a day at Maki looks like (Mornings / Days / Nights). Wellness, food, adventure.
- **The Guide** — public, SEO-rich Tulum guidebook (cenotes, restaurants, beach clubs, transport, water safety, seasons). Doubles as proof-of-hosting *before* booking and as a long-tail SEO moat.
- **Book** — transactional surface, reachable from every story page via a persistent, soft date-picker strip.

Front-loading story before the date picker is what Aman, Habitas, The Thinking Traveller, Plum Guide, and onefinestay all do. Small Luxury Hotels measured a +38% direct-book uplift from this exact shift. ([Aman / Inviqa](https://inviqa.com/case-studies/aman), [Our Habitas Tulum](https://www.ourhabitas.com/tulum/))

---

## 8. The three UX bets that matter for v1

Every "state-of-the-art" idea we researched is deferrable — except these three, which are cheap, on-brand, and documented ROI:

1. **Matterport 3D walkthrough** of each unit + the grounds. Vacasa measured +12% booking lift and 3× time-on-listing. For a single compound, this is the biggest trust arbitrage available. ([Matterport / Vacasa](https://matterport.com/news/vacasa-sees-near-12-boost-vacation-rental-bookings-powered-matterport))
2. **Ambient video hero** — muted auto-play loops (pool, jungle, hammock-at-dusk) over stills. Tulum's buy is 80% vibe.
3. **Soft 24-hour date hold, no card.** An exit-intent surface that says *"hold these dates for 24 hours, we'll email you"*. Converts ~43% of would-be abandoners and doesn't cheapen the brand. ([Revinate](https://www.revinate.com/blog/hotel-cart-abandonment-recovery/))

**Deferred to v2** (only after direct demand is clearly working): AI concierge that transacts, bundle builder at rate-page level, interactive compound map, repeat-guest login + remembered preferences, retreat/multi-unit quoting flow.

---

## 9. Must-haves (Tulum-specific, non-negotiable)

### Payments, pricing, tax

- **30% deposit at booking, 70% balance 30 days before arrival.** Boutique-hotel norm, reduces sticker shock on a ~$5k week.
- **Multi-currency display** (USD / EUR / MXN), locale-aware; charge in rate currency; disclose FX.
- **All-in fee transparency** on the first rate display: cleaning, deposit, and **Quintana Roo Saneamiento** itemized. Visitax (~$13 USD/person, state-collected) disclosed as *"you pay this separately on arrival"*. ([Saneamiento 2026](https://www.reportequintanaroo.com/que-es-el-derecho-de-saneamiento-ambiental-y-cuanto-debes-pagar/), [Visitax 2026](https://www.travelandtourworld.com/news/article/no-increase-in-visitax-for-2026-what-this-means-for-travelers-visiting-cancun-riviera-maya-and-tulum/))
- **Tiered cancellation:** Flex (+10–15%, full refund ≤14d) / Standard (50% refund ≤30d) / Non-refundable (−15%). ([Mews](https://www.mews.com/en/blog/hotel-cancellation-policy))
- **OXXO cash payments** offered only on non-refundable rates — OXXO cannot be refunded or disputed. ([Stripe OXXO](https://docs.stripe.com/payments/oxxo))
- **Klarna / Afterpay "pay in 3"** enabled for shoulder-season under-30 guests.

### Calendar & channel

- Direct site is the **source of truth**; channel manager pushes out to Airbnb / VRBO / Booking via API. Never the reverse.
- Owner personal-use blocks are a first-class calendar state, visible to the manager.
- Auto-discount orphan gaps (1–2 nights unsellable between stays) by 15–20%. ([PriceLabs](https://hello.pricelabs.co/how-to-use-orphan-gaps-for-increasing-revenue/))
- Length-of-stay pricing shown up-front ("book 7+, save 15%"), not buried in checkout.

### Trust layer

- Aggregated reviews from Airbnb / Google / TripAdvisor with source logos + freshness dates.
- Named owner + manager, faces + response-time promise visible on every page.
- ID verification + damage waiver (Truvi/Superhog-class) instead of a refundable deposit hold.
- Chekin-class FMM guest registration handled silently.

### Comms & pre-arrival

- **WhatsApp-first** is non-negotiable for LATAM (≈98% open, 5× email). Email secondary. ([Bookboost](https://www.bookboost.io/post/whatsapp-hotel-guest-communication))
- Boarding-pass PWA (Enso Connect-class) with lock code, WiFi, guide, chat, upsells. No app install.
- Smart lock for self-check-in, *plus* optional in-person greeting or WhatsApp video walkthrough on arrival.

### SEO & content

- Schema.org `LodgingBusiness` + `Hotel` + `HotelRoom` + `Offer` on every relevant page. ([LodgingBusiness](https://schema.org/LodgingBusiness))
- Don't chase "Tulum villa." Win long-tail micro-geo ("boutique villa Aldea Zama cenote," "5-bedroom Tulum jungle villa chef included," DE: "Tulum Villa mit Koch mieten").
- `/guide/*` destination content is the SEO moat and internal-link engine.

### User roles (satisfied by buying, not building)

| Role | Tool / surface | Sees | Doesn't see |
|---|---|---|---|
| **Guest** | Public site + Enso PWA | Browse, book, pay, boarding pass, chat, upsells, review | Anyone else |
| **Owner** (you) | Thin custom dashboard (API-aggregated) | Weekly revenue, 30-day occupancy, 3 action items, payouts, personal blocks | Daily ops noise |
| **Property manager** | Hostaway native UI + WhatsApp inbox | Full calendar, guest threads, expenses, maintenance tickets | Payouts, P&L |
| **Housekeeping** | Breezeway mobile | Turnovers, checklists w/ photo proof, supply flags | Guest PII beyond first name + party size |
| **Maintenance** | Breezeway ticket view | Ticket + photo attach | Calendar, guest data |
| **Admin** (founder) | Everything | Role / permission management, audit log | — |

---

## 10. The Tulum-specific authenticity moat

Tulum's conscious-traveler audience is allergic to greenwashing — the town is under local scrutiny for it. Specificity wins.

- **Sustainability, measured:** "Solar 8.4 kWp," "greywater → irrigation," "cenote water tested quarterly — [latest report PDF]."
- **Local partners, named and photographed:** yoga with *Name* from Chemuyil; Mayan chef *Name*, recipes from his grandmother in Coba.
- **Cultural respect, not extraction.** No stock-photo temazcal ceremonies. If offered, led by a credentialed local practitioner, named, fairly compensated, disclosed.
- **Opt-in carbon offset** per booking with a visible on-property ledger of trees planted.
- **"We are not for everyone" page** — honest disclosure of what Maki *isn't* (not party-friendly, not toddler-proofed, mosquitoes exist, sand has steps). Builds more trust than another "sanctuary" paragraph. Plum Guide and The Thinking Traveller both do versions of this.
- **Accessibility page** with honest step counts, bathroom widths, beach-chair-transfer realities. WCAG 2.2 AA baseline.

---

## 11. User journeys

1. **OTA → direct rebook (the core loop).** Guest books trip #1 on Airbnb. Maki hosts unusually well. At checkout they receive a printed card + WhatsApp message: *"For your next stay, book at makitulum.com — same villa, same team, a drink waiting, and we'll remember your coffee."* Post-stay email sequence keeps the relationship warm. Trip #2 lands on the direct site.
2. **Dreamer → first direct booker.** Lands on an editorial story (Instagram ad / guide post), scrolls, watches the ambient loop, picks a villa, checks dates, sees all-in price, pays 30% deposit, WhatsApp confirmation in < 5 min.
3. **Repeat guest.** Magic-link rebook via post-stay email; preferences remembered (same villa, same chef, same yoga teacher).
4. **Group / multi-unit.** 2+ units in one cart; manual-quote path for 3+ units or retreats.
5. **Owner personal stay.** Block dates in one tap; reflects across all channels within minutes.
6. **Manager ops day.** Arrivals/departures in Hostaway, WhatsApp threads, expense logging, maintenance ticket acks.
7. **Housekeeping turnover.** Breezeway checklist with photo proof; supply-low flag.
8. **Pre-arrival guest.** Boarding-pass PWA 7 days out: guide, lock code (released day-of), WiFi, chat, bundle upsell offers.
9. **Post-stay.** Review prompt (public + private feedback), then a 3-week re-engagement email with returning-guest offer.

---

## 12. Metrics

### North star
**% of eligible repeat guests who rebook direct within 24 months.**

This captures whether Maki is actually building a brand relationship rather than renting demand.

### Supporting
- First-time booking mix by channel (expect OTA-heavy at launch; that's fine).
- Direct share of total bookings (target: 40%+ within 12 months).
- Repeat-guest rate.
- Repeat-**direct** rate (the critical conversion).
- WhatsApp first-response time.
- Review score + review volume.
- Bundle attach rate (chef / cenote / yoga / transfer).
- Net revenue by channel (after commission + variable ops).
- Cart-abandonment recovery rate (email + WhatsApp).

---

## 13. Why this could fail

We document failure modes explicitly so we notice them.

- **The property isn't differentiated enough in real life.** No website saves an average stay.
- **We overbuild tech instead of improving operations and media.** The moat is taste and ops, not a role-based admin.
- **OTA guests leave satisfied but not attached to the brand.** Trip #1 delivers a room, not a relationship.
- **The direct site is beautiful but high-friction at checkout.** Conversion loses to the familiar OTA UX.
- **No repeat-guest CRM discipline after checkout.** The hardest part: a system for post-stay follow-up that actually happens.
- **The market message is too broad** and sounds like every other "luxury sanctuary in Tulum."
- **Channel sync breaks, double-booking happens.** Catastrophic for a single-unit owner. Mitigation: direct site as source of truth, API push, weekly integrity check.
- **German wedge never materializes** because DE guests don't Google in German for Tulum. Mitigation: validate search volume before investing in DE content depth.

---

## 14. Anti-patterns (explicit don'ts)

- No "5 people are looking now."
- No countdown timers or fake scarcity.
- No pop-up discount coupons.
- No IP-based language redirect — language switcher, remembered preference.
- No "limited rooms left" when there's only one unit.
- No generic sustainability claims ("eco-friendly") without numbers.
- No stock photography.
- No hidden fees surfaced at step 3 of checkout.
- No "luxury sanctuary / hidden gem" hospitality-generic copy.
- No building what we can buy.

These are easy to accidentally ship. They are listed so we don't.

---

## 15. Open decisions (before build)

1. Compound scope: how many units, ours vs. neighbors we manage, revenue-share model?
2. Dual-listing: do we stay on Airbnb / Booking indefinitely (acquisition) or ramp toward direct-heavier mix at 12 months?
3. Channel manager choice: Hostaway vs. Hospitable vs. Lodgify.
4. Guest PWA: Enso Connect vs. Touch Stay vs. light custom.
5. Named on-site property manager — hiring as part of launch?
6. Repeat-guest offer — what does the returning-guest privilege actually *feel* like? (Named welcome, preferred pricing, first-access window, a small gift — pick one signature move.)
7. Language launch order: EN + DE first, ES following? Or all three at once?
8. Legal entity + payments: Mexican RFC entity or EU entity invoicing — affects Stripe account and tax flow.
9. Media: what's already shot, what needs to be shot (drone, Matterport, ambient video, owner portrait)?
10. Guest-data + consent flows: GDPR + Mexican LFPDPPP + Airbnb TOS — what can we legally capture at checkout and after?

---

## 16. One-paragraph pitch

> Maki Tulum is a small design-led compound in Aldea Zama built around a simple idea: guests may discover us anywhere, but the best way to come back is direct. We use marketplaces to win the first stay, then earn the second through trust, taste, and unusually personal hosting in English, Spanish, and German. `makitulum.com` is where returning guests book with confidence, plan their week with us over WhatsApp, hold dates without a credit card, and feel the relationship start before they arrive.

---

## 17. Strategic principles (the six to repeat)

1. **Use OTAs deliberately.** Acquisition, not defeat.
2. **Obsess over trip two.** The second booking is the real business model.
3. **Build brand, buy commodity software.** Differentiation lives in the guest-facing experience, not the back office.
4. **Prefer specificity over aspiration.** Name people, routines, caveats, practices. Numbers over adjectives.
5. **Measure channel economics.** Don't let aesthetics obscure the P&L.
6. **Calm confidence over urgency theatre.** Luxury indies don't mimic OTA dark patterns.

---

## Appendix — key sources

- [Mews — Direct bookings 2026](https://www.mews.com/en/blog/increase-hotel-direct-bookings)
- [Triptease — 2025 direct booking playbook](https://www.triptease.com/the-2025-direct-booking-playbook-webinar)
- [EHL — Direct booking strategies](https://hospitalityinsights.ehl.edu/hotel-direct-booking-strategies)
- [Skift — Future of hotel loyalty](https://research.skift.com/reports/the-future-of-hotel-loyalty-personalization-direct-booking-and-the-rise-of-experience-led-travel/)
- [Matterport / Vacasa — 12% booking lift](https://matterport.com/news/vacasa-sees-near-12-boost-vacation-rental-bookings-powered-matterport)
- [SiteMinder — AI travel agents](https://www.siteminder.com/r/ai-travel-agent/)
- [PriceLabs — STR upsells](https://hello.pricelabs.co/blog/short-term-rental-upsells/)
- [PriceLabs — orphan gaps](https://hello.pricelabs.co/how-to-use-orphan-gaps-for-increasing-revenue/)
- [Hostaway — channel sync](https://www.hostaway.com/blog/how-to-sync-your-airbnb-calendar-with-vrbo-and-booking-com/)
- [Enso Connect — guest PWA](https://ensoconnect.com/)
- [Bookboost — WhatsApp for hotels 2025](https://www.bookboost.io/post/whatsapp-hotel-guest-communication)
- [Truvi / Superhog — ID + damage waiver](https://ensoconnect.com/superhog/)
- [Stripe — OXXO](https://docs.stripe.com/payments/oxxo)
- [Stripe — Meses Sin Intereses](https://docs.stripe.com/payments/mx-installments)
- [Quintana Roo Saneamiento 2026](https://www.reportequintanaroo.com/que-es-el-derecho-de-saneamiento-ambiental-y-cuanto-debes-pagar/)
- [Visitax 2026](https://www.travelandtourworld.com/news/article/no-increase-in-visitax-for-2026-what-this-means-for-travelers-visiting-cancun-riviera-maya-and-tulum/)
- [Mews — cancellation policy guide](https://www.mews.com/en/blog/hotel-cancellation-policy)
- [Revinate — cart abandonment recovery](https://www.revinate.com/blog/hotel-cart-abandonment-recovery/)
- [Schema.org — LodgingBusiness](https://schema.org/LodgingBusiness)
- [Google — multi-regional sites](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites)
- [Tulum Times — environmental fee](https://tulumtimes.com/environmental-fee-the-hidden-cost-of-paradise-that-few-tourists-understand/)
- [Aman digital case study — Inviqa](https://inviqa.com/case-studies/aman)
- [The Thinking Traveller — how to book](https://www.thethinkingtraveller.com/booking-your-holiday)
- [Our Habitas Tulum](https://www.ourhabitas.com/tulum/)
- [Plum Guide](https://www.plumguide.com/)
