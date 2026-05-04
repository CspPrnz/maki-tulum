import { describe, expect, it } from 'vitest';
import { SUPPORTED_LOCALES } from '@maki/i18n';
import { listStays, getStay, STAYS } from './stays';

describe('stays content', () => {
  it('exposes Villa 18 and Villa 19', () => {
    const stays = listStays();
    expect(stays.map((s) => s.slug)).toEqual(['villa-18', 'villa-19']);
  });

  it('every stay has alt text in every supported locale (no missing translations)', () => {
    for (const stay of STAYS) {
      for (const locale of SUPPORTED_LOCALES) {
        expect(stay.hero.alt[locale]).toMatch(/.+/);
        for (const photo of stay.photos) {
          expect(photo.alt[locale], `${stay.slug} photo ${photo.src} missing ${locale}`).toMatch(
            /.+/,
          );
        }
        expect(stay.signature[locale], `${stay.slug} signature missing ${locale}`).toMatch(/.+/);
      }
    }
  });

  it('every stay has a hero photo path under /photos/', () => {
    for (const stay of STAYS) {
      expect(stay.hero.src).toMatch(/^\/photos\//);
    }
  });

  it('getStay returns undefined for unknown slugs', () => {
    expect(getStay('not-a-villa')).toBeUndefined();
  });

  it('getStay returns the right stay by slug', () => {
    expect(getStay('villa-18')?.name).toBe('Villa 18');
  });

  it('marks Villa 19 explicitly as placeholder (photos pending)', () => {
    expect(getStay('villa-19')?.status).toBe('placeholder');
  });
});
