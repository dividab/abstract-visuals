import {
  Plane,
  Material,
  Vec3,
  vec2Scale,
  vec3TransRot,
  vec3RotCombine,
  vec3Zero,
  vec3,
} from "../../../abstract-3d.js";
import { color } from "../color.js";
import { dxf3DFACE } from "../dxf-encoding.js";

export function dxfPlane(p: Plane, m: Material, parentPos: Vec3, parentRot: Vec3, handleRef: {handle: number}): string {
  const half = vec2Scale(p.size, 0.5);
  const pos = vec3TransRot(p.pos, parentPos, parentRot);
  const rot = vec3RotCombine(parentRot, p.rot ?? vec3Zero);
  const vec3tr = (x: number, y: number): Vec3 => vec3TransRot(vec3(x, y, 0), pos, rot);
  return dxf3DFACE(
    vec3tr(-half.x, -half.y),
    vec3tr(half.x, -half.y),
    vec3tr(half.x, half.y),
    vec3tr(-half.x, half.y),
    color(m.normal), 
    handleRef
  );
}
