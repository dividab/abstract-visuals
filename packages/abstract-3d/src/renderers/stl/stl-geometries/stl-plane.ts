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
import { stlTriangle } from "../stl-encoding.js";

export function stlPlane(p: Plane, _m: Material, parentPos: Vec3, parentRot: Vec3): string {
  const half = vec2Scale(p.size, 0.5);
  const pos = vec3TransRot(p.pos, parentPos, parentRot);
  const rot = vec3RotCombine(parentRot, p.rot ?? vec3Zero);
  const vec3tr = (x: number, y: number): Vec3 => vec3TransRot(vec3(x, y, 0), pos, rot);
  const [v1, v2, v3, v4] = [
    vec3tr(-half.x, -half.y),
    vec3tr(half.x, -half.y),
    vec3tr(half.x, half.y),
    vec3tr(-half.x, half.y),
  ];
  return stlTriangle(v1, v2, v3) + stlTriangle(v3, v4, v1);
}
