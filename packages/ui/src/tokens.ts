/**
 * Design tokens. Plain JS so they're consumable by Tailwind today and by
 * React Native / SwiftUI / Compose tomorrow via a small export script.
 * Palette grounded in the existing Maki brand (warm gold + jungle).
 */
export const palette = {
  gold: '#B08040',
  goldDark: '#8a6231',
  goldLight: '#d4a86b',
  ivory: '#F7F3EC',
  jungle: '#3E4A2E',
  terracotta: '#C26B49',
  night: '#1A1814',
  smoke: '#5D5547',
  white: '#FFFFFF',
  black: '#000000',
} as const;

export const typeScale = {
  display: { size: '3.5rem', lineHeight: '1.05', tracking: '-0.02em' },
  h1: { size: '2.5rem', lineHeight: '1.1', tracking: '-0.015em' },
  h2: { size: '1.75rem', lineHeight: '1.2', tracking: '-0.01em' },
  h3: { size: '1.25rem', lineHeight: '1.3', tracking: '0' },
  body: { size: '1rem', lineHeight: '1.6', tracking: '0' },
  small: { size: '0.875rem', lineHeight: '1.5', tracking: '0' },
} as const;

// 16px floor on inputs/buttons — iOS Safari zooms below 16px on focus.
export const minInputFontSize = '1rem';

// 44x44px floor on touch targets — WCAG 2.5.5.
export const minTouchTarget = '44px';

export const spacing = {
  '0': '0',
  '1': '0.25rem',
  '2': '0.5rem',
  '3': '0.75rem',
  '4': '1rem',
  '6': '1.5rem',
  '8': '2rem',
  '12': '3rem',
  '16': '4rem',
  '24': '6rem',
} as const;

export const radius = {
  none: '0',
  sm: '0.25rem',
  md: '0.5rem',
  lg: '1rem',
  full: '9999px',
} as const;
