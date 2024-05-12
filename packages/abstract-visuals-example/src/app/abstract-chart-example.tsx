import React, { useState } from "react";
import * as AbstractChart from "../../../../packages/abstract-chart/src";
import * as AbstractImage from "../../../../packages/abstract-image/src";

function getLineRange(
  series: AbstractChart.ChartLine[],
  axisSelector: (point: AbstractImage.Point) => number
): [number, number] {
  const axisValues = series
    .map((serie) => serie.points.map(axisSelector))
    .reduce((soFar, current) => {
      return [...soFar, ...current];
    }, [] as ReadonlyArray<number>);
  return [Math.min(...axisValues), Math.max(...axisValues)];
}

function generateLineChart(hovered: string): AbstractChart.Chart {
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
        { x: 8, y: 0 },
      ],
      color: AbstractImage.red,
      label: "How bad you feel",
      xAxis: "bottom",
      yAxis: "left",
      thickness: hovered === "line one" ? 4 : 1,
      id: "line one",
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
        { x: 8, y: 1.5 },
      ],
      color: AbstractImage.blue,
      label: "How bad you sound",
      xAxis: "bottom",
      yAxis: "left",
      thickness: hovered === "line two" ? 4 : 1,
      id: "line two",
    }),
  ];

  const [xMin, xMax] = getLineRange(series, (point) => point.x);
  const [yMin, yMax] = getLineRange(series, (point) => point.y);

  const chart = AbstractChart.createChart({
    chartLines: series,
    chartPoints: [
      AbstractChart.createChartPoint({
        position: { x: 7, y: 4 },
        id: "point1",
        size: hovered === "point1" ? { width: 8, height: 8 } : { width: 5, height: 5 },
        label: "Point",
      }),
      AbstractChart.createChartPoint({
        position: { x: 1, y: 1 },
        id: "point2",
        size: hovered === "point2" ? { width: 8, height: 8 } : { width: 5, height: 5 },
        label: "Point",
      }),
    ],
    xAxisBottom: AbstractChart.createLinearAxis(xMin, xMax, "Days with cold"),
    yAxisLeft: AbstractChart.createLinearAxis(yMin, yMax + 1, "Badness"),
    labelLayout: "center",
    textOutlineColor: AbstractImage.white,
  });

  return chart;
}

function getStackRange(
  points: ReadonlyArray<AbstractChart.StackPoints>,
  axisSelector: (point: AbstractChart.StackPoints) => ReadonlyArray<number>
): [number, number] {
  const axisValues = points
    .map(axisSelector)
    .map((stackedValues) => {
      let posSum = 0;
      let negSum = 0;
      for (const value of stackedValues) {
        if (value > 0) {
          posSum += value;
        } else {
          negSum += value;
        }
      }
      return [negSum, posSum];
    })
    .reduce((soFar, current) => {
      return [...soFar, ...current];
    }, [] as ReadonlyArray<number>);
  return [Math.min(...axisValues), Math.max(...axisValues)];
}

function generateStackedChart(): AbstractChart.Chart {
  const stack = AbstractChart.createChartStack({
    points: [
      { x: 0, ys: [0, 0] },
      { x: 1, ys: [2, 0] },
      { x: 2, ys: [4, 0] },
      { x: 3, ys: [1.5, 1] },
      { x: 4, ys: [1, 2] },
      { x: 5, ys: [0, 3] },
      { x: 6, ys: [0, 2.8] },
      { x: 7, ys: [0, 2] },
      { x: 8, ys: [0, 1.5] },
    ],
    xAxis: "bottom",
    yAxis: "left",
    config: [
      AbstractChart.createChartStackConfig({
        color: AbstractImage.red,
        label: "How bad you feel",
      }),
      AbstractChart.createChartStackConfig({
        color: AbstractImage.blue,
        label: "How bad you sound",
      }),
    ],
  });

  const [xMin, xMax] = getStackRange(stack.points, (point) => [point.x]);
  const [yMin, yMax] = getStackRange(stack.points, (point) => point.ys);

  const chart = AbstractChart.createChart({
    chartStack: stack,
    xAxisBottom: AbstractChart.createLinearAxis(xMin, xMax, "Days with cold"),
    yAxisLeft: AbstractChart.createLinearAxis(yMin, yMax + 1, "Badness"),
    labelLayout: "center",
  });

  return chart;
}

