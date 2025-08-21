import { AbstractImage } from "../model/abstract-image.js";
import { parseHandlebarsXml, parseXsd, XmlElement } from "handlebars-xml";
import { black, fromString2, transparent, white } from "../model/color.js";
import {
  AbstractFontWeight,
  BinaryImage,
  Component,
  Ellipse,
  Group,
  GrowthDirection,
  Line,
  Polygon,
  PolyLine,
  Rectangle,
  Text,
  TextAlignment,
} from "../model/component.js";
import { Point } from "../model/point.js";
import { xsd } from "./abstract-image-xsd.js";

export const abstractImageXml = (template: string, data: any): AbstractImage =>
  abstractImageOfXml(parseHandlebarsXml(template, data, {})[0]!) as AbstractImage;

export function abstractImageOfXml(el: XmlElement): unknown {
  const children = Array<Component>();
  const childElements = Array<XmlElement>();
  for (const child of el.children ?? []) {
    if (child.tagName !== undefined) {
      children.push(abstractImageOfXml(child) as Component);
      childElements.push(child);
    }
  }

  switch (el.tagName) {
    case "AbstractImage":
      const size = parsePoint(el.attributes.size);
      return {
        topLeft: parsePoint(el.attributes.topLeft),
        size: { width: size.x, height: size.y },
        backgroundColor: fromString2(el.attributes.backgroundColor ?? "", transparent),
        components: children as Array<Component>,
      } satisfies AbstractImage;
    case "Group":
      return {
        type: "group",
        name: el.attributes.name ?? "",
        children: children,
      } satisfies Group;
    case "Image":
      return {
        type: "binaryimage",
        topLeft: parsePoint(el.attributes.topLeft),
        bottomRight: parsePoint(el.attributes.bottomRight),
        data: { type: "url", url: el.attributes.url },
        id: el.attributes.id,
        format: "png",
      } satisfies BinaryImage;
    case "Ellipse":
      return {
        type: "ellipse",
        topLeft: parsePoint(el.attributes.topLeft),
        bottomRight: parsePoint(el.attributes.bottomRight),
        fillColor: fromString2(el.attributes.fillColor ?? "", white),
        strokeColor: fromString2(el.attributes.strokeColor ?? "", black),
        id: el.attributes.id,
        strokeDashStyle: {
          dashes: parseNumberArrayString(el.attributes.strokeDashArray),
          offset: el.attributes.strokeDashOffset ? Number(el.attributes.strokeDashOffset) : 0,
        },
        strokeThickness: Number(el.attributes.strokeThickness ?? 1),
      } satisfies Ellipse;
    case "Line":
      return {
        type: "line",
        start: parsePoint(el.attributes.start),
        end: parsePoint(el.attributes.end),
        strokeColor: fromString2(el.attributes.strokeColor ?? "", black),
        id: el.attributes.id,
        strokeDashStyle: {
          dashes: parseNumberArrayString(el.attributes.strokeDashArray),
          offset: el.attributes.strokeDashOffset ? Number(el.attributes.strokeDashOffset) : 0,
        },
        strokeThickness: Number(el.attributes.strokeThickness ?? 1),
      } satisfies Line;
    case "PolyLine":
      return {
        type: "polyline",
        points: parsePointsString(el.attributes.points),
        strokeColor: fromString2(el.attributes.strokeColor ?? "", black),
        id: el.attributes.id,
        strokeDashStyle: {
          dashes: parseNumberArrayString(el.attributes.strokeDashArray),
          offset: el.attributes.strokeDashOffset ? Number(el.attributes.strokeDashOffset) : 0,
        },
        strokeThickness: Number(el.attributes.strokeThickness ?? 1),
      } satisfies PolyLine;
    case "Polygon":
      return {
        type: "polygon",
        points: parsePointsString(el.attributes.points),
        fillColor: fromString2(el.attributes.fillColor ?? "", white),
        strokeColor: fromString2(el.attributes.strokeColor ?? "", black),
        id: el.attributes.id,
        strokeDashStyle: {
          dashes: parseNumberArrayString(el.attributes.strokeDashArray),
          offset: el.attributes.strokeDashOffset ? Number(el.attributes.strokeDashOffset) : 0,
        },
        strokeThickness: Number(el.attributes.strokeThickness ?? 1),
      } satisfies Polygon;
    case "Rectangle":
      return {
        type: "rectangle",
        topLeft: parsePoint(el.attributes.topLeft),
        bottomRight: parsePoint(el.attributes.bottomRight),
        fillColor: fromString2(el.attributes.fillColor ?? "", white),
        radius: el.attributes.radius ? parsePoint(el.attributes.radius) : undefined,
        strokeColor: fromString2(el.attributes.strokeColor ?? "", black),
        id: el.attributes.id,
        strokeDashStyle: {
          dashes: parseNumberArrayString(el.attributes.strokeDashArray),
          offset: el.attributes.strokeDashOffset ? Number(el.attributes.strokeDashOffset) : 0,
        },
        strokeThickness: Number(el.attributes.strokeThickness ?? 1),
      } satisfies Rectangle;
    case "Text":
      return {
        type: "text",
        position: parsePoint(el.attributes.position),
        clockwiseRotationDegrees: el.attributes.clockwiseRotationDegrees
          ? Number(el.attributes.clockwiseRotationDegrees)
          : 0,
        textColor: fromString2(el.attributes.textColor ?? "", black),
        strokeColor: fromString2(el.attributes.strokeColor ?? "", transparent),
        text: el.attributes.text?.toString() ?? "",
        id: el.attributes.id,
        fontFamily: el.attributes.fontFamily ?? "",
        fontSize: el.attributes.fontSize ? Number(el.attributes.fontSize ?? 1) : 12,
        strokeThickness: el.attributes.strokeThickness ? Number(el.attributes.strokeThickness) : 2,
        textAlignment: (el.attributes.textAlignment as TextAlignment | undefined) ?? "center",
        verticalGrowthDirection: (el.attributes.verticalGrowthDirection as GrowthDirection | undefined) ?? "down",
        fontWeight: (el.attributes.fontWeight as AbstractFontWeight | undefined) ?? "normal",
        horizontalGrowthDirection: (el.attributes.horizontalGrowthDirection as GrowthDirection | undefined) ?? "right",
        italic: Boolean(el.attributes.italic ?? false),
      } satisfies Text;

    default:
      throw new Error(`Could not find creator for element with name ${el.tagName}`);
  }
}

export const parsedXsd = parseXsd(xsd);

function parsePoint(pointString: string | undefined): Point {
  const [xString, yString] = pointString?.split(" ") ?? [0, 0];
  const [x, y] = [Number(xString ?? 0), Number(yString ?? 0)];
  return { x: Number.isFinite(x) ? x : 0, y: Number.isFinite(y) ? y : 0 };
}

function parsePointsString(numberArrayString: string | undefined): Array<Point> {
  return (
    numberArrayString?.split(" ").map((tuple): Point => {
      const [xString, yString] = tuple.split(",");
      return { x: Number(xString ?? 0), y: Number(yString ?? 0) };
    }) ?? []
  );
}

function parseNumberArrayString(numberArrayString: string | undefined): ReadonlyArray<number> {
  return numberArrayString?.split(",").map(Number) ?? [];
}
