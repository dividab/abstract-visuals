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
${CARTESIAN_POINT(v5, i + 44)}
${CARTESIAN_POINT(v6, i + 45)}
${CARTESIAN_POINT(v7, i + 46)}
${CARTESIAN_POINT(v8, i + 47)}

${VERTEX_POINT(i + 1, i + 5)}
${VERTEX_POINT(i + 2, i + 6)}
${VERTEX_POINT(i + 3, i + 7)}
${VERTEX_POINT(i + 4, i + 8)}
${VERTEX_POINT(i + 44, i + 48)}
${VERTEX_POINT(i + 45, i + 49)}
${VERTEX_POINT(i + 46, i + 50)}
${VERTEX_POINT(i + 47, i + 51)}

${ORIENTED_EDGE_big(i + 1, i + 5, i + 6, A3D.vec3(1, 0, 0), i + 9)}
${ORIENTED_EDGE_big(i + 2, i + 6, i + 7, A3D.vec3(0, 1, 0), i + 14)}
${ORIENTED_EDGE_big(i + 3, i + 7, i + 8, A3D.vec3(1, 0, 0), i + 19)}
${ORIENTED_EDGE_big(i + 4, i + 8, i + 5, A3D.vec3(0, 1, 0), i + 24)}
${ORIENTED_EDGE_big(i + 47, i + 51, i + 50, A3D.vec3(-1, 0, 0), i + 52)}
${ORIENTED_EDGE_big(i + 46, i + 50, i + 49, A3D.vec3(0, -1, 0), i + 57)}
${ORIENTED_EDGE_big(i + 45, i + 49, i + 48, A3D.vec3(-1, 0, 0), i + 62)}
${ORIENTED_EDGE_big(i + 44, i + 48, i + 51, A3D.vec3(0, -1, 0), i + 67)}
${ORIENTED_EDGE_big(i + 1, i + 5, i + 48, A3D.vec3(0, 0, 1), i + 78)}
${ORIENTED_EDGE_big(i + 44, i + 48, i + 51, A3D.vec3(0, 1, 0), i + 83)}
${ORIENTED_EDGE_big(i + 47, i + 51, i + 8, A3D.vec3(0, 0, 1), i + 88)}
${ORIENTED_EDGE_big(i + 4, i + 8, i + 5, A3D.vec3(0, 1, 0), i + 93)}
${ORIENTED_EDGE_big(i + 2, i + 6, i + 49, A3D.vec3(0, 0, 1), i + 109)}
${ORIENTED_EDGE_big(i + 45, i + 49, i + 50, A3D.vec3(0, 1, 0), i + 114)}
${ORIENTED_EDGE_big(i + 46, i + 50, i + 7, A3D.vec3(0, 0, 1), i + 119)}
${ORIENTED_EDGE_big(i + 3, i + 7, i + 6, A3D.vec3(0, 1, 0), i + 124)}
${ORIENTED_EDGE_big(i + 4, i + 8, i + 51, A3D.vec3(0, 0, 1), i + 135)}
${ORIENTED_EDGE_big(i + 47, i + 51, i + 50, A3D.vec3(1, 0, 0), i + 140)}
${ORIENTED_EDGE_big(i + 46, i + 50, i + 7, A3D.vec3(0, 0, 1), i + 145)}
${ORIENTED_EDGE_big(i + 3, i + 7, i + 8, A3D.vec3(1, 0, 0), i + 150)}
${ORIENTED_EDGE_big(i + 1, i + 5, i + 6, A3D.vec3(1, 0, 0), i + 166)}
${ORIENTED_EDGE_big(i + 2, i + 6, i + 49, A3D.vec3(0, 0, 1), i + 171)}
${ORIENTED_EDGE_big(i + 45, i + 49, i + 48, A3D.vec3(1, 0, 0), i + 176)}
${ORIENTED_EDGE_big(i + 44, i + 48, i + 5, A3D.vec3(0, 0, 1), i + 181)}

${ADVANCED_FACEbig(i + 24, i + 9, i + 14, i + 19, i + 38, i + 33)}
${ADVANCED_FACEbig(i + 52, i + 57, i + 62, i + 67, i + 38, i + 72)}
${ADVANCED_FACEbig(i + 78, i + 83, i + 88, i + 93, i + 104, i + 98)}
${ADVANCED_FACEbig(i + 109, i + 114, i + 119, i + 124, i + 104, i + 129)}
${ADVANCED_FACEbig(i + 135, i + 140, i + 145, i + 150, i + 161, i + 155)}
${ADVANCED_FACEbig(i + 166, i + 171, i + 176, i + 181, i + 161, i + 186)}

${PLANEbig(A3D.vec3(0, 0, 1), A3D.vec3(1, 0, 0), i + 38)}
${PLANEbig(A3D.vec3(1, 0, 0), A3D.vec3(0, 1, 0), i + 104)}
${PLANEbig(A3D.vec3(0, 1, 0), A3D.vec3(0, 0, 1), i + 161)}

${ADVANCED_BREP_SHAPE_REPRESENTATION(i + 39, i + 193, i + 194)}
${MANIFOLD_SOLID_BREP(i + 192, i + 193)}
${CLOSED_SHELL(i + 33, i + 72, i + 98, i + 129, i + 155, i + 186, i + 192)}


`;

  return [step, 194];
}

// ${MANIFOLD_SURFACE_SHAPE_REPRESENTATION(i + 39, i + 33, i + 43)}
// ${MANIFOLD_SURFACE_SHAPE_REPRESENTATION(i + 39, i + 72, i + 77)}
// ${MANIFOLD_SURFACE_SHAPE_REPRESENTATION(i + 39, i + 98, i + 103)}
// ${MANIFOLD_SURFACE_SHAPE_REPRESENTATION(i + 39, i + 129, i + 134)}
// ${MANIFOLD_SURFACE_SHAPE_REPRESENTATION(i + 39, i + 155, i + 160)}
// ${MANIFOLD_SURFACE_SHAPE_REPRESENTATION(i + 39, i + 186, i + 191)}