function generateSignedStackedChart(): AbstractChart.Chart {
  const numPoints = 100;
  const numYs = 5;
  const points: Array<AbstractChart.StackPoints> = [];
  let lastYs: Array<number> = [];
  for (let yi = 0; yi < numYs; ++yi) {
    lastYs[yi] = 0;
  }
  for (let x = 0; x < numPoints; ++x) {
    const ys = lastYs.slice();
    for (let yi = 0; yi < numYs; ++yi) {
      ys[yi] = Math.sin((((x / numPoints) * (yi + 1)) / numYs) * 20);
    }
    points.push({ x, ys });
    lastYs = ys;
  }

  const stack = AbstractChart.createChartStack({
    points,
    xAxis: "bottom",
    yAxis: "left",
    config: [
      AbstractChart.createChartStackConfig({
        color: AbstractImage.fromArgb(255, 94, 91, 59),
      }),
      AbstractChart.createChartStackConfig({
        color: AbstractImage.fromArgb(255, 125, 188, 169),
      }),
      AbstractChart.createChartStackConfig({
        color: AbstractImage.fromArgb(255, 234, 253, 137),
      }),
      AbstractChart.createChartStackConfig({
        color: AbstractImage.fromArgb(255, 255, 211, 124),
      }),
      AbstractChart.createChartStackConfig({
        color: AbstractImage.fromArgb(255, 255, 155, 109),
      }),
    ],
  });

  const [xMin, xMax] = getStackRange(stack.points, (point) => [point.x]);
  const [yMin, yMax] = getStackRange(stack.points, (point) => point.ys);

  const chart = AbstractChart.createChart({
    chartStack: stack,
    xAxisBottom: AbstractChart.createLinearAxis(xMin, xMax, "Time"),
    yAxisLeft: AbstractChart.createLinearAxis(yMin * 1.1, yMax * 1.1, "Sineness"),
    labelLayout: "center",
  });

  return chart;
}

function generateLineChartDiscreteXAxis(): AbstractChart.Chart {
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
        { x: 8, y: 0 },
      ],
      color: AbstractImage.red,
      label: "How bad you feel",
      xAxis: "bottom",
      yAxis: "left",
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
        { x: 8, y: 1.5 },
      ],
      color: AbstractImage.blue,
      label: "How bad you sound",
      xAxis: "bottom",
      yAxis: "left",
    }),
  ];

  const [yMin, yMax] = getLineRange(series, (point) => point.y);

  const chart = AbstractChart.createChart({
    chartLines: series,
    xAxisBottom: {
      type: "discrete",
      points: [
        { value: 0, label: "2023-02" },
        { value: 1, label: "2023-03" },
        { value: 2, label: "2023-04" },
        { value: 3, label: "2023-05" },
        { value: 3.5, label: "2023-05-15" },
        { value: 4, label: "2023-06" },
        { value: 5, label: "2023-07" },
        { value: 6, label: "2023-08" },
        { value: 7, label: "2023-09" },
        { value: 8, label: "2023-10" },
      ],
      label: "Time",
      labelRotation: -25,
      tickLabelDisp: 25,
      axisFontSize: 18,
    },
    fontSize: 12,
    yAxisLeft: { type: "linear", min: yMin, max: yMax + 1, label: "Badness", axisFontSize: 15, tickFontSize: 14 },
    labelLayout: "center",
    padding: { top: 5, left: 50, right: 110, bottom: 65 },
  });

  return chart;
}

export function AbstractChartExample(): JSX.Element {
  const [hovered, setHovered] = useState("");
  return (
    <div>
      <h1>Line Chart</h1>
      <p>
        Chart of <a href="https://www.xkcd.com/1612/">XKCD 1612</a>
      </p>
      <p>The worst part of colds</p>
      {AbstractImage.createReactSvg(AbstractChart.renderChart(generateLineChart(hovered)), {
        onMouseMove: (id) => setHovered(id ?? ""),
      })}
      <p>Hovered: {hovered}</p>
      <h1>Stacked Chart</h1>
      <p>Stacked version of above XKCD line graph.</p>
      {AbstractImage.createReactSvg(AbstractChart.renderChart(generateStackedChart()))}
      <h1>Stacked Signed Chart</h1>
      <p>Sin(x)</p>
      {AbstractImage.createReactSvg(AbstractChart.renderChart(generateSignedStackedChart()))}
      <h1>Line Chart discrete x-axis</h1>
      <p>Sin(x)</p>
      {AbstractImage.createReactSvg(AbstractChart.renderChart(generateLineChartDiscreteXAxis()))}
    </div>
  );
}
