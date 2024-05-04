import * as AbstractImage from "abstract-image";
import * as Axis from "./axis";
import { exhaustiveCheck } from "ts-exhaustive-check";

// tslint:disable:max-file-line-count

export type Partial<T> = { [P in keyof T]?: T[P] };

export type LabelLayout = "original" | "end" | "center";

export interface Chart {
  readonly width: number;
  readonly height: number;
  readonly chartPoints: Array<ChartPoint>;
  readonly chartLines: Array<ChartLine>;
  readonly chartStack: ChartStack;
  readonly xAxisBottom: Axis.Axis | undefined;
  readonly xAxisTop: Axis.Axis | undefined;
  readonly yAxisLeft: Axis.Axis | undefined;
  readonly yAxisRight: Axis.Axis | undefined;
  readonly backgroundColor: AbstractImage.Color;
  readonly gridColor: AbstractImage.Color;
  readonly gridThickness: number;
  readonly font: string;
  readonly fontSize: number;
  readonly labelLayout: LabelLayout;
  readonly padding: Padding;
}

export type ChartProps = Partial<Chart>;

export function createChart(props: ChartProps): Chart {
  const {
    width = 600,
    height = 400,
    chartPoints = [],
    chartLines = [],
    chartStack = createChartStack({}),
    xAxisBottom = Axis.createLinearAxis(0, 100, ""),
    xAxisTop = undefined,
    yAxisLeft = Axis.createLinearAxis(0, 100, ""),
    yAxisRight = undefined,
    backgroundColor = AbstractImage.white,
    gridColor = AbstractImage.gray,
    gridThickness = 1,
    font = "Arial",
    fontSize = 12,
    labelLayout = "original",
    padding = { top: 40, right: 80, bottom: 40, left: 80 },
  } = props || {};
  return {
    width,
    height,
    chartPoints,
    chartLines,
    chartStack,
    xAxisBottom,
    xAxisTop,
    yAxisLeft,
    yAxisRight,
    backgroundColor,
    gridColor,
    gridThickness,
    font,
    fontSize,
    labelLayout,
    padding,
  };
}

type Padding = { readonly top: number; readonly right: number; readonly bottom: number; readonly left: number };

export type XAxis = "bottom" | "top";
export type YAxis = "left" | "right";

export type ChartPointShape = "circle" | "triangle" | "square";

export interface ChartPoint {
  readonly shape: ChartPointShape;
  readonly position: AbstractImage.Point;
  readonly color: AbstractImage.Color;
  readonly size: AbstractImage.Size;
  readonly label: string;
  readonly xAxis: XAxis;
  readonly yAxis: YAxis;
}

export type ChartPointProps = Partial<ChartPoint>;

export function createChartPoint(props?: ChartPointProps): ChartPoint {
  const {
    shape = "circle",
    position = AbstractImage.createPoint(0, 0),
    color = AbstractImage.black,
    size = AbstractImage.createSize(6, 6),
    label = "",
    xAxis = "bottom",
    yAxis = "left",
  } = props || {};
  return { shape, position, color, size, label, xAxis, yAxis };
}

export interface ChartLine {
  readonly points: Array<AbstractImage.Point>;
  readonly color: AbstractImage.Color;
  readonly thickness: number;
  readonly label: string;
  readonly xAxis: XAxis;
  readonly yAxis: YAxis;
}

export type ChartLineProps = Partial<ChartLine>;

export function createChartLine(props: ChartLineProps): ChartLine {
  const {
    points = [],
    color = AbstractImage.black,
    thickness = 1,
    label = "",
    xAxis = "bottom",
    yAxis = "left",
  } = props || {};
  return { points, color, thickness, label, xAxis, yAxis };
}

export interface ChartStackConfig {
  readonly color: AbstractImage.Color;
  readonly label: string;
}

export type ChartStackConfigProps = Partial<ChartStackConfig>;

export function createChartStackConfig(props: ChartStackConfigProps): ChartStackConfig {
  const { color = AbstractImage.black, label = "" } = props || {};
  return { color, label };
}

