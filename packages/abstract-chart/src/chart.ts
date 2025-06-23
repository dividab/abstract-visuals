/* eslint-disable max-lines */
import { exhaustiveCheck } from "ts-exhaustive-check";
import * as AI from "abstract-image";
import {
  Axis,
  AxisBase,
  inverseTransformValue,
  getTicks,
  createLinearAxis,
  transformValue,
  transformPoint,
  DiscreteAxisPoint,
} from "./axis.js";

// tslint:disable:max-file-line-count

export type Partial<T> = { [P in keyof T]?: T[P] };

export type LabelLayout = "original" | "end" | "center";

const axisLabelPosFactor = 0.65;

export interface Chart {
  readonly width: number;
  readonly height: number;
  readonly chartAreas: Array<ChartArea>;
  readonly chartPoints: Array<ChartPoint>;
  readonly chartLines: Array<ChartLine>;
  readonly chartStack: ChartStack;
  readonly chartBars: Array<ChartBars>;
  readonly chartDataAxisesBottom: Array<ChartDataAxis>;
  readonly chartDataAxisesTop: Array<ChartDataAxis>;
  readonly chartDataAxisesLeft: Array<ChartDataAxis>;
  readonly chartDataAxisesRight: Array<ChartDataAxis>;
  readonly xAxisesBottom: ReadonlyArray<Axis>;
  readonly xAxisesTop: ReadonlyArray<Axis>;
  readonly yAxisesLeft: ReadonlyArray<Axis>;
  readonly yAxisesRight: ReadonlyArray<Axis>;
  readonly backgroundColor: AI.Color;
  readonly xGrid: ChartGrid;
  readonly yGrid: ChartGrid;
  readonly font: string;
  readonly fontSize: number;
  readonly textColor: AI.Color;
  readonly textOutlineColor: AI.Color;
  readonly labelLayout: LabelLayout;
  readonly padding: Padding;
  readonly axisWidth: Padding;
  readonly xPixelsPerTick: number;
  readonly yPixelsPerTick: number;
}

export type ChartGrid = { readonly color: AI.Color; readonly thickness: number };

export type ChartProps = Partial<Chart>;

export function createChart(props: ChartProps): Chart {
  return {
    width: props.width ?? 600,
    height: props.height ?? 600,
    chartAreas: props.chartAreas ?? [],
    chartPoints: props.chartPoints ?? [],
    chartLines: props.chartLines ?? [],
    chartStack: props.chartStack ?? createChartStack({}),
    chartBars: props.chartBars ?? [],
    chartDataAxisesBottom: props.chartDataAxisesBottom ?? [],
    chartDataAxisesTop: props.chartDataAxisesTop ?? [],
    chartDataAxisesLeft: props.chartDataAxisesLeft ?? [],
    chartDataAxisesRight: props.chartDataAxisesRight ?? [],
    xAxisesBottom: props.xAxisesBottom ?? [],
    xAxisesTop: props.xAxisesTop ?? [],
    yAxisesLeft: props.yAxisesLeft ?? [],
    yAxisesRight: props.yAxisesRight ?? [],
    backgroundColor: props.backgroundColor ?? AI.white,
    font: props.font ?? "Arial",
    fontSize: props.fontSize ?? 12,
    textColor: props.textColor ?? AI.black,
    textOutlineColor: props.textOutlineColor ?? AI.transparent,
    labelLayout: props.labelLayout ?? "original",
    padding: {
      top: props.padding?.top ?? 10,
      right: props.padding?.right ?? 10,
      bottom: props.padding?.bottom ?? 10,
      left: props.padding?.left ?? 10,
    },
    axisWidth: {
      top: props.axisWidth?.top ?? 50,
      right: props.axisWidth?.right ?? 50,
      bottom: props.axisWidth?.bottom ?? 50,
      left: props.axisWidth?.left ?? 50,
    },
    xGrid: { color: props.xGrid?.color ?? AI.gray, thickness: props.xGrid?.thickness ?? 1 },
    yGrid: { color: props.yGrid?.color ?? AI.gray, thickness: props.yGrid?.thickness ?? 1 },
    xPixelsPerTick: props.xPixelsPerTick ?? 40,
    yPixelsPerTick: props.yPixelsPerTick ?? 40,
  };
}

type Padding = { readonly top: number; readonly right: number; readonly bottom: number; readonly left: number };

export type XAxis = "bottom" | "top";
export type YAxis = "left" | "right";

export interface ChartArea {
  readonly points: ReadonlyArray<AI.Point>;
  readonly color: AI.Color;
  readonly strokeColor: AI.Color;
  readonly strokeThickness: number;
  readonly xAxis: XAxis;
  readonly xAxisIx: number;
  readonly yAxis: YAxis;
  readonly yAxisIx: number;
  readonly id?: string;
}

export type ChartPointShape = "circle" | "triangle" | "square";

export interface ChartPoint {
  readonly shape: ChartPointShape;
  readonly position: AI.Point;
  readonly size: AI.Size;
  readonly color: AI.Color;
  readonly strokeColor: AI.Color;
  readonly strokeThickness: number;
  readonly label: string;
  readonly xAxis: XAxis;
  readonly xAxisIx: number;
  readonly yAxis: YAxis;
  readonly yAxisIx: number;
  readonly fontSize?: number;
  readonly textColor?: AI.Color;
  readonly textOutlineColor?: AI.Color;
  readonly id?: string;
}

export interface ChartBars {
  readonly direction: "x" | "y";
  readonly position: number;
  readonly xAxis: XAxis;
  readonly xAxisIx: number;
  readonly yAxis: YAxis;
  readonly yAxisIx: number;
  readonly width: number;
  readonly radius?: AI.Point;
  readonly spacing?: number;
  readonly bars: ReadonlyArray<ChartBar>;
}

export interface ChartBar {
  readonly min?: number | undefined;
  readonly max: number;
  readonly color: AI.Color;
  readonly label?: string;
  readonly strokeColor?: AI.Color;
  readonly strokeThickness?: number;
  readonly fontSize?: number;
  readonly textColor?: AI.Color;
  readonly textOutlineColor?: AI.Color;
  readonly id?: string;
}

export type ChartAreaProps = Partial<ChartArea>;

