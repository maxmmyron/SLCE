// vitest.config.e2e.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/e2e/**/*.test.js'],
    setupFiles: ['./tests/vitest.setup.js'],
    environment: 'jsdom',
    globals: true,
  },
});