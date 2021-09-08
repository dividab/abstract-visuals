/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  displayName: "abstract-document",
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["<rootDir>/src/**/*.test.{ts,tsx}"],
  collectCoverage: false,
  coverageDirectory: "<rootDir>/coverage/",
  collectCoverageFrom: ["**/src/**/*.{ts,tsx}"],
  coveragePathIgnorePatterns: ["/__tests__/"],
};
