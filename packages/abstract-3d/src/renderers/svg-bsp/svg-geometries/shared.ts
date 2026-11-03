import type { Vec2, Vec3, View } from "../../../abstract-3d.js";
import { vec3TransRot, vec3Zero } from "../../../abstract-3d.js";

/**
 * An element and its mean depth, and the points it covers in view space (x right, y up, z toward the viewer), by which it's ordered when given,
 * whether it hides what's behind it, and the style of a plain polygon, without holes, by which its pieces are drawn when it's split
 */
export type zOrderElement = {
  readonly element: string;
  readonly zOrder: number;
  readonly polygon?: ReadonlyArray<Vec3>;
  readonly opaque?: boolean;
  readonly style?: PolygonStyle;
};
export type PolygonStyle = { readonly fill: string; readonly opacity: number; readonly stroke: string; readonly strokeWidth: number };
export const zElem = (element: string, zOrder: number, polygon?: ReadonlyArray<Vec3>, opaque?: boolean, style?: PolygonStyle): zOrderElement => ({
  element,
  zOrder,
  ...(polygon && { polygon }),
  ...(opaque && { opaque }),
  ...(style && { style }),
});

/** Whether a fill hides what's behind it: fully opaque, and not transparent, e.g. a sketch's default background */
export const isOpaque = (fill: string, opacity: number): boolean => opacity >= 1 && !/^(transparent|none|rgba\(.*,\s*0(\.0*)?\s*\))$/.test(fill);

/** Twice the signed area of a polygon on screen */
export function getArea(points: ReadonlyArray<Vec2>): number {
  return points.reduce((sum, p, i) => {
    const q = points[(i + 1) % points.length]!;
    return sum + p.x * q.y - q.x * p.y;
  }, 0);
}

export const stBW = 0.7;
export const stN = 0.1;

export const gray = "rgb(85, 85, 85)";
export const white = "rgb(255, 255, 255)";
export const transparent = "rgba(255, 255, 255, 0)";
export const black = "rgb(15, 15, 15)";

export type ImageDataUri = `data:image/png;base64,${string}` | `data:image/jpeg;base64,${string}` | `data:image/svg+xml,${string}`;

/** A view, or a three-quarter one from the front's top left or top right, which shows the front foremost, the top and that side */
export type SvgView = View | "TopLeft" | "TopRight";

export type SvgOptions = {
  readonly view: SvgView;
  readonly stroke_thickness: number;
  readonly only_stroke: boolean;
  readonly gray_scale: boolean;
  readonly background: string;
  readonly rotation: number;
  readonly imageBg: boolean;

  readonly font: string;
  readonly imageDataByUrl: Record<string, ImageDataUri>;
  /** Its svg's class besides `classNames.root`, e.g. sized to fill its box */
  readonly className: string;
};

export function svgTrsMatrix(translation: Vec2, rotation: Vec3, scale?: Vec2): string {
  const xRot = vec3TransRot({ x: 1, y: 0, z: 0 }, vec3Zero, rotation);
  const yRot = vec3TransRot({ x: 0, y: -1, z: 0 }, vec3Zero, rotation);

  const x2D = { x: xRot.x, y: -xRot.y };
  const y2D = { x: yRot.x, y: -yRot.y };

  const sx = scale?.x ?? 1;
  const sy = scale?.y ?? 1;

  const a = x2D.x * sx;
  const b = x2D.y * sx;
  const c = y2D.x * sy;
  const d = y2D.y * sy;
  const e = translation.x;
  const f = translation.y;

  return `matrix(${svgNum(a)} ${svgNum(b)} ${svgNum(c)} ${svgNum(d)} ${svgNum(e)} ${svgNum(f)})`;
}

const svgNum = (num: number): string => {
  if (Math.abs(num) < 1e-9) {
    return "0";
  }
  return num.toFixed(6);
};
