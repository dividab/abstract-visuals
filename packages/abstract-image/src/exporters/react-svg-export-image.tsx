import React from "react";
import type { AbstractImage } from "../model/abstract-image.js";
import { classNames } from "../model/class-names.js";
import type { Color } from "../model/color.js";
import type { AbstractFontWeight, Component, Text } from "../model/component.js";
import type { Point } from "../model/point.js";
import { createPoint } from "../model/point.js";
import type { Optional } from "../model/shared.js";
import { getBaselineAdjustment, getBinaryImageHref, getTextAnchor } from "./svg-shared.js";

export interface ReactSvgCallbacks {
  readonly onClick?: MouseCallback;
  readonly onDoubleClick?: MouseCallback;
  readonly onMouseMove?: MouseCallback;
  readonly onContextMenu?: MouseCallback;
}

export type MouseCallback = (id: string | undefined, point: Point) => void;

export type ReactSvgOptions = {
  readonly imageDataByUrl: Record<string, `data:image/${string},${string}` | AbstractImage>;
};

type ImageDataByUrl = ReactSvgOptions["imageDataByUrl"];

const noImageData: ImageDataByUrl = {};

/** Drawn with `classNames`' classes on its parts; `className` its svg's class besides `classNames.root`, e.g. sized to fill its box */
export function ReactSvg({
  image,
  callbacks,
  options,
  className,
}: {
  readonly image: AbstractImage;
  readonly callbacks?: ReactSvgCallbacks;
  readonly options?: Optional<ReactSvgOptions>;
  readonly className?: string;
}): React.JSX.Element {
  const imageDataByUrl = options?.imageDataByUrl ?? noImageData;
  // The same elements while its image is, so React skips them when only its callbacks or class change
  const children = React.useMemo(() => renderComponents(image.components, imageDataByUrl), [image, imageDataByUrl]);
  const cb = callbacks ?? {};
  const id = "ai_root";
  return (
    // oxlint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events -- rendered image/chart, click callbacks report hit coordinates rather than acting as an interactive widget
    <svg
      id={id}
      className={className ? `${classNames.root} ${className}` : classNames.root}
      width={`${image.size.width}px`}
      height={`${image.size.height}px`}
      viewBox={`0 0 ${image.size.width} ${image.size.height}`}
      onClick={_callback(cb.onClick, id)}
      onDoubleClick={_callback(cb.onDoubleClick, id)}
      onMouseMove={_callback(cb.onMouseMove, id)}
      onContextMenu={_callback(cb.onContextMenu, id)}
    >
      {children}
    </svg>
  );
}

