# abstract-visuals

[![CI](https://github.com/dividab/abstract-visuals/actions/workflows/ci.yml/badge.svg)](https://github.com/dividab/abstract-visuals/actions/workflows/ci.yml)
[![Coverage Status][codecov-image]][codecov-url]
[![code style: oxfmt][oxfmt-image]][oxfmt-url]
[![types][types-image]][types-url]
[![MIT license][license-image]][license-url]

This is a [monorepo](https://medium.com/@maoberlehner/monorepos-in-the-wild-33c6eb246cb9) managed using pnpm workspaces and [Changesets](https://github.com/changesets/changesets).

For more information see the readme for each package:

| Package                                         | Version                        | README                                         | CHANGELOG                                            |
| ----------------------------------------------- | ------------------------------ | ---------------------------------------------- | ---------------------------------------------------- |
| [abstract-image](packages/abstract-image)       | [![npm version][i-ai]][u-ai]   | [README](packages/abstract-image/README.md)    | [CHANGELOG](packages/abstract-image/CHANGELOG.md)    |
| [abstract-chart](packages/abstract-chart)       | [![npm version][i-ac]][u-ac]   | [README](packages/abstract-chart/README.md)    | [CHANGELOG](packages/abstract-chart/CHANGELOG.md)    |
| [abstract-document](packages/abstract-document) | [![npm version][i-ad]][u-ad]   | [README](packages/abstract-document/README.md) | [CHANGELOG](packages/abstract-document/CHANGELOG.md) |
| [abstract-3d](packages/abstract-3d)             | [![npm version][i-a3d]][u-a3d] | [README](packages/abstract-3d/README.md)       | [CHANGELOG](packages/abstract-3d/CHANGELOG.md)       |
| [abstract-sheet](packages/abstract-sheet)       | [![npm version][i-as]][u-as]   | [README](packages/abstract-sheet/README.md)    | [CHANGELOG](packages/abstract-sheet/CHANGELOG.md)    |

There is also a package with examples:

- [abstract-visuals-example](packages/abstract-visuals-example)

## How to develop

For development of the react components, use `pnpm storybook` to start storybook in development mode.

For the other packages, use `pnpm test` to test them.

Linting uses [oxlint](https://oxc.rs) with type-aware rules (`pnpm lint`). The [oxc VS Code extension](https://marketplace.visualstudio.com/items?itemName=oxc.oxc-vscode) needs `"oxc.typeAware": true` and `"oxc.configPath": "./oxlint.config.js"` (set in `.vscode/settings.json`) to surface the same type-aware errors live in the editor — nested config auto-discovery doesn't reliably load the JS config file, so the path must be given explicitly.

## How to release

The packages are published on npmjs.org, versioned independently, using [Changesets](https://github.com/changesets/changesets).

For each PR that changes a published package, add a changeset describing the bump type and a changelog summary:

```
pnpm changeset
```

When ready to release, run:

```
pnpm release
```

This bumps versions, updates each package's `CHANGELOG.md`, verifies (lint, build, test), commits the version bump, publishes to npm, creates git tags, and pushes the commit and tags — all in one step. Needs an npm auth token in `~/.npmrc` and, if 2FA is enabled, a one-time password: `pnpm release -- --otp=123456`.

`scripts/release.sh` runs the actual publish under `pnpm@10.34.5` instead of this repo's pinned `pnpm@12.3.1` — the pinned version has a confirmed upstream bug where registry-authenticated requests (`whoami`, `publish`) fail even with a valid npm token, while `pnpm@10.34.5` works. Revisit that once it's fixed upstream.

[build-image]: https://github.com/dividab/abstract-visuals/workflows/Build/badge.svg
[build-url]: https://github.com/dividab/abstract-visuals/actions?query=workflow%3ABuild+branch%3Amaster
[codecov-image]: https://codecov.io/gh/dividab/abstract-visuals/branch/master/graph/badge.svg
[codecov-url]: https://codecov.io/gh/dividab/abstract-visuals
[oxfmt-image]: https://img.shields.io/badge/code_style-oxfmt-ff69b4.svg?style=flat
[oxfmt-url]: https://oxc.rs/docs/guide/usage/formatter.html
[types-image]: https://img.shields.io/npm/types/scrub-js.svg
[types-url]: https://www.typescriptlang.org/
[license-image]: https://img.shields.io/github/license/dividab/abstract-visuals.svg?style=flat
[license-url]: https://opensource.org/licenses/MIT
[i-ai]: https://img.shields.io/npm/v/abstract-image.svg?style=flat
[u-ai]: https://www.npmjs.com/package/abstract-image
[i-ac]: https://img.shields.io/npm/v/abstract-chart.svg?style=flat
[u-ac]: https://www.npmjs.com/package/abstract-chart
[i-ad]: https://img.shields.io/npm/v/abstract-document.svg?style=flat
[u-ad]: https://www.npmjs.com/package/abstract-document
[i-a3d]: https://img.shields.io/npm/v/abstract-3d.svg?style=flat
[u-a3d]: https://www.npmjs.com/package/abstract-3d
[i-as]: https://img.shields.io/npm/v/abstract-sheet.svg?style=flat
[u-as]: https://www.npmjs.com/package/abstract-sheet
