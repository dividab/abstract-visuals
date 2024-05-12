import * as AI from "abstract-image";
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
  readonly backgroundColor: AI.Color;
  readonly xGrid: ChartGrid;
  readonly yGrid: ChartGrid;
  readonly font: string;
  readonly fontSize: number;
  readonly labelLayout: LabelLayout;
  readonly padding: Padding;
}

export type ChartGrid = { readonly color: AI.Color; readonly thickness: number };

export type ChartProps = Partial<Chart>;

export function createChart(props: ChartProps): Chart {
  return {
    width: props.width ?? 600,
    height: props.height ?? 600,
    chartPoints: props.chartPoints ?? [],
    chartLines: props.chartLines ?? [],
    chartStack: props.chartStack ?? createChartStack({}),
    xAxisBottom: props.xAxisBottom ?? Axis.createLinearAxis(0, 100, ""),
    xAxisTop: props.xAxisTop ?? undefined,
    yAxisLeft: props.yAxisLeft ?? Axis.createLinearAxis(0, 100, ""),
    yAxisRight: props.yAxisRight ?? undefined,
    backgroundColor: props.backgroundColor ?? AI.white,
    font: props.font ?? "Arial",
    fontSize: props.fontSize ?? 12,
    labelLayout: props.labelLayout ?? "original",
    padding: {
      top: props.padding?.top ?? (props.xAxisTop !== undefined ? 45 : 10),
      right: props.padding?.right ?? (props.yAxisRight !== undefined ? 45 : 10),
      bottom: props.padding?.bottom ?? (props.xAxisBottom === undefined ? 10 : 45),
      left: props.padding?.left ?? (!props.yAxisLeft === undefined ? 10 : 45),
    },
    xGrid: { color: props.xGrid?.color ?? AI.gray, thickness: props.xGrid?.thickness ?? 1 },
    yGrid: { color: props.yGrid?.color ?? AI.gray, thickness: props.yGrid?.thickness ?? 1 },
  };
}

type Padding = { readonly top: number; readonly right: number; readonly bottom: number; readonly left: number };

export type XAxis = "bottom" | "top";
export type YAxis = "left" | "right";

export type ChartPointShape = "circle" | "triangle" | "square";

export interface ChartPoint {
  readonly shape: ChartPointShape;
  readonly position: AI.Point;
  readonly color: AI.Color;
  readonly outline: AI.Color;
  readonly labelColor: AI.Color;
  readonly size: AI.Size;
  readonly label: string;
  readonly xAxis: XAxis;
  readonly yAxis: YAxis;
  readonly fontSize?: number;
}

export type ChartPointProps = Partial<ChartPoint>;

export function createChartPoint(props?: ChartPointProps): ChartPoint {
  const {
    shape = "circle",
    position = AI.createPoint(0, 0),
    color = AI.black,
    size = AI.createSize(6, 6),
    label = "",
    xAxis = "bottom",
    yAxis = "left",
    labelColor = AI.black,
    outline = AI.transparent,
  } = props || {};
  return { shape, position, color, size, label, xAxis, yAxis, labelColor, outline };
}

export interface ChartLine {
  readonly points: Array<AI.Point>;
  readonly color: AI.Color;
  readonly labelColor: AI.Color;
  readonly thickness: number;
  readonly label: string;
  readonly xAxis: XAxis;
  readonly yAxis: YAxis;
  readonly fontSize?: number;
}

export type ChartLineProps = Partial<ChartLine>;

export function createChartLine(props: ChartLineProps): ChartLine {
  const {
    points = [],
    color = AI.black,
    thickness = 1,
    label = "",
    xAxis = "bottom",
    yAxis = "left",
    labelColor = AI.black,
  } = props || {};
  return { points, color, thickness, label, xAxis, yAxis, labelColor };
}

export interface ChartStackConfig {
  readonly color: AI.Color;
  readonly label: string;
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
  readonly yAxis: YAxis;
  readonly config: ReadonlyArray<ChartStackConfig>;
}

export type ChartStackProps = Partial<ChartStack>;

export function createChartStack(props: ChartStackProps): ChartStack {
  const { points = [], xAxis = "bottom", yAxis = "left", config = [createChartStackConfig({})] } = props || {};
  return { points, xAxis, yAxis, config };
}

export function inverseTransformPoint(
  point: AI.Point,
  chart: Chart,
  xAxis: XAxis,
  yAxis: YAxis,
  padding: Padding
): AI.Point | undefined {
  const xMin = padding.left;
  const xMax = chart.width - padding.right;
  const yMin = chart.height - padding.bottom;
  const yMax = padding.top;
  const x = Axis.inverseTransformValue(point.x, xMin, xMax, xAxis === "top" ? chart.xAxisTop : chart.xAxisBottom);
  const y = Axis.inverseTransformValue(point.y, yMin, yMax, yAxis === "right" ? chart.yAxisRight : chart.yAxisLeft);
  if (x === undefined || y === undefined) {
    return undefined;
  }
  return AI.createPoint(x, y);
}

