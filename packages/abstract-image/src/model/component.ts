import * as Point from "./point";
import * as Color from "./color";
import * as DashStyle from "./dash-style";
import * as AbstractImage from "./abstract-image";

export type Component = BinaryImage | Ellipse | Line | PolyLine | Polygon | Rectangle | Text | SubImage | Group;

export interface Group {
  readonly type: "group";
  readonly name: string;
  readonly children: Array<Component>;
}

export function createGroup(name: string, children: Array<Component>): Group {
  return {
    type: "group",
    name: name,
    children: children,
  };
}

/**
 * Embed a foreign binary image in any suported format.
 */

export type BinaryFormat = "svg" | "png";

export interface BinaryImage {
  readonly type: "binaryimage";
  readonly topLeft: Point.Point;
  readonly bottomRight: Point.Point;
  readonly format: BinaryFormat;
  readonly data: ImageData;
  readonly id: string | undefined;
}

export type ImageData = ImageBytes | ImageUrl;

export interface ImageBytes {
  readonly type: "bytes";
  readonly bytes: Uint8Array;
}

export interface ImageUrl {
  readonly type: "url";
  readonly url: string;
}

export function createBinaryImage(
  topLeft: Point.Point,
  bottomRight: Point.Point,
  format: BinaryFormat,
  data: ImageData,
  id?: string
): BinaryImage {
  return {
    type: "binaryimage",
    topLeft: topLeft,
    bottomRight: bottomRight,
    format: format,
    data: data,
    id: id,
  };
}

export interface Ellipse {
  readonly type: "ellipse";
  readonly topLeft: Point.Point;
  readonly bottomRight: Point.Point;
  readonly strokeColor: Color.Color;
  readonly strokeThickness: number;
  readonly strokeDashStyle: DashStyle.DashStyle;
  readonly fillColor: Color.Color;
  readonly id: string | undefined;
}

export function createEllipse(
  topLeft: Point.Point,
  bottomRight: Point.Point,
  strokeColor: Color.Color,
  strokeThickness: number,
  fillColor: Color.Color,
  id?: string,
  strokeDashStyle: DashStyle.DashStyle = DashStyle.solidLine
): Ellipse {
  return {
    type: "ellipse",
    topLeft: topLeft,
    bottomRight: bottomRight,
    strokeColor: strokeColor,
    strokeThickness: strokeThickness,
    strokeDashStyle: strokeDashStyle,
    fillColor: fillColor,
    id: id,
  };
}

export interface Line {
  readonly type: "line";
  readonly start: Point.Point;
  readonly end: Point.Point;
  readonly strokeColor: Color.Color;
  readonly strokeThickness: number;
  readonly strokeDashStyle: DashStyle.DashStyle;
  readonly id: string | undefined;
}

export function createLine(
  start: Point.Point,
  end: Point.Point,
  strokeColor: Color.Color,
  strokeThickness: number,
  id?: string,
  strokeDashStyle: DashStyle.DashStyle = DashStyle.solidLine
): Line {
  return {
    type: "line",
    start: start,
    end: end,
    strokeColor: strokeColor,
    strokeThickness: strokeThickness,
    strokeDashStyle: strokeDashStyle,
    id: id,
  };
}

export interface PolyLine {
  readonly type: "polyline";
  readonly points: Array<Point.Point>;
  readonly strokeColor: Color.Color;
  readonly strokeThickness: number;
  readonly strokeDashStyle: DashStyle.DashStyle;
  readonly id: string | undefined;
}

export function createPolyLine(
  points: Array<Point.Point>,
  strokeColor: Color.Color,
  strokeThickness: number,
  id?: string,
  strokeDashStyle: DashStyle.DashStyle = DashStyle.solidLine
): PolyLine {
  return {
    type: "polyline",
    points: points,
    strokeColor: strokeColor,
    strokeThickness: strokeThickness,
    strokeDashStyle: strokeDashStyle,
    id: id,
  };
}

export interface Polygon {
  readonly type: "polygon";
  readonly points: Array<Point.Point>;
  readonly strokeColor: Color.Color;
  readonly strokeThickness: number;
  readonly strokeDashStyle: DashStyle.DashStyle;
  readonly fillColor: Color.Color;
  readonly id: string | undefined;
}

