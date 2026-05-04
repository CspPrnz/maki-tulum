// Static imports for every locale. Two reasons:
// (1) Eliminates flash of untranslated content (Civion lesson).
// (2) Vite's static analyzer rejects template-string dynamic imports that
//     cross directory boundaries (e.g. `../locales/${locale}.json`), so a
//     static map is the portable choice for both Next and Vitest builds.
import en from '../locales/en.json' with { type: 'json' };
import es from '../locales/es.json' with { type: 'json' };
import de from '../locales/de.json' with { type: 'json' };

export type Translations = typeof en;
export const defaultTranslations = en;

export const SUPPORTED_LOCALES = ['en', 'es', 'de'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

const LOCALE_MAP: Record<Locale, Translations> = { en, es, de };

export async function loadLocale(locale: Locale): Promise<Translations> {
  return LOCALE_MAP[locale];
}

/**
 * Lookup a key with dot notation. Returns the key itself on miss for visibility.
 */
export function t(translations: Translations, key: string): string {
  const segments = key.split('.');
  let cursor: unknown = translations;
  for (const seg of segments) {
    if (cursor && typeof cursor === 'object' && seg in cursor) {
      cursor = (cursor as Record<string, unknown>)[seg];
    } else {
      return key;
    }
  }
  return typeof cursor === 'string' ? cursor : key;
}
