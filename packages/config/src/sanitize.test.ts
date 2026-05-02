import { describe, expect, it } from 'vitest';
import { sanitizeText } from './sanitize.js';

describe('sanitizeText', () => {
  it.each([
    ['plain text', 'plain text'],
    ['<script>alert(1)</script>', 'alert(1)'],
    ['<b>bold</b> and <i>italic</i>', 'bold and italic'],
    ['  spaces  ', 'spaces'],
    ['<img src=x onerror=alert(1)>', ''],
    ['no tags & ampersand', 'no tags & ampersand'],
  ])('strips tags and trims: %s', (input, expected) => {
    expect(sanitizeText(input)).toBe(expected);
  });

  it('respects maxLength', () => {
    expect(sanitizeText('a'.repeat(200), 100)).toHaveLength(100);
  });
});
