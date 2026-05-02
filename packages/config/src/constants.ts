// Tax constants — see ADR for sourcing. Update here only; both API and web read from this.
export const QUINTANA_ROO_SANEAMIENTO_BASE_MXN = 36;
export const VISITAX_USD_PER_PERSON = 13;

// Booking rules
export const DEPOSIT_PERCENT = 0.3;
export const BALANCE_DUE_DAYS_BEFORE_ARRIVAL = 30;

// Token lifetimes
export const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
export const REFRESH_TOKEN_TTL_SECONDS = 30 * 24 * 60 * 60;

// Rate limits — per-IP, per-window
export const RATE_LIMITS = {
  login: { requests: 20, windowSeconds: 3600 },
  register: { requests: 15, windowSeconds: 3600 },
  forgotPassword: { requests: 10, windowSeconds: 3600 },
  resetPassword: { requests: 5, windowSeconds: 3600 },
  default: { requests: 120, windowSeconds: 60 },
} as const;

// Locales
export const SUPPORTED_LOCALES = ['en', 'es', 'de'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

// Validation
export const MAX_DISPLAY_NAME_LENGTH = 100;
export const MAX_EMAIL_LENGTH = 254;
