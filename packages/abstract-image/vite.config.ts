import { defineConfig } from "vitest/config";

// eslint-disable-next-line import/no-default-export
export default defineConfig({
  test: { include: ["src/**/__tests__/*.test.{ts,tsx}"] },
});
