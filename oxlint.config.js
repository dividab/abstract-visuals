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
    // Generated 3D-scene data, not hand-written example code.
    "packages/abstract-visuals-example/src/app/generated/**",
  ],
  rules: {
    // TODO: remove once oxlint-config-divid ships this as its own default (staged locally,
    // not yet released/bumped here - see oxlint-config-divid's index.js on disk).
    "functional/no-let": ["error", { allowInFunctions: true, ignoreIdentifierPattern: "^[mM]utable" }],
    "functional/no-classes": "off", // 10 errors
    "functional/no-this-expressions": "off", // 142 errors
    "functional/prefer-readonly-type": "off", // 419 errors

    "typescript/prefer-readonly-parameter-types": "off", // 1120 errors
    "typescript/explicit-module-boundary-types": "off", // 15 errors
    "typescript/no-unsafe-assignment": "off", // 165 errors
    "typescript/no-unsafe-call": "off", // 48 errors
    "typescript/no-unsafe-return": "off", // 48 errors
    "typescript/no-unsafe-member-access": "off", // 390 errors
    "typescript/no-unsafe-type-assertion": "off", // 155 errors
    "no-restricted-globals": "off", // 10 errors
    "no-case-declarations": "off", // 20 errors
    "prefer-const": "off", // 46 errors
    "typescript/prefer-nullish-coalescing": "off", // 151 errors
    "typescript/prefer-optional-chain": "off", // 21 errors
    "typescript/no-explicit-any": "off", // 237 errors
    "typescript/no-empty-object-type": "off", // 37 errors
    "typescript/array-type": "off", // 100 errors
    "typescript/no-unnecessary-condition": "off", // 164 errors
    "no-useless-return": "off", // 5 errors
    "typescript/ban-tslint-comment": "off", // 11 errors
    "typescript/unified-signatures": "off", // 5 errors
    "no-bitwise": "off", // 38 errors
    "init-declarations": "off", // 14 errors
    "typescript/prefer-string-starts-ends-with": "off", // 4 errors
    "no-restricted-properties": "off", // 8 errors
    "typescript/no-unnecessary-boolean-literal-compare": "off", // 2 errors
    "typescript/switch-exhaustiveness-check": "off", // 25 errors
    "typescript/prefer-reduce-type-parameter": "off", // 8 errors
    "one-var": "off", // 17 errors
    "max-lines": ["error", 1100],

    // Flags React components defined inside other components, which is a normal pattern.
    "unicorn/consistent-function-scoping": "off", // 72 errors
    // False-positives on <Namespace.Component /> through an `export *` barrel.
    "import/namespace": "off", // 22 errors
  },
});
