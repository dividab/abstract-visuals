import * as Size from "./size.js";
import * as Color from "./color.js";
import * as Component from "./component.js";
import * as Point from "./point.js";

export interface AbstractImage {
  readonly topLeft: Point.Point;
  readonly size: Size.Size;
  readonly backgroundColor: Color.Color;
  readonly components: Array<Component.Component>;
}

export function createAbstractImage(
  topLeft: Point.Point,
  size: Size.Size,
  backgroundColor: Color.Color,
  components: Array<Component.Component>
): AbstractImage {
  return {
    topLeft: topLeft,
    size: size,
    backgroundColor: backgroundColor,
    components: components,
  };
}
