// vitest.config.e2e.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: "istanbul"
    },
    include: ['tests/e2e/**/*.test.ts'],
    setupFiles: ['./tests/vitest.setup.js', 'vitest-canvas-mock'],
    deps: {
      inline: ["vitest-canvas-mock"],
    },
    environmentOptions: {
      jsdom: {
        resources: "usable",
      }
    },
    environment: 'jsdom',
    globals: true,
  },
});