export function createChartArea(props?: ChartAreaProps): ChartArea {
  const {
    points = [],
    color = AI.lightGray,
    strokeColor = AI.transparent,
    strokeThickness = 0,
    xAxis = "bottom",
    xAxisIx = 0,
    yAxis = "left",
    yAxisIx = 0,
    id,
  } = props || {};
  return {
    points,
    color,
    strokeColor,
    strokeThickness,
    xAxis,
    xAxisIx,
    yAxis,
    yAxisIx,
    id,
  };
}

export type ChartPointProps = Partial<ChartPoint>;

export function createChartPoint(props?: ChartPointProps): ChartPoint {
  const {
    shape = "circle",
    position = AI.createPoint(0, 0),
    color = AI.black,
    strokeColor = AI.black,
    strokeThickness = 1,
    size = AI.createSize(6, 6),
    label = "",
    xAxis = "bottom",
    xAxisIx = 0,
    yAxis = "left",
    yAxisIx = 0,
    fontSize,
    textColor,
    textOutlineColor,
    id,
  } = props || {};
  return {
    shape,
    position,
    color,
    strokeColor,
    strokeThickness,
    size,
    label,
    xAxis,
    xAxisIx,
    yAxis,
    yAxisIx,
    fontSize,
    textColor,
    textOutlineColor,
    id,
  };
}

export interface ChartLine {
  readonly points: Array<AI.Point>;
  readonly color: AI.Color;
  readonly thickness: number;
  readonly label: string;
  readonly xAxis: XAxis;
  readonly xAxisIx: number;
  readonly yAxis: YAxis;
  readonly yAxisIx: number;
  readonly fontSize?: number;
  readonly textColor?: AI.Color;
  readonly textOutlineColor?: AI.Color;
  readonly id?: string;
}

export type ChartLineProps = Partial<ChartLine>;

export function createChartLine(props: ChartLineProps): ChartLine {
  const {
    points = [],
    color = AI.black,
    thickness = 1,
    label = "",
    xAxis = "bottom",
    xAxisIx = 0,
    yAxis = "left",
    yAxisIx = 0,
    fontSize,
    textColor,
    textOutlineColor,
    id,
  } = props || {};
  return { points, color, thickness, label, xAxis, xAxisIx, yAxis, yAxisIx, fontSize, textColor, textOutlineColor, id };
}

export interface ChartStackConfig {
  readonly color: AI.Color;
  readonly label: string;
  readonly id?: string;
}

export type ChartStackConfigProps = Partial<ChartStackConfig>;

export function createChartStackConfig(props: ChartStackConfigProps): ChartStackConfig {
  const { color = AI.black, label = "" } = props || {};
  return { color, label };
}

export interface StackPoints {
  readonly x: number;
  readonly ys: ReadonlyArray<number>;
}

export interface ChartStack {
  readonly points: Array<StackPoints>;
  readonly xAxis: XAxis;
  readonly xAxisIx: number;
  readonly yAxis: YAxis;
  readonly yAxisIx: number;
  readonly config: ReadonlyArray<ChartStackConfig>;
}

export type ChartStackProps = Partial<ChartStack>;

export function createChartStack(props: ChartStackProps): ChartStack {
  const {
    points = [],
    xAxis = "bottom",
    xAxisIx = 0,
    yAxis = "left",
    yAxisIx = 0,
    config = [createChartStackConfig({})],
  } = props || {};
  return { points, xAxis, xAxisIx, yAxis, yAxisIx, config };
}

export type ChartDataAxis = AxisBase & {
  readonly points: Array<AI.Point>;
};

export function createChartDataAxis(
  points: Array<AI.Point>,
  label: string,
  labelRotation?: number,
  tickLabelDisp?: number,
  labelColor?: AI.Color,
  tickLabelColor?: AI.Color,
  thickness?: number,
  axisColor?: AI.Color,
  tickFontSize?: number,
  axisFontSize?: number,
  id?: string
): ChartDataAxis {
  return {
    points,
    label,
    labelRotation,
    tickLabelDisp,
    labelColor,
    tickLabelColor,
    thickness,
    axisColor,
    tickFontSize,
    axisFontSize,
    id,
  };
}

export function inverseTransformPoint(
  point: AI.Point,
  chart: Chart,
  xAxis: XAxis,
  xAxisIx: number,
  yAxis: YAxis,
  yAxisIx: number
): AI.Point | undefined {
  const padding = finalPadding(chart);
  const xMin = padding.left;
  const xMax = chart.width - padding.right;
  const yMin = chart.height - padding.bottom;
  const yMax = padding.top;
  const x = inverseTransformValue(
    point.x,
    xMin,
    xMax,
    xAxis === "top" ? chart.xAxisesTop[xAxisIx] : chart.xAxisesBottom[xAxisIx]
  );
  const y = inverseTransformValue(
    point.y,
    yMin,
    yMax,
    yAxis === "right" ? chart.yAxisesRight[yAxisIx] : chart.yAxisesLeft[yAxisIx]
  );
  if (x === undefined || y === undefined) {
    return undefined;
  }
  return AI.createPoint(x, y);
}

function finalPadding(chart: Chart): Padding {
  return {
    bottom:
      chart.padding.bottom +
      (chart.xAxisesBottom.filter((a) => !a.noTicks || a.label).length +
        chart.chartDataAxisesBottom.filter((a) => !a.noTicks || a.label).length) *
        chart.axisWidth.bottom,
    top:
      chart.padding.top +
      (chart.xAxisesTop.filter((a) => !a.noTicks || a.label).length +
        chart.chartDataAxisesTop.filter((a) => !a.noTicks || a.label).length) *
        chart.axisWidth.top,
    left:
      chart.padding.left +
      (chart.yAxisesLeft.filter((a) => !a.noTicks || a.label).length +
        chart.chartDataAxisesLeft.filter((a) => !a.noTicks || a.label).length) *
        chart.axisWidth.left,
    right:
      chart.padding.right +
      (chart.yAxisesRight.filter((a) => !a.noTicks || a.label).length +
        chart.chartDataAxisesRight.filter((a) => !a.noTicks || a.label).length) *
        chart.axisWidth.right,
  };
}

