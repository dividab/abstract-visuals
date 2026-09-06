# Change Log

All notable changes to this project will be documented in this file. The format is based on [Keep a Changelog](http://keepachangelog.com/) and this project adheres to [Semantic Versioning](http://semver.org/).

## [0.5.0] - 2026-09-06

- Internal: activated 39 additional oxlint rules — curly, default-case, eqeqeq, init-declarations, no-alert, no-bitwise, no-case-declarations, no-empty-pattern, no-prototype-builtins, no-restricted-globals, no-restricted-properties, no-shadow, no-throw-literal, no-unused-vars, no-useless-return, node/global-require, one-var, prefer-const, prefer-object-spread, typescript/array-type, typescript/ban-tslint-comment, typescript/dot-notation, typescript/explicit-module-boundary-types, typescript/no-empty-object-type, typescript/no-explicit-any, typescript/no-require-imports, typescript/no-unnecessary-boolean-literal-compare, typescript/no-var-requires, typescript/no-wrapper-object-types, typescript/parameter-properties, typescript/prefer-nullish-coalescing, typescript/prefer-optional-chain, typescript/prefer-readonly, typescript/prefer-reduce-type-parameter, typescript/prefer-string-starts-ends-with, typescript/switch-exhaustiveness-check, typescript/unified-signatures, unicorn/no-array-sort — and upgraded `oxlint-config-divid` to 1.2.0. No functional changes.

## [0.4.6] - 2026-09-05

- Internal: adopt `verbatimModuleSyntax` and stricter compiler/lint settings (no bracket-free index-signature access). No functional changes.

## v0.4.0 - 2025.01.29

- Added logical operator helpers `or`, `and` and `not`.
- Changed so `groupByKey` also accepts a key as a JSON path.

## v0.3.3 - 2025.01.26

- Added the helper `round`.

## v0.3.2 - 2025.12.17

- Renamed the helper `length` to `arrayLength`.

## v0.3.0 - 2025-12-16

- Added the helper `length` to make it possible to get the item count of an array.

## v0.2.0 - 2025-11-24

Add two new handlebar helper functions:

- `groupBy`: Groups an array of objects based on a value inside each object.
- `sortBy`: Sorts an array of objects based on a value at a JSON path inside each object.

## v0.0.0 - 2025-08-21

- Start of changelog.
