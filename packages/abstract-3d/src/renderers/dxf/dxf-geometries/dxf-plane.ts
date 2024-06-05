import * as A3D from "../../../abstract-3d";
import { dxf3DFACE } from "../dxf-encoding";

export function dxfPlane(p: A3D.Plane, m: A3D.Material, parentPos: A3D.Vec3, parentRot: A3D.Vec3): string {
  const half = A3D.vec2Scale(p.size, 0.5);
  const pos = A3D.vec3TransRot(p.pos, parentPos, parentRot);
  const rot = A3D.vec3RotCombine(parentRot, p.rot);
  const vec3tr = (x: number, y: number): A3D.Vec3 => A3D.vec3TransRot(A3D.vec3(x, y, 0), pos, rot);
  return dxf3DFACE(
    vec3tr(-half.x, -half.y),
    vec3tr(half.x, -half.y),
    vec3tr(half.x, half.y),
    vec3tr(-half.x, half.y),
    m.dxf
  );
}