export interface StackPoints {
  readonly x: number;
  readonly ys: ReadonlyArray<number>;
}

export interface ChartStack {
  readonly points: Array<StackPoints>;
  readonly xAxis: XAxis;
  readonly yAxis: YAxis;
  readonly config: ReadonlyArray<ChartStackConfig>;
}

export type ChartStackProps = Partial<ChartStack>;

export function createChartStack(props: ChartStackProps): ChartStack {
  const { points = [], xAxis = "bottom", yAxis = "left", config = [createChartStackConfig({})] } = props || {};
  return { points, xAxis, yAxis, config };
}

export function inverseTransformPoint(
  point: AbstractImage.Point,
  chart: Chart,
  xAxis: XAxis,
  yAxis: YAxis,
  padding: Padding
): AbstractImage.Point | undefined {
  const xMin = padding.left;
  const xMax = chart.width - padding.right;
  const yMin = chart.height - padding.bottom;
  const yMax = padding.top;
  const x = Axis.inverseTransformValue(point.x, xMin, xMax, xAxis === "top" ? chart.xAxisTop : chart.xAxisBottom);
  const y = Axis.inverseTransformValue(point.y, yMin, yMax, yAxis === "right" ? chart.yAxisRight : chart.yAxisLeft);
  if (x === undefined || y === undefined) {
    return undefined;
  }
  return AbstractImage.createPoint(x, y);
}

export function renderChart(chart: Chart): AbstractImage.AbstractImage {
  const { width, height, xAxisBottom, xAxisTop, yAxisLeft, yAxisRight, padding } = chart;

  const gridWidth = width - padding.left - padding.right;
  const gridHeight = height - padding.bottom - padding.top;

  const xMin = padding.left;
  const xMax = width - padding.right;
  const yMin = height - padding.bottom;
  const yMax = padding.top;

  const renderedBackground = generateBackground(xMin, xMax, yMin, yMax, chart);

  const xNumTicks = gridWidth / 40;
  const renderedXAxisBottom = generateXAxisBottom(xNumTicks, xAxisBottom, xMin, xMax, yMin, yMax, chart);
  const renderedXAxisTop = generateXAxisTop(xNumTicks, xAxisTop, xMin, xMax, yMax, chart);

  const yNumTicks = gridHeight / 40;
  const renderedYAxisLeft = generateYAxisLeft(yNumTicks, yAxisLeft, xMin, xMax, yMin, yMax, chart);
  const renderedYAxisRight = generateYAxisRight(yNumTicks, yAxisRight, xMax, yMin, yMax, chart);

  const renderedPoints = generatePoints(xMin, xMax, yMin, yMax, chart);
  const renderedLines = generateLines(xMin, xMax, yMin, yMax, chart);
  const renderedStack = generateStack(xMin, xMax, yMin, yMax, chart);

  const components = [
    renderedBackground,
    renderedXAxisBottom,
    renderedXAxisTop,
    renderedYAxisLeft,
    renderedYAxisRight,
    renderedStack,
    renderedLines,
    renderedPoints,
  ];
  const topLeft = AbstractImage.createPoint(0, 0);
  const size = AbstractImage.createSize(width, height);
  return AbstractImage.createAbstractImage(topLeft, size, AbstractImage.white, components);
}

export function generateBackground(
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
  chart: Chart
): AbstractImage.Component {
  const topLeft = AbstractImage.createPoint(xMin, yMax);
  const bottomRight = AbstractImage.createPoint(xMax, yMin);
  return AbstractImage.createRectangle(
    topLeft,
    bottomRight,
    chart.gridColor,
    chart.gridThickness,
    chart.backgroundColor
  );
}

