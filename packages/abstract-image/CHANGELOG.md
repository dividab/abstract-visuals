# Change Log

All notable changes to this project will be documented in this file. The format is based on [Keep a Changelog](http://keepachangelog.com/) and this project adheres to [Semantic Versioning](http://semver.org/).

## [13.2.0] - 2026-09-10

- Internal: activated `typescript/no-unnecessary-condition`. No functional changes.

## [13.1.0] - 2026-09-06

- Internal: activated 39 additional oxlint rules — curly, default-case, eqeqeq, init-declarations, no-alert, no-bitwise, no-case-declarations, no-empty-pattern, no-prototype-builtins, no-restricted-globals, no-restricted-properties, no-shadow, no-throw-literal, no-unused-vars, no-useless-return, node/global-require, one-var, prefer-const, prefer-object-spread, typescript/array-type, typescript/ban-tslint-comment, typescript/dot-notation, typescript/explicit-module-boundary-types, typescript/no-empty-object-type, typescript/no-explicit-any, typescript/no-require-imports, typescript/no-unnecessary-boolean-literal-compare, typescript/no-var-requires, typescript/no-wrapper-object-types, typescript/parameter-properties, typescript/prefer-nullish-coalescing, typescript/prefer-optional-chain, typescript/prefer-readonly, typescript/prefer-reduce-type-parameter, typescript/prefer-string-starts-ends-with, typescript/switch-exhaustiveness-check, typescript/unified-signatures, unicorn/no-array-sort — and upgraded `oxlint-config-divid` to 1.2.0. No functional changes.

## [13.0.59] - 2026-09-05

- Internal: adopt `verbatimModuleSyntax` and stricter compiler/lint settings (no unused locals/params, no bracket-free index-signature access). No functional changes.

## [13.0.0] - 2026-02-23

- Dxf AC1015 2D Exporter that can import external dxf files with the same standard.

## [12.0.0] - 2025-10-30

### Changed

Make esm module for better tree shaking.

## [11.0.2] - 2025-06-02

### Added

- Text outline now also have `id` attribute to improve mouse events.

## [11.0.0] - 2024-11-29

- createReactSvg -> ReactSvg (jsx-syntax), make it React 19 compatible

## [10.0.0] - 2024-11-29

- ~~Switch to ES Modules from CommonJS~~ Libraries should be in commonjs, for now...

## [9.0.0] - 2024-11-28

- Switch from yarn to pnpm.

## [8.3.0] - 2024-10-16

### Added

- Svg and React svg exports uses the svg attribute 'alignment-baseline' to position text verticly.

## [8.2.0] - 2024-07-08

### Added

- Support for dashed lines

## [8.1.0] - 2024-05-22

### Added

- Support for id on text components

## [8.0.0] - 2024-05-19

### Changed

- React 16 -> 18

### Removed

- Rambda

## [v3.4.0](https://github.com/dividab/abstract-visuals/compare/abstract-image@3.3.3...abstract-image@3.4.0)

### Added

- Added support for exporting EPS images with "ISOLatin1Encoding" encoding

### Changed

### Removed

## [v3.3.3](https://github.com/dividab/abstract-visuals/compare/abstract-image@3.3.2...abstract-image@3.3.3) - 2023-05-25

### Added

- Add missing ramda dependency #106

## [v3.3.2](https://github.com/dividab/abstract-visuals/compare/abstract-image@3.0.0...abstract-image@3.3.2) - 2022-06-02

### Added

- Support for URL as source for embedded binary images
- Support for positioning and scaling embedded svg images

### Changed

### Removed

## [v3.1.4](https://github.com/dividab/abstract-visuals/compare/abstract-image@3.1.3...abstract-image@3.1.4) - 2022-01-05

### Added

- Added italic and mediumBold as options for texts

## [v3.0.1](https://github.com/dividab/abstract-visuals/compare/abstract-image@3.0.0...abstract-image@3.0.1) - 2021-01-01

### Added

- Added typing on GrowthDirection for textAnchor on the svg export.

## v3.0.0 - 2021-03-24

- Start of changelog.
