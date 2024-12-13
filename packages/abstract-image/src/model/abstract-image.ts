import { Size } from "./size.js";
import { Color } from "./color.js";
import { Component } from "./component.js";
import { Point } from "./point.js";

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
