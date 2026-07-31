# 2026-07-31 — Railway live, location corrected, payments simplified

## State

**Phase 0 closed.** Both services live on Railway (project `maki-tulum`), schema migrated, CI green, smoke test passing. Phase 1B copy is publishable. See [`../backlog/TODO.MD`](../backlog/TODO.MD).

## What happened

**Railway provisioned end to end** — 4 services, domains, variables, migrations. The API Dockerfile had never been built and could not have run: `@maki/config` and `@maki/types` published raw TypeScript as their entrypoint, so Node could never import them. Both packages now compile to `dist`. Found by building and running the images locally rather than deploying to find out.

**The compound's location was wrong.** The site said Aldea Zama throughout; Maki is in **Xul Kaa**, a colonia at the southwest end of Tulum. The error had propagated into 18 files including the schema.org address, all three locales, the guide slug, `CONTEXT.md` and `idea-v3.md` — everything downstream had trusted it as fact. Corrected everywhere except the frozen lineage docs. The drive times that shipped alongside it were measured from the wrong neighbourhood and were **removed rather than re-guessed**.

**All five invented copy claims resolved** on Felix's feedback — the gate is real, maintenance is irregular, the concierge promise is softened to message-us framing, life jackets cut. The cenotes article now names Cristal/Escondido and Vesica, which are genuinely closest to Xul Kaa.

**Two decisions taken.** Legal: **foreign entity now, hybrid long-term** → card-only for v1, since OXXO/MercadoPago need a Mexican RFC. Payments: **100% at booking** → [ADR 0017](../adrs/0017-charge-in-full-at-booking.md) supersedes 0016, deleting the dunning ladder and the SCA-recovery magic link (which removes a security P1 rather than mitigating it). Channel manager deferred on cost, which keeps the Phase 2 inventory schema frozen.

**Old-domain security review.** No spam pollution — the archive shows only legitimate WordPress assets, no injected pages. The traffic Felix saw was generic WordPress scanner noise following the _software_, not the domain, so a Next.js stack does not inherit it. Real gaps found: the domain still returns 200 with a directory listing, old URLs are still indexed (now 308-redirected), the web app had **no security headers at all**, and there is **no SPF/DMARC** — the one genuinely exploitable item, and it blocks Brevo.

## Next move

Felix: healthcheck settings in the Railway dashboard, SPF/DKIM/DMARC before any Brevo send, Search Console, then real drive times. Then Villa 19 photos + Lighthouse to close Phase 1B.

Phase 2 can start on booking/quote work — but **not** availability, rates or inventory, which stay blocked on the channel-manager choice (MRT-15-P0-02).

## Suggested skills

`grill` before Phase 2 checkout; `orchestrate` if it splits into parallel streams.
