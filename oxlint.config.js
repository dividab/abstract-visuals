import { defineConfig } from "oxlint";
import dividConfig from "oxlint-config-divid";

export default defineConfig({
  extends: [dividConfig],
  ignorePatterns: [
    "**/lib/**",
    "**/node_modules/**",
    "**/dist/**",
    "**/build-storybook/**",
    "packages/*/public/**",
    "packages/abstract-visuals-example/src/app/generated/**",
  ],
  rules: {
    "functional/no-this-expressions": "off", // 142 errors
    "functional/prefer-readonly-type": "off", // 419 errors
    "typescript/prefer-readonly-parameter-types": "off", // 1120 errors
    "typescript/no-unsafe-assignment": "off", // 165 errors
    "typescript/no-unsafe-call": "off", // 48 errors
    "typescript/no-unsafe-return": "off", // 48 errors
    "typescript/no-unsafe-member-access": "off", // 390 errors
    "typescript/no-unsafe-type-assertion": "off", // 155 errors
    "typescript/no-unnecessary-condition": "off", // 164 errors
    "typescript/switch-exhaustiveness-check": ["error", { considerDefaultExhaustiveForUnions: true }],
    "max-lines": ["error", 1100],
    "unicorn/consistent-function-scoping": "off", // 72 errors - Flags React components defined inside other components, which is a normal pattern.
    "import/namespace": "off", // 22  - False-positives on <Namespace.Component /> through an `export *` barrel.
    "react/react-in-jsx-scope": "off", // 1356 - tsconfig uses jsx: react-jsx (automatic runtime), React need not be in scope.
    "react-perf/jsx-no-new-object-as-prop": "off", // 102 errors
    "react-perf/jsx-no-new-array-as-prop": "off", // 61 errors
    "react-perf/jsx-no-new-function-as-prop": "off", // 46 errors
    "vitest/no-commented-out-tests": "off", // 12 errors
    "vitest/valid-title": "off", // 10 errors
    "jsx-a11y/alt-text": "off", // 6 errors
  },
});
