import { describe, expect, it } from 'vitest';
import en from '../locales/en.json' with { type: 'json' };
import es from '../locales/es.json' with { type: 'json' };
import de from '../locales/de.json' with { type: 'json' };

type Bag = Record<string, unknown>;

function flatten(obj: Bag, prefix = ''): string[] {
  const keys: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      keys.push(...flatten(v as Bag, path));
    } else {
      keys.push(path);
    }
  }
  return keys.sort();
}

describe('locale parity', () => {
  const enKeys = flatten(en as Bag);
  const esKeys = flatten(es as Bag);
  const deKeys = flatten(de as Bag);

  it('ES has the same keys as EN', () => {
    expect(esKeys).toEqual(enKeys);
  });

  it('DE has the same keys as EN', () => {
    expect(deKeys).toEqual(enKeys);
  });
});

describe('German locale uses Unicode umlauts (no ASCII approximations)', () => {
  // Lesson from Civion Safe: ae/oe/ue patterns in German content cascade into
  // every translated locale. Catch them at build.
  it('contains no ae/oe/ue tokens that should be ä/ö/ü', () => {
    const json = JSON.stringify(de);
    // These are the words we know should use umlauts in German strings.
    // Tolerant: looks for likely-wrong substrings within German tokens.
    // Patterns that would be wrong if present (ASCII fallbacks for umlauts).
    // We've intentionally NOT included words that are correct in ASCII form
    // (e.g. "buchen" / "to book" — no umlaut). Curated from words we actually use.
    const suspicious = [
      /[Hh]aeuser\b/, // Häuser
      /[Mm]aenner\b/, // Männer
      /[Ll]aerm\b/, // Lärm — appears in our hero copy
      /[Hh]oeren\b/, // hören
      /[Tt]aeglich\b/, // täglich
      /[Ss]choen\b/, // schön
      /[Tt]uere\b/, // Türe
      /[Ww]aescht\b/, // wäscht
    ];
    for (const re of suspicious) {
      expect(json, `suspected ASCII umlaut: ${re}`).not.toMatch(re);
    }
  });
});