export function generateXAxisBottom(
  xNumTicks: number,
  xAxisBottom: Axis.Axis | undefined,
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
  chart: Chart
): AbstractImage.Component {
  if (!xAxisBottom) {
    return AbstractImage.createGroup("XAxisBottom", []);
  }
  const axisLabelPosY = yMin + chart.padding.bottom - chart.fontSize;
  const tickLabelPosY = yMin + (chart.padding.bottom - chart.fontSize) / 2;
  const xTicks = Axis.getTicks(xNumTicks, xAxisBottom);
  const xLines = generateXAxisGridLines(xMin, xMax, yMin + 10, yMax, xTicks, xAxisBottom, chart);
  const xLabels = generateXAxisLabels(xMin, xMax, tickLabelPosY, "down", xTicks, xAxisBottom, chart);

  let xLabel: AbstractImage.Component;
  switch (chart.labelLayout) {
    case "original":
      xLabel = generateXAxisLabel(
        xMax + chart.padding.right,
        tickLabelPosY,
        "uniform",
        "down",
        xAxisBottom.label,
        chart
      );
      break;
    case "end":
      xLabel = generateXAxisLabel(xMax, axisLabelPosY, "left", "down", xAxisBottom.label, chart);
      break;
    case "center":
      xLabel = generateXAxisLabel((xMin + xMax) / 2, axisLabelPosY, "uniform", "down", xAxisBottom.label, chart);
      break;
    default:
      return exhaustiveCheck(chart.labelLayout);
  }

  return AbstractImage.createGroup("XAxisBottom", [xLines, xLabels, xLabel]);
}

export function generateXAxisTop(
  xNumTicks: number,
  xAxisTop: Axis.Axis | undefined,
  xMin: number,
  xMax: number,
  yMax: number,
  chart: Chart
): AbstractImage.Component {
  if (!xAxisTop) {
    return AbstractImage.createGroup("XAxisTop", []);
  }
  const axisLabelPosY = yMax - chart.padding.top + chart.fontSize;
  const tickLabelPosY = yMax - (chart.padding.top - chart.fontSize) / 2;
  const xTicks2 = Axis.getTicks(xNumTicks, xAxisTop);
  const xLines2 = generateXAxisGridLines(xMin, xMax, yMax - 10, yMax, xTicks2, xAxisTop, chart);
  const xLabels2 = generateXAxisLabels(xMin, xMax, tickLabelPosY, "up", xTicks2, xAxisTop, chart);

  let xLabel2: AbstractImage.Component;
  switch (chart.labelLayout) {
    case "original":
      xLabel2 = generateXAxisLabel(
        xMax + 0.5 * chart.padding.right,
        tickLabelPosY,
        "uniform",
        "up",
        xAxisTop.label,
        chart
      );
      break;
    case "end":
      xLabel2 = generateXAxisLabel(xMax, axisLabelPosY, "left", "up", xAxisTop.label, chart);
      break;
    case "center":
      xLabel2 = generateXAxisLabel((xMin + xMax) / 2, axisLabelPosY, "uniform", "up", xAxisTop.label, chart);
      break;
    default:
      return exhaustiveCheck(chart.labelLayout);
  }

  return AbstractImage.createGroup("XAxisTop", [xLines2, xLabels2, xLabel2]);
}

export function generateYAxisLeft(
  yNumTicks: number,
  yAxisLeft: Axis.Axis | undefined,
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
  chart: Chart
): AbstractImage.Component {
  if (!yAxisLeft) {
    return AbstractImage.createGroup("YAxisLeft", []);
  }
  const tickLabelPosX = xMin - chart.padding.left / 2 + chart.fontSize;
  const axisLabelPosX =
    xMin - chart.padding.left + labelPadding(formatNumber(Axis.axisMax(yAxisLeft)).length, chart.fontSize, 0.5);

  const yTicks = Axis.getTicks(yNumTicks, yAxisLeft);
  const yLines = generateYAxisLines(xMin - 5, xMax, yMin, yMax, yTicks, yAxisLeft, chart);
  const yLabels = generateYAxisLabels(tickLabelPosX, yMin, yMax, "left", yTicks, yAxisLeft, chart);

  let yLabel: AbstractImage.Component;
  switch (chart.labelLayout) {
    case "original":
      yLabel = generateYAxisLabel(
        axisLabelPosX,
        yMax + 0.5 * chart.padding.bottom,
        "uniform",
        "up",
        yAxisLeft.label,
        chart
      );
      break;
    case "end":
      yLabel = generateYAxisLabel(axisLabelPosX, yMax, "left", "up", yAxisLeft.label, chart);
      break;
    case "center":
      yLabel = generateYAxisLabel(axisLabelPosX, (yMin + yMax) / 2, "uniform", "up", yAxisLeft.label, chart);
      break;
    default:
      return exhaustiveCheck(chart.labelLayout);
  }

  return AbstractImage.createGroup("YAxisLeft", [yLines, yLabels, yLabel]);
}

