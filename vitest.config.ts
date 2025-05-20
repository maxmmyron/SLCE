// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.ts', 'tests/integration/**/*.test.ts'],
    // Mock performance.now for consistent time tests
    setupFiles: ['./tests/vitest.setup.ts'],
    environment: 'jsdom', // or 'node' if not testing DOM interactions
    globals: true, // Makes describe, it, expect globally available
  },
});