export function renderChart(chart: Chart): AI.AbstractImage {
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

export function generateXAxisBottom(
  xNumTicks: number,
  axis: Axis.Axis | undefined,
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
  chart: Chart
): AI.Component {
  const components = Array<AI.Component>();
  if (!axis) {
    return AI.createGroup("XAxisBottom", components);
  }
  const axisLabelPosY = yMin + chart.padding.bottom - (axis.axisFontSize ?? chart.fontSize);
  const xTicks = Axis.getTicks(xNumTicks, axis);
  if (chart.xGrid) {
    components.push(generateXAxisGridLines(xMin, xMax, yMin + 10, yMax, xTicks, axis, chart.xGrid));
  }
  components.push(
    AI.createLine({ x: xMin, y: yMin }, { x: xMax, y: yMin }, axis.axisColor ?? AI.gray, axis.thickness ?? 1),
    generateXAxisLabels(xMin, xMax, yMin + (axis.tickLabelDisp ?? 10), "down", xTicks, axis, chart)
  );

  switch (chart.labelLayout) {
    case "original":
      components.push(
        generateXAxisLabel(
          xMax + chart.padding.right,
          yMin + (axis.tickLabelDisp ?? 10),
          "uniform",
          "down",
          axis,
          chart
        )
      );
      break;
    case "end":
      components.push(generateXAxisLabel(xMax, axisLabelPosY, "left", "down", axis, chart));
      break;
    case "center":
      components.push(generateXAxisLabel((xMin + xMax) / 2, axisLabelPosY, "uniform", "down", axis, chart));
      break;
    default:
      return exhaustiveCheck(chart.labelLayout);
  }

  return AI.createGroup("XAxisBottom", components);
}

export function generateXAxisTop(
  xNumTicks: number,
  axis: Axis.Axis | undefined,
  xMin: number,
  xMax: number,
  yMax: number,
  chart: Chart
): AI.Component {
  const components = Array<AI.Component>();
  if (!axis) {
    return AI.createGroup("XAxisTop", components);
  }
  const axisLabelPosY = yMax - chart.padding.top + (axis.axisFontSize ?? chart.fontSize);
  const xTicks = Axis.getTicks(xNumTicks, axis);
  if (chart.xGrid) {
    components.push(generateXAxisGridLines(xMin, xMax, yMax - 10, yMax, xTicks, axis, chart.xGrid));
  }
  components.push(
    AI.createLine({ x: xMin, y: yMax }, { x: xMax, y: yMax }, axis.axisColor ?? AI.gray, axis.thickness ?? 1),
    generateXAxisLabels(xMin, xMax, yMax - (axis.tickLabelDisp ?? 13), "up", xTicks, axis, chart)
  );

  switch (chart.labelLayout) {
    case "original":
      components.push(
        generateXAxisLabel(
          xMax + 0.5 * chart.padding.right,
          yMax - (axis.tickLabelDisp ?? 13),
          "uniform",
          "up",
          axis,
          chart
        )
      );
      break;
    case "end":
      components.push(generateXAxisLabel(xMax, axisLabelPosY, "left", "up", axis, chart));
      break;
    case "center":
      components.push(generateXAxisLabel((xMin + xMax) / 2, axisLabelPosY, "uniform", "up", axis, chart));
      break;
    default:
      return exhaustiveCheck(chart.labelLayout);
  }

  return AI.createGroup("XAxisTop", components);
}

export function generateYAxisLeft(
  yNumTicks: number,
  axis: Axis.Axis | undefined,
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
  chart: Chart
): AI.Component {
  const components = Array<AI.Component>();
  if (!axis) {
    return AI.createGroup("YAxisLeft", components);
  }
  const axisLabelPosX = xMin - chart.padding.left + (axis.axisFontSize ?? chart.fontSize);

  const yTicks = Axis.getTicks(yNumTicks, axis);
  if (chart.yGrid) {
    components.push(generateYAxisLines(xMin - 5, xMax, yMin, yMax, yTicks, axis, chart.yGrid));
  }
  components.push(
    AI.createLine({ x: xMin, y: yMin }, { x: xMin, y: yMax }, axis.axisColor ?? AI.gray, axis.thickness ?? 1),
    generateYAxisLabels(xMin - (axis.tickLabelDisp ?? 7), yMin, yMax, "left", yTicks, axis, chart)
  );

  switch (chart.labelLayout) {
    case "original":
      components.push(
        generateYAxisLabel(axisLabelPosX, yMax + 0.5 * chart.padding.bottom, "uniform", "up", axis, chart)
      );
      break;
    case "end":
      components.push(generateYAxisLabel(axisLabelPosX, yMax, "left", "up", axis, chart));
      break;
    case "center":
      components.push(generateYAxisLabel(axisLabelPosX, (yMin + yMax) / 2, "uniform", "up", axis, chart));
      break;
    default:
      return exhaustiveCheck(chart.labelLayout);
  }

  return AI.createGroup("YAxisLeft", components);
}

export function generateYAxisRight(
  yNumTicks: number,
  axis: Axis.Axis | undefined,
  xMax: number,
  yMin: number,
  yMax: number,
  chart: Chart
): AI.Component {
  const components = Array<AI.Component>();
  if (!axis) {
    return AI.createGroup("YAxisRight", components);
  }
  const axisLabelPosX = xMax + chart.padding.right - (axis.axisFontSize ?? chart.fontSize);

  const yTicks = Axis.getTicks(yNumTicks, axis);
  if (chart.yGrid) {
    components.push(generateYAxisLines(xMax - 5, xMax + 5, yMin, yMax, yTicks, axis, chart.yGrid));
  }
  components.push(
    AI.createLine({ x: xMax, y: yMin }, { x: xMax, y: yMax }, axis.axisColor ?? AI.gray, axis.thickness ?? 1),
    generateYAxisLabels(xMax + (axis.tickLabelDisp ?? 7), yMin, yMax, "right", yTicks, axis, chart)
  );

  switch (chart.labelLayout) {
    case "original":
      components.push(
        generateYAxisLabel(axisLabelPosX, yMax + 0.5 * chart.padding.bottom, "uniform", "up", axis, chart)
      );
      break;
    case "end":
      components.push(generateYAxisLabel(axisLabelPosX, yMax, "left", "up", axis, chart));
      break;
    case "center":
      components.push(generateYAxisLabel(axisLabelPosX, (yMin + yMax) / 2, "uniform", "up", axis, chart));
      break;
    default:
      return exhaustiveCheck(chart.labelLayout);
  }

  return AI.createGroup("YAxisRight", components);
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

  const xAxis = chart.chartStack.xAxis === "top" ? chart.xAxisTop : chart.xAxisBottom;
  const yAxis = chart.chartStack.yAxis === "right" ? chart.yAxisRight : chart.yAxisLeft;

  const xPoints = chart.chartStack.points.map((stackPoints) => {
    let sumY = 0;
    const points = stackPoints.ys.map((y) => {
      sumY += y;
      return Axis.transformPoint(AI.createPoint(stackPoints.x, sumY), xMin, xMax, yMin, yMax, xAxis, yAxis);
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
    Axis.transformPoint(AI.createPoint(stackPoint.x, 0), xMin, xMax, yMin, yMax, xAxis, yAxis)
  );
  lines.forEach((line, index) => {
    const config = chart.chartStack.config[index];
    if (!config) {
      throw new Error("Missing config for series " + index);
    }
    const color = config.color;
    const points = [...line, ...lastLine.slice().reverse()];
    lastLine = line;
    polygons.push(AI.createPolygon(points, color, 0, color));
  });

  return AI.createGroup("Stack", polygons);
}

export function generateLines(xMin: number, xMax: number, yMin: number, yMax: number, chart: Chart): AI.Component {
  const lines = chart.chartLines.map((l: ChartLine) => {
    if (l.points.length < 2) {
      return AI.createGroup(l.label, []);
    }
    const xAxis = l.xAxis === "top" ? chart.xAxisTop : chart.xAxisBottom;
    const yAxis = l.yAxis === "right" ? chart.yAxisRight : chart.yAxisLeft;
    const points = l.points.map((p) => Axis.transformPoint(p, xMin, xMax, yMin, yMax, xAxis, yAxis));
    return AI.createGroup(l.label, [
      AI.createPolyLine(points, l.color, l.thickness),
      AI.createText(
        points.at(-1)!,
        l.label,
        chart.font,
        l.fontSize ?? chart.fontSize,
        l.labelColor ?? AI.black,
        "normal",
        0,
        "center",
        "right",
        "down",
        0,
        l.labelColor ?? AI.black,
        false
      ),
    ]);
  });
  return AI.createGroup("Lines", lines);
}

export function generatePoints(xMin: number, xMax: number, yMin: number, yMax: number, chart: Chart): AI.Component {
  const points = chart.chartPoints.map((p) => {
    const xAxis = p.xAxis === "top" ? chart.xAxisTop : chart.xAxisBottom;
    const yAxis = p.yAxis === "right" ? chart.yAxisRight : chart.yAxisLeft;
    const position = Axis.transformPoint(p.position, xMin, xMax, yMin, yMax, xAxis, yAxis);
    const shape = generatePointShape(p, position);
    return AI.createGroup(p.label, [
      shape,
      AI.createText(
        position,
        p.label,
        chart.font,
        p.fontSize ?? chart.fontSize,
        p.labelColor ?? AI.black,
        "normal",
        0,
        "center",
        "right",
        "down",
        0,
        p.labelColor ?? AI.black,
        false
      ),
    ]);
  });
  return AI.createGroup("Points", points);
}

function generatePointShape(p: ChartPoint, position: AI.Point): AI.Component {
  const halfWidth = p.size.width * 0.5;
  const halfHeight = p.size.height * 0.5;
  if (p.shape === "triangle") {
    const trianglePoints = [
      AI.createPoint(position.x, position.y + halfHeight),
      AI.createPoint(position.x - halfWidth, position.y - halfHeight),
      AI.createPoint(position.x + halfWidth, position.y - halfHeight),
    ];
    return AI.createPolygon(trianglePoints, p.outline, 1, p.color);
  } else if (p.shape === "square") {
    const topLeft = AI.createPoint(position.x - halfWidth, position.y - halfHeight);
    const bottomRight = AI.createPoint(position.x + halfWidth, position.y + halfHeight);
    return AI.createRectangle(topLeft, bottomRight, p.outline, 1, p.color);
  } else {
    const topLeft = AI.createPoint(position.x - halfWidth, position.y - halfHeight);
    const bottomRight = AI.createPoint(position.x + halfWidth, position.y + halfHeight);
    return AI.createEllipse(topLeft, bottomRight, p.outline, 1, p.color);
  }
}

export function generateXAxisGridLines(
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
  xTicks: ReadonlyArray<Axis.DiscreteAxisPoint>,
  xAxis: Axis.Axis,
  grid: { readonly color: AI.Color; readonly thickness: number }
): AI.Component {
  const xLines = xTicks.map((l) => {
    const x = Axis.transformValue(l.value, xMin, xMax, xAxis);
    const start = AI.createPoint(x, yMin);
    const end = AI.createPoint(x, yMax);
    return AI.createLine(start, end, grid.color, grid.thickness);
  });

  return AI.createGroup("Lines", xLines);
}

export function generateXAxisLabels(
  xMin: number,
  xMax: number,
  y: number,
  growVertical: AI.GrowthDirection,
  ticks: ReadonlyArray<Axis.DiscreteAxisPoint>,
  axis: Axis.Axis,
  chart: Chart
): AI.Component {
  const xLabels = ticks.map((l) => {
    const position = AI.createPoint(Axis.transformValue(l.value, xMin, xMax, axis), y);
    return AI.createText(
      position,
      l.label ?? formatNumber(l.value),
      chart.font,
      axis.tickFontSize ?? chart.fontSize,
      axis.labelColor ?? AI.black,
      "normal",
      axis.labelRotation ?? 0,
      "center",
      "uniform",
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
  axis: Axis.Axis,
  chart: Chart
): AI.Component {
  const position = AI.createPoint(x, y);
  return AI.createText(
    position,
    axis.label,
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
  grid: { readonly color: AI.Color; readonly thickness: number }
): AI.Component {
  const yLines = yTicks.map((l) => {
    const y = Axis.transformValue(l.value, yMin, yMax, yAxis);
    const start = AI.createPoint(xMin, y);
    const end = AI.createPoint(xMax, y);
    return AI.createLine(start, end, grid.color, grid.thickness);
  });
  return AI.createGroup("Lines", yLines);
}

export function generateYAxisLabels(
  x: number,
  yMin: number,
  yMax: number,
  growHorizontal: AI.GrowthDirection,
  yTicks: ReadonlyArray<Axis.DiscreteAxisPoint>,
  yAxis: Axis.Axis,
  chart: Chart
): AI.Component {
  const yLabels = yTicks.map((l) => {
    const position = AI.createPoint(x, Axis.transformValue(l.value, yMin, yMax, yAxis));
    return AI.createText(
      position,
      l.label ?? formatNumber(l.value),
      chart.font,
      yAxis.tickFontSize ?? chart.fontSize,
      yAxis.labelColor ?? AI.black,
      "normal",
      yAxis.labelRotation ?? 0,
      "center",
      growHorizontal,
      "uniform",
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
  horizontalGrowthDirection: AI.GrowthDirection,
  verticalGrowthDirection: AI.GrowthDirection,
  axis: Axis.Axis,
  chart: Chart
): AI.Component {
  const position = AI.createPoint(x, y);
  return AI.createText(
    position,
    axis.label,
    chart.font,
    axis.axisFontSize ?? chart.fontSize,
    axis.labelColor ?? AI.black,
    "normal",
    -90,
    "center",
    horizontalGrowthDirection,
    verticalGrowthDirection,
    0,
    axis.labelColor ?? AI.black,
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
