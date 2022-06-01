import * as R from "ramda";
import * as B64 from "base64-js";
import * as React from "react";
import * as AbstractImage from "../model/index";
import { TextEncoder } from "util";

export interface ReactSvgCallbacks {
  readonly onClick?: MouseCallback;
  readonly onDoubleClick?: MouseCallback;
  readonly onMouseMove?: MouseCallback;
  readonly onContextMenu?: MouseCallback;
}

export type MouseCallback = (id: string | undefined, point: AbstractImage.Point) => void;

export function createReactSvg(
  image: AbstractImage.AbstractImage,
  callbacks?: ReactSvgCallbacks
): React.ReactElement<{}> {
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
      {R.unnest(
        R.addIndex(R.map)(
          // tslint:disable-next-line:no-any
          (c, i) => _visit(i.toString(), c as any),
          image.components
        )
      )}
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
    const mousePoint = AbstractImage.createPoint(offsetX, offsetY);
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

function _visit(key: string, component: AbstractImage.Component): Array<React.ReactElement<{}>> {
  switch (component.type) {
    case "group":
      return [
        <g key={key} name={component.name}>
          {R.unnest(
            R.addIndex(R.map)(
              // tslint:disable-next-line:no-any
              (c, i) => _visit(i.toString(), c as any),
              component.children
            )
          )}
        </g>,
      ];
    case "binaryimage":
      const url = getImageUrl(component.format, component.data);
      return [
        <image
          key={key}
          x={component.topLeft.x}
          y={component.topLeft.y}
          width={component.bottomRight.x - component.topLeft.x}
          height={component.bottomRight.y - component.topLeft.y}
          id={makeIdAttr(component.id)}
          {...(component.rotation && {
            style: {
              transform: `rotateX(${component.rotation.x}deg) rotateY(${component.rotation.y}deg) rotateZ(${component.rotation.z}deg)`,
            },
          })}
          href={url}
        />,
      ];
    case "line":
      return [
        <line
          id={makeIdAttr(component.id)}
          key={key}
          x1={component.start.x}
          y1={component.start.y}
          x2={component.end.x}
          y2={component.end.y}
          stroke={colorToRgb(component.strokeColor)}
          strokeWidth={component.strokeThickness}
          strokeOpacity={colorToOpacity(component.strokeColor)}
        />,
      ];
    case "text":
      if (!component.text) {
        return [];
      }
      const lineHeight = component.fontSize;

      const shadowStyle = {
        textAnchor: getTextAnchor(component.horizontalGrowthDirection),
        fontSize: component.fontSize.toString() + "px",
        fontWeight: component.fontWeight === "mediumBold" ? "bold" : component.fontWeight,
        fontFamily: component.fontFamily,
        stroke: colorToRgb(component.strokeColor),
        strokeWidth: component.strokeThickness,
      };
      const style = {
        textAnchor: getTextAnchor(component.horizontalGrowthDirection),
        fontSize: component.fontSize.toString() + "px",
        fontWeight: component.fontWeight === "mediumBold" ? "bold" : component.fontWeight,
        fontFamily: component.fontFamily,
        fill: colorToRgb(component.textColor),
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
        renderLine(
          t,
          component.position.x,
          component.position.y + (lines.indexOf(t) + dy) * lineHeight,
          component.fontSize,
          lineHeight
        )
      );
      let cs: Array<React.ReactElement<{}>> = [];
      if (component.strokeThickness > 0 && component.strokeColor) {
        cs.push(
          <text key={key + "shadow"} style={shadowStyle} transform={transform}>
            {tSpans}
          </text>
        );
      }
      cs.push(
        <text key={key} style={style} transform={transform}>
          {tSpans}
        </text>
      );
      return cs;
    case "ellipse":
      const rx = Math.abs(component.bottomRight.x - component.topLeft.x) * 0.5;
      const ry = Math.abs(component.bottomRight.y - component.topLeft.y) * 0.5;
      const cx = (component.bottomRight.x + component.topLeft.x) * 0.5;
      const cy = (component.bottomRight.y + component.topLeft.y) * 0.5;
      return [
        <ellipse
          id={makeIdAttr(component.id)}
          key={key}
          cx={cx}
          cy={cy}
          rx={rx}
          ry={ry}
          stroke={colorToRgb(component.strokeColor)}
          strokeWidth={component.strokeThickness}
          strokeOpacity={colorToOpacity(component.strokeColor)}
          fillOpacity={colorToOpacity(component.fillColor)}
          fill={colorToRgb(component.fillColor)}
        />,
      ];
    case "polyline":
      let linePoints = component.points.map((p) => p.x.toString() + "," + p.y.toString()).join(" ");
      return [
        <polyline
          id={makeIdAttr(component.id)}
          key={key}
          points={linePoints}
          stroke={colorToRgb(component.strokeColor)}
          strokeWidth={component.strokeThickness}
          strokeOpacity={colorToOpacity(component.strokeColor)}
          fill="none"
        />,
      ];
    case "polygon":
      let points = component.points.map((p) => p.x.toString() + "," + p.y.toString()).join(" ");
      return [
        <polygon
          id={makeIdAttr(component.id)}
          key={key}
          points={points}
          stroke={colorToRgb(component.strokeColor)}
          strokeWidth={component.strokeThickness}
          strokeOpacity={colorToOpacity(component.strokeColor)}
          fillOpacity={colorToOpacity(component.fillColor)}
          fill={colorToRgb(component.fillColor)}
        />,
      ];
    case "rectangle":
      return [
        <rect
          id={makeIdAttr(component.id)}
          key={key}
          x={component.topLeft.x}
          y={component.topLeft.y}
          width={Math.abs(component.bottomRight.x - component.topLeft.x)}
          height={Math.abs(component.bottomRight.y - component.topLeft.y)}
          stroke={colorToRgb(component.strokeColor)}
          strokeWidth={component.strokeThickness}
          strokeOpacity={colorToOpacity(component.strokeColor)}
          fillOpacity={colorToOpacity(component.fillColor)}
          fill={colorToRgb(component.fillColor)}
        />,
      ];
    default:
      return [];
  }
}

function getImageUrl(format: AbstractImage.BinaryFormat, data: AbstractImage.ImageData): string {
  if (data.type === "url") {
    return data.url;
  } else if (format === "png") {
    const base64 = B64.fromByteArray(data.bytes);
    return `data:image/png;base64,${base64}`;
  } else {
    const svg = String.fromCharCode(...data.bytes).replace('<?xml version="1.0" encoding="utf-8"?>', "");
    const bytes = [];
    for (let i = 0; i < svg.length; ++i) {
      bytes.push(svg.charCodeAt(i));
    }
    const base64 = B64.fromByteArray(new Uint8Array(bytes));
    return `data:image/svg+xml;base64,${base64}`;
  }
}

function renderLine(text: string, x: number, y: number, fontSize: number, lineHeight: number): JSX.Element {
  const split = R.unnest<string>(text.split("<sub>").map((t) => t.split("</sub>")));
  let inside = false;
  const tags: Array<JSX.Element> = [];
  for (let i = 0; i < split.length; ++i) {
    const splitText = split[i];
    if (inside) {
      tags.push(
        <tspan key={i} baselineShift="sub" style={{ fontSize: (fontSize * 0.8).toString() + "px" }}>
          {splitText}
        </tspan>
      );
    } else {
      tags.push(<tspan key={i}>{splitText}</tspan>);
    }
    inside = !inside;
  }
  return (
    <tspan key={text} x={x} y={y} height={lineHeight.toString() + "px"}>
      {tags}
    </tspan>
  );
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

function getTextAnchor(d: AbstractImage.GrowthDirection): "end" | "middle" | "start" {
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
  return "rgb(" + color.r.toString() + "," + color.g.toString() + "," + color.b.toString() + ")";
}

function colorToOpacity(color: AbstractImage.Color): string {
  return (color.a / 255).toString();
}
