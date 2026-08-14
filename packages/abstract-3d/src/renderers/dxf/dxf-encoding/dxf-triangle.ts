import type { Vec3 } from "../../../abstract-3d.js";
import type { DxfColor } from "./dxf-color.js";
import type { Handle } from "./dxf-common.js";
import { dxfEncQuad } from "./dxf-quad.js";

export const dxfEncTriangle = (
  vec1: Vec3,
  vec2: Vec3,
  vec3: Vec3,
  col: DxfColor,
  handleRef: Handle
): string => dxfEncQuad(vec1, vec2, vec3, vec3, col, handleRef);