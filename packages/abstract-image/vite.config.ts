import { defineConfig } from "vitest/config";

// eslint-disable-next-line import/no-default-export
export default defineConfig({
  test: { include: ["src/**/__tests__/*.test.{ts,tsx}"] },
});

//  Old jest config, migrate?
//
// @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
// export default {
//   displayName: "abstract-image",
//   preset: "ts-jest",
//   testEnvironment: "node",
//   testMatch: ["<rootDir>/src/**/*.test.{ts,tsx}"],
//   collectCoverage: false,
//   coverageDirectory: "<rootDir>/coverage/",
//   collectCoverageFrom: ["**/src/**/*.{ts,tsx}"],
//   coveragePathIgnorePatterns: ["/__tests__/"],
//   transform: {},
// };