export function renderChart(chart: Chart): AI.AbstractImage {
  const { width, height, xAxisesBottom, xAxisesTop, yAxisesLeft, yAxisesRight } = chart;

  const padding = finalPadding(chart);

  const gridWidth = width - padding.left - padding.right;
  const gridHeight = height - padding.bottom - padding.top;

  const xMin = padding.left;
  const xMax = chart.width - padding.right;
  const yMin = chart.height - padding.bottom;
  const yMax = padding.top;

  const renderedBackground = generateBackground(xMin, xMax, yMin, yMax, chart);

  const xNumTicks = gridWidth / chart.xPixelsPerTick;
  const [xleft, xRight] = [
    yAxisesLeft[0] ? yAxisesLeft[0].thickness ?? 1 : chart.xGrid.thickness / 2,
    yAxisesRight[0] ? yAxisesRight[0].thickness ?? 1 : chart.xGrid.thickness / 2,
  ];
  const [xAxisBottom, yAxisGridBottom] = xAxises(
    "bottom",
    xNumTicks,
    xAxisesBottom,
    xMin,
    xMax,
    yMin,
    yMax,
    xleft,
    xRight,
    chart
  );
  const [xAxisTop, yAxisGridTop] = xAxises("top", xNumTicks, xAxisesTop, xMin, xMax, yMin, yMax, xleft, xRight, chart);

  const yNumTicks = gridHeight / chart.yPixelsPerTick;
  const [yBottom, yTop] = [
    xAxisesBottom[0] ? xAxisesBottom[0].thickness ?? 1 : chart.xGrid.thickness / 2,
    xAxisesTop[0] ? xAxisesTop[0].thickness ?? 1 : chart.xGrid.thickness / 2,
  ];

  const [yAxisLeft, xAxisGridLeft] = yAxises(
    "left",
    yNumTicks,
    yAxisesLeft,
    xMin,
    xMax,
    yMin,
    yMax,
    yBottom,
    yTop,
    chart
  );
  const [yAxisRight, xAxisGridRight] = yAxises(
    "right",
    yNumTicks,
    yAxisesRight,
    xMin,
    xMax,
    yMin,
    yMax,
    yBottom,
    yTop,
    chart
  );

  const renderedAreas = generateAreas(xMin, xMax, yMin, yMax, chart);
  const renderedPoints = generatePoints(xMin, xMax, yMin, yMax, chart);
  const renderedLines = generateLines(xMin, xMax, yMin, yMax, chart);
  const renderedStack = generateStack(xMin, xMax, yMin, yMax, chart);
  const renderedBars = generateBars(xMin, xMax, yMin, yMax, chart);
  const dataNumTicksX = gridWidth / 70;
  const renderedDataAxisesBottom = generateDataAxisesX(
    "bottom",
    chart.chartDataAxisesBottom,
    dataNumTicksX,
    xMin,
    xMax,
    yMin,
    yMax,
    chart
  );
  const renderedDataAxisesTop = generateDataAxisesX(
    "top",
    chart.chartDataAxisesTop,
    dataNumTicksX,
    xMin,
    xMax,
    yMin,
    yMax,
    chart
  );

  const dataNumTicksY = gridHeight / 70;
  const renderedDataAxisesLeft = generateDataAxisesY(
    "left",
    chart.chartDataAxisesLeft,
    dataNumTicksY,
    xMin,
    xMax,
    yMin,
    yMax,
    chart
  );
  const renderedDataAxisesRight = generateDataAxisesY(
    "right",
    chart.chartDataAxisesRight,
    dataNumTicksY,
    xMin,
    xMax,
    yMin,
    yMax,
    chart
  );

  const components = [
    renderedBackground,
    renderedAreas,
    xAxisGridLeft,
    xAxisGridRight,
    yAxisGridBottom,
    yAxisGridTop,
    xAxisBottom,
    xAxisTop,
    yAxisLeft,
    yAxisRight,
    renderedStack,
    renderedBars,
    renderedLines,
    renderedPoints,
    renderedDataAxisesBottom,
    renderedDataAxisesTop,
    renderedDataAxisesLeft,
    renderedDataAxisesRight,
  ];
  const topLeft = AI.createPoint(0, 0);
  const size = AI.createSize(width, height);
  return AI.createAbstractImage(topLeft, size, AI.white, components);
}

export function generateBackground(xMin: number, xMax: number, yMin: number, yMax: number, chart: Chart): AI.Component {
  return AI.createRectangle(
    AI.createPoint(xMin, yMax),
    AI.createPoint(xMax, yMin),
    AI.transparent,
    0,
    chart.backgroundColor
  );
}

export function xAxises(
  xAxis: XAxis,
  xNumTicks: number,
  axises: ReadonlyArray<Axis>,
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
  xMinLineThicknessAdjustment: number,
  xMaxLineThicknessAdjustment: number,
  chart: Chart
): readonly [AI.Component, AI.Component] {
  const components = Array<AI.Component>();
  const gridLineComponents = Array<AI.Component>();
  let lineY = xAxis === "bottom" ? yMin : yMax;
  const [dirFactor, axisWidth] = xAxis === "bottom" ? [1, chart.axisWidth.bottom] : [-1, chart.axisWidth.top];
  for (const [ix, axis] of axises.entries()) {
    const fullGrid = ix === 0 && xAxis === "bottom";
    const xTicks = getTicks(xNumTicks, axis);
    if (chart.xGrid && !axis.noTicks) {
      gridLineComponents.push(
        generateXAxisGridLines(xMin, xMax, lineY + dirFactor * 10, fullGrid ? yMax : lineY, xTicks, axis, chart.xGrid)
      );
    }
    const thickness = axis.thickness ?? 1;
    const lineDisp = ix == 0 ? (xAxis === "bottom" ? thickness / 2 : -thickness / 2) : 0;
    components.push(
      AI.createLine(
        { x: xMin - (ix == 0 ? xMinLineThicknessAdjustment : chart.xGrid.thickness / 2), y: lineY + lineDisp },
        { x: xMax + (ix == 0 ? xMaxLineThicknessAdjustment : chart.xGrid.thickness / 2), y: lineY + lineDisp },
        axis.axisColor ?? AI.gray,
        thickness
      )
    );
    if (!axis.noTicks) {
      components.push(
        generateXAxisLabels(xMin, xMax, lineY + dirFactor * 12, xAxis === "bottom" ? "down" : "up", xTicks, axis, chart)
      );
    }

    if (axis.label) {
      const axisLabelPosY = lineY + dirFactor * (axisWidth - (axis.axisFontSize ?? chart.fontSize));

      switch (chart.labelLayout) {
        case "original":
          components.push(
            generateXAxisLabel(
              xMax + chart.padding.right,
              lineY + (axis.tickLabelDisp ?? 10),
              "uniform",
              "down",
              axis,
              chart
            )
          );
          break;
        case "end":
          components.push(generateXAxisLabel(xMax, axisLabelPosY, "left", "uniform", axis, chart));
          break;
        case "center":
          components.push(generateXAxisLabel((xMin + xMax) / 2, axisLabelPosY, "uniform", "uniform", axis, chart));
          break;
        default:
          return exhaustiveCheck(chart.labelLayout);
      }
    }
    lineY += dirFactor * axisWidth;
  }

  return [AI.createGroup(xAxis + "XAxis", components), AI.createGroup(xAxis + "XAxisGridLines", gridLineComponents)];
}

