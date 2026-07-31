import { describe, expect, it } from 'vitest';
import { SUPPORTED_LOCALES } from '@maki/i18n';
import { COMPOUND_PHOTOS, listCompoundPhotos } from './compound';

describe('compound content', () => {
  it('lists at least one photo', () => {
    expect(listCompoundPhotos().length).toBeGreaterThan(0);
  });

  it('every photo has alt text in every supported locale (no missing translations)', () => {
    for (const photo of COMPOUND_PHOTOS) {
      for (const locale of SUPPORTED_LOCALES) {
        expect(photo.alt[locale], `${photo.src} missing ${locale}`).toMatch(/.+/);
      }
    }
  });

  it('every photo path is under /photos/compound/', () => {
    for (const photo of COMPOUND_PHOTOS) {
      expect(photo.src).toMatch(/^\/photos\/compound\//);
    }
  });
});
