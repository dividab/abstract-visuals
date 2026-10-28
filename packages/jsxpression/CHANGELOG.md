# Change Log

All notable changes to this project will be documented in this file. The format is based on [Keep a Changelog](http://keepachangelog.com/) and this project adheres to [Semantic Versioning](http://semver.org/).

## [0.4.0] - 2026-10-28

- Breaking: a schema's data, element attributes and function arguments and return values are JSON Schemas instead of `PropertySchema`, which is removed with `serializePropertySchemaToJson` and `deserializePropertySchemaFromJson`.
- Added: `jsxpression/json-schema`, what jsxpression reads JSON Schemas with, for others to read them the same way, like an editor suggesting a template's names: `resolve` follows `$ref`s, `property`, `keys`, `items`, `types`, `enumValues` and `isRequired` read objects, arrays, `allOf`, `anyOf` and `oneOf`. An object with `properties` but no `additionalProperties` only has those, unless it's one of `allOf`'s, and the names a `propertyNames` lists are its known keys, only those if it enumerates them.
  - `data` is one object's schema, each of its properties a variable, its `$defs` what `$ref`s in it refer to. An element's `props` is an object's schema, its `required` the attributes it needs. A function argument's `property` is its `schema`.
  - The old kinds map as `{ type: "object", shape }` to `properties` and `required`, `record` to `additionalProperties`, `array`'s `shape` to `items` and `union` to `anyOf`. A property's `required: true` moves to its object's `required`, and data properties are no longer required unless listed there.
- Added: the data check follows `$ref`s, `allOf`, `anyOf` and `oneOf`, so a union's members' properties can be read, and allows any key of an object with `additionalProperties`, or only those its `propertyNames` enumerate, where a record couldn't be read before.
- Changed: the generated TypeScript definitions declare the data's `$defs` as named types, e.g. `type Node = { children?: Node[] }`, which replaces the optional `name` of 0.3.3. An object with `additionalProperties` gets an index signature, `{ [key: string]: T }`, besides its properties.

## [0.3.3] - 2026-10-27

- The generated TypeScript definitions support a data schema that contains itself, e.g. a component whose `children` are components. Such a schema is declared as a named type, e.g. `type Component = { children: Component[] }`, instead of the generator never finishing. An object, array, record or union schema takes an optional `name` for that type, else it's called `Recursive`.

## [0.3.2] - 2026-10-26

- The generated TypeScript definitions give `String` and `Number` a call signature, so `String(value)` and `Number(value)` are typed as returning a `string` and a `number`, and an editor shows them as functions instead of empty objects.
- Validation only allows calling a builtin global that is a function: `String(value)` and `Number(value)` still pass, `Math(1)` (which threw on render) and `Array(3)` are now errors.

## [0.3.0] - 2026-09-10

- Internal: activated `typescript/no-unnecessary-condition`. Runtime checks against acorn's real (broader-than-declared) AST shapes were kept, widening casts instead of removing them. No functional changes.

## [0.2.2] - 2026-09-09

- Added support for optional chaining (`?.`) in compiled expressions, including chained member access and calls.

## [0.2.0] - 2026-09-06

- Internal: activated 39 additional oxlint rules — curly, default-case, eqeqeq, init-declarations, no-alert, no-bitwise, no-case-declarations, no-empty-pattern, no-prototype-builtins, no-restricted-globals, no-restricted-properties, no-shadow, no-throw-literal, no-unused-vars, no-useless-return, node/global-require, one-var, prefer-const, prefer-object-spread, typescript/array-type, typescript/ban-tslint-comment, typescript/dot-notation, typescript/explicit-module-boundary-types, typescript/no-empty-object-type, typescript/no-explicit-any, typescript/no-require-imports, typescript/no-unnecessary-boolean-literal-compare, typescript/no-var-requires, typescript/no-wrapper-object-types, typescript/parameter-properties, typescript/prefer-nullish-coalescing, typescript/prefer-optional-chain, typescript/prefer-readonly, typescript/prefer-reduce-type-parameter, typescript/prefer-string-starts-ends-with, typescript/switch-exhaustiveness-check, typescript/unified-signatures, unicorn/no-array-sort — and upgraded `oxlint-config-divid` to 1.2.0. No functional changes.

## [0.1.39] - 2026-09-05

- Wired the package's test suite into the shared workspace test runner.
- Internal: adopt `verbatimModuleSyntax` and stricter compiler/lint settings. No other functional changes.
