# ADR 0001 — TypeScript on the backend (Hono), not Go

- **Date:** 2026-05-02
- **Status:** accepted
- **Context:** We need a backend that (a) ships fast for a solo/small team, (b) shares types with web today and native apps later, and (c) handles the volume of a single Tulum compound (~10–200 bookings/month). Civion Safe used Go and learned its lessons; the question here is whether to repeat or diverge.
- **Decision:** TypeScript on Node 22 with **Hono** + `@hono/zod-openapi`. The OpenAPI spec is generated from Zod schemas in route definitions; clients consume the spec directly.
- **Consequences:**
  - One language across api, web, scripts. Smaller cognitive surface.
  - Shared types via `@maki/types` consumed by server and client without code generation. Mobile (Swift/Kotlin) uses generated clients from the OpenAPI spec.
  - Lower raw throughput than Go, but Hono comfortably handles the volume we need.
  - We accept the dependency on Node's npm ecosystem (Civion ate one supply-chain attack on a Python image — same hygiene applies: pin every Docker image by SHA digest).
- **Alternatives considered:**
  - **Go (chi/v5)** like Civion Safe — proven, fast, but adds a second language and a manual sharing path for types.
  - **Rust (Axum)** — overkill for a 1-compound site.
  - **Next.js API routes** — couples backend to Next.js, complicates mobile client consumption.
