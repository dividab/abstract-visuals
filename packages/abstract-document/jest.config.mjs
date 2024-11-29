/* eslint-disable import/no-default-export */
/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
export default {
  displayName: "abstract-document",
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["<rootDir>/src/**/*.test.{ts,tsx}"],
  collectCoverage: false,
  coverageDirectory: "<rootDir>/coverage/",
  collectCoverageFrom: ["**/src/**/*.{ts,tsx}"],
  coveragePathIgnorePatterns: ["/__tests__/"],
  transform: {},
};