function _callback(callback: MouseCallback | undefined, rootId: string): React.MouseEventHandler | undefined {
  if (!callback) {
    return undefined;
  }
  return (e: React.MouseEvent) => {
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

/** An element's classes: `classNames.part` with an id, and a text's own */
function makePartClass(id: string | undefined, className?: string): string | undefined {
  const part = id ? classNames.part : undefined;
  return part && className ? `${part} ${className}` : (part ?? className);
}

function getIdAttr(target: Element | undefined, rootId: string): string | undefined {
  if (!target || target.id === rootId) {
    return undefined;
  }
  const id = target.id;
  const parts = id.split("%");
  if (parts.length !== 2 || parts[0] !== "ai") {
    return getIdAttr((target.parentNode as Element | null) ?? undefined, rootId);
  }
  return parts[1];
}

/** Components' elements, rendered by plain calls rather than a React component each, so each is one element and fiber */
function renderComponents(components: ReadonlyArray<Component>, imageDataByUrl: ImageDataByUrl): Array<React.ReactNode> {
  const elements: Array<React.ReactNode> = [];
  for (const [i, c] of components.entries()) {
    elements.push(renderComponent(c, imageDataByUrl, i));
  }
  return elements;
}

/** A sub image's svg, without the root's class, id or callbacks */
function renderSubImage(image: AbstractImage, imageDataByUrl: ImageDataByUrl): React.JSX.Element {
  return (
    <svg width={`${image.size.width}px`} height={`${image.size.height}px`} viewBox={`0 0 ${image.size.width} ${image.size.height}`}>
      {renderComponents(image.components, imageDataByUrl)}
    </svg>
  );
}

function renderComponent(component: Component, imageDataByUrl: ImageDataByUrl, key: number): React.ReactNode {
  switch (component.type) {
    case "group":
      return (
        <g key={key} name={component.name}>
          {renderComponents(component.children, imageDataByUrl)}
        </g>
      );
    case "binaryimage": {
      const { x, y } = component.topLeft;
      const width = component.bottomRight.x - x;
      const height = component.bottomRight.y - y;
      const data = component.data.type === "url" ? imageDataByUrl[component.data.url] : getBinaryImageHref(component.format, component.data.bytes);
      if (data === undefined) {
        return null;
      }
      if (typeof data === "string") {
        return <image key={key} x={x} y={y} width={width} height={height} id={makeIdAttr(component.id)} className={classNames.image} href={data} />;
      }
      const scale = Math.min(width / (data.size.width || 1), height / (data.size.height || 1));
      return (
        <g key={key} transform={`translate(${x}, ${y}) scale(${scale})`}>
          {renderSubImage(data, imageDataByUrl)}
        </g>
      );
    }
    case "subimage": {
      const scale = Math.min(component.size.width / (component.image.size.width || 1), component.size.height / (component.image.size.height || 1));
      return (
        <g key={key} transform={`translate(${component.topLeft.x}, ${component.topLeft.y}) scale(${scale})`}>
          {renderSubImage(component.image, imageDataByUrl)}
        </g>
      );
    }
    case "line": {
      const dashed = component.strokeDashStyle.dashes.length > 0;
      return (
        <line
          key={key}
          id={makeIdAttr(component.id)}
          className={makePartClass(component.id)}
          x1={component.start.x}
          y1={component.start.y}
          x2={component.end.x}
          y2={component.end.y}
          stroke={colorToRgb(component.strokeColor)}
          strokeWidth={component.strokeThickness}
          strokeOpacity={colorToOpacity(component.strokeColor)}
          strokeLinecap={component.strokeLineCap}
          strokeDasharray={dashed ? component.strokeDashStyle.dashes.join(" ") : undefined}
          strokeDashoffset={dashed ? component.strokeDashStyle.offset : undefined}
        />
      );
    }
    case "text":
      return component.text ? renderText(component, key) : null;
    case "ellipse": {
      const { topLeft, bottomRight } = component;
      const dashed = component.strokeDashStyle.dashes.length > 0;
      return (
        <ellipse
          key={key}
          id={makeIdAttr(component.id)}
          className={makePartClass(component.id)}
          cx={(bottomRight.x + topLeft.x) * 0.5}
          cy={(bottomRight.y + topLeft.y) * 0.5}
          rx={Math.abs(bottomRight.x - topLeft.x) * 0.5}
          ry={Math.abs(bottomRight.y - topLeft.y) * 0.5}
          stroke={colorToRgb(component.strokeColor)}
          strokeWidth={component.strokeThickness}
          strokeOpacity={colorToOpacity(component.strokeColor)}
          strokeDasharray={dashed ? component.strokeDashStyle.dashes.join(" ") : undefined}
          strokeDashoffset={dashed ? component.strokeDashStyle.offset : undefined}
          fillOpacity={colorToOpacity(component.fillColor)}
          fill={colorToRgb(component.fillColor)}
        />
      );
    }
    case "polyline": {
      const dashed = component.strokeDashStyle.dashes.length > 0;
      return (
        <polyline
          key={key}
          id={makeIdAttr(component.id)}
          className={makePartClass(component.id)}
          points={getPoints(component.points)}
          stroke={colorToRgb(component.strokeColor)}
          strokeWidth={component.strokeThickness}
          strokeOpacity={colorToOpacity(component.strokeColor)}
          strokeLinejoin={component.strokeLineJoin}
          strokeLinecap={component.strokeLineCap}
          strokeDasharray={dashed ? component.strokeDashStyle.dashes.join(" ") : undefined}
          strokeDashoffset={dashed ? component.strokeDashStyle.offset : undefined}
          fill="none"
        />
      );
    }
    case "polygon": {
      const dashed = component.strokeDashStyle.dashes.length > 0;
      return (
        <polygon
          key={key}
          id={makeIdAttr(component.id)}
          className={makePartClass(component.id)}
          points={getPoints(component.points)}
          stroke={colorToRgb(component.strokeColor)}
          strokeWidth={component.strokeThickness}
          strokeOpacity={colorToOpacity(component.strokeColor)}
          strokeLinejoin={component.strokeLineJoin}
          strokeDasharray={dashed ? component.strokeDashStyle.dashes.join(" ") : undefined}
          strokeDashoffset={dashed ? component.strokeDashStyle.offset : undefined}
          fillOpacity={colorToOpacity(component.fillColor)}
          fill={colorToRgb(component.fillColor)}
        />
      );
    }
    case "rectangle": {
      const { topLeft, bottomRight, radius } = component;
      const dashed = component.strokeDashStyle.dashes.length > 0;
      return (
        <rect
          key={key}
          id={makeIdAttr(component.id)}
          className={makePartClass(component.id)}
          x={topLeft.x}
          y={topLeft.y}
          width={Math.abs(bottomRight.x - topLeft.x)}
          height={Math.abs(bottomRight.y - topLeft.y)}
          stroke={colorToRgb(component.strokeColor)}
          strokeWidth={component.strokeThickness}
          strokeOpacity={colorToOpacity(component.strokeColor)}
          strokeDasharray={dashed ? component.strokeDashStyle.dashes.join(" ") : undefined}
          strokeDashoffset={dashed ? component.strokeDashStyle.offset : undefined}
          fillOpacity={colorToOpacity(component.fillColor)}
          rx={radius?.x}
          ry={radius?.y}
          fill={colorToRgb(component.fillColor)}
        />
      );
    }
    default:
      return null;
  }
}

function renderText(component: Text, key: number): React.JSX.Element {
  const { position, fontSize } = component;
  const alignmentBaseline = getBaselineAdjustment(component.verticalGrowthDirection);
  const transform = `rotate(${component.clockwiseRotationDegrees} ${position.x} ${position.y})`;
  const id = makeIdAttr(component.id);
  const className = makePartClass(component.id, component.className);
  const style = {
    textAnchor: getTextAnchor(component.horizontalGrowthDirection),
    fontSize: `${fontSize}px`,
    fontWeight: getTextFontWeight(component.fontWeight),
    fontFamily: component.fontFamily,
  };
  // Its lines' tspans, each a tspan per run alternating outside and inside <sub>, shared by its stroke and fill
  const tSpans: Array<React.JSX.Element> = [];
  const subStyle = { fontSize: `${fontSize * 0.8}px` };
  for (const [i, line] of component.text.split("\n").entries()) {
    const runs: Array<React.JSX.Element> = [];
    for (const [j, run] of line.split(/<\/?sub>/).entries()) {
      runs.push(
        j % 2 === 1 ? (
          <tspan key={j} baselineShift="sub" alignmentBaseline={alignmentBaseline} style={subStyle}>
            {run}
          </tspan>
        ) : (
          <tspan key={j} alignmentBaseline={alignmentBaseline}>
            {run}
          </tspan>
        )
      );
    }
    tSpans.push(
      <tspan key={i} x={position.x} y={position.y + i * fontSize} height={`${fontSize}px`}>
        {runs}
      </tspan>
    );
  }
  return (
    <React.Fragment key={key}>
      {component.strokeThickness > 0 && (
        <text
          style={style}
          stroke={colorToRgb(component.strokeColor)}
          strokeWidth={component.strokeThickness}
          transform={transform}
          id={id}
          className={className}
        >
          {tSpans}
        </text>
      )}
      {/* Its colors attributes, which a class overrides, e.g. a hovered axis label */}
      <text style={style} fill={colorToRgb(component.textColor)} transform={transform} id={id} className={className}>
        {tSpans}
      </text>
    </React.Fragment>
  );
}

function getPoints(points: ReadonlyArray<Point>): string {
  let s = "";
  for (const p of points) {
    s += s ? ` ${p.x},${p.y}` : `${p.x},${p.y}`;
  }
  return s;
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

function colorToRgb(color: Color): string {
  return color.css ?? `rgb(${color.r},${color.g},${color.b})`;
}

function colorToOpacity(color: Color): string {
  return color.css ? "1" : (color.a / 255).toString();
}
