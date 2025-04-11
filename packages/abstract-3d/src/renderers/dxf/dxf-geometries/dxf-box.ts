import { Box, Material, Vec3, vec3TransRot, vec3RotCombine, vec3Zero, vec3Scale, vec3 } from "../../../abstract-3d.js";
import { color } from "../color.js";
import { dxf3DFACE } from "../dxf-encoding.js";

export function dxfBox(b: Box, m: Material, parentPos: Vec3, parentRot: Vec3, handleRef: {handle: number}): string {
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
  const mat = color(m.normal);
  return (
    dxf3DFACE(v1, v2, v3, v4, mat, handleRef) + // front
    dxf3DFACE(v5, v6, v7, v8, mat, handleRef) + // Back
    dxf3DFACE(v5, v1, v4, v8, mat, handleRef) + // Left
    dxf3DFACE(v6, v2, v3, v7, mat, handleRef) + // Right
    dxf3DFACE(v8, v7, v3, v4, mat, handleRef) + // Top
    dxf3DFACE(v5, v6, v2, v1, mat, handleRef) // Bottom
  );
}
