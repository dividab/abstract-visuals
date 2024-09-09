import * as A3D from "../../../abstract-3d";
import { ADVANCED_FACE, CARTESIAN_POINT, CLOSED_SHELL, MANIFOLD_SOLID_BREP, POLY_LOOP } from "../step-encoding";

export function stepBox(
  b: A3D.Box,
  _m: A3D.Material,
  parentPos: A3D.Vec3,
  parentRot: A3D.Vec3,
  refIdx: number
): readonly [string, number] {
  const half = A3D.vec3Scale(b.size, 0.5);
  const pos = A3D.vec3TransRot(b.pos, parentPos, parentRot);
  const rot = A3D.vec3RotCombine(parentRot, b.rot ?? A3D.vec3Zero);
  const vec3tr = (x: number, y: number, z: number): A3D.Vec3 => A3D.vec3TransRot(A3D.vec3(x, y, z), pos, rot);

  const v1 = vec3tr(-half.x, -half.y, -half.z);
  const v2 = vec3tr(half.x, -half.y, -half.z);
  const v3 = vec3tr(half.x, half.y, -half.z);
  const v4 = vec3tr(-half.x, half.y, -half.z);
  const v5 = vec3tr(-half.x, -half.y, half.z);
  const v6 = vec3tr(half.x, -half.y, half.z);
  const v7 = vec3tr(half.x, half.y, half.z);
  const v8 = vec3tr(-half.x, half.y, half.z);

  const step = `
${CARTESIAN_POINT(v1, refIdx + 1)}
${CARTESIAN_POINT(v2, refIdx + 2)}
${CARTESIAN_POINT(v3, refIdx + 3)}
${CARTESIAN_POINT(v4, refIdx + 4)}
${CARTESIAN_POINT(v5, refIdx + 5)}
${CARTESIAN_POINT(v6, refIdx + 6)}
${CARTESIAN_POINT(v7, refIdx + 7)}
${CARTESIAN_POINT(v8, refIdx + 8)}
${POLY_LOOP(refIdx + 1, refIdx + 2, refIdx + 3, refIdx + 4, refIdx + 9)}
${POLY_LOOP(refIdx + 5, refIdx + 6, refIdx + 7, refIdx + 8, refIdx + 10)}
${POLY_LOOP(refIdx + 1, refIdx + 5, refIdx + 8, refIdx + 4, refIdx + 11)}
${POLY_LOOP(refIdx + 2, refIdx + 6, refIdx + 7, refIdx + 3, refIdx + 12)}
${POLY_LOOP(refIdx + 1, refIdx + 2, refIdx + 6, refIdx + 5, refIdx + 13)}
${POLY_LOOP(refIdx + 4, refIdx + 3, refIdx + 7, refIdx + 8, refIdx + 14)}
${ADVANCED_FACE(refIdx + 9, refIdx + 15)}
${ADVANCED_FACE(refIdx + 10, refIdx + 16)}
${ADVANCED_FACE(refIdx + 11, refIdx + 17)}
${ADVANCED_FACE(refIdx + 12, refIdx + 18)}
${ADVANCED_FACE(refIdx + 13, refIdx + 19)}
${ADVANCED_FACE(refIdx + 14, refIdx + 20)}
${CLOSED_SHELL(refIdx + 15, refIdx + 16, refIdx + 17, refIdx + 18, refIdx + 19, refIdx + 20, refIdx + 21)}
${MANIFOLD_SOLID_BREP(refIdx + 21, refIdx + 22)}`;

  return [step, 22];
}
