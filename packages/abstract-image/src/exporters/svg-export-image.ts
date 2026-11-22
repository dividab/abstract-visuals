import type { AbstractImage } from "../model/abstract-image.js";
import { classNames } from "../model/class-names.js";
import type { Color } from "../model/color.js";
import type { Component } from "../model/component.js";
import type { DashStyle } from "../model/dash-style.js";
import type { Point } from "../model/point.js";
import type { Optional } from "../model/shared.js";
import { getBaselineAdjustment, getBinaryImageHref, getTextAnchor } from "./svg-shared.js";

export const SVG_DATA_URL = "data:image/svg+xml,";

export type SvgOptions = {
  readonly pixelWidth: number;
  readonly pixelHeight: number;
  readonly imageDataByUrl: Record<string, `data:image/${string},${string}` | AbstractImage>;
  /** Its svg's class besides `classNames.root`, e.g. sized to fill its box */
  readonly className: string;
};

type ImageDataByUrl = SvgOptions["imageDataByUrl"];

/** Drawn with `classNames`' classes like ReactSvg, its svg's `classNames.root` and `className`, an embedded picture's `classNames.image` */
export function createSVG(image: AbstractImage, options?: Optional<SvgOptions>): string {
  const className = options?.className ? `${classNames.root} ${options.className}` : classNames.root;
  const width = options?.pixelWidth ?? image.size.width;
  const height = options?.pixelHeight ?? image.size.height;
  return svgElement(image, options?.imageDataByUrl ?? {}, ` class="${className}" width="${width}px" height="${height}px"`);
}

/** An image's svg, `attributes` its root's class and size, a sub image's its own size */
function svgElement(image: AbstractImage, imageDataByUrl: ImageDataByUrl, attributes: string | undefined): string {
  const { width, height } = image.size;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg"${attributes ?? ` width="${width}px" height="${height}px"`} viewBox="0 0 ${width} ${height}">`;
  for (const c of image.components) {
    svg += componentToSvg(c, imageDataByUrl);
  }
  return svg + "</svg>";
}

