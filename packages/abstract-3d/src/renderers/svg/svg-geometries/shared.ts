import { vec2, Vec2, vec3, Vec3, vec3TransRot, vec3Zero, View } from "../../../abstract-3d.js";

export type zOrderElement = { readonly element: string; readonly zOrder: number };
export const zElem = (element: string, zOrder: number): zOrderElement => ({ element, zOrder });

export const stBW = 0.7;
export const stN = 0.1;

export const gray = "rgb(85, 85, 85)";
export const white = "rgb(255, 255, 255)";
export const transparent = "rgba(255, 255, 255, 0)";
export const black = "rgb(15, 15, 15)";

export type ImageDataUri =
  | `data:image/png;base64,${string}`
  | `data:image/jpeg;base64,${string}`
  | `data:image/svg+xml,${string}`;

export type SvgOptions = {
  readonly view: View;
  readonly stroke_thickness: number;
  readonly only_stroke: boolean;
  readonly gray_scale: boolean;
  readonly only_stroke_fill: string;
  readonly rotation: number;

  readonly font: string;
  readonly imageDataByUrl: Record<string, ImageDataUri>;
};

export function svgTrsMatrix(translation: Vec2, rotation: Vec3, scale?: Vec2): string {
  const xRot = vec3TransRot({ x: 1, y: 0, z: 0 }, vec3Zero, rotation);
  const yRot = vec3TransRot({ x: 0, y: -1, z: 0 }, vec3Zero, rotation);

  const x2D = { x: xRot.x, y: -xRot.y };
  const y2D = { x: yRot.x, y: -yRot.y };

  const lenX = Math.hypot(x2D.x, x2D.y);
  const lenY = Math.hypot(y2D.x, y2D.y);
  const xN = { x: x2D.x / lenX, y: x2D.y / lenX };
  const yN = { x: y2D.x / lenY, y: y2D.y / lenY };

  const sx = scale?.x ?? 1;
  const sy = scale?.y ?? 1;

  const a = xN.x * lenX * sx;
  const b = xN.y * lenX * sx;
  const c = yN.x * lenY * sy;
  const d = yN.y * lenY * sy;
  const e = translation.x;
  const f = translation.y;

  return `matrix(${a} ${b} ${c} ${d} ${e} ${f})`;
}
