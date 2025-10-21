import React from "react";

import {
  Group as GroupComponent,
  BinaryImage as BinaryImageComponent,
  Ellipse as EllipseComponent,
  Line as LineComponent,
  PolyLine as PolyLineComponent,
  Polygon as PolygonComponent,
  Rectangle as RectangleComponent,
  Text as TextComponent,
  SubImage as SubImageComponent,
  createGroup,
  createBinaryImage,
  createEllipse,
  createLine,
  createPolyLine,
  createPolygon,
  createRectangle,
  createText,
  createSubImage,
} from "../model/component.js";

export interface ChildrenProp {
  readonly children?: Child;
}
export type Child = React.JSX.Element | Children;
export interface Children extends ReadonlyArray<Child> {}

export const Group = (props: GroupComponent): GroupComponent => createGroup(props.name, props.children);
export const BinaryImage = (props: BinaryImageComponent): BinaryImageComponent =>
  createBinaryImage(props.topLeft, props.bottomRight, props.format, props.data, props.id);
export const Ellipse = (props: EllipseComponent): EllipseComponent =>
  createEllipse(
    props.topLeft,
    props.bottomRight,
    props.strokeColor,
    props.strokeThickness,
    props.fillColor,
    props.id,
    props.strokeDashStyle
  );
export const Line = (props: LineComponent): LineComponent =>
  createLine(props.start, props.end, props.strokeColor, props.strokeThickness, props.id, props.strokeDashStyle);
export const PolyLine = (props: PolyLineComponent): PolyLineComponent =>
  createPolyLine(props.points, props.strokeColor, props.strokeThickness, props.id, props.strokeDashStyle);
export const Polygon = (props: PolygonComponent): PolygonComponent =>
  createPolygon(
    props.points,
    props.strokeColor,
    props.strokeThickness,
    props.fillColor,
    props.id,
    props.strokeDashStyle
  );
export const Rectangle = (props: RectangleComponent): RectangleComponent =>
  createRectangle(
    props.topLeft,
    props.bottomRight,
    props.strokeColor,
    props.strokeThickness,
    props.fillColor,
    props.id,
    props.strokeDashStyle,
    props.radius
  );
export const Text = (props: TextComponent): TextComponent =>
  createText(
    props.position,
    props.text,
    props.fontFamily,
    props.fontSize,
    props.textColor,
    props.fontWeight,
    props.clockwiseRotationDegrees,
    props.textAlignment,
    props.horizontalGrowthDirection,
    props.verticalGrowthDirection,
    props.strokeThickness,
    props.strokeColor,
    props.italic,
    props.id
  );
export const SubImage = (props: SubImageComponent): SubImageComponent => createSubImage(props.topLeft, props.image);

export function render(element: any): any {
  if (typeof element.type !== "function") {
    return element;
  }
  const props = element.props || {};
  const children = renderChildren(element);
  return (element.type as any)({ ...props, children });
}

function renderChildren(element: React.ReactElement<any>): any {
  if (!element.props || !element.props.children) {
    return [];
  }

  if (element.props.type === "group") {
    const children = element.props.children;
    if (Array.isArray(children)) {
      return children.flatMap((c: any) => {
        if (!c) return [];
        if (Array.isArray(c)) return c.map(render);
        return render(c);
      });
    } else {
      const elements = render(children);
      return Array.isArray(elements) ? elements : [elements];
    }
  }

  return [];
}
