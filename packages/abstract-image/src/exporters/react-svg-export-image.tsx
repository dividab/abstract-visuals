import * as R from "ramda";
import * as React from "react";
import * as AbstractImage from "../model/index";

export interface ReactSvgCallbacks {
  readonly onClick?: MouseCallback;
  readonly onDoubleClick?: MouseCallback;
  readonly onMouseMove?: MouseCallback;
  readonly onContextMenu?: MouseCallback;
}

export type MouseCallback = (
  id: string | undefined,
  point: AbstractImage.Point
) => void;

export function createReactSvg(
  image: AbstractImage.AbstractImage,
  callbacks?: ReactSvgCallbacks
): React.ReactElement<{}> {
  const cb = callbacks || {};
  return (
    <svg
      width={`${image.size.width}px`}
      height={`${image.size.height}px`}
      viewBox={[0, 0, image.size.width, image.size.height].join(" ")}
      onClick={_callback(cb.onClick)}
      onDoubleClick={_callback(cb.onDoubleClick)}
      onMouseMove={_callback(cb.onMouseMove)}
      onContextMenu={_callback(cb.onContextMenu)}
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

function _callback(
  callback: MouseCallback | undefined
): React.MouseEventHandler<Element> | undefined {
  if (!callback) {
    return undefined;
  }
  return (e: React.MouseEvent<Element>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    const mousePoint = AbstractImage.createPoint(offsetX, offsetY);
    const id = e.target && (e.target as Element).id;
    callback(id !== "" ? id : undefined, mousePoint);
  };
}

function _visit(
  key: string,
  component: AbstractImage.Component
): Array<React.ReactElement<{}>> {
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
        </g>
      ];
    case "binaryimage":
      switch (component.format) {
        case "svg":
          return [
            <g
              key={key}
              id={component.id}
              dangerouslySetInnerHTML={{
                __html: component.data.reduce(
                  (a, b) => a + String.fromCharCode(b),
                  ""
                )
              }}
            />
          ];
        default:
          return [];
      }
    case "line":
      return [
        <line
          id={component.id}
          key={key}
          x1={component.start.x}
          y1={component.start.y}
          x2={component.end.x}
          y2={component.end.y}
          stroke={colorToRgb(component.strokeColor)}
          strokeWidth={component.strokeThickness}
          strokeOpacity={colorToOpacity(component.strokeColor)}
        />
      ];
    case "text":
      if (!component.text) {
        return [];
      }
      const lineHeight = component.fontSize;

      const shadowStyle = {
        textAnchor: getTextAnchor(component.horizontalGrowthDirection),
        fontSize: component.fontSize.toString() + "px",
        fontWeight: component.fontWeight,
        fontFamily: component.fontFamily,
        stroke: colorToRgb(component.strokeColor),
        strokeWidth: component.strokeThickness
      };
      const style = {
        textAnchor: getTextAnchor(component.horizontalGrowthDirection),
        fontSize: component.fontSize.toString() + "px",
        fontWeight: component.fontWeight,
        fontFamily: component.fontFamily,
        fill: colorToRgb(component.textColor)
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

      const lines: Array<string> =
        component.text !== null ? component.text.split("\n") : [];
      const tSpans = lines.map(t => (
        <tspan
          key={t}
          x={component.position.x}
          y={component.position.y + (lines.indexOf(t) + dy) * lineHeight}
          height={lineHeight.toString() + "px"}
        >
          {t}
        </tspan>
      ));
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
          id={component.id}
          key={key}
          cx={cx}
          cy={cy}
          rx={rx}
          ry={ry}
          stroke={colorToRgb(component.strokeColor)}
          strokeWidth={component.strokeThickness}
          strokeOpacity={colorToOpacity(component.strokeColor)}
          opacity={colorToOpacity(component.fillColor)}
          fill={colorToRgb(component.fillColor)}
        />
      ];
    case "polyline":
      let linePoints = component.points
        .map(p => p.x.toString() + "," + p.y.toString())
        .join(" ");
      return [
        <polyline
          id={component.id}
          key={key}
          points={linePoints}
          stroke={colorToRgb(component.strokeColor)}
          strokeWidth={component.strokeThickness}
          strokeOpacity={colorToOpacity(component.strokeColor)}
          fill="none"
        />
      ];
    case "polygon":
      let points = component.points
        .map(p => p.x.toString() + "," + p.y.toString())
        .join(" ");
      return [
        <polygon
          id={component.id}
          key={key}
          points={points}
          stroke={colorToRgb(component.strokeColor)}
          strokeWidth={component.strokeThickness}
          strokeOpacity={colorToOpacity(component.strokeColor)}
          opacity={colorToOpacity(component.fillColor)}
          fill={colorToRgb(component.fillColor)}
        />
      ];
    case "rectangle":
      return [
        <rect
          id={component.id}
          key={key}
          x={component.topLeft.x}
          y={component.topLeft.y}
          width={Math.abs(component.bottomRight.x - component.topLeft.x)}
          height={Math.abs(component.bottomRight.y - component.topLeft.y)}
          stroke={colorToRgb(component.strokeColor)}
          strokeWidth={component.strokeThickness}
          strokeOpacity={colorToOpacity(component.strokeColor)}
          opacity={colorToOpacity(component.fillColor)}
          fill={colorToRgb(component.fillColor)}
        />
      ];
    default:
      return [];
  }
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
  return (
    "rgb(" +
    color.r.toString() +
    "," +
    color.g.toString() +
    "," +
    color.b.toString() +
    ")"
  );
}

function colorToOpacity(color: AbstractImage.Color): string {
  return (color.a / 255).toString();
}
