import {
  AbstractFontWeight,
  AbstractImage,
  BinaryImage,
  black,
  createBinaryImage,
  createEllipse,
  createGroup,
  createLine,
  createPolygon,
  createPolyLine,
  createRectangle,
  createText,
  Ellipse,
  fromString2,
  Group,
  Line,
  Point,
  Polygon,
  PolyLine,
  Rectangle,
  solidLine,
  Text,
  transparent,
  white,
} from "../model";

export const createComponents = (mutableImageUrls: Array<string>): Record<string, (...args: any[]) => any> => ({
  AbstractImage: (props): AbstractImage => ({
    topLeft: { x: 0, y: 0 },
    size: { width: props.width ?? 800, height: props.height ?? 600 },
    backgroundColor: transparent,
    components: (props.children ?? []).flat().filter(Boolean),
  }),
  Group: (props): Group => {
    return createGroup("", (props.children ?? []).flat().filter(Boolean));
  },
  Image: (props): BinaryImage => {
    mutableImageUrls.push(props.src);
    const x = props.x ?? 0;
    const y = props.y ?? 0;
    const width = props.width ?? 100;
    const height = props.height ?? 100;
    return createBinaryImage(
      { x, y },
      { x: x + width, y: y + height },
      "png",
      { type: "url", url: props.src },
      undefined
    );
  },
  Rectangle: (props): Rectangle => {
    const x = props.x ?? 0;
    const y = props.y ?? 0;
    const width = props.width ?? 100;
    const height = props.height ?? 100;
    return createRectangle(
      { x, y },
      { x: x + width, y: y + height },
      fromString2(props.stroke ?? "#000", black),
      props.strokeWidth ?? 1,
      fromString2(props.fill ?? "#fff", white),
      undefined,
      solidLine,
      props.radius ? { x: props.radius, y: props.radius } : undefined
    );
  },
  Ellipse: (props): Ellipse => {
    const x = props.x ?? 0;
    const y = props.y ?? 0;
    const width = props.width ?? 100;
    const height = props.height ?? 100;
    return createEllipse(
      { x, y },
      { x: x + width, y: y + height },
      fromString2(props.stroke ?? "#000", black),
      props.strokeWidth ?? 1,
      fromString2(props.fill ?? "#fff", white),
      undefined,
      solidLine
    );
  },
  Line: (props): Line => {
    return createLine(
      { x: props.x1 ?? 0, y: props.y1 ?? 0 },
      { x: props.x2 ?? 100, y: props.y2 ?? 0 },
      fromString2(props.stroke ?? "#000", black),
      props.strokeWidth ?? 1,
      undefined,
      solidLine
    );
  },
  Polyline: (props): PolyLine => {
    return createPolyLine(
      parsePointsString(props.points),
      fromString2(props.stroke ?? "#000", black),
      props.strokeWidth ?? 1,
      undefined,
      solidLine
    );
  },
  Polygon: (props): Polygon => {
    return createPolygon(
      parsePointsString(props.points),
      fromString2(props.stroke ?? "#000", black),
      props.strokeWidth ?? 1,
      fromString2(props.fill ?? "#fff", white),
      undefined,
      solidLine
    );
  },
  Text: (props): Text => {
    const fontWeight = mapFontWeight(props.fontWeight);
    const children = props.children ?? [];
    const filteredChildren = Array.isArray(children)
      ? children.flat().filter((c: any) => c !== null && c !== undefined)
      : [];
    const text = filteredChildren.length > 0 ? String(filteredChildren[0]) : "";
    return createText(
      { x: props.x ?? 0, y: props.y ?? 0 },
      text,
      props.fontFamily ?? "",
      props.fontSize ?? 12,
      fromString2(props.fill ?? "#000", black),
      fontWeight,
      0, // clockwiseRotationDegrees
      "left", // textAlignment
      "right", // horizontalGrowthDirection
      "down", // verticalGrowthDirection
      0, // strokeThickness
      transparent, // strokeColor
      false, // italic
      undefined // id
    );
  },
});

function mapFontWeight(weight?: string | number): AbstractFontWeight {
  if (weight === undefined) {
    return "normal";
  }

  if (typeof weight === "string") {
    switch (weight.toLowerCase()) {
      case "bold":
      case "bolder":
        return "bold";
      case "lighter":
      case "normal":
      default:
        return "normal";
    }
  }

  return weight >= 600 ? "bold" : "normal";
}

function parsePointsString(pointsString: string): Array<Point> {
  return pointsString.split(" ").map((tuple): Point => {
    const [xString, yString] = tuple.split(",");
    return { x: Number(xString ?? 0), y: Number(yString ?? 0) };
  });
}