export function generateYAxisRight(
  yNumTicks: number,
  yAxisRight: Axis.Axis | undefined,
  xMax: number,
  yMin: number,
  yMax: number,
  chart: Chart
): AbstractImage.Component {
  if (!yAxisRight) {
    return AbstractImage.createGroup("YAxisRight", []);
  }

  const tickLabelPosX = xMax + (chart.padding.right - chart.fontSize) / 2;
  const axisLabelPosX =
    xMax + chart.padding.right - labelPadding(formatNumber(Axis.axisMax(yAxisRight)).length, chart.fontSize, 0.5);

  const yTicks2 = Axis.getTicks(yNumTicks, yAxisRight);
  const yLines2 = generateYAxisLines(xMax - 5, xMax + 5, yMin, yMax, yTicks2, yAxisRight, chart);
  const yLabels2 = generateYAxisLabels(tickLabelPosX, yMin, yMax, "right", yTicks2, yAxisRight, chart);

  const labelPaddingRight = 7 + labelPadding(formatNumber(Axis.axisMax(yAxisRight)).length, chart.fontSize, 1.5);

  let yLabel2: AbstractImage.Component;
  switch (chart.labelLayout) {
    case "original":
      yLabel2 = generateYAxisLabel(
        axisLabelPosX,
        yMax + 0.5 * chart.padding.bottom,
        "uniform",
        "up",
        yAxisRight.label,
        chart
      );
      break;
    case "end":
      yLabel2 = generateYAxisLabel(axisLabelPosX, yMax, "left", "up", yAxisRight.label, chart);
      break;
    case "center":
      yLabel2 = generateYAxisLabel(axisLabelPosX, (yMin + yMax) / 2, "uniform", "up", yAxisRight.label, chart);
      break;
    default:
      return exhaustiveCheck(chart.labelLayout);
  }

  return AbstractImage.createGroup("YAxisRight", [yLines2, yLabels2, yLabel2]);
}

export function generateStack(
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
  chart: Chart
): AbstractImage.Component {
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

  return AbstractImage.createGroup("Stacks", [stackPos, stackNeg]);
}

function generateUnsignedStack(
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
  chart: Chart
): AbstractImage.Component {
  if (chart.chartStack.points.length < 2) {
    return AbstractImage.createGroup("stack", []);
  }

  const xAxis = chart.chartStack.xAxis === "top" ? chart.xAxisTop : chart.xAxisBottom;
  const yAxis = chart.chartStack.yAxis === "right" ? chart.yAxisRight : chart.yAxisLeft;

  const xPoints = chart.chartStack.points.map((stackPoints) => {
    let sumY = 0;
    const points = stackPoints.ys.map((y) => {
      sumY += y;
      return Axis.transformPoint(AbstractImage.createPoint(stackPoints.x, sumY), xMin, xMax, yMin, yMax, xAxis, yAxis);
    });
    return points;
  });

  // Transpose the xPoints data to lines.
  const lines: Array<Array<AbstractImage.Point>> = [];
  for (let i = 0; i < (xPoints[0]?.length ?? 0); ++i) {
    lines[i] = [];
    for (const points of xPoints) {
      lines[i]!.push(points[i]!);
    }
  }

  const polygons: Array<AbstractImage.Polygon> = [];
  let lastLine = chart.chartStack.points.map((stackPoint) =>
    Axis.transformPoint(AbstractImage.createPoint(stackPoint.x, 0), xMin, xMax, yMin, yMax, xAxis, yAxis)
  );
  lines.forEach((line, index) => {
    const config = chart.chartStack.config[index];
    if (!config) {
      throw new Error("Missing config for series " + index);
    }
    const color = config.color;
    const points = [...line, ...lastLine.slice().reverse()];
    lastLine = line;
    polygons.push(AbstractImage.createPolygon(points, color, 0, color));
  });

  return AbstractImage.createGroup("Stack", polygons);
}

