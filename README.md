# abstract-visuals

[![build][build-image]][build-url]
[![Coverage Status][codecov-image]][codecov-url]
[![code style: prettier][prettier-image]][prettier-url]
[![types][types-image]][types-url]
[![MIT license][license-image]][license-url]

This is a [monorepo](https://medium.com/@maoberlehner/monorepos-in-the-wild-33c6eb246cb9) managed using [lerna](https://lernajs.io/).

For more information see the readme for each package:

| Package                                         | Version                      | README                                         | CHANGELOG                                            |
| ----------------------------------------------- | ---------------------------- | ---------------------------------------------- | ---------------------------------------------------- |
| [abstract-image](packages/abstract-image)       | [![npm version][i-ai]][u-ai] | [README](packages/abstract-image/README.md)    | [CHANGELOG](packages/abstract-image/CHANGELOG.md)    |
| [abstract-chart](packages/abstract-chart)       | [![npm version][i-ac]][u-ac] | [README](packages/abstract-chart/README.md)    | [CHANGELOG](packages/abstract-chart/CHANGELOG.md)    |
| [abstract-document](packages/abstract-document) | [![npm version][i-ad]][u-ad] | [README](packages/abstract-document/README.md) | [CHANGELOG](packages/abstract-document/CHANGELOG.md) |

There is also a package with examples:

- [abstract-visuals-example](packages/abstract-visuals-example)

## How to develop

For development of the react components, use `yarn storybook` to start storybook in development mode.

For the other packages, use `yarn test` to test them.

## How to publish

First update changelog.

The packages are published on npmjs.org. To publish run this command:

```
yarn publish-npm
```

It will build the packages and call `lerna publish` which will figure out which packages has changed, ask for new versions of them, and then publish them.

[build-image]: https://github.com/dividab/abstract-visuals/workflows/Build/badge.svg
[build-url]: https://github.com/dividab/abstract-visuals/actions?query=workflow%3ABuild+branch%3Amaster
[codecov-image]: https://codecov.io/gh/dividab/abstract-visuals/branch/master/graph/badge.svg
[codecov-url]: https://codecov.io/gh/dividab/abstract-visuals
[prettier-image]: https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat
[prettier-url]: https://github.com/prettier/prettier
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

dummy
