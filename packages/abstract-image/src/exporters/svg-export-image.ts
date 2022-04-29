import * as AbstractImage from "../model/index";

export function createSVG(image: AbstractImage.AbstractImage, pixelWidth?: number, pixelHeight?: number): string {
  const imageElements = image.components.map((c: AbstractImage.Component) => abstractComponentToSVG(c));

  return createElement(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      width: `${pixelWidth || image.size.width}px`,
      height: `${pixelHeight || image.size.height}px`,
      viewBox: [0, 0, image.size.width, image.size.height].join(" "),
    },
    imageElements
  );
}

function abstractComponentToSVG(component: AbstractImage.Component): string {
  switch (component.type) {
    case "group":
      return createElement(
        "g",
        {
          name: component.name,
        },
        component.children.map((c) => abstractComponentToSVG(c))
      );
    case "binaryimage":
      switch (component.format) {
        case "svg":
          const svg = component.data
            .reduce((a, b) => a + String.fromCharCode(b), "")
            .replace('<?xml version="1.0" encoding="utf-8"?>', "");
          return createElement(
            "image",
            {
              x: component.topLeft.x.toString(),
              y: component.topLeft.y.toString(),
              width: (component.bottomRight.x - component.topLeft.x).toString(),
              height: (component.bottomRight.y - component.topLeft.y).toString(),
              href: `data:image/svg+xml;utf8,${svg}`,
            },
            []
          );
        default:
          return "";
      }
    case "subimage":
      return "";
    case "line":
      return createElement(
        "line",
        {
          x1: component.start.x.toString(),
          y1: component.start.y.toString(),
          x2: component.end.x.toString(),
          y2: component.end.y.toString(),
          stroke: colorToRgb(component.strokeColor),
          strokeOpacity: colorToOpacity(component.strokeColor),
          strokeWidth: component.strokeThickness.toString(),
        },
        []
      );
    case "polyline":
      return createElement(
        "polyline",
        {
          fill: "none",
          points: component.points.map((p) => p.x.toString() + "," + p.y.toString()).join(" "),
          stroke: colorToRgb(component.strokeColor),
          strokeOpacity: colorToOpacity(component.strokeColor),
          strokeWidth: component.strokeThickness.toString(),
        },
        []
      );
    case "text":
      if (!component.text) {
        return "";
      }
      const lineHeight = component.fontSize;

      const shadowStyle = {
        textAnchor: getTextAnchor(component.horizontalGrowthDirection),
        fontSize: component.fontSize.toString() + "px",
        fontWeight: component.fontWeight,
        fontFamily: component.fontFamily,
        stroke: colorToRgb(component.strokeColor),
        strokeOpacity: colorToOpacity(component.strokeColor),
        strokeWidth: component.strokeThickness.toString() + "px",
      };

      const style = {
        textAnchor: getTextAnchor(component.horizontalGrowthDirection),
        fontSize: component.fontSize.toString() + "px",
        fontWeight: component.fontWeight,
        fontFamily: component.fontFamily,
        fill: colorToRgb(component.textColor),
        fillOpacity: colorToOpacity(component.textColor),
      };

      const dy = getBaselineAdjustment(component.verticalGrowthDirection);

      const transform =
        "rotate(" +
        component.clockwiseRotationDegrees.toString() +
        " " +
        component.position.x.toString() +
        " " +
        component.position.y.toString() +
        ")";

      const lines: Array<string> = component.text !== null ? component.text.split("\n") : [];

      const tSpans = lines.map((t) =>
        createElement(
          "tspan",
          {
            x: component.position.x.toString(),
            y: (component.position.y + (lines.indexOf(t) + dy) * lineHeight).toString(),
            height: lineHeight.toString() + "px",
          },
          [
            t
              .replace("<sub>", `<tspan style="font-size: ${component.fontSize * 0.8}px" baseline-shift="sub">`)
              .replace("</sub>", "</tspan>"),
          ]
        )
      );

      const cs: Array<string> = [];

      if (component.strokeThickness > 0 && component.strokeColor !== null) {
        cs.push(
          createElement(
            "text",
            {
              style: objectToAttributeValue(shadowStyle),
              transform: transform,
            },
            tSpans
          )
        );
      }
      cs.push(
        createElement(
          "text",
          {
            style: objectToAttributeValue(style),
            transform: transform,
          },
          tSpans
        )
      );
      return cs.join();
    case "ellipse":
      const rx = Math.abs(component.bottomRight.x - component.topLeft.x) * 0.5;
      const ry = Math.abs(component.bottomRight.y - component.topLeft.y) * 0.5;
      const cx = (component.bottomRight.x + component.topLeft.x) * 0.5;
      const cy = (component.bottomRight.y + component.topLeft.y) * 0.5;
      return createElement(
        "ellipse",
        {
          cx: cx.toString(),
          cy: cy.toString(),
          rx: rx.toString(),
          ry: ry.toString(),
          stroke: colorToRgb(component.strokeColor),
          strokeOpacity: colorToOpacity(component.strokeColor),
          strokeWidth: component.strokeThickness.toString(),
          fill: colorToRgb(component.fillColor),
          fillOpacity: colorToOpacity(component.fillColor),
        },
        []
      );
    case "polygon":
      return createElement(
        "polygon",
        {
          points: component.points.map((p) => p.x.toString() + "," + p.y.toString()).join(" "),
          stroke: colorToRgb(component.strokeColor),
          strokeOpacity: colorToOpacity(component.strokeColor),
          strokeWidth: component.strokeThickness.toString(),
          fill: colorToRgb(component.fillColor),
          fillOpacity: colorToOpacity(component.fillColor),
        },
        []
      );
    case "rectangle":
      return createElement(
        "rect",
        {
          x: component.topLeft.x.toString(),
          y: component.topLeft.y.toString(),
          width: Math.abs(component.bottomRight.x - component.topLeft.x).toString(),
          height: Math.abs(component.bottomRight.y - component.topLeft.y).toString(),
          stroke: colorToRgb(component.strokeColor),
          strokeOpacity: colorToOpacity(component.strokeColor),
          strokeWidth: component.strokeThickness.toString(),
          fill: colorToRgb(component.fillColor),
          fillOpacity: colorToOpacity(component.fillColor),
        },
        []
      );
    default:
      return "";
  }
}

