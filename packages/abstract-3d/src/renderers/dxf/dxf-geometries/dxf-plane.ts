import {
  type Plane,
  type Material,
  type Vec3,
  vec2Scale,
  vec3,
  vec3TransRot,
  vec3RotCombine,
  vec3Zero,
} from "../../../abstract-3d.js";
import type { Handle } from "../dxf-encoding/dxf-common.js";
import { dxfEnc3DFace } from "../dxf-encoding/dxf-3dface.js";

export function dxfPlane(p: Plane, m: Material, parentPos: Vec3, parentRot: Vec3, handleRef: Handle): string {
  const half = vec2Scale(p.size, 0.5);
  const pos = vec3TransRot(p.pos, parentPos, parentRot);
  const rot = vec3RotCombine(parentRot, p.rot ?? vec3Zero);
  const vec3tr = (x: number, y: number): Vec3 => vec3TransRot(vec3(x, y, 0), pos, rot);
  return dxfEnc3DFace(
    vec3tr(-half.x, -half.y),
    vec3tr(half.x, -half.y),
    vec3tr(half.x, half.y),
    vec3tr(-half.x, half.y),
    m.normal,
    handleRef
  );
}
