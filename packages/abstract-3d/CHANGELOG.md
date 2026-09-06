# Change Log

All notable changes to this project will be documented in this file. The format is based on [Keep a Changelog](http://keepachangelog.com/) and this project adheres to [Semantic Versioning](http://semver.org/).

## [2.8.0] - 2026-09-06

- Internal: activated 39 additional oxlint rules — curly, default-case, eqeqeq, init-declarations, no-alert, no-bitwise, no-case-declarations, no-empty-pattern, no-prototype-builtins, no-restricted-globals, no-restricted-properties, no-shadow, no-throw-literal, no-unused-vars, no-useless-return, node/global-require, one-var, prefer-const, prefer-object-spread, typescript/array-type, typescript/ban-tslint-comment, typescript/dot-notation, typescript/explicit-module-boundary-types, typescript/no-empty-object-type, typescript/no-explicit-any, typescript/no-require-imports, typescript/no-unnecessary-boolean-literal-compare, typescript/no-var-requires, typescript/no-wrapper-object-types, typescript/parameter-properties, typescript/prefer-nullish-coalescing, typescript/prefer-optional-chain, typescript/prefer-readonly, typescript/prefer-reduce-type-parameter, typescript/prefer-string-starts-ends-with, typescript/switch-exhaustiveness-check, typescript/unified-signatures, unicorn/no-array-sort — and upgraded `oxlint-config-divid` to 1.2.0. No functional changes.

## [2.7.31] - 2026-09-05

- Internal: adopt `verbatimModuleSyntax` and stricter compiler/lint settings (no unused locals/params, no bracket-free index-signature access, no non-null-assertion lint rule dropped). No functional changes.

## v2.7.4

- Added culled lines

## v2.7.0

- Added support for aligned dimensions for native dimension support in DXF

## v2.4.0

- Added support for tooltips.

## v2.2.0

- Added flag to react 3d renderer allowing user to force reset pan and zoom on cube/viewport click

## v2.1.0

- Made dxf exporter use LINE and POLYLINE instead of 3DFACE for the lines and polylines

## v2.0.9

- Made Text only front sided

## v1.7.0

- Allow using the abstract 3d scene origin in the DXF export

## v1.6.0

- Included abstract image and made a new Image component to draw abstract images.

## v1.4.0

- Added a flag to turn off alpha test on texture materials.

## v1.3.9

- Added a setting for the dxf exporter to specify the sides of the cylinders.

## v1.3.4

- Bugfix Polygon: THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.

## v1.3.1

- Text bounds calculation.

## v1.3.0

- Exposed functions to calculate bounds from geometry.

## v1.2.2

- Fixed the square holes to the SVG renderer
- Added opacity to the SVG elements

## v1.2.0

- Added holes rendering to the SVG renderer

## v1.1.4

- Added screen space ambient occlusion

## v1.1.0

- Added outlines to hotspots

## v0.9.0

- Added React event to React renderer callbacks

## v0.8.0

- Added reactPopovers to React renderer

## v0.7.0

- Added onHoverGroup to React renderer

## v0.1.0 - 2024-06-05

- Start of changelog.
