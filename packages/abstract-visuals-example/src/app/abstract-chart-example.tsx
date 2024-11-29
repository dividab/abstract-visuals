import React, { useState } from "react";
import FileSaver from "file-saver";
import * as AC from "../../../../packages/abstract-chart/src/index.js";
import * as AI from "../../../../packages/abstract-image/src/index.js";

export function AbstractChartExample(): JSX.Element {
  const [hovered, setHovered] = useState("");
  return (
    <div>
      <Chart
        name="Line Chart"
        chart={generateLineChart(hovered)}
        callbacks={{ onMouseMove: (id) => setHovered(id ?? "") }}
        width="950"
        height="750"
      >
        <>
          <p>
            Chart of <a href="https://www.xkcd.com/1612/">XKCD 1612</a>
          </p>
          <p>Hovered: {hovered}</p>
        </>
      </Chart>
      <Chart name="Stacked Chart" chart={generateStackedChart()}>
        <p>Stacked version of above XKCD line graph.</p>
      </Chart>
      <Chart chart={generateSignedStackedChart()} name="Stacked Signed Chart">
        <p>Sin(x)</p>
      </Chart>
      <Chart chart={generateLineChartDiscreteXAxis()} name=" Line Chart discrete x-axis" />
      <Chart chart={generateBarChart()} name="Bar chart" />
    </div>
  );

  function Chart({
    chart,
    name,
    callbacks,
    children,
    width = "600",
    height = "600",
  }: {
    readonly chart: AC.Chart;
    readonly name: string;
    readonly callbacks?: AI.ReactSvgCallbacks;
    readonly children?: JSX.Element;
    readonly width?: string;
    readonly height?: string;
  }): JSX.Element {
    const ac = AC.renderChart(chart);
    const svg = AI.createSVG(ac);
    return (
      <>
        <h1 style={{ display: "flex", gap: "6px", alignItems: "center" }}>{name}</h1>
        {children}
        <div style={{ display: "flex", gap: "10px" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <h4>React</h4>
            {AI.createReactSvg(ac, callbacks)}
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <h4 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              Svg
              <button onClick={() => FileSaver.saveAs(new Blob([svg], { type: "text/plain" }), `chart.svg`)}>
                Download
              </button>
            </h4>
            <img width={width} height={height} src={`data:image/svg+xml;,${svg}`} />
          </div>
        </div>
      </>
    );
  }

  function generateLineChart(hovered: string): AC.Chart {
    const series = [
      AC.createChartLine({
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
        color: AI.red,
        label: "How bad you feel",
        xAxis: "bottom",
        yAxis: "left",
        thickness: hovered === "line one" ? 4 : 1,
        id: "line one",
      }),
      AC.createChartLine({
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
        color: AI.blue,
        label: "How bad you sound<sub>Feel good!</sub>",
        xAxis: "bottom",
        yAxis: "left",
        thickness: hovered === "line two" ? 4 : 1,
        id: "line two",
      }),
    ];

    const [xMin, xMax] = getLineRange(series, (point) => point.x);
    const [yMin, yMax] = getLineRange(series, (point) => point.y);

    const dataAxisPointsSquaredX = [];
    const dataAxisPointsCubedX = [];
    for (let i = xMin; i <= xMax; ++i) {
      dataAxisPointsSquaredX.push({ x: i, y: i * i });
      dataAxisPointsCubedX.push({ x: i, y: i * i * i });
    }
    const dataAxisPointsSquaredY = [];
    const dataAxisPointsCubedY = [];
    for (let i = yMin; i <= yMax; ++i) {
      dataAxisPointsSquaredY.push({ x: i, y: i * i });
      dataAxisPointsCubedY.push({ x: i, y: i * i * i });
    }

    const chart = AC.createChart({
      width: 1000,
      height: 800,
      chartLines: series,
      chartPoints: [
        AC.createChartPoint({
          position: { x: 7, y: 4 },
          id: "point1",
          size: hovered === "point1" ? { width: 8, height: 8 } : { width: 5, height: 5 },
          label: "Point",
        }),
        AC.createChartPoint({
          position: { x: 1, y: 1 },
          id: "point2",
          size: hovered === "point2" ? { width: 8, height: 8 } : { width: 5, height: 5 },
          label: "Point<sub>Feel good!</sub>",
        }),
      ],
      chartDataAxisesBottom: [AC.createChartDataAxis(dataAxisPointsSquaredX, "X^2")],
      chartDataAxisesTop: [AC.createChartDataAxis(dataAxisPointsCubedX, "X^3")],
      chartDataAxisesLeft: [AC.createChartDataAxis(dataAxisPointsSquaredY, "Y^2")],
      chartDataAxisesRight: [AC.createChartDataAxis(dataAxisPointsCubedY, "Y^3")],
      xAxisesBottom: [
        AC.createLinearAxis(
          xMin,
          xMax,
          "Days with cold bottom 1",
          undefined,
          undefined,
          undefined,
          2,
          undefined,
          "x-bottom-1"
        ),
        AC.createLinearAxis(
          xMin,
          xMax,
          "Days with cold bottom 2",
          undefined,
          undefined,
          undefined,
          2,
          undefined,
          "x-bottom-2"
        ),
      ],
      xAxisesTop: [
        AC.createLinearAxis(
          xMin,
          xMax,
          "Days with cold top 1",
          undefined,
          undefined,
          undefined,
          2,
          undefined,
          "x-top-1"
        ),
        AC.createLinearAxis(
          xMin,
          xMax,
          "Days with cold top 2",
          undefined,
          undefined,
          undefined,
          2,
          undefined,
          "x-top-2"
        ),
      ],
      yAxisesLeft: [
        AC.createLinearAxis(
          yMin,
          yMax + 1,
          "Badness left 1",
          undefined,
          undefined,
          undefined,
          2,
          undefined,
          "y-left-1"
        ),
        AC.createLinearAxis(
          yMin,
          yMax + 1,
          "Badness left 2",
          undefined,
          undefined,
          undefined,
          2,
          undefined,
          "y-left-2"
        ),
      ],
      yAxisesRight: [
        AC.createLinearAxis(
          yMin,
          yMax + 1,
          "Badness right 1",
          undefined,
          undefined,
          undefined,
          2,
          undefined,
          "y-right-1"
        ),
        AC.createLinearAxis(
          yMin,
          yMax + 1,
          "Badness right 2",
          undefined,
          undefined,
          undefined,
          2,
          undefined,
          "y-right-2"
        ),
      ],
      labelLayout: "center",
      textOutlineColor: AI.white,
    });

    return chart;
  }

  function getStackRange(
    points: ReadonlyArray<AC.StackPoints>,
    axisSelector: (point: AC.StackPoints) => ReadonlyArray<number>
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

  function generateStackedChart(): AC.Chart {
    const stack = AC.createChartStack({
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
        AC.createChartStackConfig({
          color: { r: 255, b: 0, g: 0, a: 120 },
          label: "How bad you feel",
        }),
        AC.createChartStackConfig({
          color: AI.blue,
          label: "How bad you sound \n How bad you soundn \n How bad you soundn \n How bad you soundn",
        }),
      ],
    });

    const [xMin, xMax] = getStackRange(stack.points, (point) => [point.x]);
    const [yMin, yMax] = getStackRange(stack.points, (point) => point.ys);

    const chart = AC.createChart({
      chartStack: stack,
      xAxisesBottom: [AC.createLinearAxis(xMin, xMax, "Days with cold")],
      yAxisesLeft: [AC.createLinearAxis(yMin, yMax + 1, "Badness")],
      labelLayout: "center",
    });

    return chart;
  }

  function generateSignedStackedChart(): AC.Chart {
    const numPoints = 100;
    const numYs = 5;
    const points: Array<AC.StackPoints> = [];
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

    const stack = AC.createChartStack({
      points,
      xAxis: "bottom",
      yAxis: "left",
      config: [
        AC.createChartStackConfig({
          color: AI.fromArgb(255, 94, 91, 59),
        }),
        AC.createChartStackConfig({
          color: AI.fromArgb(255, 125, 188, 169),
        }),
        AC.createChartStackConfig({
          color: AI.fromArgb(255, 234, 253, 137),
        }),
        AC.createChartStackConfig({
          color: AI.fromArgb(255, 255, 211, 124),
        }),
        AC.createChartStackConfig({
          color: AI.fromArgb(255, 255, 155, 109),
        }),
      ],
    });

    const [xMin, xMax] = getStackRange(stack.points, (point) => [point.x]);
    const [yMin, yMax] = getStackRange(stack.points, (point) => point.ys);

    const chart = AC.createChart({
      chartStack: stack,
      xAxisesBottom: [AC.createLinearAxis(xMin, xMax, "Time")],
      yAxisesLeft: [AC.createLinearAxis(yMin * 1.1, yMax * 1.1, "Sineness")],
      labelLayout: "center",
    });

    return chart;
  }

  function generateLineChartDiscreteXAxis(): AC.Chart {
    const series = [
      AC.createChartLine({
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
        color: AI.red,
        label: "How bad you feel",
        xAxis: "bottom",
        yAxis: "left",
      }),
      AC.createChartLine({
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
        color: AI.blue,
        label: "How bad you sound",
        xAxis: "bottom",
        yAxis: "left",
      }),
    ];

    const [yMin, yMax] = getLineRange(series, (point) => point.y);

    const xAxis: AC.Axis = {
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
      thickness: 2,
      axisColor: { r: 0, b: 0, g: 0, a: 255 },
    };
    const yAxis: AC.Axis = {
      type: "linear",
      min: yMin,
      max: yMax + 1,
      label: "Badness",
      axisFontSize: 15,
      tickFontSize: 14,
      thickness: 7,
      axisColor: { r: 0, b: 0, g: 0, a: 255 },
    };
    const chart = AC.createChart({
      chartLines: [],
      xAxisesBottom: [xAxis],
      xAxisesTop: [
        {
          type: "linear",
          min: 0,
          max: 8,
          label: "",
          thickness: 2,
          axisColor: { r: 0, b: 0, g: 0, a: 255 },
          noTicks: true,
        },
      ],
      yAxisesRight: [
        {
          type: "linear",
          noTicks: true,
          min: yMin,
          max: yMax + 1,
          label: "",
          thickness: 2,
          axisColor: { r: 0, b: 0, g: 0, a: 255 },
        },
      ],
      fontSize: 12,
      yAxisesLeft: [yAxis],
      labelLayout: "center",
      padding: { top: 5, left: 50, right: 110, bottom: 65 },
    });

    return chart;
  }
  //dummy
  function generateBarChart(): AC.Chart {
    const xAxis: AC.Axis = {
      type: "linear",
      min: 0,
      max: 10,
      label: "Time",
      labelRotation: -25,
      tickLabelDisp: 25,
      axisFontSize: 18,
      thickness: 1,
      axisColor: { r: 0, b: 0, g: 0, a: 255 },
    };
    const yAxis: AC.Axis = {
      type: "linear",
      min: 0,
      max: 30,
      label: "Badness",
      axisFontSize: 15,
      tickFontSize: 14,
      thickness: 1,
      axisColor: { r: 0, b: 0, g: 0, a: 255 },
    };
    const chartBase: AC.ChartBars = {
      direction: "y",
      width: 0.4,
      radius: { x: 2, y: 2 },
      xAxis: "bottom",
      yAxis: "left",
      position: 0,
      bars: [],
    };
    const chart = AC.createChart({
      chartLines: [],
      chartBars: [
        {
          ...chartBase,
          position: 1,
          bars: [
            { max: 10, min: 0, color: AI.fromArgb(255, 255, 0, 0) },
            { max: 5, min: 0, color: AI.fromArgb(255, 0, 0, 255) },
            { max: 7, min: 0, color: AI.fromArgb(255, 0, 255, 0) },
          ],
        },
        { ...chartBase, position: 3, bars: [{ max: 4, color: AI.fromArgb(255, 255, 0, 0) }] },
        { ...chartBase, position: 4, bars: [{ max: 2, color: AI.fromArgb(255, 255, 0, 0) }] },
        { ...chartBase, position: 6, bars: [{ max: 4, color: AI.fromArgb(255, 255, 0, 0) }] },
        { ...chartBase, position: 7, bars: [{ max: 5, color: AI.fromArgb(255, 255, 0, 0) }] },
        { ...chartBase, position: 10, bars: [{ max: 8, color: AI.fromArgb(255, 255, 0, 0) }] },
      ],
      xAxisesBottom: [xAxis],
      xAxisesTop: [
        { type: "linear", min: 0, max: 8, label: "", axisColor: { r: 0, b: 0, g: 0, a: 255 }, noTicks: true },
      ],
      yAxisesRight: [
        { type: "linear", noTicks: true, min: 0, max: 30, label: "", axisColor: { r: 0, b: 0, g: 0, a: 255 } },
      ],
      fontSize: 12,
      xGrid: undefined,
      yAxisesLeft: [yAxis],
      labelLayout: "center",
      padding: { top: 10, left: 50, right: 110, bottom: 65 },
    });

    return chart;
  }
}

function getLineRange(series: AC.ChartLine[], axisSelector: (point: AI.Point) => number): [number, number] {
  const axisValues = series
    .map((serie) => serie.points.map(axisSelector))
    .reduce((soFar, current) => {
      return [...soFar, ...current];
    }, [] as ReadonlyArray<number>);
  return [Math.min(...axisValues), Math.max(...axisValues)];
}