function componentToSvg(component: Component, imageDataByUrl: ImageDataByUrl): string {
  switch (component.type) {
    case "group": {
      let g = component.name ? `<g name="${component.name}">` : "<g>";
      for (const c of component.children) {
        g += componentToSvg(c, imageDataByUrl);
      }
      return g + "</g>";
    }
    case "binaryimage": {
      const { x, y } = component.topLeft;
      const width = component.bottomRight.x - x;
      const height = component.bottomRight.y - y;
      const data = component.data.type === "url" ? (imageDataByUrl[component.data.url] ?? component.data.url) : undefined;
      if (typeof data === "object") {
        const scale = Math.min(width / (data.size.width || 1), height / (data.size.height || 1));
        return `<g transform="translate(${x}, ${y}) scale(${scale})">${svgElement(data, imageDataByUrl, undefined)}</g>`;
      }
      const href = component.data.type === "url" ? data : getBinaryImageHref(component.format, component.data.bytes);
      if (href === undefined) {
        return "";
      }
      return `<image x="${x}" y="${y}" width="${width}" height="${height}" class="${classNames.image}"${href ? ` href="${href}"` : ""}></image>`;
    }
    case "subimage": {
      const scale = Math.min(component.size.width / (component.image.size.width || 1), component.size.height / (component.image.size.height || 1));
      return `<g transform="translate(${component.topLeft.x}, ${component.topLeft.y}) scale(${scale})">${svgElement(component.image, imageDataByUrl, undefined)}</g>`;
    }
    case "line": {
      const { start, end } = component;
      const cap = component.strokeLineCap ? ` stroke-linecap="${component.strokeLineCap}"` : "";
      return `<line x1="${start.x}" y1="${start.y}" x2="${end.x}" y2="${end.y}"${getStroke(component.strokeColor, component.strokeThickness)}${cap}${getDash(component.strokeDashStyle)}></line>`;
    }
    case "polyline": {
      const join = component.strokeLineJoin ? ` stroke-linejoin="${component.strokeLineJoin}"` : "";
      const cap = component.strokeLineCap ? ` stroke-linecap="${component.strokeLineCap}"` : "";
      return `<polyline fill="none"${getPoints(component.points)}${getStroke(component.strokeColor, component.strokeThickness)}${join}${cap}${getDash(component.strokeDashStyle)}></polyline>`;
    }
    case "polygon": {
      const join = component.strokeLineJoin ? ` stroke-linejoin="${component.strokeLineJoin}"` : "";
      return `<polygon${getPoints(component.points)}${getStroke(component.strokeColor, component.strokeThickness)}${getFill(component.fillColor)}${join}${getDash(component.strokeDashStyle)}></polygon>`;
    }
    case "ellipse": {
      const { topLeft, bottomRight } = component;
      const rx = Math.abs(bottomRight.x - topLeft.x) * 0.5;
      const ry = Math.abs(bottomRight.y - topLeft.y) * 0.5;
      const cx = (bottomRight.x + topLeft.x) * 0.5;
      const cy = (bottomRight.y + topLeft.y) * 0.5;
      return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"${getStroke(component.strokeColor, component.strokeThickness)}${getFill(component.fillColor)}${getDash(component.strokeDashStyle)}></ellipse>`;
    }
    case "rectangle": {
      const { topLeft, bottomRight, radius } = component;
      const width = Math.abs(bottomRight.x - topLeft.x);
      const height = Math.abs(bottomRight.y - topLeft.y);
      const r = radius ? ` rx="${radius.x}" ry="${radius.y}"` : "";
      return `<rect x="${topLeft.x}" y="${topLeft.y}" width="${width}" height="${height}"${getStroke(component.strokeColor, component.strokeThickness)}${getFill(component.fillColor)}${r}${getDash(component.strokeDashStyle)}></rect>`;
    }
    case "text": {
      if (!component.text) {
        return "";
      }
      const { position, fontSize } = component;
      const alignmentBaseline = getBaselineAdjustment(component.verticalGrowthDirection);
      const font = `text-anchor:${getTextAnchor(component.horizontalGrowthDirection)};font-size:${fontSize}px;font-weight:${component.fontWeight};${component.fontFamily ? `font-family:${component.fontFamily};` : ""}`;
      const transform = ` transform="rotate(${component.clockwiseRotationDegrees} ${position.x} ${position.y})"`;
      // Its lines' tspans, each a tspan per run alternating outside and inside <sub>
      let tSpans = "";
      for (const [i, line] of component.text.split("\n").entries()) {
        tSpans += `<tspan x="${position.x}" y="${position.y + i * fontSize}" height="${fontSize}px">`;
        let inside = false;
        for (const run of line.split(/<\/?sub>/)) {
          tSpans += inside
            ? `<tspan baseline-shift="sub" font-size="${fontSize * 0.8}" alignment-baseline="${alignmentBaseline}">${escapeXml(run)}</tspan>`
            : `<tspan alignment-baseline="${alignmentBaseline}">${escapeXml(run)}</tspan>`;
          inside = !inside;
        }
        tSpans += "</tspan>";
      }
      const fill = `<text style="${font}fill:${colorToRgb(component.textColor)};fill-opacity:${component.textColor.a / 255};"${transform}>${tSpans}</text>`;
      const { strokeColor, strokeThickness } = component;
      return strokeThickness > 0
        ? `<text style="${font}stroke:${colorToRgb(strokeColor)};stroke-opacity:${strokeColor.a / 255};stroke-width:${strokeThickness}px;"${transform}>${tSpans}</text>${fill}`
        : fill;
    }
    default:
      return "";
  }
}

function getStroke(color: Color, thickness: number): string {
  return ` stroke="${colorToRgb(color)}" stroke-opacity="${color.a / 255}" stroke-width="${thickness}"`;
}

function getFill(color: Color): string {
  return ` fill="${colorToRgb(color)}" fill-opacity="${color.a / 255}"`;
}

function getDash(dashStyle: DashStyle): string {
  return dashStyle.dashes.length > 0 ? ` stroke-dasharray="${dashStyle.dashes.join(" ")}" stroke-dashoffset="${dashStyle.offset}"` : "";
}

function getPoints(points: ReadonlyArray<Point>): string {
  let s = "";
  for (const p of points) {
    s += s ? ` ${p.x},${p.y}` : `${p.x},${p.y}`;
  }
  return s ? ` points="${s}"` : "";
}

function colorToRgb(color: Color): string {
  return `rgb(${color.r}, ${color.g}, ${color.b})`;
}

const xmlEntities: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" };

function escapeXml(text: string): string {
  return text.replace(/[&<>"']/g, (c) => xmlEntities[c] ?? c);
}