export function yAxises(
  yAxis: YAxis,
  yNumTicks: number,
  axises: ReadonlyArray<Axis>,
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
  yMinLineThicknessAdjustment: number,
  yMaxLineThicknessAdjustment: number,
  chart: Chart
): readonly [AI.Component, AI.Component] {
  const components = Array<AI.Component>();
  const gridLineComponents = Array<AI.Component>();
  let lineX = yAxis === "left" ? xMin : xMax;
  const [dirFactor, axisWidth] = yAxis === "left" ? [-1, chart.axisWidth.left] : [1, chart.axisWidth.right];

  for (const [ix, axis] of axises.entries()) {
    const fullGrid = ix === 0 && yAxis === "left";
    const yTicks = getTicks(yNumTicks, axis);
    if (chart.yGrid && !axis.noTicks) {
      gridLineComponents.push(
        generateYAxisLines(
          lineX + dirFactor * 10,
          fullGrid ? xMax : lineX,
          yMin,
          yMax,
          yTicks,
          axis,
          chart.yGrid,
          chart.xGrid
        )
      );
    }
    const thickness = axis.thickness ?? 1;
    const lineDisp = ix == 0 ? (yAxis === "left" ? -thickness / 2 : thickness / 2) : 0;
    components.push(
      AI.createLine(
        { x: lineX + lineDisp, y: yMin + (ix == 0 ? yMinLineThicknessAdjustment : chart.yGrid.thickness / 2) },
        { x: lineX + lineDisp, y: yMax - (ix == 0 ? yMaxLineThicknessAdjustment : chart.yGrid.thickness / 2) },
        axis.axisColor ?? AI.gray,
        axis.thickness ?? 1
      )
    );
    if (!axis.noTicks) {
      components.push(generateYAxisLabels(lineX + dirFactor * 12, yMin, yMax, yAxis, yTicks, axis, chart));
    }

    if (axis.label) {
      const axisLabelPosX = lineX + dirFactor * (axisWidth - (axis.axisFontSize ?? chart.fontSize));
      const rotation = yAxis === "left" ? -90 : 90;
      switch (chart.labelLayout) {
        case "original":
          components.push(
            generateYAxisLabel(axisLabelPosX, yMax + 0.5 * chart.padding.bottom, rotation, "uniform", "up", axis, chart)
          );
          break;
        case "end":
          components.push(generateYAxisLabel(axisLabelPosX, yMax, rotation, yAxis, "uniform", axis, chart));
          break;
        case "center":
          components.push(
            generateYAxisLabel(axisLabelPosX, (yMin + yMax) / 2, rotation, "uniform", "uniform", axis, chart)
          );
          break;
        default:
          return exhaustiveCheck(chart.labelLayout);
      }
    }
    lineX += dirFactor * axisWidth;
  }

  return [AI.createGroup("YAxisLeft", components), AI.createGroup("YAxisLeftGridLines", gridLineComponents)];
}

export function generateDataAxisesX(
  xAxis: XAxis,
  axises: Array<ChartDataAxis>,
  numTicks: number,
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
  chart: Chart
): AI.Component {
  const components = Array<AI.Component>();
  let lineY =
    xAxis === "bottom"
      ? yMin + chart.xAxisesBottom.length * chart.axisWidth.bottom
      : yMax - chart.xAxisesTop.length * chart.axisWidth.top;
  const [dirFactor, axisWidth] = xAxis === "bottom" ? [1, chart.axisWidth.bottom] : [-1, chart.axisWidth.top];
  for (const axis of axises) {
    const min = Math.min(...axis.points.map((p) => p.y));
    const max = Math.max(...axis.points.map((p) => p.y));
    const linear = createLinearAxis(
      min,
      max,
      axis.label,
      axis.labelColor,
      axis.labelRotation,
      axis.tickLabelDisp,
      axis.thickness,
      axis.axisColor,
      axis.id
    );
    const findX = (y: number): number => {
      for (let i = 0; i < axis.points.length; ++i) {
        const p0 = i > 0 ? axis.points[i - 1] : undefined;
        const p1 = axis.points[i];
        if (!p1) {
          continue;
        }
        if (p0 && p0.y <= y && p1.y >= y) {
          const k = (p1.x - p0.x) / (p1.y - p0.y);
          const x = p0.x + k * (y - p0.y);
          return x;
        }
        if (!p0 && p1.y >= y) {
          return p1.x;
        }
      }
      return axis.points[axis.points.length - 1]?.x ?? 0;
    };
    const yValues = getTicks(numTicks, linear).map((t) => t.value);
    const lineY2 = lineY;
    components.push(
      ...yValues.flatMap((y) => {
        const tickX = findX(y);
        const x = transformValue(tickX, xMin, xMax, chart.xAxisesBottom[0]);
        const start = AI.createPoint(x, lineY2);
        const end = AI.createPoint(x, lineY2 + dirFactor * 10);
        const textPos = AI.createPoint(x, lineY2 + dirFactor * 12);
        return [
          AI.createLine(start, end, chart.xGrid.color, chart.xGrid.thickness),
          AI.createText(
            textPos,
            formatNumber(y),
            chart.font,
            axis.tickFontSize ?? chart.fontSize,
            axis.labelColor ?? AI.black,
            "normal",
            axis.labelRotation ?? 0,
            "center",
            "uniform",
            xAxis === "bottom" ? "down" : "up",
            0,
            axis.labelColor ?? AI.black,
            false
          ),
        ];
      })
    );

    components.push(
      AI.createLine({ x: xMin, y: lineY }, { x: xMax, y: lineY }, axis.axisColor ?? AI.gray, axis.thickness ?? 1)
    );

    const axisLabelPosY = lineY + dirFactor * (axisWidth - (axis.axisFontSize ?? chart.fontSize));
    switch (chart.labelLayout) {
      case "original":
        components.push(
          generateXAxisLabel(
            xMax + chart.padding.right,
            yMin + (axis.tickLabelDisp ?? 10),
            "uniform",
            "up",
            linear,
            chart
          )
        );
        break;
      case "end":
        components.push(generateXAxisLabel(xMax, axisLabelPosY, "left", "uniform", linear, chart));
        break;
      case "center":
        components.push(generateXAxisLabel((xMin + xMax) / 2, axisLabelPosY, "uniform", "uniform", linear, chart));
        break;
      default:
        return exhaustiveCheck(chart.labelLayout);
    }
    lineY += dirFactor * axisWidth;
  }
  return AI.createGroup(xAxis + "XDataAxis", components);
}

