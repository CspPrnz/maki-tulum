# ADR 0009 — OpenAPI spec generated from Zod, not hand-maintained

- **Date:** 2026-05-04
- **Status:** accepted (already implemented in Phase 0)
- **Context:** The implementation plan (§3.4) commits to "OpenAPI is the contract." That contract has to live somewhere. Two patterns exist in the wild: (a) hand-author `openapi.yaml` and generate handlers + clients from it (spec-as-source), or (b) define routes with typed schemas in code and generate the spec from them (code-as-source). Civion Safe used option (a) with Go handlers; it worked but the spec drifted from implementation in a few places.
- **Decision:** Use **`@hono/zod-openapi`** to generate the OpenAPI 3.1 spec **from Zod schemas declared inline in route definitions.** The spec is served at `/openapi.json` by the API itself. Route handlers receive request inputs already type-narrowed by Zod; response shapes are validated against the declared schema in development.
- **Consequences:**
  - **The spec can never lie about the implementation** — it's literally read off the same Zod schemas the runtime uses to validate.
  - One schema source for: input validation, response shape, OpenAPI spec, OpenAPI client generation, types in `@maki/types`. Civion lesson: "status enums defined once" is much easier when there's no duplicate.
  - Web (`apps/web`) consumes the spec by importing types directly from `@maki/types` — no client codegen needed for TypeScript clients.
  - Native (when added) generates Swift / Kotlin clients from `/openapi.json` using `openapi-generator-cli` or similar. The spec is always current.
  - Cost: every route is decorated with a schema (example below). Marginally more boilerplate than a bare Hono handler but pays for itself the first time a refactor would have caused drift.
- **Alternatives considered:**
  - **Hand-authored `openapi.yaml` + codegen:** rejected. Civion's drift problem.
  - **No spec at all:** rejected. Native clients (Phase 5+) need it.
  - **tRPC instead of REST:** rejected. tRPC ties clients to TypeScript and breaks the "same backend, native clients" principle of this project.
  - **TypeBox + `@fastify/swagger`:** comparable; Hono fits our deploy story (single binary on Node 22) and integrates with Zod (which we already use everywhere else). Same outcome with our existing toolchain.

## Pattern

```ts
// services/api/src/routes/bookings.ts
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { BookingResponseSchema, CreateBookingSchema } from '@maki/types';

export const bookingsRoutes = new OpenAPIHono();

const create = createRoute({
  method: 'post',
  path: '/bookings',
  summary: 'Create a booking',
  request: {
    body: { content: { 'application/json': { schema: CreateBookingSchema } } },
    headers: z.object({ 'idempotency-key': z.string().uuid() }),
  },
  responses: {
    201: {
      content: { 'application/json': { schema: BookingResponseSchema } },
      description: 'Created',
    },
    400: {
      content: { 'application/json': { schema: ApiErrorSchema } },
      description: 'Invalid input',
    },
  },
});

bookingsRoutes.openapi(create, async (c) => {
  const input = c.req.valid('json'); // already typed + validated
  const idempotencyKey = c.req.valid('header')['idempotency-key'];
  // …
});
```

## Already implemented

- `services/api/src/app.ts` constructs an `OpenAPIHono` and mounts routes.
- `services/api/src/routes/health.ts` declares two `createRoute` definitions and wires `/openapi.json`.
- `services/api/src/app.test.ts` asserts the spec is served and that 404s return the standard envelope.

## Rules

- Every new route uses `createRoute` + `app.openapi()`. No bare `app.get('/foo', …)` in route files.
- Response schemas are declared for every status code the route can produce (200/201/400/404/etc.).
- Error responses use `ApiErrorSchema` from `@maki/types` consistently.
- `pnpm test` includes a contract test: every integration response is validated against the declared schema.
