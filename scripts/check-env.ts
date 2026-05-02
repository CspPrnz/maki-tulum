#!/usr/bin/env tsx
/**
 * Pre-deploy env audit. Greps the codebase for `process.env.X` references
 * and compares against the manifest below + an optional .env file.
 *
 * Lesson from Civion Safe: deploys silently fall back to defaults when env
 * var names drift between code and Railway dashboard.
 *
 * Run: `pnpm check-env`
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = new URL('..', import.meta.url).pathname;

// Names listed here are EXPECTED to exist at runtime in the relevant service.
// If grep finds a process.env.X NOT in this manifest, the script fails.
const KNOWN_ENV: Record<string, string> = {
  NODE_ENV: 'standard',
  APP_ENV: 'maki — local | staging | production',
  PORT: 'service port',
  DATABASE_URL: 'postgres conn string',
  REDIS_URL: 'redis conn string',
  JWT_PRIVATE_KEY: 'JWT signing key (PEM)',
  JWT_PUBLIC_KEY: 'JWT verifying key (PEM)',
  CORS_ORIGINS: 'comma-separated origins',
  RATE_LIMIT_REDIS_PREFIX: 'redis key prefix for rate limiter',
  STRIPE_SECRET_KEY: 'optional in dev',
  STRIPE_WEBHOOK_SECRET: 'optional in dev',
  HOSTAWAY_CLIENT_ID: 'optional in dev',
  HOSTAWAY_CLIENT_SECRET: 'optional in dev',
  POSTMARK_SERVER_TOKEN: 'optional in dev',
  TWILIO_ACCOUNT_SID: 'optional in dev',
  TWILIO_AUTH_TOKEN: 'optional in dev',
  SENTRY_DSN: 'optional',
  NEXT_PUBLIC_API_URL: 'web build arg',
  NEXT_PUBLIC_PLAUSIBLE_DOMAIN: 'web build arg, optional',
  NEXT_PUBLIC_SENTRY_DSN: 'web build arg, optional',
  npm_package_version: 'set by node automatically',
};

const SKIP_DIRS = new Set([
  'node_modules',
  '.next',
  '.turbo',
  'dist',
  'build',
  '.git',
  'coverage',
]);

function* walk(dir: string): Generator<string> {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) yield* walk(full);
    else if (/\.(ts|tsx|js|mjs|cjs)$/.test(name)) yield full;
  }
}

const ENV_RE = /process\.env(?:\.([A-Z_][A-Z0-9_]*)|\[\s*['"]([A-Z_][A-Z0-9_]*)['"]\s*\])/g;

const referenced = new Set<string>();
const fileRefs: Record<string, string[]> = {};

for (const file of walk(root)) {
  const src = readFileSync(file, 'utf8');
  for (const m of src.matchAll(ENV_RE)) {
    const name = m[1] ?? m[2];
    if (!name) continue;
    referenced.add(name);
    fileRefs[name] ??= [];
    fileRefs[name].push(relative(root, file));
  }
}

const unknown = [...referenced].filter((n) => !(n in KNOWN_ENV));
const unused = Object.keys(KNOWN_ENV).filter((n) => !referenced.has(n) && !n.startsWith('npm_'));

let failed = false;

console.log(`\nMaki env audit · ${referenced.size} referenced names\n`);

if (unknown.length > 0) {
  console.error('UNKNOWN env vars referenced in code (add to KNOWN_ENV or remove the reference):');
  for (const n of unknown) {
    console.error(`  ${n}  (in: ${fileRefs[n]?.join(', ')})`);
  }
  failed = true;
} else {
  console.log('✓ No unknown env references.');
}

if (unused.length > 0) {
  console.warn('\nDeclared but never referenced (probably ok — feature flags, optional vendor):');
  for (const n of unused) console.warn(`  ${n}`);
}

if (failed) {
  console.error('\nFailed.');
  process.exit(1);
}
console.log('\n✓ env audit passed.');
