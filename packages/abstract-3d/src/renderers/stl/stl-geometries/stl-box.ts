import * as A3D from "../../../abstract-3d.js";
import { stlTriangle } from "../stl-encoding.js";

export function stlBox(b: A3D.Box, _m: A3D.Material, parentPos: A3D.Vec3, parentRot: A3D.Vec3): string {
  const half = A3D.vec3Scale(b.size, 0.5);
  const pos = A3D.vec3TransRot(b.pos, parentPos, parentRot);
  const rot = A3D.vec3RotCombine(parentRot, b.rot ?? A3D.vec3Zero);
  const vec3tr = (x: number, y: number, z: number): A3D.Vec3 => A3D.vec3TransRot(A3D.vec3(x, y, z), pos, rot);

  const v1 = vec3tr(-half.x, -half.y, half.z);
  const v2 = vec3tr(half.x, -half.y, half.z);
  const v3 = vec3tr(half.x, half.y, half.z);
  const v4 = vec3tr(-half.x, half.y, half.z);
  const v5 = vec3tr(-half.x, -half.y, -half.z);
  const v6 = vec3tr(half.x, -half.y, -half.z);
  const v7 = vec3tr(half.x, half.y, -half.z);
  const v8 = vec3tr(-half.x, half.y, -half.z);

  return (
    stlTriangle(v1, v2, v3) + // front
    stlTriangle(v3, v4, v1) +
    stlTriangle(v5, v6, v7) + // Back
    stlTriangle(v7, v8, v5) +
    stlTriangle(v5, v1, v4) + // Left
    stlTriangle(v8, v4, v5) +
    stlTriangle(v6, v2, v3) + // Right
    stlTriangle(v3, v7, v6) +
    stlTriangle(v8, v7, v3) + // Top
    stlTriangle(v3, v4, v8) +
    stlTriangle(v5, v6, v2) + // Bottom
    stlTriangle(v2, v1, v5)
  );
}
