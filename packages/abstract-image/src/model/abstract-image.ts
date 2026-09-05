import type { Size } from "./size.js";
import type { Color } from "./color.js";
import type { Component } from "./component.js";
import type { Point } from "./point.js";

export interface AbstractImage {
  readonly topLeft: Point;
  readonly size: Size;
  readonly backgroundColor: Color;
  readonly components: Array<Component>;
}

export function createAbstractImage(
  topLeft: Point,
  size: Size,
  backgroundColor: Color,
  components: Array<Component>
): AbstractImage {
  return {
    topLeft: topLeft,
    size: size,
    backgroundColor: backgroundColor,
    components: components,
  };
}
