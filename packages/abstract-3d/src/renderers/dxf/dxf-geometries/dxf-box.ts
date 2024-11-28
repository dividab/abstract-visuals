import * as A3D from "../../../abstract-3d.js";
import { color } from "../color.js";
import { dxf3DFACE } from "../dxf-encoding.js";

export function dxfBox(b: A3D.Box, m: A3D.Material, parentPos: A3D.Vec3, parentRot: A3D.Vec3): string {
  const pos = A3D.vec3TransRot(b.pos, parentPos, parentRot);
  const rot = A3D.vec3RotCombine(parentRot, b.rot ?? A3D.vec3Zero);
  const half = A3D.vec3Scale(b.size, 0.5);
  const vec3tr3 = (x: number, y: number, z: number): A3D.Vec3 => A3D.vec3TransRot(A3D.vec3(x, y, z), pos, rot);

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
    dxf3DFACE(v1, v2, v3, v4, mat) + // front
    dxf3DFACE(v5, v6, v7, v8, mat) + // Back
    dxf3DFACE(v5, v1, v4, v8, mat) + // Left
    dxf3DFACE(v6, v2, v3, v7, mat) + // Right
    dxf3DFACE(v8, v7, v3, v4, mat) + // Top
    dxf3DFACE(v5, v6, v2, v1, mat) // Bottom
  );
}
