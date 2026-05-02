// Static import of the default locale to eliminate flash of untranslated content.
// Lesson from Civion Safe: dynamic locale fetching causes a brief flash on first load.
import en from '../locales/en.json' with { type: 'json' };

export type Translations = typeof en;
export const defaultTranslations = en;

export const SUPPORTED_LOCALES = ['en', 'es', 'de'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

export async function loadLocale(locale: Locale): Promise<Translations> {
  if (locale === 'en') return en;
  const mod = await import(`../locales/${locale}.json`, { with: { type: 'json' } });
  return mod.default as Translations;
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
