import divid from "eslint-config-divid";

export default [
  {
    // Global ignores (applies everywhere, mirrors the files the old CLI glob never touched).
    ignores: ["**/lib/**", "**/node_modules/**", "**/dist/**", "**/build-storybook/**"],
  },
  ...divid,
  {
    files: ["packages/*/src/**/*.ts", "packages/*/src/**/*.tsx"],
    languageOptions: {
      parserOptions: {
        project: "./packages/tsconfig.settings.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // functional/no-this-expression -> functional/no-this-expressions (renamed in eslint-plugin-functional v9)
      "functional/no-this-expressions": "off",
      "functional/prefer-readonly-type": "off",
      "@typescript-eslint/prefer-readonly-parameter-types": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/naming-convention": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      // functional/no-class -> functional/no-classes (renamed in eslint-plugin-functional v9)
      "functional/no-classes": "off",
      "global-require": "off",
      "no-restricted-globals": "off",
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/dot-notation": "off",
      "@typescript-eslint/restrict-template-expressions": "off",
      "no-case-declarations": "off",
      "prefer-const": "off",
      "no-useless-concat": "off",
      "@typescript-eslint/prefer-nullish-coalescing": "off",
      "@typescript-eslint/prefer-optional-chain": "off",
      "@typescript-eslint/no-explicit-any": "off",
      // @typescript-eslint/ban-types was split in v8 into the three rules below (already off)
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-unsafe-function-type": "off",
      "@typescript-eslint/no-wrapper-object-types": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      // @typescript-eslint/no-parameter-properties -> @typescript-eslint/parameter-properties (renamed in v8)
      "@typescript-eslint/parameter-properties": "off",
      curly: "off",
      "default-case": "off",
      "@typescript-eslint/array-type": "off",
      "@typescript-eslint/no-unnecessary-condition": "off",
      "no-useless-return": "off",
      "@typescript-eslint/ban-tslint-comment": "off",
      "import/order": "off",
      eqeqeq: "off",
      "no-throw-literal": "off",
      // @typescript-eslint/no-throw-literal -> @typescript-eslint/only-throw-error (renamed in v8, already off)
      "@typescript-eslint/only-throw-error": "off",
      "@typescript-eslint/unified-signatures": "off",
      "no-bitwise": "off",
      // @typescript-eslint/no-implicit-any-catch was removed in v8 with no replacement; TS's
      // useUnknownInCatchVariables: false (see packages/tsconfig.settings.json) covers the same intent.
      "@typescript-eslint/no-var-requires": "off",
      "@typescript-eslint/member-ordering": "off",
      "@typescript-eslint/init-declarations": "off",
      "@typescript-eslint/no-shadow": "off",
      "import/no-extraneous-dependencies": "off",
      "@typescript-eslint/no-unnecessary-boolean-literal-compare": "off",
      "no-empty-pattern": "off",
      "@typescript-eslint/prefer-string-starts-ends-with": "off",
      "no-restricted-properties": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/switch-exhaustiveness-check": "off",
      "@typescript-eslint/prefer-reduce-type-parameter": "off",
      "one-var": "off",
      "no-prototype-builtins": "off",
      "@typescript-eslint/prefer-readonly": "off",
      "no-alert": "off",
      "max-lines": ["error", 1100],
      "prefer-object-spread": "off",
      // @typescript-eslint/comma-spacing no longer exists in v8 (no replacement); the core
      // "comma-spacing" rule above is already off (and disabled again for good measure via
      // eslint-config-divid's own core/style.js).
    },
  },
];
