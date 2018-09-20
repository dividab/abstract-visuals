# abstract-document

[![npm version][version-image]][version-url]
[![code style: prettier][prettier-image]][prettier-url]
[![MIT license][license-image]][license-url]

Create documents using functions or JSX and render to any format

## Introduction

When dynamically creating complex documents, traditional reporting packages with WYSIWYG interfaces can make documents cumbersome to design, difficult to provide data for, hard to debug, and mostly get in your way. This library offers a solution by allowing you to create an abstract representation of a document using code (function calls or JSX). This abstract representation can then be rendered to any format such as .pdf, .docx etc. It is also possible to embed [abstract-image] images into the document.

## Installation

`npm install --save abstract-document`

The library is compiled to ES5 and no polyfills are required.

## Usage

```js
const doc = render(
  <AbstractDoc>
    <Section page={page}>
      <Paragraph>
        <TextRun text="Test" />
      </Paragraph>
      {["a", "b", "c"].map(c => (
        <Paragraph key={c}>
          <TextRun text={c} />
        </Paragraph>
      ))}
      <Paragraph />
    </Section>
  </AbstractDoc>
);
```

[version-image]: https://img.shields.io/npm/v/abstract-document.svg?style=flat
[version-url]: https://www.npmjs.com/package/abstract-document
[license-image]: https://img.shields.io/github/license/dividab/abstract-document.svg?style=flat
[license-url]: https://opensource.org/licenses/MIT
[prettier-image]: https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat
[prettier-url]: https://github.com/prettier/prettier
[abstract-image]: https://www.npmjs.com/package/abstract-image