export function generateDataAxisesY(
  yAxis: YAxis,
  axises: Array<ChartDataAxis>,
  numTicks: number,
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
  chart: Chart
): AI.Component {
  const components = Array<AI.Component>();
  let lineX =
    yAxis === "left"
      ? xMin - chart.yAxisesLeft.length * chart.axisWidth.left
      : xMax + chart.yAxisesRight.length * chart.axisWidth.right;
  const [dirFactor, axisWidth] = yAxis === "left" ? [-1, chart.axisWidth.left] : [1, chart.axisWidth.right];
  for (const axis of axises) {
    const min = Math.min(...axis.points.map((p) => p.y));
    const max = Math.max(...axis.points.map((p) => p.y));
    const linear = createLinearAxis(
      min,
      max,
      axis.label,
      axis.labelColor,
      axis.labelRotation,
      axis.tickLabelDisp,
      axis.thickness,
      axis.axisColor,
      axis.id
    );
    const findX = (y: number): number => {
      for (let i = 0; i < axis.points.length; ++i) {
        const p0 = i > 0 ? axis.points[i - 1] : undefined;
        const p1 = axis.points[i];
        if (!p1) {
          continue;
        }
        if (p0 && p0.y <= y && p1.y >= y) {
          const k = (p1.x - p0.x) / (p1.y - p0.y);
          const x = p0.x + k * (y - p0.y);
          return x;
        }
        if (!p0 && p1.y >= y) {
          return p1.x;
        }
      }
      return axis.points[axis.points.length - 1]?.x ?? 0;
    };
    const yValues = getTicks(numTicks, linear).map((t) => t.value);
    const lineX2 = lineX;
    components.push(
      ...yValues.flatMap((y) => {
        const tickY = findX(y);
        const yPx = transformValue(tickY, yMin, yMax, chart.yAxisesLeft[0]);
        const start = AI.createPoint(lineX2, yPx);
        const end = AI.createPoint(lineX2 + dirFactor * 10, yPx);
        const textPos = AI.createPoint(lineX2 + dirFactor * 12, yPx);
        return [
          AI.createLine(start, end, chart.xGrid.color, chart.xGrid.thickness),
          AI.createText(
            textPos,
            formatNumber(y),
            chart.font,
            axis.tickFontSize ?? chart.fontSize,
            axis.labelColor ?? AI.black,
            "normal",
            0,
            "center",
            yAxis,
            "uniform",
            0,
            axis.labelColor ?? AI.black,
            false
          ),
        ];
      })
    );

    components.push(
      AI.createLine({ x: lineX, y: yMin }, { x: lineX, y: yMax }, axis.axisColor ?? AI.gray, axis.thickness ?? 1)
    );
    const rotation = yAxis === "left" ? -90 : 90;
    const axisLabelPosX = lineX + dirFactor * (axisWidth - (axis.axisFontSize ?? chart.fontSize));
    switch (chart.labelLayout) {
      case "original":
        components.push(
          generateYAxisLabel(
            xMax + chart.padding.right,
            yMin + (axis.tickLabelDisp ?? 10),
            rotation,
            "uniform",
            "up",
            linear,
            chart
          )
        );
        break;
      case "end":
        components.push(generateYAxisLabel(axisLabelPosX, yMax, rotation, "left", "uniform", linear, chart));
        break;
      case "center":
        components.push(
          generateYAxisLabel(axisLabelPosX, (yMin + yMax) / 2, rotation, "uniform", "uniform", linear, chart)
        );
        break;
      default:
        return exhaustiveCheck(chart.labelLayout);
    }
    lineX += dirFactor * axisWidth;
  }
  return AI.createGroup(yAxis + "YDataAxis", components);
}

export function generateStack(xMin: number, xMax: number, yMin: number, yMax: number, chart: Chart): AI.Component {
  const pointsPos = chart.chartStack.points.map((stackPoint) => ({
    x: stackPoint.x,
    ys: [...stackPoint.ys.map((y) => Math.min(0, y))],
  }));

  const stackPos = generateUnsignedStack(xMin, xMax, yMin, yMax, {
    ...chart,
    chartStack: { ...chart.chartStack, points: pointsPos },
  });

  const pointsNeg = chart.chartStack.points.map((stackPoint) => ({
    x: stackPoint.x,
    ys: [...stackPoint.ys.map((y) => Math.max(0, y))],
  }));

  const stackNeg = generateUnsignedStack(xMin, xMax, yMin, yMax, {
    ...chart,
    chartStack: { ...chart.chartStack, points: pointsNeg },
  });

  return AI.createGroup("Stacks", [stackPos, stackNeg]);
}