export function generateLines(
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
  chart: Chart
): AbstractImage.Component {
  const lines = chart.chartLines.map((l: ChartLine) => {
    if (l.points.length < 2) {
      return AbstractImage.createGroup(l.label, []);
    }
    const xAxis = l.xAxis === "top" ? chart.xAxisTop : chart.xAxisBottom;
    const yAxis = l.yAxis === "right" ? chart.yAxisRight : chart.yAxisLeft;
    const points = l.points.map((p) => Axis.transformPoint(p, xMin, xMax, yMin, yMax, xAxis, yAxis));
    return AbstractImage.createGroup(l.label, [
      AbstractImage.createPolyLine(points, l.color, l.thickness),
      AbstractImage.createText(
        points.at(-1)!,
        l.label,
        chart.font,
        chart.fontSize,
        AbstractImage.black,
        "normal",
        0,
        "center",
        "right",
        "down",
        0,
        AbstractImage.black,
        false
      ),
    ]);
  });
  return AbstractImage.createGroup("Lines", lines);
}

export function generatePoints(
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
  chart: Chart
): AbstractImage.Component {
  const points = chart.chartPoints.map((p) => {
    const xAxis = p.xAxis === "top" ? chart.xAxisTop : chart.xAxisBottom;
    const yAxis = p.yAxis === "right" ? chart.yAxisRight : chart.yAxisLeft;
    const position = Axis.transformPoint(p.position, xMin, xMax, yMin, yMax, xAxis, yAxis);
    const shape = generatePointShape(p, position);
    return AbstractImage.createGroup(p.label, [
      shape,
      AbstractImage.createText(
        position,
        p.label,
        chart.font,
        chart.fontSize,
        AbstractImage.black,
        "normal",
        0,
        "center",
        "right",
        "down",
        0,
        AbstractImage.black,
        false
      ),
    ]);
  });
  return AbstractImage.createGroup("Points", points);
}

function generatePointShape(p: ChartPoint, position: AbstractImage.Point): AbstractImage.Component {
  const halfWidth = p.size.width * 0.5;
  const halfHeight = p.size.height * 0.5;
  if (p.shape === "triangle") {
    const trianglePoints = [
      AbstractImage.createPoint(position.x, position.y + halfHeight),
      AbstractImage.createPoint(position.x - halfWidth, position.y - halfHeight),
      AbstractImage.createPoint(position.x + halfWidth, position.y - halfHeight),
    ];
    return AbstractImage.createPolygon(trianglePoints, AbstractImage.black, 1, p.color);
  } else if (p.shape === "square") {
    const topLeft = AbstractImage.createPoint(position.x - halfWidth, position.y - halfHeight);
    const bottomRight = AbstractImage.createPoint(position.x + halfWidth, position.y + halfHeight);
    return AbstractImage.createRectangle(topLeft, bottomRight, AbstractImage.black, 1, p.color);
  } else {
    const topLeft = AbstractImage.createPoint(position.x - halfWidth, position.y - halfHeight);
    const bottomRight = AbstractImage.createPoint(position.x + halfWidth, position.y + halfHeight);
    return AbstractImage.createEllipse(topLeft, bottomRight, AbstractImage.black, 1, p.color);
  }
}

