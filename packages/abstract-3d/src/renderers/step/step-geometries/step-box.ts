import * as A3D from "../../../abstract-3d";
import { parseRgb } from "../../shared";
import {
  ADVANCED_FACEbig,
  MECHANICAL_DESIGN_GEOMETRIC_PRESENTATION_REPRESENTATION,
  ORIENTED_EDGE_big,
  PLANEbig,
  CLOSED_SHELL,
  MANIFOLD_SOLID_BREP,
  ADVANCED_BREP_SHAPE_REPRESENTATION,
  CARTESIAN_POINT,
  VERTEX_POINT,
} from "../step-encoding";

export function stepBox(
  b: A3D.Box,
  m: A3D.Material,
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

  const n1 = A3D.vec3RotCombine(A3D.vec3PosX, rot);
  const n2 = A3D.vec3RotCombine(A3D.vec3PosY, rot);
  const n3 = A3D.vec3RotCombine(A3D.vec3PosZ, rot);
  const n4 = A3D.vec3RotCombine(A3D.vec3NegX, rot);
  const n5 = A3D.vec3RotCombine(A3D.vec3NegY, rot);
  const n6 = A3D.vec3RotCombine(A3D.vec3NegZ, rot);

  const step = `
${CARTESIAN_POINT(v1, i + 1)}
${CARTESIAN_POINT(v2, i + 2)}
${CARTESIAN_POINT(v3, i + 3)}
${CARTESIAN_POINT(v4, i + 4)}
${CARTESIAN_POINT(v5, i + 5)}
${CARTESIAN_POINT(v6, i + 6)}
${CARTESIAN_POINT(v7, i + 7)}
${CARTESIAN_POINT(v8, i + 8)}
${VERTEX_POINT(i + 1, i + 9)}
${VERTEX_POINT(i + 2, i + 10)}
${VERTEX_POINT(i + 3, i + 11)}
${VERTEX_POINT(i + 4, i + 12)}
${VERTEX_POINT(i + 5, i + 13)}
${VERTEX_POINT(i + 6, i + 14)}
${VERTEX_POINT(i + 7, i + 15)}
${VERTEX_POINT(i + 8, i + 16)}
${ORIENTED_EDGE_big(i + 1, i + 9, i + 10, i + 17)}
${ORIENTED_EDGE_big(i + 2, i + 10, i + 11, i + 22)}
${ORIENTED_EDGE_big(i + 3, i + 11, i + 12, i + 27)}
${ORIENTED_EDGE_big(i + 4, i + 12, i + 9, i + 32)}
${ORIENTED_EDGE_big(i + 8, i + 16, i + 15, i + 37)}
${ORIENTED_EDGE_big(i + 7, i + 15, i + 14, i + 42)}
${ORIENTED_EDGE_big(i + 6, i + 14, i + 13, i + 47)}
${ORIENTED_EDGE_big(i + 5, i + 13, i + 16, i + 52)}
${ORIENTED_EDGE_big(i + 1, i + 9, i + 13, i + 57)}
${ORIENTED_EDGE_big(i + 5, i + 13, i + 16, i + 62)}
${ORIENTED_EDGE_big(i + 8, i + 16, i + 12, i + 67)}
${ORIENTED_EDGE_big(i + 4, i + 12, i + 9, i + 72)}
${ORIENTED_EDGE_big(i + 2, i + 10, i + 14, i + 77)}
${ORIENTED_EDGE_big(i + 6, i + 14, i + 15, i + 82)}
${ORIENTED_EDGE_big(i + 7, i + 15, i + 11, i + 87)}
${ORIENTED_EDGE_big(i + 3, i + 11, i + 10, i + 92)}
${ORIENTED_EDGE_big(i + 4, i + 12, i + 16, i + 97)}
${ORIENTED_EDGE_big(i + 8, i + 16, i + 15, i + 102)}
${ORIENTED_EDGE_big(i + 7, i + 15, i + 11, i + 107)}
${ORIENTED_EDGE_big(i + 3, i + 11, i + 12, i + 112)}
${ORIENTED_EDGE_big(i + 1, i + 9, i + 10, i + 117)}
${ORIENTED_EDGE_big(i + 2, i + 10, i + 14, i + 122)}
${ORIENTED_EDGE_big(i + 6, i + 14, i + 13, i + 127)}
${ORIENTED_EDGE_big(i + 5, i + 13, i + 9, i + 132)}
${ADVANCED_FACEbig(i + 17, i + 22, i + 27, i + 32, i + 170, i + 137)}
${ADVANCED_FACEbig(i + 37, i + 42, i + 47, i + 52, i + 185, i + 142)}
${ADVANCED_FACEbig(i + 57, i + 62, i + 67, i + 72, i + 190, i + 147)}
${ADVANCED_FACEbig(i + 77, i + 82, i + 87, i + 92, i + 175, i + 152)}
${ADVANCED_FACEbig(i + 97, i + 102, i + 107, i + 112, i + 180, i + 157)}
${ADVANCED_FACEbig(i + 117, i + 122, i + 127, i + 132, i + 195, i + 162)}
${ADVANCED_BREP_SHAPE_REPRESENTATION(i + 168, i + 169)}
${MANIFOLD_SOLID_BREP(i + 167, i + 168)}
${CLOSED_SHELL(i + 137, i + 142, i + 147, i + 152, i + 157, i + 162, i + 167)}
${PLANEbig(n3, n1, i + 170)}
${PLANEbig(n1, n6, i + 175)}
${PLANEbig(n2, n1, i + 180)}
${PLANEbig(n6, n4, i + 185)}
${PLANEbig(n4, n3, i + 190)}
${PLANEbig(n5, n4, i + 195)}
${MECHANICAL_DESIGN_GEOMETRIC_PRESENTATION_REPRESENTATION(parseRgb(m.normal), i + 168, i + 200)}`;

  return [step, 211];
}
