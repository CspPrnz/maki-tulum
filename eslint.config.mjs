import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/.turbo/**',
      '**/coverage/**',
      '**/*.tsbuildinfo',
      '**/next-env.d.ts',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: { ...globals.node, ...globals.browser },
    },
    rules: {
      'no-console': ['error', { allow: ['warn', 'error'] }],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      // The response envelope and vendor payloads are validated by Zod at the
      // boundary; `any` inside a handler defeats that guarantee silently.
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
  {
    files: ['**/*.test.ts', '**/*.test.tsx', '**/test/**', 'scripts/**'],
    rules: { 'no-console': 'off' },
  },
  {
    // ADR 0008 names this as an enforcement layer, but it never existed —
    // handlers could import `db` and quietly skip the account_id filter that
    // is the entire tenant boundary. Repositories take accountId first; route
    // handlers go through them.
    files: ['services/api/src/routes/**', 'services/api/src/middleware/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/db/index.js', '**/db/index', '**/db/schema.js', '**/db/schema'],
              message:
                'Handlers call repositories, never db directly (ADR 0008). Every tenant-scoped query needs an explicit account_id filter.',
            },
          ],
        },
      ],
    },
  },
);
