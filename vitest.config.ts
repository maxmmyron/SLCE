// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: "istanbul"
    },
    include: ['tests/unit/**/*.test.ts', 'tests/integration/**/*.test.ts'],
    // Mock performance.now for consistent time tests
    setupFiles: ['./tests/vitest.setup.ts'],
    deps: {
      inline: ["vitest-canvas-mock"],
    },
    environmentOptions: {
      jsdom: {
        resources: "usable",
      }
    },
    environment: 'jsdom', // or 'node' if not testing DOM interactions
    globals: true, // Makes describe, it, expect globally available
  },
});