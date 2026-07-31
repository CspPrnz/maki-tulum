#!/usr/bin/env tsx
/**
 * Regenerates packages/ui/src/tokens.css from packages/ui/src/tokens.ts.
 * Run after editing tokens.ts. Eventually this same script will also emit
 * iOS Asset Catalog and Android colors.xml when native apps land.
 */
import { writeFileSync } from 'node:fs';
import {
  palette,
  typeScale,
  spacing,
  radius,
  minInputFontSize,
  minTouchTarget,
} from '../packages/ui/src/tokens.js';

const lines: string[] = [];
lines.push('/* Auto-generated from packages/ui/src/tokens.ts. Do not edit by hand. */');
lines.push('');
lines.push(':root {');
lines.push('  /* Palette */');
for (const [name, value] of Object.entries(palette)) {
  lines.push(`  --color-${kebab(name)}: ${value};`);
}
lines.push('');
lines.push('  /* Type scale */');
for (const [name, scale] of Object.entries(typeScale)) {
  lines.push(`  --text-${name}: ${scale.size};`);
}
lines.push('');
lines.push('  /* Floors */');
lines.push(`  --min-input-font-size: ${minInputFontSize};`);
lines.push(`  --min-touch-target: ${minTouchTarget};`);
lines.push('');
lines.push('  /* Spacing */');
for (const [name, value] of Object.entries(spacing)) {
  lines.push(`  --space-${name}: ${value};`);
}
lines.push('');
lines.push('  /* Radius */');
for (const [name, value] of Object.entries(radius)) {
  lines.push(`  --radius-${name}: ${value};`);
}
lines.push('}');
lines.push('');

const out = new URL('../packages/ui/src/tokens.css', import.meta.url).pathname;
writeFileSync(out, lines.join('\n'));
console.log(`Wrote ${out}`);

function kebab(s: string): string {
  return s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}
