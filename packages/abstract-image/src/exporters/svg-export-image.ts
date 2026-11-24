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
  /**
   * The decimals its coordinates, sizes and stroke widths are rounded to, in the image's units, a sub image's as many more as it's scaled up, e.g. 2
   * for a hundredth of a pixel; not rounded without
   */
  readonly decimals: number;
  /** False to leave out its namespace, e.g. for an svg put inside another; it's needed on its own, e.g. as a file or an image's source */
  readonly namespace: boolean;
};

/** What its parts are drawn with: the images by url, and the decimals of a part's units, undefined for not rounded */
type Context = { readonly imageDataByUrl: SvgOptions["imageDataByUrl"]; readonly decimals: number | undefined };

/** Drawn with `classNames`' classes like ReactSvg, its svg's `classNames.root` and `className`, an embedded picture's `classNames.image` */
export function createSVG(image: AbstractImage, options?: Optional<SvgOptions>): string {
  const className = options?.className ? `${classNames.root} ${options.className}` : classNames.root;
  const context: Context = { imageDataByUrl: options?.imageDataByUrl ?? {}, decimals: options?.decimals };
  const width = round(options?.pixelWidth ?? image.size.width, context);
  const height = round(options?.pixelHeight ?? image.size.height, context);
  const namespace = options?.namespace === false ? "" : ' xmlns="http://www.w3.org/2000/svg"';
  return svgElement(image, context, `${namespace} class="${className}" width="${width}px" height="${height}px"`);
}

/** An image's svg, `attributes` its root's namespace, class and size, a sub image's its own size, inside the root's namespace */
function svgElement(image: AbstractImage, context: Context, attributes: string | undefined): string {
  const [width, height] = [round(image.size.width, context), round(image.size.height, context)];
  let svg = `<svg${attributes ?? ` width="${width}px" height="${height}px"`} viewBox="0 0 ${width} ${height}">`;
  for (const c of image.components) {
    svg += componentToSvg(c, context);
  }
  return svg + "</svg>";
}

