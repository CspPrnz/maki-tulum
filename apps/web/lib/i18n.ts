import 'server-only';
import { headers } from 'next/headers';
import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  type Locale,
  loadLocale,
  type Translations,
} from '@maki/i18n';

export function isLocale(value: string | undefined): value is Locale {
  return value !== undefined && (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

export async function getLocaleFromHeaders(): Promise<Locale> {
  const h = await headers();
  const value = h.get('x-locale');
  return isLocale(value ?? undefined) ? (value as Locale) : DEFAULT_LOCALE;
}

const cache = new Map<Locale, Promise<Translations>>();

export function getTranslations(locale: Locale): Promise<Translations> {
  if (!cache.has(locale)) cache.set(locale, loadLocale(locale));
  return cache.get(locale)!;
}

/**
 * Build hreflang alternates for a given path. Pass the locale-less path
 * (e.g. "/stays/villa-18") and we emit one entry per supported locale plus
 * x-default. Lesson from best-practices.md §i18n: proper hreflang is part
 * of how German long-tail SEO becomes a moat.
 */
export function buildAlternates(pathWithoutLocale: string): {
  canonical: string;
  languages: Record<string, string>;
} {
  const path = pathWithoutLocale === '/' ? '' : pathWithoutLocale;
  const languages: Record<string, string> = {};
  for (const l of SUPPORTED_LOCALES) {
    languages[l] = `/${l}${path}`;
  }
  languages['x-default'] = `/${DEFAULT_LOCALE}${path}`;
  return {
    canonical: `/${DEFAULT_LOCALE}${path}`,
    languages,
  };
}
