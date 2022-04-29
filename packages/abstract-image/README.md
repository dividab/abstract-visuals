# abstract-image

[![npm version][version-image]][version-url]
[![code style: prettier][prettier-image]][prettier-url]
[![MIT license][license-image]][license-url]

Dynamically create images using code or JSX and render to any format

## Introduction

Sometimes you need to create an image dynamically, for example when dynamically generating schematics etc. This library makes that easy by providing tools to create an abstract representation of an image which can then be turned into a concrete format such as .png, .svg etc.

## Installation

`npm install --save abstract-document`

The library is compiled to ES5 and no polyfills are required.

## Usage

```js
import * as React from "react";
import * as AbstractImage from "abstract-image";

export function AbstractImageExample() {
  const components = [
    AbstractImage.createLine(
      AbstractImage.createPoint(25, 25),
      AbstractImage.createPoint(80, 60),
      AbstractImage.black,
      2
    ),
    AbstractImage.createRectangle(
      AbstractImage.createPoint(10, 50),
      AbstractImage.createPoint(40, 80),
      AbstractImage.blue,
      2,
      AbstractImage.fromArgb(100, 0, 0, 0)
    ),
    AbstractImage.createRectangle(
      AbstractImage.createPoint(60, 50),
      AbstractImage.createPoint(90, 80),
      AbstractImage.blue,
      2,
      AbstractImage.transparent
    ),
  ];
  const image = AbstractImage.createAbstractImage(
    AbstractImage.createPoint(0, 0),
    AbstractImage.createSize(400, 400),
    AbstractImage.white,
    components
  );
  const svg = AbstractImage.createSVG(image);
  return (
    <div>
      <h1>Svg</h1>
      <p>Test</p>
      <pre>{svg}</pre>
      <img width="400" height="400" src={`data:image/svg+xml;,${svg}`} />
    </div>
  );
}
```

[version-image]: https://img.shields.io/npm/v/abstract-image.svg?style=flat
[version-url]: https://www.npmjs.com/package/abstract-image
[license-image]: https://img.shields.io/github/license/dividab/abstract-visuals.svg?style=flat
[license-url]: https://opensource.org/licenses/MIT
[prettier-image]: https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat
[prettier-url]: https://github.com/prettier/prettier

dummy
