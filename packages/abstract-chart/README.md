# abstract-chart

[![npm version][version-image]][version-url]
[![code style: prettier][prettier-image]][prettier-url]
[![MIT license][license-image]][license-url]

Drawing charts using multiple unit of measure axes as coordinate system

## Introduction

When drawing complex scientific charts, regular line/bar/pie chart libraries are not very useful. This aim of this library is to enable any chart to be drawn, no matter how complex. This is achieved by treating the chart as a canvas where you can draw anything, but in constract to a regular canvas, the chart has a coordinate system specified by axes that can be of different units of measure. You can have multiple coordinate systems overlayed in the same chart by adding more axes to the chart.

The chart is created as an abstract representation which can then be converted to an [abstract-image] which then in turn can be realised into different concrete formats such as .png, .svg etc.

## Installation

`npm install --save abstract-chart`

The library is compiled to ES5 and no polyfills are required.

## Usage

Example of chart <a href="https://www.xkcd.com/1612/">XKCD 1612</a>, "The worst part of colds".

```typescript
import * as React from "react";
import * as AbstractChart from "abstract-chart";
import * as AbstractImage from "abstract-image";

const svg = AbstractImage.createSvg(
  AbstractChart.renderChart(generateLineChart())
);

function generateLineChart(): AbstractChart.Chart {
  const series = [
    AbstractChart.createChartLine({
      points: [
        { x: 0, y: 0 },
        { x: 1, y: 2 },
        { x: 2, y: 4 },
        { x: 3, y: 1.5 },
        { x: 4, y: 1 },
        { x: 5, y: 0 },
        { x: 6, y: 0 },
        { x: 7, y: 0 },
        { x: 8, y: 0 }
      ],
      color: AbstractImage.red,
      label: "How bad you feel",
      xAxis: "bottom",
      yAxis: "left"
    }),
    AbstractChart.createChartLine({
      points: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 3, y: 1 },
        { x: 4, y: 2 },
        { x: 5, y: 3 },
        { x: 6, y: 2.8 },
        { x: 7, y: 2 },
        { x: 8, y: 1.5 }
      ],
      color: AbstractImage.blue,
      label: "How bad you sound",
      xAxis: "bottom",
      yAxis: "left"
    })
  ];

  const [xMin, xMax] = getLineRange(series, point => point.x);
  const [yMin, yMax] = getLineRange(series, point => point.y);

  const chart = AbstractChart.createChart({
    chartLines: series,
    xAxisBottom: AbstractChart.createLinearAxis(xMin, xMax, "Days with cold"),
    yAxisLeft: AbstractChart.createLinearAxis(yMin, yMax + 1, "Badness"),
    labelLayout: "center"
  });

  return chart;
}

function getLineRange(
  series: AbstractChart.ChartLine[],
  axisSelector: (point: AbstractImage.Point) => number
): [number, number] {
  const axisValues = series.map(serie => serie.points.map(axisSelector)).reduce(
    (soFar, current) => {
      return [...soFar, ...current];
    },
    [] as ReadonlyArray<number>
  );
  return [Math.min(...axisValues), Math.max(...axisValues)];
}
```

[version-image]: https://img.shields.io/npm/v/abstract-chart.svg?style=flat
[version-url]: https://www.npmjs.com/package/abstract-chart
[license-image]: https://img.shields.io/github/license/dividab/abstract-visuals.svg?style=flat
[license-url]: https://opensource.org/licenses/MIT
[prettier-image]: https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat
[prettier-url]: https://github.com/prettier/prettier
[abstract-image]: https://www.npmjs.com/package/abstract-image
[uom]: https://www.npmjs.com/package/uom