export function createPolygon(
  points: Array<Point.Point>,
  strokeColor: Color.Color,
  strokeThickness: number,
  fillColor: Color.Color,
  id?: string,
  strokeDashStyle: DashStyle.DashStyle = DashStyle.solidLine
): Polygon {
  return {
    type: "polygon",
    points: points,
    strokeColor: strokeColor,
    strokeThickness: strokeThickness,
    strokeDashStyle: strokeDashStyle,
    fillColor: fillColor,
    id: id,
  };
}

export interface Rectangle {
  readonly type: "rectangle";
  readonly topLeft: Point.Point;
  readonly bottomRight: Point.Point;
  readonly strokeColor: Color.Color;
  readonly strokeThickness: number;
  readonly strokeDashStyle: DashStyle.DashStyle;
  readonly fillColor: Color.Color;
  readonly id: string | undefined;
  readonly radius?: Point.Point;
}

export function createRectangle(
  topLeft: Point.Point,
  bottomRight: Point.Point,
  strokeColor: Color.Color,
  strokeThickness: number,
  fillColor: Color.Color,
  id?: string,
  strokeDashStyle: DashStyle.DashStyle = DashStyle.solidLine,
  radius?: Point.Point
): Rectangle {
  return {
    type: "rectangle",
    topLeft: topLeft,
    bottomRight: bottomRight,
    strokeColor: strokeColor,
    strokeThickness: strokeThickness,
    strokeDashStyle: strokeDashStyle,
    fillColor: fillColor,
    id: id,
    radius,
  };
}

export function corners(rectangle: Rectangle): Array<Point.Point> {
  return [
    rectangle.topLeft,
    Point.createPoint(rectangle.bottomRight.x, rectangle.topLeft.y),
    rectangle.bottomRight,
    Point.createPoint(rectangle.topLeft.x, rectangle.bottomRight.y),
  ];
}

export type AbstractFontWeight = "light" | "normal" | "mediumBold" | "bold" | "extraBold";

export type TextAlignment = "left" | "center" | "right";

export type GrowthDirection = "up" | "down" | "uniform" | "left" | "right";

export interface Text {
  readonly type: "text";
  readonly position: Point.Point;
  readonly text: string;
  readonly fontFamily: string;
  readonly fontSize: number;
  readonly textColor: Color.Color;
  readonly fontWeight: AbstractFontWeight;
  readonly clockwiseRotationDegrees: number;
  readonly textAlignment: TextAlignment;
  readonly horizontalGrowthDirection: GrowthDirection;
  readonly verticalGrowthDirection: GrowthDirection;
  readonly strokeThickness: number;
  readonly strokeColor: Color.Color;
  readonly italic: boolean;
  readonly id: string | undefined;
}

export function createText(
  position: Point.Point,
  text: string,
  fontFamily: string,
  fontSize: number,
  textColor: Color.Color,
  fontWeight: AbstractFontWeight,
  clockwiseRotationDegrees: number,
  textAlignment: TextAlignment,
  horizontalGrowthDirection: GrowthDirection,
  verticalGrowthDirection: GrowthDirection,
  strokeThickness: number,
  strokeColor: Color.Color,
  italic: boolean,
  id?: string
): Text {
  return {
    type: "text",
    position,
    text,
    fontFamily,
    fontSize,
    textColor,
    fontWeight,
    clockwiseRotationDegrees,
    textAlignment,
    horizontalGrowthDirection,
    verticalGrowthDirection,
    strokeThickness,
    strokeColor,
    italic,
    id,
  };
}

export interface SubImage {
  readonly type: "subimage";
  readonly topLeft: Point.Point;
  readonly image: Component;
}

export function createSubImage(topLeft: Point.Point, image: Component): SubImage {
  return { type: "subimage", topLeft, image };
}

export function embedAbstractImage(topLeft: Point.Point, name: string, image: AbstractImage.AbstractImage): Component {
  return createSubImage(topLeft, createGroup(name, image.components));
}
