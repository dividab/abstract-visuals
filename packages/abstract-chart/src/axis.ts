import * as AbstractImage from "abstract-image";
import { exhaustiveCheck } from "ts-exhaustive-check";

export type Axis = LinearAxis | LogarithmicAxis | DiscreteAxis;

export interface LinearAxis {
  readonly type: "linear";
  readonly min: number;
  readonly max: number;
  readonly label: string;
  readonly labelRotation?: number;
}

export function createLinearAxis(min: number, max: number, label: string, labelRotation?: number): LinearAxis {
  return { type: "linear", min, max, label, labelRotation };
}

export interface LogarithmicAxis {
  readonly type: "logarithmic";
  readonly min: number;
  readonly max: number;
  readonly label: string;
  readonly labelRotation?: number;
}

export function createLogarithmicAxis(
  min: number,
  max: number,
  label: string,
  labelRotation?: number
): LogarithmicAxis {
  return { type: "logarithmic", min, max, label, labelRotation };
}

export interface DiscreteAxis {
  readonly type: "discrete";
  readonly points: ReadonlyArray<DiscreteAxisPoint>;
  readonly label: string;
  readonly labelRotation?: number;
}

export interface DiscreteAxisPoint {
  readonly value: number;
  readonly label?: string;
}

export function createDiscreteAxis(
  points: ReadonlyArray<DiscreteAxisPoint>,
  label: string,
  labelRotation?: number
): DiscreteAxis {
  return { type: "discrete", points, label, labelRotation };
}

const linearMultiples = [1, 2, 5];
const linearPowers = [-2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

export function getTicks(desiredTicks: number, axis: Axis): ReadonlyArray<DiscreteAxisPoint> {
  switch (axis.type) {
    case "linear":
      return getLinearTicks(desiredTicks, axis.min, axis.max);
    case "logarithmic":
      return getLogarithmicTicks(desiredTicks, axis.min, axis.max);
    case "discrete":
      return axis.points;
    default:
      exhaustiveCheck(axis);
      return [];
  }
}

interface Alternative {
  readonly min: number;
  readonly step: number;
  readonly ticks: number;
}

export function getLinearTicks(desiredTicks: number, min: number, max: number): ReadonlyArray<DiscreteAxisPoint> {
  let best: Alternative | undefined;
  for (const power of linearPowers) {
    const base = Math.pow(10, power);
    for (const multiple of linearMultiples) {
      const step = base * multiple;
      const cMin = Math.ceil(min / step);
      const cMax = Math.floor(max / step);
      const ticks = cMax - cMin + 1;

      if (!best || Math.abs(best.ticks - desiredTicks) > Math.abs(ticks - desiredTicks)) {
        best = { min: cMin * step, step: step, ticks: ticks };
      }
    }
  }

  return best ? range(0, best.ticks).map((l) => ({ value: best.min + best.step * l })) : [];
}

const logarithmicAlternatives = [
  [0],
  [0, 5],
  [0, 1, 2, 5],
  [0, 1, 2, 3, 5],
  [0, 1, 2, 3, 5, 8],
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
];

export function getLogarithmicTicks(desiredTicks: number, min: number, max: number): ReadonlyArray<DiscreteAxisPoint> {
  const minPow = Math.floor(Math.log10(min)) - 1;
  const maxPow = Math.ceil(Math.log10(max)) + 1;
  const powers = range(0, maxPow - minPow + 1).map((p) => minPow + p);
  const alternatives = logarithmicAlternatives.map((stepAlt) => {
    const altLines = powers.reduce((lines: Array<DiscreteAxisPoint>, power: number) => {
      const base = Math.pow(10, power);
      const powerLines = stepAlt.map((i) => ({ value: i * base }));
      return lines.concat(powerLines);
    }, []);
    return altLines.filter((l) => l.value >= min && l.value <= max);
  });
  return alternatives.reduce((prev, alt) =>
    Math.abs(alt.length - desiredTicks) < Math.abs(prev.length - desiredTicks) ? alt : prev
  );
}

export function transformPoint(
  point: AbstractImage.Point,
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
  xAxis: Axis | undefined,
  yAxis: Axis | undefined
): AbstractImage.Point {
  const x = transformValue(point.x, xMin, xMax, xAxis);
  const y = transformValue(point.y, yMin, yMax, yAxis);
  return AbstractImage.createPoint(x, y);
}

export function transformValue(value: number, min: number, max: number, axis: Axis | undefined): number {
  if (!axis) {
    return value;
  }
  const range = max - min;
  switch (axis.type) {
    case "linear":
      return min + range * linearTransform(value, axisMin(axis), axisMax(axis));
    case "logarithmic":
      return min + range * logarithmicTransform(value, axisMin(axis), axisMax(axis));
    case "discrete":
      return min + range * linearTransform(value, axisMin(axis), axisMax(axis));
    default:
      exhaustiveCheck(axis);
      return 0;
  }
}

export function inverseTransformValue(value: number, min: number, max: number, axis: Axis | undefined): number {
  if (!axis) {
    return value;
  }
  const range = max - min;
  switch (axis.type) {
    case "linear":
      return inverseLinearTransform((value - min) / range, axisMin(axis), axisMax(axis));
    case "logarithmic":
      return inverseLogarithmicTransform((value - min) / range, axisMin(axis), axisMax(axis));
    case "discrete":
      return inverseLinearTransform((value - min) / range, axisMin(axis), axisMax(axis));
    default:
      exhaustiveCheck(axis);
      return 0;
  }
}

export function axisMin(axis: Axis): number {
  switch (axis.type) {
    case "linear":
    case "logarithmic":
      return axis.min;
    case "discrete":
      return axis.points[0]?.value ?? 0;
    default:
      exhaustiveCheck(axis);
      return 0;
  }
}

export function axisMax(axis: Axis): number {
  switch (axis.type) {
    case "linear":
    case "logarithmic":
      return axis.max;
    case "discrete":
      return axis.points.at(-1)?.value ?? 0;
    default:
      exhaustiveCheck(axis);
      return 0;
  }
}

export function linearTransform(value: number, min: number, max: number): number {
  return (value - min) / (max - min);
}

export function logarithmicTransform(value: number, min: number, max: number): number {
  if (value > 0) {
    return (Math.log10(value) - Math.log10(min)) / (Math.log10(max) - Math.log10(min));
  } else if (value < 0) {
    return 0.0;
  } else {
    return 0.0;
  }
}

export function inverseLinearTransform(value: number, min: number, max: number): number {
  return min + value * (max - min);
}

export function inverseLogarithmicTransform(value: number, min: number, max: number): number {
  return Math.pow(10, value * (Math.log10(max) - Math.log10(min)) + Math.log10(min));
}

function range(from: number, to: number): ReadonlyArray<number> {
  const result: Array<number> = [];
  for (let i = from; i < to; ++i) {
    result.push(i);
  }
  return result;
}
