import {
  type Box,
  type Material,
  type Vec3,
  vec3,
  vec3RotCombine,
  vec3Scale, 
  vec3TransRot,
  vec3Zero,
} from "../../../abstract-3d.js";
import type { Handle } from "../dxf-encoding/dxf-common.js";
import { dxfEnc3DFace } from "../dxf-encoding/dxf-3dface.js";

export function dxfBox(b: Box, m: Material, parentPos: Vec3, parentRot: Vec3, handleRef: Handle): string {
  const pos = vec3TransRot(b.pos, parentPos, parentRot);
  const rot = vec3RotCombine(parentRot, b.rot ?? vec3Zero);
  const half = vec3Scale(b.size, 0.5);
  const vec3tr3 = (x: number, y: number, z: number): Vec3 => vec3TransRot(vec3(x, y, z), pos, rot);

  const v1 = vec3tr3(-half.x, -half.y, half.z);
  const v2 = vec3tr3(half.x, -half.y, half.z);
  const v3 = vec3tr3(half.x, half.y, half.z);
  const v4 = vec3tr3(-half.x, half.y, half.z);
  const v5 = vec3tr3(-half.x, -half.y, -half.z);
  const v6 = vec3tr3(half.x, -half.y, -half.z);
  const v7 = vec3tr3(half.x, half.y, -half.z);
  const v8 = vec3tr3(-half.x, half.y, -half.z);
  return (
    dxfEnc3DFace(v1, v2, v3, v4, m.normal, handleRef) + // front
    dxfEnc3DFace(v5, v6, v7, v8, m.normal, handleRef) + // Back
    dxfEnc3DFace(v5, v1, v4, v8, m.normal, handleRef) + // Left
    dxfEnc3DFace(v6, v2, v3, v7, m.normal, handleRef) + // Right
    dxfEnc3DFace(v8, v7, v3, v4, m.normal, handleRef) + // Top
    dxfEnc3DFace(v5, v6, v2, v1, m.normal, handleRef) // Bottom
  );
}
