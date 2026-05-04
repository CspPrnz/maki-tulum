// In Next.js, `server-only` throws if imported by a Client Component.
// Vitest doesn't run inside Next, so the package isn't there. This shim is a
// no-op alias so server modules can be unit-tested.
export {};
