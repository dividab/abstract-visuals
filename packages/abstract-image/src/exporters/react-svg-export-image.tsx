import { fromByteArray } from "base64-js";
import React from "react";
import { AbstractImage } from "../model/abstract-image.js";
import { createPoint, Point } from "../model/point.js";
import { AbstractFontWeight, BinaryFormat, Component, GrowthDirection, ImageData } from "../model/component.js";
import { Color } from "../model/color.js";

export interface ReactSvgCallbacks {
  readonly onClick?: MouseCallback;
  readonly onDoubleClick?: MouseCallback;
  readonly onMouseMove?: MouseCallback;
  readonly onContextMenu?: MouseCallback;
}

export type MouseCallback = (id: string | undefined, point: Point) => void;

export function ReactSvg({
  image,
  callbacks,
}: {
  readonly image: AbstractImage;
  readonly callbacks?: ReactSvgCallbacks;
}): React.JSX.Element {
  const cb = callbacks || {};
  const id = "ai_root";
  return (
    <svg
      id={id}
      width={`${image.size.width}px`}
      height={`${image.size.height}px`}
      viewBox={[0, 0, image.size.width, image.size.height].join(" ")}
      onClick={_callback(cb.onClick, id)}
      onDoubleClick={_callback(cb.onDoubleClick, id)}
      onMouseMove={_callback(cb.onMouseMove, id)}
      onContextMenu={_callback(cb.onContextMenu, id)}
    >
      {image.components.map((c, i) => (
        <JsxComponent key={i} component={c} />
      ))}
    </svg>
  );
}

function _callback(callback: MouseCallback | undefined, rootId: string): React.MouseEventHandler<Element> | undefined {
  if (!callback) {
    return undefined;
  }
  return (e: React.MouseEvent<Element>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    const mousePoint = createPoint(offsetX, offsetY);
    const id = getIdAttr(e.target as Element, rootId);
    callback(id && id !== "" ? id : undefined, mousePoint);
  };
}

function makeIdAttr(id: string | undefined): string | undefined {
  if (!id) {
    return undefined;
  }
  return `ai%${id}`;
}

function getIdAttr(target: Element | undefined, rootId: string): string | undefined {
  if (!target || target.id === rootId) {
    return undefined;
  }
  const id = target.id;
  const parts = id.split("%");
  if (parts.length !== 2 || parts[0] !== "ai") {
    return getIdAttr((target.parentNode as Element) || undefined, rootId);
  }
  return parts[1];
}

function JsxComponent({ component }: { readonly component: Component }): React.JSX.Element {
  switch (component.type) {
    case "group":
      return (
        <g name={component.name}>
          {component.children.flatMap((c, i) => (
            <JsxComponent key={i} component={c} />
          ))}
        </g>
      );
    case "binaryimage":
      const url = getImageUrl(component.format, component.data);
      return (
        <image
          x={component.topLeft.x}
          y={component.topLeft.y}
          width={component.bottomRight.x - component.topLeft.x}
          height={component.bottomRight.y - component.topLeft.y}
          id={makeIdAttr(component.id)}
          href={url}
        />
      );

    case "line": {
      const strokeDasharray =
        component.strokeDashStyle.dashes.length > 0 ? component.strokeDashStyle.dashes.join(" ") : undefined;
      const strokeDashoffset =
        component.strokeDashStyle.dashes.length > 0 ? component.strokeDashStyle.offset : undefined;
      return (
        <line
          id={makeIdAttr(component.id)}
          x1={component.start.x}
          y1={component.start.y}
          x2={component.end.x}
          y2={component.end.y}
          stroke={colorToRgb(component.strokeColor)}
          strokeWidth={component.strokeThickness}
          strokeOpacity={colorToOpacity(component.strokeColor)}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
        />
      );
    }
    case "text": {
      if (!component.text) {
        return <></>;
      }
      const alignmentBaseline = getBaselineAdjustment(component.verticalGrowthDirection);
      const transform = `rotate(${component.clockwiseRotationDegrees} ${component.position.x} ${component.position.y})`;
      const lines: Array<string> = component.text !== null ? component.text.split("\n") : [];
      const tSpans = lines.map((t, i) => (
        <TSpan
          key={t}
          text={t}
          x={component.position.x}
          y={component.position.y + i * component.fontSize}
          fontSize={component.fontSize}
          alignmentBaseline={alignmentBaseline}
          lineHeight={component.fontSize}
        />
      ));

      const baseStyle = {
        textAnchor: getTextAnchor(component.horizontalGrowthDirection),
        fontSize: component.fontSize.toString() + "px",
        fontWeight: getTextFontWeight(component.fontWeight),
        fontFamily: component.fontFamily,
      };
      return (
        <>
          {component.strokeThickness > 0 && component.strokeColor && (
            <text
              style={{
                ...baseStyle,
                stroke: colorToRgb(component.strokeColor),
                strokeWidth: component.strokeThickness,
              }}
              transform={transform}
              id={makeIdAttr(component.id)}
            >
              {tSpans}
            </text>
          )}
          <text
            style={{ ...baseStyle, fill: colorToRgb(component.textColor) }}
            transform={transform}
            id={makeIdAttr(component.id)}
          >
            {tSpans}
          </text>
        </>
      );
    }
    case "ellipse": {
      const rx = Math.abs(component.bottomRight.x - component.topLeft.x) * 0.5;
      const ry = Math.abs(component.bottomRight.y - component.topLeft.y) * 0.5;
      const cx = (component.bottomRight.x + component.topLeft.x) * 0.5;
      const cy = (component.bottomRight.y + component.topLeft.y) * 0.5;
      const strokeDasharray =
        component.strokeDashStyle.dashes.length > 0 ? component.strokeDashStyle.dashes.join(" ") : undefined;
      const strokeDashoffset =
        component.strokeDashStyle.dashes.length > 0 ? component.strokeDashStyle.offset : undefined;
      return (
        <ellipse
          id={makeIdAttr(component.id)}
          cx={cx}
          cy={cy}
          rx={rx}
          ry={ry}
          stroke={colorToRgb(component.strokeColor)}
          strokeWidth={component.strokeThickness}
          strokeOpacity={colorToOpacity(component.strokeColor)}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          fillOpacity={colorToOpacity(component.fillColor)}
          fill={colorToRgb(component.fillColor)}
        />
      );
    }
    case "polyline": {
      let linePoints = component.points.map((p) => p.x.toString() + "," + p.y.toString()).join(" ");
      const strokeDasharray =
        component.strokeDashStyle.dashes.length > 0 ? component.strokeDashStyle.dashes.join(" ") : undefined;
      const strokeDashoffset =
        component.strokeDashStyle.dashes.length > 0 ? component.strokeDashStyle.offset : undefined;
      return (
        <polyline
          id={makeIdAttr(component.id)}
          points={linePoints}
          stroke={colorToRgb(component.strokeColor)}
          strokeWidth={component.strokeThickness}
          strokeOpacity={colorToOpacity(component.strokeColor)}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          fill="none"
        />
      );
    }
    case "polygon": {
      let points = component.points.map((p) => p.x.toString() + "," + p.y.toString()).join(" ");
      const strokeDasharray =
        component.strokeDashStyle.dashes.length > 0 ? component.strokeDashStyle.dashes.join(" ") : undefined;
      const strokeDashoffset =
        component.strokeDashStyle.dashes.length > 0 ? component.strokeDashStyle.offset : undefined;
      return (
        <polygon
          id={makeIdAttr(component.id)}
          points={points}
          stroke={colorToRgb(component.strokeColor)}
          strokeWidth={component.strokeThickness}
          strokeOpacity={colorToOpacity(component.strokeColor)}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          fillOpacity={colorToOpacity(component.fillColor)}
          fill={colorToRgb(component.fillColor)}
        />
      );
    }
    case "rectangle": {
      const strokeDasharray =
        component.strokeDashStyle.dashes.length > 0 ? component.strokeDashStyle.dashes.join(" ") : undefined;
      const strokeDashoffset =
        component.strokeDashStyle.dashes.length > 0 ? component.strokeDashStyle.offset : undefined;
      return (
        <rect
          id={makeIdAttr(component.id)}
          x={component.topLeft.x}
          y={component.topLeft.y}
          width={Math.abs(component.bottomRight.x - component.topLeft.x)}
          height={Math.abs(component.bottomRight.y - component.topLeft.y)}
          stroke={colorToRgb(component.strokeColor)}
          strokeWidth={component.strokeThickness}
          strokeOpacity={colorToOpacity(component.strokeColor)}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          fillOpacity={colorToOpacity(component.fillColor)}
          {...(component.radius ? { rx: component.radius.x.toString(), ry: component.radius.y.toString() } : {})}
          fill={colorToRgb(component.fillColor)}
        />
      );
    }
    default:
      return <></>;
  }
}

