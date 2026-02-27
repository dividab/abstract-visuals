import { fromByteArray } from "base64-js";
import { Component, GrowthDirection } from "../model/component.js";
import { AbstractImage } from "../model/abstract-image.js";
import { Color } from "../model/color.js";
import { Optional } from "../model/shared.js";

export const SVG_DATA_URL = "data:image/svg+xml,";

export type SvgOptions = {
  readonly pixelWidth: number;
  readonly pixelHeight: number;
  readonly imageDataByUrl: Record<string, `data:image/${string},${string}`>;
};

export function createSVG(image: AbstractImage, options?: Optional<SvgOptions>): string {
  const opts: SvgOptions = {
    imageDataByUrl: options?.imageDataByUrl ?? {},
    pixelWidth: options?.pixelWidth || image.size.width,
    pixelHeight: options?.pixelHeight || image.size.height,
  };
  const imageElements = image.components.map((c: Component) => abstractComponentToSVG(c, opts));

  return createElement(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      width: `${opts.pixelWidth}px`,
      height: `${opts.pixelHeight}px`,
      viewBox: [0, 0, image.size.width, image.size.height].join(" "),
    },
    imageElements
  );
}

function abstractComponentToSVG(component: Component, options: SvgOptions): string {
  switch (component.type) {
    case "group":
      return createElement(
        "g",
        {
          name: component.name,
        },
        component.children.map((c) => abstractComponentToSVG(c, options))
      );
    case "binaryimage": {
      const x = component.topLeft.x.toString();
      const y = component.topLeft.y.toString();
      const width = (component.bottomRight.x - component.topLeft.x).toString();
      const height = (component.bottomRight.y - component.topLeft.y).toString();

      if (component.data.type === "url") {
        const url = options.imageDataByUrl[component.data.url] ?? component.data.url;
        return createElement("image", { x, y, width, height, href: url }, []);
      } else if (component.format === "png") {
        const base64 = fromByteArray(component.data.bytes);
        return createElement("image", { x, y, width, height, href: `data:image/png;base64,${base64}` }, []);
      } else if (component.format === "svg") {
        const svg = String.fromCharCode(...component.data.bytes).replace('<?xml version="1.0" encoding="utf-8"?>', "");
        const bytes = [];
        for (let i = 0; i < svg.length; ++i) {
          bytes.push(svg.charCodeAt(i));
        }
        const base64 = fromByteArray(new Uint8Array(bytes));
        return createElement("image", { x, y, width, height, href: `data:image/svg+xml;base64,${base64}` }, []);
      }
      return "";
    }
    case "subimage":
      return "";
    case "line": {
      const dashStyle: Attributes =
        component.strokeDashStyle.dashes.length > 0
          ? {
              strokeDasharray: component.strokeDashStyle.dashes.join(" "),
              strokeDashoffset: component.strokeDashStyle.offset.toString(),
            }
          : {};
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
          ...dashStyle,
        },
        []
      );
    }
    case "polyline": {
      const dashStyle: Attributes =
        component.strokeDashStyle.dashes.length > 0
          ? {
              strokeDasharray: component.strokeDashStyle.dashes.join(" "),
              strokeDashoffset: component.strokeDashStyle.offset.toString(),
            }
          : {};
      return createElement(
        "polyline",
        {
          fill: "none",
          points: component.points.map((p) => p.x.toString() + "," + p.y.toString()).join(" "),
          stroke: colorToRgb(component.strokeColor),
          strokeOpacity: colorToOpacity(component.strokeColor),
          strokeWidth: component.strokeThickness.toString(),
          ...dashStyle,
        },
        []
      );
    }
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

      const alignmentBaseline = getBaselineAdjustment(component.verticalGrowthDirection);

      const transform =
        "rotate(" +
        component.clockwiseRotationDegrees.toString() +
        " " +
        component.position.x.toString() +
        " " +
        component.position.y.toString() +
        ")";

      const lines: Array<string> = component.text !== null ? component.text.split("\n") : [];

      const tSpans = lines.map((t, i) => {
        const split = t.split("<sub>").flatMap((t) => t.split("</sub>"));
        let inside = false;
        const tags: Array<string> = [];
        for (const st of split) {
          if (inside) {
            tags.push(
              createElement(
                "tspan",
                {
                  "baseline-shift": "sub",
                  "font-size": (component.fontSize * 0.8).toString(),
                  "alignment-baseline": alignmentBaseline,
                },
                [st]
              )
            );
          } else {
            tags.push(createElement("tspan", { "alignment-baseline": alignmentBaseline }, [st]));
          }
          inside = !inside;
        }
        return createElement(
          "tspan",
          {
            x: component.position.x.toString(),
            y: (component.position.y + i * lineHeight).toString(),
            height: lineHeight.toString() + "px",
          },
          tags
        );
      });
      const cs: Array<string> = [];

      if (component.strokeThickness > 0 && component.strokeColor !== null) {
        cs.push(createElement("text", { style: objectToAttributeValue(shadowStyle), transform: transform }, tSpans));
      }
      cs.push(createElement("text", { style: objectToAttributeValue(style), transform: transform }, tSpans));
      return cs.join();
    case "ellipse": {
      const dashStyle: Attributes =
        component.strokeDashStyle.dashes.length > 0
          ? {
              strokeDasharray: component.strokeDashStyle.dashes.join(" "),
              strokeDashoffset: component.strokeDashStyle.offset.toString(),
            }
          : {};
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
          ...dashStyle,
        },
        []
      );
    }
    case "polygon": {
      const dashStyle: Attributes =
        component.strokeDashStyle.dashes.length > 0
          ? {
              strokeDasharray: component.strokeDashStyle.dashes.join(" "),
              strokeDashoffset: component.strokeDashStyle.offset.toString(),
            }
          : {};
      return createElement(
        "polygon",
        {
          points: component.points.map((p) => p.x.toString() + "," + p.y.toString()).join(" "),
          stroke: colorToRgb(component.strokeColor),
          strokeOpacity: colorToOpacity(component.strokeColor),
          strokeWidth: component.strokeThickness.toString(),
          fill: colorToRgb(component.fillColor),
          fillOpacity: colorToOpacity(component.fillColor),
          ...dashStyle,
        },
        []
      );
    }
    case "rectangle": {
      const dashStyle: Attributes =
        component.strokeDashStyle.dashes.length > 0
          ? {
              strokeDasharray: component.strokeDashStyle.dashes.join(" "),
              strokeDashoffset: component.strokeDashStyle.offset.toString(),
            }
          : {};
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
          ...(component.radius ? { rx: component.radius.x.toString(), ry: component.radius.y.toString() } : {}),
          ...dashStyle,
        },
        []
      );
    }
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

function getBaselineAdjustment(d: GrowthDirection): "baseline" | "central" | "hanging" {
  if (d === "up") {
    return "baseline";
  }
  if (d === "uniform") {
    return "central";
  }
  if (d === "down") {
    return "hanging";
  }
  throw "Unknown text alignment " + d;
}

function getTextAnchor(d: GrowthDirection): string {
  if (d === "left") {
    return "end";
  }
  if (d === "uniform") {
    return "middle";
  }
  if (d === "right") {
    return "start";
  }
  throw "Unknown text anchor " + d;
}

function colorToRgb(color: Color): string {
  return `rgb(${color.r.toString()}, ${color.g.toString()}, ${color.b.toString()})`;
}

function colorToOpacity(color: Color): string {
  return (color.a / 255).toString();
}
