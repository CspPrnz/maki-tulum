import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Lesson from Civion Safe: RTL doesn't auto-clean between Vitest tests;
// without this every test inherits the previous one's DOM.
afterEach(() => {
  cleanup();
});