function componentToSvg(component: Component, context: Context): string {
  switch (component.type) {
    case "group": {
      let g = component.name ? `<g name="${component.name}">` : "<g>";
      for (const c of component.children) {
        g += componentToSvg(c, context);
      }
      return g + "</g>";
    }
    case "binaryimage": {
      const { x, y } = component.topLeft;
      const width = component.bottomRight.x - x;
      const height = component.bottomRight.y - y;
      const data = component.data.type === "url" ? (context.imageDataByUrl[component.data.url] ?? component.data.url) : undefined;
      if (typeof data === "object") {
        return scaledSvg(x, y, Math.min(width / (data.size.width || 1), height / (data.size.height || 1)), data, context);
      }
      const href = component.data.type === "url" ? data : getBinaryImageHref(component.format, component.data.bytes);
      if (href === undefined) {
        return "";
      }
      return `<image x="${round(x, context)}" y="${round(y, context)}" width="${round(width, context)}" height="${round(height, context)}" class="${classNames.image}"${href ? ` href="${href}"` : ""}/>`;
    }
    case "subimage": {
      const { topLeft, size, image } = component;
      return scaledSvg(topLeft.x, topLeft.y, Math.min(size.width / (image.size.width || 1), size.height / (image.size.height || 1)), image, context);
    }
    case "line": {
      const { start, end } = component;
      const cap = component.strokeLineCap ? ` stroke-linecap="${component.strokeLineCap}"` : "";
      return `<line x1="${round(start.x, context)}" y1="${round(start.y, context)}" x2="${round(end.x, context)}" y2="${round(end.y, context)}"${getStroke(component.strokeColor, component.strokeThickness, context)}${cap}${getDash(component.strokeDashStyle)}/>`;
    }
    case "polyline": {
      const join = component.strokeLineJoin ? ` stroke-linejoin="${component.strokeLineJoin}"` : "";
      const cap = component.strokeLineCap ? ` stroke-linecap="${component.strokeLineCap}"` : "";
      return `<polyline fill="none"${getPoints(component.points, context)}${getStroke(component.strokeColor, component.strokeThickness, context)}${join}${cap}${getDash(component.strokeDashStyle)}/>`;
    }
    case "polygon": {
      const join = component.strokeLineJoin ? ` stroke-linejoin="${component.strokeLineJoin}"` : "";
      return `<polygon${getPoints(component.points, context)}${getStroke(component.strokeColor, component.strokeThickness, context)}${getFill(component.fillColor)}${join}${getDash(component.strokeDashStyle)}/>`;
    }
    case "ellipse": {
      const { topLeft, bottomRight } = component;
      const rx = round(Math.abs(bottomRight.x - topLeft.x) * 0.5, context);
      const ry = round(Math.abs(bottomRight.y - topLeft.y) * 0.5, context);
      const cx = round((bottomRight.x + topLeft.x) * 0.5, context);
      const cy = round((bottomRight.y + topLeft.y) * 0.5, context);
      return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"${getStroke(component.strokeColor, component.strokeThickness, context)}${getFill(component.fillColor)}${getDash(component.strokeDashStyle)}/>`;
    }
    case "rectangle": {
      const { topLeft, bottomRight, radius } = component;
      const width = round(Math.abs(bottomRight.x - topLeft.x), context);
      const height = round(Math.abs(bottomRight.y - topLeft.y), context);
      const r = radius ? ` rx="${round(radius.x, context)}" ry="${round(radius.y, context)}"` : "";
      return `<rect x="${round(topLeft.x, context)}" y="${round(topLeft.y, context)}" width="${width}" height="${height}"${getStroke(component.strokeColor, component.strokeThickness, context)}${getFill(component.fillColor)}${r}${getDash(component.strokeDashStyle)}/>`;
    }
    case "text": {
      if (!component.text) {
        return "";
      }
      const fontSize = round(component.fontSize, context);
      const position = { x: round(component.position.x, context), y: round(component.position.y, context) };
      const alignmentBaseline = getBaselineAdjustment(component.verticalGrowthDirection);
      const font = `text-anchor:${getTextAnchor(component.horizontalGrowthDirection)};font-size:${fontSize}px;font-weight:${component.fontWeight};${component.fontFamily ? `font-family:${component.fontFamily};` : ""}`;
      const transform = ` transform="rotate(${component.clockwiseRotationDegrees} ${position.x} ${position.y})"`;
      // Its lines' tspans, each a tspan per run alternating outside and inside <sub>
      let tSpans = "";
      for (const [i, line] of component.text.split("\n").entries()) {
        tSpans += `<tspan x="${position.x}" y="${round(position.y + i * fontSize, context)}" height="${fontSize}px">`;
        let inside = false;
        for (const run of line.split(/<\/?sub>/)) {
          tSpans += inside
            ? `<tspan baseline-shift="sub" font-size="${round(fontSize * 0.8, context)}" alignment-baseline="${alignmentBaseline}">${escapeXml(run)}</tspan>`
            : `<tspan alignment-baseline="${alignmentBaseline}">${escapeXml(run)}</tspan>`;
          inside = !inside;
        }
        tSpans += "</tspan>";
      }
      const fill = `<text style="${font}fill:${colorToRgb(component.textColor)};fill-opacity:${component.textColor.a / 255};"${transform}>${tSpans}</text>`;
      const { strokeColor, strokeThickness } = component;
      return strokeThickness > 0
        ? `<text style="${font}stroke:${colorToRgb(strokeColor)};stroke-opacity:${strokeColor.a / 255};stroke-width:${round(strokeThickness, context)}px;"${transform}>${tSpans}</text>${fill}`
        : fill;
    }
    default:
      return "";
  }
}
/** A sub image's svg, scaled from its own units */
function scaledSvg(x: number, y: number, scale: number, image: AbstractImage, context: Context): string {
  const { decimals } = context;
  // As many more decimals as it's scaled up, as few less as it's scaled down
  const inner = { ...context, decimals: decimals === undefined ? undefined : Math.max(0, decimals + Math.ceil(Math.log10(scale || 1))) };
  return `<g transform="translate(${round(x, context)}, ${round(y, context)}) scale(${scale})">${svgElement(image, inner, undefined)}</g>`;
}

function getStroke(color: Color, thickness: number, context: Context): string {
  return ` stroke="${colorToRgb(color)}" stroke-opacity="${color.a / 255}" stroke-width="${round(thickness, context)}"`;
}

function getFill(color: Color): string {
  return ` fill="${colorToRgb(color)}" fill-opacity="${color.a / 255}"`;
}

function getDash(dashStyle: DashStyle): string {
  return dashStyle.dashes.length > 0 ? ` stroke-dasharray="${dashStyle.dashes.join(" ")}" stroke-dashoffset="${dashStyle.offset}"` : "";
}

function getPoints(points: ReadonlyArray<Point>, context: Context): string {
  let s = "";
  for (const p of points) {
    s += s ? ` ${round(p.x, context)},${round(p.y, context)}` : `${round(p.x, context)},${round(p.y, context)}`;
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

/** To the context's decimals, without trailing zeros; as it is without */
function round(value: number, { decimals }: Context): number {
  return decimals === undefined ? value : Number(value.toFixed(decimals));
}
