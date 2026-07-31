'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

/**
 * Every @sentry/nextjs import in web lives here. NEXT_PUBLIC_* vars are
 * inlined at build time — reading them at module scope, not per-request,
 * mirrors how the bundle actually behaves.
 */
const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const PLAUSIBLE_DOMAIN = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

let sentryInitialized = false;

function initClientSentry(): void {
  if (!SENTRY_DSN || sentryInitialized) return;
  Sentry.init({
    dsn: SENTRY_DSN,
    tracesSampleRate: 0,
    // Mirrors the API's scrubbing (services/api/src/observability.ts). Nothing
    // to leak today — the site is static marketing with no forms — but Phase 2
    // puts guest email and dates into fetch URLs, which the browser SDK records
    // as breadcrumbs by default. Landing this now means the booking form can't
    // silently start exfiltrating on the day it ships.
    sendDefaultPii: false,
    beforeBreadcrumb: () => null,
    beforeSend(event) {
      delete event.user;
      if (event.request) {
        delete event.request.cookies;
        delete event.request.headers;
        delete event.request.data;
        event.request.url = event.request.url?.split('?')[0];
      }
      return event;
    },
  });
  sentryInitialized = true;
}

/**
 * Plausible is cookieless by design — no consent banner needed. The script
 * only renders when a domain is configured; absent env = absent script.
 */
export function Analytics() {
  useEffect(() => {
    initClientSentry();
  }, []);

  if (!PLAUSIBLE_DOMAIN) return null;

  return <script defer data-domain={PLAUSIBLE_DOMAIN} src="https://plausible.io/js/script.js" />;
}