function getTextFontWeight(fontWeight: AbstractFontWeight): React.CSSProperties["fontWeight"] {
  if (fontWeight === "mediumBold" || fontWeight === "extraBold") {
    return "bold";
  } else if (fontWeight === "light") {
    return "normal";
  } else {
    return fontWeight;
  }
}

function getImageUrl(format: BinaryFormat, data: ImageData): string {
  if (data.type === "url") {
    return data.url;
  } else if (format === "png") {
    const base64 = fromByteArray(data.bytes);
    return `data:image/png;base64,${base64}`;
  } else if (format === "svg") {
    const svg = String.fromCharCode(...data.bytes).replace('<?xml version="1.0" encoding="utf-8"?>', "");
    const bytes = [];
    for (let i = 0; i < svg.length; ++i) {
      bytes.push(svg.charCodeAt(i));
    }
    const base64 = fromByteArray(new Uint8Array(bytes));
    return `data:image/svg+xml;base64,${base64}`;
  }
  return `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg==`;
}

function TSpan({
  text,
  x,
  y,
  fontSize,
  alignmentBaseline,
  lineHeight,
}: {
  readonly text: string;
  readonly x: number;
  readonly y: number;
  readonly fontSize: number;
  readonly alignmentBaseline: "baseline" | "central" | "hanging";
  readonly lineHeight: number;
}): React.JSX.Element {
  const split = text.split("<sub>").flatMap((t) => t.split("</sub>"));
  let inside = false;
  const tags: Array<React.JSX.Element> = [];
  for (let i = 0; i < split.length; ++i) {
    const splitText = split[i];
    if (inside) {
      tags.push(
        <tspan
          key={i}
          baselineShift="sub"
          alignmentBaseline={alignmentBaseline}
          style={{ fontSize: (fontSize * 0.8).toString() + "px" }}
        >
          {splitText}
        </tspan>
      );
    } else {
      tags.push(
        <tspan key={i} alignmentBaseline={alignmentBaseline}>
          {splitText}
        </tspan>
      );
    }
    inside = !inside;
  }
  return (
    <tspan x={x} y={y} height={lineHeight.toString() + "px"}>
      {tags}
    </tspan>
  );
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

function getTextAnchor(d: GrowthDirection): "end" | "middle" | "start" {
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
  return "rgb(" + color.r.toString() + "," + color.g.toString() + "," + color.b.toString() + ")";
}

function colorToOpacity(color: Color): string {
  return (color.a / 255).toString();
}