function generateUnsignedStack(xMin: number, xMax: number, yMin: number, yMax: number, chart: Chart): AI.Component {
  if (chart.chartStack.points.length < 2) {
    return AI.createGroup("stack", []);
  }

  const xAxis =
    chart.chartStack.xAxis === "top"
      ? chart.xAxisesTop[chart.chartStack.xAxisIx]
      : chart.xAxisesBottom[chart.chartStack.xAxisIx];
  const yAxis =
    chart.chartStack.yAxis === "right"
      ? chart.yAxisesRight[chart.chartStack.yAxisIx]
      : chart.yAxisesLeft[chart.chartStack.yAxisIx];

  const xPoints = chart.chartStack.points.map((stackPoints) => {
    let sumY = 0;
    const points = stackPoints.ys.map((y) => {
      sumY += y;
      return transformPoint(AI.createPoint(stackPoints.x, sumY), xMin, xMax, yMin, yMax, xAxis, yAxis);
    });
    return points;
  });

  // Transpose the xPoints data to lines.
  const lines: Array<Array<AI.Point>> = [];
  for (let i = 0; i < (xPoints[0]?.length ?? 0); ++i) {
    lines[i] = [];
    for (const points of xPoints) {
      lines[i]!.push(points[i]!);
    }
  }

  const polygons: Array<AI.Polygon> = [];
  let lastLine = chart.chartStack.points.map((stackPoint) =>
    transformPoint(AI.createPoint(stackPoint.x, 0), xMin, xMax, yMin, yMax, xAxis, yAxis)
  );
  lines.forEach((line, index) => {
    const config = chart.chartStack.config[index];
    if (!config) {
      throw new Error("Missing config for series " + index);
    }
    const color = config.color;
    const points = [...line, ...lastLine.slice().reverse()];
    lastLine = line;
    polygons.push(AI.createPolygon(points, color, 0, color, config.id));
  });

  return AI.createGroup("Stack", polygons);
}

export function generateLines(xMin: number, xMax: number, yMin: number, yMax: number, chart: Chart): AI.Component {
  const lines = chart.chartLines.map((l: ChartLine) => {
    if (l.points.length < 2) {
      return AI.createGroup(l.label.split("<")[0] ?? "UNKNOWN", []);
    }
    const xAxis = l.xAxis === "top" ? chart.xAxisesTop[l.xAxisIx] : chart.xAxisesBottom[l.xAxisIx];
    const yAxis = l.yAxis === "right" ? chart.yAxisesRight[l.yAxisIx] : chart.yAxisesLeft[l.yAxisIx];
    const points = l.points.map((p) => transformPoint(p, xMin, xMax, yMin, yMax, xAxis, yAxis));
    const segments = getLineSegmentsInsideChart(xMin, xMax, yMin, yMax, points);
    const components = [];
    const outlineColor = l.textOutlineColor ?? chart.textOutlineColor;
    for (const segment of segments) {
      components.push(AI.createPolyLine(segment.slice(), l.color, l.thickness));
      if (l.id !== undefined) {
        components.push(AI.createPolyLine(segment.slice(), AI.transparent, l.thickness + 8, l.id));
      }
    }
    const lastSeg = segments.at(-1);
    const last = lastSeg?.at(-1);
    if (last) {
      components.push(
        AI.createText(
          last,
          l.label,
          chart.font,
          l.fontSize ?? chart.fontSize,
          l.textColor ?? chart.textColor,
          "normal",
          0,
          "center",
          textHorizontalGrowth(last.x, xMin, xMax),
          textVerticalGrowth(last.y, yMin, yMax),
          outlineColor !== AI.transparent ? 3 : 0,
          outlineColor,
          false,
          l.id
        )
      );
    }
    return AI.createGroup(l.label.split("<")[0] ?? "UNKNOWN", components);
  });
  return AI.createGroup("Lines", lines);
}

function getLineSegmentsInsideChart(
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
  points: ReadonlyArray<AI.Point>
): ReadonlyArray<ReadonlyArray<AI.Point>> {
  const segments: Array<ReadonlyArray<AI.Point>> = [];
  let segment: Array<AI.Point> = [];
  let prev: AI.Point | undefined;
  for (const point of points) {
    const prevInside = prev && isInside(xMin, xMax, yMin, yMax, prev);
    const inside = isInside(xMin, xMax, yMin, yMax, point);
    if (prevInside && inside) {
      segment.push(point);
    } else if (prevInside && prev && !inside) {
      const moved = moveInside(xMin, xMax, yMin, yMax, prev, point);
      segment.push(moved);
      segments.push(segment);
      segment = [];
    } else if (!prevInside && prev && inside) {
      const moved = moveInside(xMin, xMax, yMin, yMax, point, prev);
      segment.push(moved);
      segment.push(point);
    } else if (!prev && inside) {
      segment.push(point);
    } else if (!prev && !inside && segment.length > 1) {
      segments.push(segment);
      segment = [];
    }
    prev = point;
  }
  if (segment.length > 1) {
    segments.push(segment);
  }
  return segments;
}

function isInside(xMin: number, xMax: number, yMin: number, yMax: number, p: AI.Point): boolean {
  return p.x >= xMin && p.x <= xMax && p.y <= yMin && p.y >= yMax;
}

function moveInside(
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
  inside: AI.Point,
  outside: AI.Point
): AI.Point {
  const xMinYMin = AI.createPoint(xMin, yMin);
  const xMinYMax = AI.createPoint(xMin, yMax);
  const xMaxYMin = AI.createPoint(xMax, yMin);
  const xMaxYMax = AI.createPoint(xMax, yMax);
  return (
    lineLine(inside, outside, xMinYMin, xMaxYMin) ??
    lineLine(inside, outside, xMinYMax, xMaxYMax) ??
    lineLine(inside, outside, xMinYMin, xMinYMax) ??
    lineLine(inside, outside, xMaxYMin, xMaxYMax) ??
    inside
  );
}

function lineLine(a0: AI.Point, a1: AI.Point, b0: AI.Point, b1: AI.Point): AI.Point | undefined {
  const da = AI.createPoint(a1.x - a0.x, a1.y - a0.y);
  const db = AI.createPoint(b1.x - b0.x, b1.y - b0.y);
  const dab = AI.createPoint(a0.x - b0.x, a0.y - b0.y);
  const uA = (db.x * dab.y - db.y * dab.x) / (db.y * da.x - db.x * da.y);
  const uB = (da.x * dab.y - da.y * dab.x) / (db.y * da.x - db.x * da.y);

  // if uA and uB are between 0-1, lines are colliding
  if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {
    return AI.createPoint(a0.x + uA * da.x, a0.y + uA * da.y);
  }
  return undefined;
}

