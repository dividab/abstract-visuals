import type React from "react";
import type {
  Group as GroupComponent,
  BinaryImage as BinaryImageComponent,
  Ellipse as EllipseComponent,
  Line as LineComponent,
  PolyLine as PolyLineComponent,
  Polygon as PolygonComponent,
  Rectangle as RectangleComponent,
  Text as TextComponent,
  SubImage as SubImageComponent,
} from "../model/component.js";
import {
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
  createEllipse(props.topLeft, props.bottomRight, props.strokeColor, props.strokeThickness, props.fillColor, props.id, props.strokeDashStyle);
export const Line = (props: LineComponent): LineComponent =>
  createLine(props.start, props.end, props.strokeColor, props.strokeThickness, props.id, props.strokeDashStyle);
export const PolyLine = (props: PolyLineComponent): PolyLineComponent =>
  createPolyLine(props.points, props.strokeColor, props.strokeThickness, props.id, props.strokeDashStyle);
export const Polygon = (props: PolygonComponent): PolygonComponent =>
  createPolygon(props.points, props.strokeColor, props.strokeThickness, props.fillColor, props.id, props.strokeDashStyle);
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
export const SubImage = (props: SubImageComponent): SubImageComponent => createSubImage(props.topLeft, props.size, props.image);

// Shape actually accessed when walking the fake element tree at runtime; `type`'s props param and
// `props` itself are a genuinely arbitrary bag of component props, not a fixed structural type.
interface FakeElement {
  readonly type: string | ((props: Record<string, unknown>) => unknown);
  readonly props?: { readonly type?: unknown; readonly children?: unknown; readonly [key: string]: unknown };
}

export function render(element: unknown): unknown {
  const el = element as FakeElement;
  if (typeof el.type !== "function") {
    return el;
  }
  const props = el.props ?? {};
  const children = renderChildren(el);
  return el.type({ ...props, children });
}

function renderChildren(element: FakeElement): Array<unknown> {
  if (!element.props?.children) {
    return [];
  }

  if (element.props.type === "group") {
    const children = element.props.children;
    if (Array.isArray(children)) {
      return children.flatMap((c: unknown) => {
        if (!c) {
          return [];
        }
        if (Array.isArray(c)) {
          return c.map(render);
        }
        return render(c);
      });
    } else {
      const elements = render(children);
      return Array.isArray(elements) ? elements : [elements];
    }
  }

  return [];
}
