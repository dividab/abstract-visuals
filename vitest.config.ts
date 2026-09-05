import { defineConfig } from "vitest/config";

// eslint-disable-next-line import/no-default-export
export default defineConfig({
  test: {
    projects: [
      "./packages/abstract-document/vite.config.ts",
      "./packages/abstract-image/vite.config.ts",
      "./packages/jsxpression/vite.config.ts",
    ],
  },
});
