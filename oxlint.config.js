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
    "functional/no-this-expressions": "off", // 142 errors
    "functional/prefer-readonly-type": "off", // 419 errors

    "typescript/prefer-readonly-parameter-types": "off", // 1120 errors
    "typescript/explicit-module-boundary-types": "off", // 15 errors
    "typescript/no-unsafe-assignment": "off", // 165 errors
    "typescript/no-unsafe-call": "off", // 48 errors
    "typescript/no-unsafe-return": "off", // 48 errors
    "typescript/no-unsafe-member-access": "off", // 390 errors
    "typescript/no-unsafe-type-assertion": "off", // 155 errors
    "typescript/prefer-nullish-coalescing": "off", // 151 errors
    "typescript/no-explicit-any": "off", // 237 errors
    "typescript/no-empty-object-type": "off", // 37 errors
    "typescript/no-unnecessary-condition": "off", // 164 errors
    "typescript/ban-tslint-comment": "off", // 11 errors
    "no-bitwise": "off", // 38 errors
    "init-declarations": "off", // 14 errors
    "typescript/switch-exhaustiveness-check": "off", // 25 errors
    "max-lines": ["error", 1100],

    // Flags React components defined inside other components, which is a normal pattern.
    "unicorn/consistent-function-scoping": "off", // 72 errors
    // False-positives on <Namespace.Component /> through an `export *` barrel.
    "import/namespace": "off", // 22 errors
  },
});
