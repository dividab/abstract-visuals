import type { Vec3 } from "../../../abstract-3d.js";
import { dxfEnc3DFace } from "./dxf-3dface.js";
import type { Handle } from "./dxf-common.js";
import { dxfEncSolid } from "./dxf-solid.js";

export const dxfEnc3DFaceTriangle = (vec1: Vec3, vec2: Vec3, vec3: Vec3, style: string, handleRef: Handle, blockRefHandle?: string): string =>
  dxfEnc3DFace(vec1, vec2, vec3, vec3, style, handleRef, blockRefHandle);

export const dxfEncSolidTriangle = (vec1: Vec3, vec2: Vec3, vec3: Vec3, style: string, handleRef: Handle, blockRefHandle?: string): string =>
  dxfEncSolid(vec1, vec2, vec3, vec3, style, handleRef, blockRefHandle);
