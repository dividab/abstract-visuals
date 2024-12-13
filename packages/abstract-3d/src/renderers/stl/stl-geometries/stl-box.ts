import { Box, Material, Vec3, vec3Scale, vec3TransRot, vec3RotCombine, vec3Zero, vec3 } from "../../../abstract-3d.js";
import { stlTriangle } from "../stl-encoding.js";

export function stlBox(b: Box, _m: Material, parentPos: Vec3, parentRot: Vec3): string {
  const half = vec3Scale(b.size, 0.5);
  const pos = vec3TransRot(b.pos, parentPos, parentRot);
  const rot = vec3RotCombine(parentRot, b.rot ?? vec3Zero);
  const vec3tr = (x: number, y: number, z: number): Vec3 => vec3TransRot(vec3(x, y, z), pos, rot);

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