export function generateAreas(xMin: number, xMax: number, yMin: number, yMax: number, chart: Chart): AI.Component {
  const areas = chart.chartAreas.map((a) => {
    const xAxis = a.xAxis === "top" ? chart.xAxisesTop[a.xAxisIx] : chart.xAxisesBottom[a.xAxisIx];
    const yAxis = a.yAxis === "right" ? chart.yAxisesRight[a.yAxisIx] : chart.yAxisesLeft[a.yAxisIx];
    const points = a.points.map((p) => transformPoint(p, xMin, xMax, yMin, yMax, xAxis, yAxis));
    const components = [AI.createPolygon(points, a.strokeColor, a.strokeThickness, a.color, a.id)];
    return AI.createGroup("UNKNOWN", components);
  });
  return AI.createGroup("Areas", areas);
}

export function generatePoints(xMin: number, xMax: number, yMin: number, yMax: number, chart: Chart): AI.Component {
  const points = chart.chartPoints.map((p) => {
    const xAxis = p.xAxis === "top" ? chart.xAxisesTop[p.xAxisIx] : chart.xAxisesBottom[p.xAxisIx];
    const yAxis = p.yAxis === "right" ? chart.yAxisesRight[p.yAxisIx] : chart.yAxisesLeft[p.yAxisIx];
    const position = transformPoint(p.position, xMin, xMax, yMin, yMax, xAxis, yAxis);
    const outlineColor = p.textOutlineColor ?? chart.textOutlineColor;
    const components = [
      generatePointShape(p, position, undefined),
      AI.createText(
        position,
        p.label,
        chart.font,
        p.fontSize ?? chart.fontSize,
        p.textColor ?? chart.textColor,
        "normal",
        0,
        "center",
        textHorizontalGrowth(position.x, xMin, xMax),
        textVerticalGrowth(position.y, yMin, yMax),
        outlineColor !== AI.transparent ? 3 : 0,
        outlineColor,
        false
      ),
    ];
    if (p.id !== undefined) {
      components.push(
        generatePointShape(
          {
            ...p,
            color: AI.transparent,
            strokeColor: AI.transparent,
            strokeThickness: 0,
            size: { width: p.size.width + 10, height: p.size.height + 10 },
          },
          position,
          p.id
        )
      );
    }
    return AI.createGroup(p.label.split("<")[0] ?? "UNKNOWN", components);
  });
  return AI.createGroup("Points", points);
}

export function generateBars(xMin: number, xMax: number, yMin: number, yMax: number, chart: Chart): AI.Component {
  const components = Array<AI.Component>();

  for (const bars of chart.chartBars) {
    const xAxis = bars.xAxis === "top" ? chart.xAxisesTop[bars.xAxisIx] : chart.xAxisesBottom[bars.xAxisIx];
    const yAxis = bars.yAxis === "right" ? chart.yAxisesRight[bars.yAxisIx] : chart.yAxisesLeft[bars.yAxisIx];
    const yMinValue =
      yAxis?.type === "linear" || yAxis?.type === "logarithmic" ? yAxis.min : yAxis?.points[0]?.value ?? 0;
    const xMinValue =
      xAxis?.type === "linear" || xAxis?.type === "logarithmic" ? xAxis.min : xAxis?.points[0]?.value ?? 0;
    const halfStep = bars.width / 2 + (bars.spacing ?? bars.width / 3) / 2;
    const textRot = bars.direction === "x" ? 0 : -Math.PI / 2;

    for (let i = 0; i < bars.bars.length; i++) {
      const b = bars.bars[i]!;
      const barPos = bars.position + (-bars.bars.length + 1 + 2 * i) * halfStep;
      const outlineColor = b.textOutlineColor ?? chart.textOutlineColor;

      const [tl, middle, br] =
        bars.direction === "x"
          ? [
              AI.createPoint(b.min ?? xMinValue, barPos + bars.width / 2),
              AI.createPoint((b.max + (b.min ?? xMinValue)) / 2, barPos),
              AI.createPoint(b.max, barPos - bars.width / 2),
            ]
          : [
              AI.createPoint(barPos - bars.width / 2, b.max),
              AI.createPoint(barPos, (b.max + (b.min ?? yMinValue)) / 2),
              AI.createPoint(barPos + bars.width / 2, b.min ?? yMinValue),
            ];
      const pos = transformPoint(middle, xMin, xMax, yMin, yMax, xAxis, yAxis);
      const topLeft = transformPoint(tl, xMin, xMax, yMin, yMax, xAxis, yAxis);
      const bottomRight = transformPoint(br, xMin, xMax, yMin, yMax, xAxis, yAxis);
      components.push(
        AI.createRectangle(
          topLeft,
          bottomRight,
          b.strokeColor ?? AI.transparent,
          b.strokeThickness ?? 0,
          b.color,
          b.id,
          AI.solidLine,
          bars.radius
        )
      );
      if (b.label) {
        components.push(
          AI.createText(
            pos,
            b.label,
            chart.font,
            b.fontSize ?? chart.fontSize,
            b.textColor ?? chart.textColor,
            "normal",
            textRot,
            "center",
            "uniform",
            "uniform",
            outlineColor !== AI.transparent ? 3 : 0,
            outlineColor,
            false
          )
        );
      }
    }
  }

  return AI.createGroup("Bars", components);
}

function textHorizontalGrowth(position: number, xMin: number, xMax: number): AI.GrowthDirection {
  return position > (xMin + xMax) * 0.5 ? "left" : "right";
}

function textVerticalGrowth(position: number, yMin: number, yMax: number): AI.GrowthDirection {
  return position < (yMin + yMax) * 0.5 ? "down" : "up";
}

