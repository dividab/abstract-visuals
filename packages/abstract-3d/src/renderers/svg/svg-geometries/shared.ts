import { vec2, Vec2, vec3, Vec3, View } from "../../../abstract-3d.js";

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
  readonly stroke: number;
  readonly scale: { readonly size: number; readonly scaleByWidth: boolean } | undefined;
  readonly onlyStroke: boolean;
  readonly grayScale: boolean;
  readonly onlyStrokeFill: string;
  readonly font: string;
  readonly imageDataByUrl: Record<string, ImageDataUri>;
  readonly rotation: number;
};

export function eulerToSvgMatrix(rot: Vec3, pos: Vec2, origin?: Vec2): string {
  const rx = rot.x;
  const ry = rot.y;
  const rz = rot.z;

  const cx = Math.cos(rx);
  const cy = Math.cos(ry);
  const cz = Math.cos(rz);
  const sx = Math.sin(rx);
  const sy = Math.sin(ry);
  const sz = Math.sin(rz);

  const rotate3D = (v: Vec3): Vec3 => {
    return {
      x: v.x * (cy * cz) + v.y * (-cy * sz) + v.z * sy,
      y: v.x * (sx * sy * cz + cx * sz) + v.y * (-sx * sy * sz + cx * cz) + v.z * (-sx * cy),
      z: v.x * (-cx * sy * cz + sx * sz) + v.y * (cx * sy * sz + sx * cz) + v.z * (cx * cy),
    };
  };

  const ori = origin ?? vec2(0, 0);
  const originRotated = rotate3D(vec3(ori.x, ori.y, 0));

  const xRot = rotate3D({ x: 1, y: 0, z: 0 });
  const yRot = rotate3D({ x: 0, y: -1, z: 0 });

  const x2D = { x: xRot.x, y: -xRot.y };
  const y2D = { x: yRot.x, y: -yRot.y };

  const lenX = Math.hypot(x2D.x, x2D.y);
  const lenY = Math.hypot(y2D.x, y2D.y);
  const xN = { x: x2D.x / lenX, y: x2D.y / lenX };
  const yN = { x: y2D.x / lenY, y: y2D.y / lenY };

  const a = xN.x * lenX;
  const b = xN.y * lenX;
  const c = yN.x * lenY;
  const d = yN.y * lenY;
  const e = pos.x - originRotated.x;
  const f = pos.y - originRotated.y;

  return `matrix(${a} ${b} ${c} ${d} ${e} ${f})`;
}
