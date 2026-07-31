import * as Sentry from '@sentry/node';
import type { ApiEnv } from '@maki/config';

/**
 * Every @sentry/node import in the api lives here. Handlers call
 * captureError, never the SDK directly — keeps the vendor swappable.
 */
let enabled = false;

export function initObservability(env: ApiEnv): void {
  if (!env.SENTRY_DSN) return;
  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.APP_ENV,
    tracesSampleRate: 0,
    // Guest IPs and request headers are personal data we have no lawful basis
    // to ship to a US processor — see docs/backlog/plans/consent-data-map.md.
    // Without this, wiring Sentry silently makes it the stack's first PII
    // processor. Scrubbed here rather than in Sentry's UI so it's reviewable.
    sendDefaultPii: false,
    beforeSend(event) {
      delete event.user;
      if (event.request) {
        delete event.request.cookies;
        delete event.request.headers;
        delete event.request.data;
      }
      return event;
    },
  });
  enabled = true;
}

export function captureError(err: unknown): void {
  if (!enabled) return;
  Sentry.captureException(err);
}
