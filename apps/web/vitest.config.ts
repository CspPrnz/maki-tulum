import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['{app,components,lib,content}/**/*.test.{ts,tsx}'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@maki/i18n': path.resolve(__dirname, '../../packages/i18n/src/index.ts'),
      '@maki/types': path.resolve(__dirname, '../../packages/types/src/index.ts'),
      '@maki/ui': path.resolve(__dirname, '../../packages/ui/src/index.ts'),
      '@maki/config': path.resolve(__dirname, '../../packages/config/src/index.ts'),
      // Lesson: `server-only` is a Next.js-provided virtual module that doesn't
      // exist in the vitest runtime. Alias to a no-op so server-only modules
      // remain unit-testable.
      'server-only': path.resolve(__dirname, './test/server-only-shim.ts'),
    },
  },
});
