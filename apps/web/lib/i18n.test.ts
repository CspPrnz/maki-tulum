import { describe, expect, it } from 'vitest';
import { isLocale, buildAlternates } from './i18n';

describe('isLocale', () => {
  it.each(['en', 'es', 'de'])('accepts %s', (l) => {
    expect(isLocale(l)).toBe(true);
  });

  it.each(['fr', 'EN', '', undefined])('rejects %s', (l) => {
    expect(isLocale(l as string | undefined)).toBe(false);
  });
});

describe('buildAlternates', () => {
  it('emits one entry per supported locale + x-default', () => {
    const alts = buildAlternates('/stays/villa-18');
    expect(alts.canonical).toBe('/en/stays/villa-18');
    expect(alts.languages).toEqual({
      en: '/en/stays/villa-18',
      es: '/es/stays/villa-18',
      de: '/de/stays/villa-18',
      'x-default': '/en/stays/villa-18',
    });
  });

  it('handles the root path', () => {
    const alts = buildAlternates('/');
    expect(alts.languages.en).toBe('/en');
    expect(alts.languages['x-default']).toBe('/en');
  });
});
