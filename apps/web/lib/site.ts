/**
 * Canonical origin. NEXT_PUBLIC_SITE_URL is inlined at build time, so changing
 * it requires a rebuild, not a restart — see infra/railway/README.md.
 */
export const SITE_URL = process.env['NEXT_PUBLIC_SITE_URL'] ?? 'http://localhost:3000';
