module.exports = {
  projects: ["<rootDir>/packages/*/jest.config.js"],
  // coverageDirectory: "<rootDir>/coverage/",
  // Seems only relative paths work for collectCoverageFrom when using projects https://github.com/facebook/jest/issues/5417
  // collectCoverageFrom: ["**/src/**/!(*.test).{ts,tsx}"],
  // collectCoverageFrom: ["packages/property/src/**/!(*.test).{ts,tsx}"]
};
