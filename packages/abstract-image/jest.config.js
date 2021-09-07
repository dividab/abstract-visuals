/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  displayName: "abstract-image",
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["<rootDir>/src/**/*.test.{ts,tsx}"],
  collectCoverage: false,
  coverageDirectory: "<rootDir>/coverage/",
  collectCoverageFrom: ["**/src/**/!(*.test).{ts,tsx}", "!(**/__tests__/**)"],
};
