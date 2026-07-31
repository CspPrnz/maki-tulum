#!/usr/bin/env tsx
/**
 * Post-deploy smoke test. Hits /healthz (required on every service) and
 * /readyz (optional — apps/web only exposes /healthz, services/api exposes
 * both) against a base URL, prints the real status + body for each, and
 * exits non-zero if anything required failed.
 *
 * A 404 on /readyz is not a failure: it means this service has no
 * downstream deps to check, not that the deploy is broken.
 *
 * Run: `pnpm exec tsx scripts/smoke.ts <baseUrl>`
 *      `pnpm exec tsx scripts/smoke.ts http://localhost:3000`
 *      `pnpm exec tsx scripts/smoke.ts https://staging.makitulum.com`
 */

const TIMEOUT_MS = 10_000;

interface CheckResult {
  path: string;
  ok: boolean;
  skipped: boolean;
  status?: number;
  body?: string;
  error?: string;
}

async function check(baseUrl: string, path: string): Promise<CheckResult> {
  const url = new URL(path, baseUrl).toString();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    const body = await res.text();
    return { path, ok: res.ok, skipped: false, status: res.status, body };
  } catch (err) {
    return {
      path,
      ok: false,
      skipped: false,
      error: err instanceof Error ? err.message : String(err),
    };
  } finally {
    clearTimeout(timer);
  }
}

function printResult(result: CheckResult): void {
  if (result.skipped) {
    console.log(`  ${result.path}  SKIPPED (404 — not implemented on this service)`);
    return;
  }
  if (result.error) {
    console.log(`  ${result.path}  ERROR — ${result.error}`);
    return;
  }
  console.log(`  ${result.path}  ${result.status}`);
  console.log(`    ${result.body}`);
}

async function main(): Promise<void> {
  const baseUrl = process.argv[2];
  if (!baseUrl) {
    console.error('Usage: tsx scripts/smoke.ts <baseUrl>');
    process.exit(1);
  }

  console.log(`\nMaki smoke test · ${baseUrl}\n`);

  const healthz = await check(baseUrl, '/healthz');
  printResult(healthz);

  const readyzRaw = await check(baseUrl, '/readyz');
  const readyz: CheckResult =
    readyzRaw.status === 404 ? { ...readyzRaw, skipped: true, ok: true } : readyzRaw;
  printResult(readyz);

  const failed = !healthz.ok || !readyz.ok;

  console.log(failed ? '\nFAILED\n' : '\nOK\n');
  process.exit(failed ? 1 : 0);
}

void main();