interface Attributes {
  readonly [key: string]: string;
}

function createElement(elementName: string, attributes: Attributes, innerElements: string[]): string {
  const formattedName = convertUpperToHyphenLower(elementName);
  let element = `<${formattedName}`;

  if (Object.keys(attributes).length > 0) {
    element = Object.keys(attributes).reduce((previousValue: string, currentValue: string) => {
      if (attributes[currentValue]) {
        return previousValue + ` ${convertUpperToHyphenLower(currentValue)}="${attributes[currentValue]}"`;
      } else {
        return previousValue;
      }
    }, element);
  }

  element += ">";

  if (innerElements.length > 0) {
    element = innerElements.reduce((previousValue: string, currentValue: string) => {
      if (!currentValue || currentValue.length < 1) {
        return previousValue;
      } else {
        return previousValue + `${currentValue}`;
      }
    }, element);
  }

  element += `</${formattedName}>`;

  return element;
}

function objectToAttributeValue(attributes: Attributes): string {
  if (attributes && Object.keys(attributes).length > 0) {
    return Object.keys(attributes).reduce((previousValue: string, currentValue: string) => {
      if (attributes[currentValue]) {
        return previousValue + `${convertUpperToHyphenLower(currentValue)}:${attributes[currentValue]};`;
      } else {
        return previousValue;
      }
    }, "");
  }

  return "";
}

function convertUpperToHyphenLower(elementName: string): string {
  function upperToHyphenLower(match: string): string {
    return "-" + match.toLowerCase();
  }

  return elementName !== "viewBox" ? elementName.replace(/[A-Z]/g, upperToHyphenLower) : elementName;
}

function getBaselineAdjustment(d: AbstractImage.GrowthDirection): number {
  if (d === "up") {
    return 0.0;
  }
  if (d === "uniform") {
    return 0.5;
  }
  if (d === "down") {
    return 1.0;
  }
  throw "Unknown text alignment " + d;
}

function getTextAnchor(d: AbstractImage.GrowthDirection): string {
  if (d === "left") {
    return "end";
  }
  if (d === "uniform") {
    return "middle";
  }
  if (d === "right") {
    return "start";
  }
  throw "Unknown text alignment " + d;
}

function colorToRgb(color: AbstractImage.Color): string {
  return `rgb(${color.r.toString()}, ${color.g.toString()}, ${color.b.toString()})`;
}

function colorToOpacity(color: AbstractImage.Color): string {
  return (color.a / 255).toString();
}
