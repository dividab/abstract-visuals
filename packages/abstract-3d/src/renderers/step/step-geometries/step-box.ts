import * as A3D from "../../../abstract-3d";
import {
  ADVANCED_FACE,
  AXIS2_PLACEMENT_3D,
  CARTESIAN_POINT,
  DIRECTION,
  EDGE_CURVE,
  EDGE_LOOP,
  FACE_BOUND,
  LINE,
  MANIFOLD_SURFACE_SHAPE_REPRESENTATION,
  OPEN_SHELL,
  ORIENTED_EDGE,
  PLANE,
  SHELL_BASED_SURFACE_MODEL,
  VECTOR,
  VERTEX_POINT,
} from "../step-encoding";

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
${ORIENTED_EDGE(refIdx + 2, refIdx + 1)}
${EDGE_CURVE(refIdx + 4, refIdx + 6, refIdx + 3, refIdx + 2)}
${LINE(refIdx + 7, refIdx + 8, refIdx + 3)}
${VERTEX_POINT(refIdx + 5, refIdx + 4)}
${CARTESIAN_POINT(v2, refIdx + 5)}
${VERTEX_POINT(refIdx + 7, refIdx + 6)}
${CARTESIAN_POINT(v1, refIdx + 7)}
${VECTOR(refIdx + 9, refIdx + 8)}
${DIRECTION(A3D.vec3(1, 0, 0), refIdx + 9)}

${ORIENTED_EDGE(refIdx + 11, refIdx + 10)}
${EDGE_CURVE(refIdx + 13, refIdx + 15, refIdx + 12, refIdx + 11)}
${LINE(refIdx + 16, refIdx + 17, refIdx + 12)}
${VERTEX_POINT(refIdx + 14, refIdx + 13)}
${CARTESIAN_POINT(v3, refIdx + 14)}
${VERTEX_POINT(refIdx + 16, refIdx + 15)}
${CARTESIAN_POINT(v2, refIdx + 16)}
${VECTOR(refIdx + 18, refIdx + 17)}
${DIRECTION(A3D.vec3(0, 1, 0), refIdx + 18)}

${ORIENTED_EDGE(refIdx + 20, refIdx + 19)}
${EDGE_CURVE(refIdx + 22, refIdx + 24, refIdx + 21, refIdx + 20)}
${LINE(refIdx + 25, refIdx + 26, refIdx + 21)}
${VERTEX_POINT(refIdx + 23, refIdx + 22)}
${CARTESIAN_POINT(v4, refIdx + 23)}
${VERTEX_POINT(refIdx + 25, refIdx + 24)}
${CARTESIAN_POINT(v3, refIdx + 25)}
${VECTOR(refIdx + 27, refIdx + 26)}
${DIRECTION(A3D.vec3(1, 0, 0), refIdx + 27)}

${ORIENTED_EDGE(refIdx + 29, refIdx + 28)}
${EDGE_CURVE(refIdx + 31, refIdx + 33, refIdx + 30, refIdx + 29)}
${LINE(refIdx + 34, refIdx + 35, refIdx + 30)}
${VERTEX_POINT(refIdx + 32, refIdx + 31)}
${CARTESIAN_POINT(v1, refIdx + 32)}
${VERTEX_POINT(refIdx + 34, refIdx + 33)}
${CARTESIAN_POINT(v4, refIdx + 34)}
${VECTOR(refIdx + 36, refIdx + 35)}
${DIRECTION(A3D.vec3(0, 1, 0), refIdx + 36)}

${EDGE_LOOP(refIdx + 1, refIdx + 10, refIdx + 19, refIdx + 28, refIdx + 37)}
${FACE_BOUND(refIdx + 37, refIdx + 38)}
${ADVANCED_FACE(refIdx + 38, refIdx + 46, refIdx + 39)}
${OPEN_SHELL(refIdx + 39, refIdx + 40)}
${SHELL_BASED_SURFACE_MODEL(refIdx + 40, refIdx + 41)}

${DIRECTION(A3D.vec3(0, 0, 1), refIdx + 42)}
${DIRECTION(A3D.vec3(1, 0, 0), refIdx + 43)}
${CARTESIAN_POINT(A3D.vec3(0, 0, 0), refIdx + 44)}
${AXIS2_PLACEMENT_3D(refIdx + 44, refIdx + 42, refIdx + 43, refIdx + 45)}
${PLANE(refIdx + 45, refIdx + 46)}

${MANIFOLD_SURFACE_SHAPE_REPRESENTATION(refIdx + 45, refIdx + 41, refIdx + 47)}
`;

  return [step, 47];
}