function generatePointShape(p: ChartPoint, position: AI.Point, id: string | undefined): AI.Component {
  const halfWidth = p.size.width * 0.5;
  const halfHeight = p.size.height * 0.5;
  if (p.shape === "triangle") {
    const trianglePoints = [
      AI.createPoint(position.x, position.y + halfHeight),
      AI.createPoint(position.x - halfWidth, position.y - halfHeight),
      AI.createPoint(position.x + halfWidth, position.y - halfHeight),
    ];
    return AI.createPolygon(trianglePoints, p.strokeColor, p.strokeThickness, p.color, id);
  } else if (p.shape === "square") {
    const topLeft = AI.createPoint(position.x - halfWidth, position.y - halfHeight);
    const bottomRight = AI.createPoint(position.x + halfWidth, position.y + halfHeight);
    return AI.createRectangle(topLeft, bottomRight, p.strokeColor, p.strokeThickness, p.color, id);
  } else {
    const topLeft = AI.createPoint(position.x - halfWidth, position.y - halfHeight);
    const bottomRight = AI.createPoint(position.x + halfWidth, position.y + halfHeight);
    return AI.createEllipse(topLeft, bottomRight, p.strokeColor, p.strokeThickness, p.color, id);
  }
}

export function generateXAxisGridLines(
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
  xTicks: ReadonlyArray<DiscreteAxisPoint>,
  xAxis: Axis,
  xGrid: { readonly color: AI.Color; readonly thickness: number }
): AI.Component {
  const xLines = xTicks.map((l) => {
    const x = transformValue(l.value, xMin, xMax, xAxis);
    const start = AI.createPoint(x, yMin);
    const end = AI.createPoint(x, yMax);
    return AI.createLine(start, end, xGrid.color, xGrid.thickness);
  });

  return AI.createGroup("Lines", xLines);
}

export function generateXAxisLabels(
  xMin: number,
  xMax: number,
  y: number,
  growVertical: AI.GrowthDirection,
  ticks: ReadonlyArray<DiscreteAxisPoint>,
  axis: Axis,
  chart: Chart
): AI.Component {
  const rotation = axis.labelRotation ?? 0;

  const horizontalGrowth: AI.GrowthDirection = (() => {
    if (rotation === 0) {
      return "uniform";
    }
    if (growVertical === "down") {
      return rotation < 0 ? "left" : "right";
    } else {
      return rotation < 0 ? "right" : "left";
    }
  })();
  const xLabels = ticks.map((l) => {
    const position = AI.createPoint(transformValue(l.value, xMin, xMax, axis), y);
    return AI.createText(
      position,
      l.label ?? formatNumber(l.value),
      chart.font,
      axis.tickFontSize ?? chart.fontSize,
      axis.labelColor ?? AI.black,
      "normal",
      rotation,
      "center",
      horizontalGrowth,
      growVertical,
      0,
      axis.labelColor ?? AI.black,
      false
    );
  });
  return AI.createGroup("Labels", xLabels);
}

export function generateXAxisLabel(
  x: number,
  y: number,
  horizontalGrowthDirection: AI.GrowthDirection,
  verticalGrowthDirection: AI.GrowthDirection,
  axis: Axis,
  chart: Chart
): AI.Component {
  const position = AI.createPoint(x, y);
  return AI.createText(
    position,
    axis.label ?? "",
    chart.font,
    axis.axisFontSize ?? chart.fontSize,
    axis.labelColor ?? AI.black,
    "normal",
    0,
    "center",
    horizontalGrowthDirection,
    verticalGrowthDirection,
    0,
    axis.labelColor ?? AI.black,
    false,
    axis.id
  );
}

export function generateYAxisLines(
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
  yTicks: ReadonlyArray<DiscreteAxisPoint>,
  yAxis: Axis,
  yGrid: { readonly color: AI.Color; readonly thickness: number },
  xGrid: { readonly color: AI.Color; readonly thickness: number }
): AI.Component {
  const yLines = yTicks.map((l) => {
    const y = transformValue(l.value, yMin, yMax, yAxis);
    const start = AI.createPoint(xMin - xGrid.thickness / 2, y);
    const end = AI.createPoint(xMax + xGrid.thickness / 2, y);
    return AI.createLine(start, end, yGrid.color, yGrid.thickness);
  });
  return AI.createGroup("Lines", yLines);
}

export function generateYAxisLabels(
  x: number,
  yMin: number,
  yMax: number,
  growHorizontal: AI.GrowthDirection,
  yTicks: ReadonlyArray<DiscreteAxisPoint>,
  yAxis: Axis,
  chart: Chart
): AI.Component {
  const rotation = yAxis.labelRotation ?? 0;
  const growVertical: AI.GrowthDirection = (() => {
    if (rotation === 0) {
      return "uniform";
    }
    if (growHorizontal === "left") {
      return rotation < 0 ? "up" : "down";
    } else {
      return rotation < 0 ? "down" : "up";
    }
  })();

  const yLabels = yTicks.map((l) => {
    const position = AI.createPoint(x, transformValue(l.value, yMin, yMax, yAxis));
    return AI.createText(
      position,
      l.label ?? formatNumber(l.value),
      chart.font,
      yAxis.tickFontSize ?? chart.fontSize,
      yAxis.labelColor ?? AI.black,
      "normal",
      rotation,
      "center",
      growHorizontal,
      growVertical,
      0,
      yAxis.labelColor ?? AI.black,
      false
    );
  });
  return AI.createGroup("Labels", yLabels);
}

export function generateYAxisLabel(
  x: number,
  y: number,
  rotation: number,
  horizontalGrowthDirection: AI.GrowthDirection,
  verticalGrowthDirection: AI.GrowthDirection,
  axis: Axis,
  chart: Chart
): AI.Component {
  const position = AI.createPoint(x, y);
  return AI.createText(
    position,
    axis.label ?? "",
    chart.font,
    axis.axisFontSize ?? chart.fontSize,
    axis.labelColor ?? AI.black,
    "normal",
    rotation,
    "center",
    horizontalGrowthDirection,
    verticalGrowthDirection,
    0,
    axis.labelColor ?? AI.black,
    false,
    axis.id
  );
}

function formatNumber(n: number): string {
  if (n >= 10000000) {
    return numberToString(n / 1000000) + "m";
  }
  if (n >= 10000) {
    return numberToString(n / 1000) + "k";
  }
  return numberToString(n);
}

function numberToString(n: number): string {
  return parseFloat(n.toPrecision(5)).toString();
}

function labelPadding(numberOfCharacters: number, fontSize: number, characterOffset: number): number {
  return ((numberOfCharacters + 1 + characterOffset) * fontSize * 3) / 4;
}
