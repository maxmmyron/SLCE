/// <reference types="vitest" />
import { defineConfig } from "vite"
import * as path from "path"

export default defineConfig({
  test: {
    setupFiles: ["./vitest.setup.ts"],
    environment: "jsdom",
    deps: {
      inline: ["vitest-canvas-mock"]
    },
    threads: false,
    environmentOptions:{
      jsdom: {
        resources: "usable"
      }
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    }
  },
});
