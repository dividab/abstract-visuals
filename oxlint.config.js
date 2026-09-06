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
    "typescript/no-empty-object-type": "off", // 37 errors
    "typescript/no-unnecessary-condition": "off", // 164 errors
    "typescript/switch-exhaustiveness-check": ["error", { considerDefaultExhaustiveForUnions: true }],
    "max-lines": ["error", 1100],
    "unicorn/consistent-function-scoping": "off", // 72 errors - Flags React components defined inside other components, which is a normal pattern.
    "import/namespace": "off", // 22  - False-positives on <Namespace.Component /> through an `export *` barrel.
  },
});
