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
  readonly background: string;
  readonly rotation: number;
  readonly imageBg: boolean;

  readonly font: string;
  readonly imageDataByUrl: Record<string, ImageDataUri>;
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