export function generateXAxisGridLines(
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
  xTicks: ReadonlyArray<Axis.DiscreteAxisPoint>,
  xAxis: Axis.Axis,
  chart: Chart
): AbstractImage.Component {
  const xLines = xTicks.map((l) => {
    const x = Axis.transformValue(l.value, xMin, xMax, xAxis);
    const start = AbstractImage.createPoint(x, yMin);
    const end = AbstractImage.createPoint(x, yMax);
    return AbstractImage.createLine(start, end, chart.gridColor, chart.gridThickness);
  });

  return AbstractImage.createGroup("Lines", xLines);
}

export function generateXAxisLabels(
  xMin: number,
  xMax: number,
  y: number,
  growVertical: AbstractImage.GrowthDirection,
  xTicks: ReadonlyArray<Axis.DiscreteAxisPoint>,
  xAxis: Axis.Axis,
  chart: Chart
): AbstractImage.Component {
  const xLabels = xTicks.map((l) => {
    const position = AbstractImage.createPoint(Axis.transformValue(l.value, xMin, xMax, xAxis), y);
    return AbstractImage.createText(
      position,
      l.label ?? formatNumber(l.value),
      chart.font,
      chart.fontSize,
      AbstractImage.black,
      "normal",
      xAxis.labelRotation ?? 0,
      "center",
      "uniform",
      growVertical,
      0,
      AbstractImage.black,
      false
    );
  });
  return AbstractImage.createGroup("Labels", xLabels);
}

export function generateXAxisLabel(
  x: number,
  y: number,
  horizontalGrowthDirection: AbstractImage.GrowthDirection,
  verticalGrowthDirection: AbstractImage.GrowthDirection,
  label: string,
  chart: Chart
): AbstractImage.Component {
  const position = AbstractImage.createPoint(x, y);
  return AbstractImage.createText(
    position,
    label,
    chart.font,
    chart.fontSize,
    AbstractImage.black,
    "normal",
    0,
    "center",
    horizontalGrowthDirection,
    verticalGrowthDirection,
    0,
    AbstractImage.black,
    false
  );
}

export function generateYAxisLines(
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
  yTicks: ReadonlyArray<Axis.DiscreteAxisPoint>,
  yAxis: Axis.Axis,
  chart: Chart
): AbstractImage.Component {
  const yLines = yTicks.map((l) => {
    const y = Axis.transformValue(l.value, yMin, yMax, yAxis);
    const start = AbstractImage.createPoint(xMin, y);
    const end = AbstractImage.createPoint(xMax, y);
    return AbstractImage.createLine(start, end, chart.gridColor, chart.gridThickness);
  });
  return AbstractImage.createGroup("Lines", yLines);
}

export function generateYAxisLabels(
  x: number,
  yMin: number,
  yMax: number,
  growHorizontal: AbstractImage.GrowthDirection,
  yTicks: ReadonlyArray<Axis.DiscreteAxisPoint>,
  yAxis: Axis.Axis,
  chart: Chart
): AbstractImage.Component {
  const yLabels = yTicks.map((l) => {
    const position = AbstractImage.createPoint(x, Axis.transformValue(l.value, yMin, yMax, yAxis));
    return AbstractImage.createText(
      position,
      l.label ?? formatNumber(l.value),
      chart.font,
      chart.fontSize,
      AbstractImage.black,
      "normal",
      yAxis.labelRotation ?? 0,
      "center",
      growHorizontal,
      "uniform",
      0,
      AbstractImage.black,
      false
    );
  });
  return AbstractImage.createGroup("Labels", yLabels);
}

export function generateYAxisLabel(
  x: number,
  y: number,
  horizontalGrowthDirection: AbstractImage.GrowthDirection,
  verticalGrowthDirection: AbstractImage.GrowthDirection,
  label: string,
  chart: Chart
): AbstractImage.Component {
  const position = AbstractImage.createPoint(x, y);
  return AbstractImage.createText(
    position,
    label,
    chart.font,
    chart.fontSize,
    AbstractImage.black,
    "normal",
    -90,
    "center",
    horizontalGrowthDirection,
    verticalGrowthDirection,
    0,
    AbstractImage.black,
    false
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
