import * as A3D from "../../../abstract-3d";
import {
  ADVANCED_BREP_SHAPE_REPRESENTATION,
  ADVANCED_FACE,
  ADVANCED_FACEbig,
  AXIS2_PLACEMENT_3D,
  CARTESIAN_POINT,
  CLOSED_SHELL,
  CLOSED_SHELL2,
  DIRECTION,
  EDGE_CURVE,
  EDGE_LOOP,
  FACE_BOUND,
  LINE,
  MANIFOLD_SOLID_BREP,
  MANIFOLD_SURFACE_SHAPE_REPRESENTATION,
  OPEN_SHELL,
  ORIENTED_EDGE,
  ORIENTED_EDGE_big,
  PLANE,
  PLANEbig,
  SHELL_BASED_SURFACE_MODEL,
  SHELL_BASED_SURFACE_MODEL_big,
  VECTOR,
  VERTEX_POINT,
} from "../step-encoding";

export function stepBox(
  b: A3D.Box,
  _m: A3D.Material,
  parentPos: A3D.Vec3,
  parentRot: A3D.Vec3,
  i: number
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
${CARTESIAN_POINT(v1, i + 1)}
${CARTESIAN_POINT(v2, i + 2)}
${CARTESIAN_POINT(v3, i + 3)}
${CARTESIAN_POINT(v4, i + 4)}
${CARTESIAN_POINT(v5, i + 5)}
${CARTESIAN_POINT(v6, i + 6)}
${CARTESIAN_POINT(v7, i + 7)}
${CARTESIAN_POINT(v8, i + 8)}
${VERTEX_POINT(i + 1, i + 5)}
${VERTEX_POINT(i + 2, i + 6)}
${VERTEX_POINT(i + 3, i + 7)}
${VERTEX_POINT(i + 4, i + 8)}
${VERTEX_POINT(i + 5, i + 9)}
${VERTEX_POINT(i + 6, i + 10)}
${VERTEX_POINT(i + 7, i + 11)}
${VERTEX_POINT(i + 8, i + 12)}
${ORIENTED_EDGE_big(i + 1, i + 5, i + 6, A3D.vec3PosX, i + 13)}
${ORIENTED_EDGE_big(i + 2, i + 6, i + 7, A3D.vec3PosY, i + 18)}
${ORIENTED_EDGE_big(i + 3, i + 7, i + 8, A3D.vec3PosX, i + 23)}
${ORIENTED_EDGE_big(i + 4, i + 8, i + 5, A3D.vec3PosY, i + 28)}
${ORIENTED_EDGE_big(i + 8, i + 12, i + 11, A3D.vec3PosX, i + 33)}
${ORIENTED_EDGE_big(i + 7, i + 11, i + 10, A3D.vec3PosY, i + 38)}
${ORIENTED_EDGE_big(i + 6, i + 10, i + 9, A3D.vec3PosX, i + 43)}
${ORIENTED_EDGE_big(i + 5, i + 9, i + 12, A3D.vec3PosY, i + 48)}
${ORIENTED_EDGE_big(i + 1, i + 5, i + 9, A3D.vec3PosZ, i + 53)}
${ORIENTED_EDGE_big(i + 5, i + 9, i + 12, A3D.vec3PosY, i + 58)}
${ORIENTED_EDGE_big(i + 8, i + 12, i + 8, A3D.vec3PosZ, i + 63)}
${ORIENTED_EDGE_big(i + 4, i + 8, i + 5, A3D.vec3PosY, i + 68)}
${ORIENTED_EDGE_big(i + 2, i + 6, i + 10, A3D.vec3PosZ, i + 73)}
${ORIENTED_EDGE_big(i + 6, i + 10, i + 11, A3D.vec3PosY, i + 78)}
${ORIENTED_EDGE_big(i + 7, i + 11, i + 7, A3D.vec3PosZ, i + 83)}
${ORIENTED_EDGE_big(i + 3, i + 7, i + 6, A3D.vec3PosY, i + 88)}
${ORIENTED_EDGE_big(i + 4, i + 8, i + 12, A3D.vec3PosZ, i + 93)}
${ORIENTED_EDGE_big(i + 8, i + 12, i + 11, A3D.vec3PosX, i + 98)}
${ORIENTED_EDGE_big(i + 7, i + 11, i + 7, A3D.vec3PosZ, i + 103)}
${ORIENTED_EDGE_big(i + 3, i + 7, i + 8, A3D.vec3PosX, i + 108)}
${ORIENTED_EDGE_big(i + 1, i + 5, i + 6, A3D.vec3PosX, i + 113)}
${ORIENTED_EDGE_big(i + 2, i + 6, i + 10, A3D.vec3PosZ, i + 118)}
${ORIENTED_EDGE_big(i + 6, i + 10, i + 9, A3D.vec3PosX, i + 123)}
${ORIENTED_EDGE_big(i + 5, i + 9, i + 5, A3D.vec3PosZ, i + 128)}
${ADVANCED_FACEbig(i + 13, i + 18, i + 23, i + 28, i + 166, i + 133)}
${ADVANCED_FACEbig(i + 33, i + 38, i + 43, i + 48, i + 166, i + 138)}
${ADVANCED_FACEbig(i + 53, i + 58, i + 63, i + 68, i + 171, i + 143)}
${ADVANCED_FACEbig(i + 73, i + 78, i + 83, i + 88, i + 171, i + 148)}
${ADVANCED_FACEbig(i + 93, i + 98, i + 103, i + 108, i + 176, i + 153)}
${ADVANCED_FACEbig(i + 113, i + 118, i + 123, i + 128, i + 176, i + 158)}
${ADVANCED_BREP_SHAPE_REPRESENTATION(i + 167, i + 164, i + 165)}
${MANIFOLD_SOLID_BREP(i + 163, i + 164)}
${CLOSED_SHELL(i + 133, i + 138, i + 143, i + 148, i + 153, i + 158, i + 163)}
${PLANEbig(A3D.vec3PosZ, A3D.vec3PosX, i + 166)}
${PLANEbig(A3D.vec3PosX, A3D.vec3PosY, i + 171)}
${PLANEbig(A3D.vec3PosY, A3D.vec3PosZ, i + 176)}
`;

  return [step, 181];
}

// ${MANIFOLD_SURFACE_SHAPE_REPRESENTATION(i + 39, i + 33, i + 43)}
// ${MANIFOLD_SURFACE_SHAPE_REPRESENTATION(i + 39, i + 72, i + 77)}
// ${MANIFOLD_SURFACE_SHAPE_REPRESENTATION(i + 39, i + 98, i + 103)}
// ${MANIFOLD_SURFACE_SHAPE_REPRESENTATION(i + 39, i + 129, i + 134)}
// ${MANIFOLD_SURFACE_SHAPE_REPRESENTATION(i + 39, i + 155, i + 160)}
// ${MANIFOLD_SURFACE_SHAPE_REPRESENTATION(i + 39, i + 186, i + 191)}
