import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: false,
    include: ['src/**/*.test.ts', 'test/**/*.test.ts'],
    testTimeout: 30_000,
    hookTimeout: 120_000,
  },
  resolve: {
    alias: {
      '@maki/config': new URL('../../packages/config/src/index.ts', import.meta.url).pathname,
      '@maki/types': new URL('../../packages/types/src/index.ts', import.meta.url).pathname,
    },
  },
});
