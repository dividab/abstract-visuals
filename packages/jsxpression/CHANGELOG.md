# Change Log

All notable changes to this project will be documented in this file. The format is based on [Keep a Changelog](http://keepachangelog.com/) and this project adheres to [Semantic Versioning](http://semver.org/).

## [0.3.0] - 2026-09-10

- Internal: activated `typescript/no-unnecessary-condition`. Runtime checks against acorn's real (broader-than-declared) AST shapes were kept, widening casts instead of removing them. No functional changes.

## [0.2.2] - 2026-09-09

- Added support for optional chaining (`?.`) in compiled expressions, including chained member access and calls.

## [0.2.0] - 2026-09-06

- Internal: activated 39 additional oxlint rules — curly, default-case, eqeqeq, init-declarations, no-alert, no-bitwise, no-case-declarations, no-empty-pattern, no-prototype-builtins, no-restricted-globals, no-restricted-properties, no-shadow, no-throw-literal, no-unused-vars, no-useless-return, node/global-require, one-var, prefer-const, prefer-object-spread, typescript/array-type, typescript/ban-tslint-comment, typescript/dot-notation, typescript/explicit-module-boundary-types, typescript/no-empty-object-type, typescript/no-explicit-any, typescript/no-require-imports, typescript/no-unnecessary-boolean-literal-compare, typescript/no-var-requires, typescript/no-wrapper-object-types, typescript/parameter-properties, typescript/prefer-nullish-coalescing, typescript/prefer-optional-chain, typescript/prefer-readonly, typescript/prefer-reduce-type-parameter, typescript/prefer-string-starts-ends-with, typescript/switch-exhaustiveness-check, typescript/unified-signatures, unicorn/no-array-sort — and upgraded `oxlint-config-divid` to 1.2.0. No functional changes.

## [0.1.39] - 2026-09-05

- Wired the package's test suite into the shared workspace test runner.
- Internal: adopt `verbatimModuleSyntax` and stricter compiler/lint settings. No other functional changes.
