/// <reference types="vitest" />
import { defineConfig } from "vite"
import * as path from "path"

export default defineConfig({
  test: {
    environment: "jsdom",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    }
  },
});
