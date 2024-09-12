import * as A3D from "../../../abstract-3d";
import { parseRgb } from "../../shared";
import {
  CARTESIAN_POINT,
  MANIFOLD_SURFACE_SHAPE_REPRESENTATION,
  MECHANICAL_DESIGN_GEOMETRIC_PRESENTATION_REPRESENTATION,
  ORIENTED_EDGE_big,
  PLANEbig,
  SHELL_BASED_SURFACE_MODEL_big,
  VERTEX_POINT,
} from "../step-encoding";

export function stepPlane(
  p: A3D.Plane,
  m: A3D.Material,
  parentPos: A3D.Vec3,
  parentRot: A3D.Vec3,
  i: number
): readonly [string, number] {
  const half = A3D.vec2Scale(p.size, 0.5);
  const pos = A3D.vec3TransRot(p.pos, parentPos, parentRot);
  const rot = A3D.vec3RotCombine(parentRot, p.rot ?? A3D.vec3Zero);
  const vec3tr = (x: number, y: number): A3D.Vec3 => A3D.vec3TransRot(A3D.vec3(x, y, 0), pos, rot);

  const v1 = vec3tr(-half.x, -half.y);
  const v2 = vec3tr(half.x, -half.y);
  const v3 = vec3tr(half.x, half.y);
  const v4 = vec3tr(-half.x, half.y);
  const n1 = A3D.vec3RotCombine(A3D.vec3PosX, rot);
  const n3 = A3D.vec3RotCombine(A3D.vec3PosZ, rot);

  const step = `
${CARTESIAN_POINT(v1, i + 1)}
${CARTESIAN_POINT(v2, i + 2)}
${CARTESIAN_POINT(v3, i + 3)}
${CARTESIAN_POINT(v4, i + 4)}
${VERTEX_POINT(i + 1, i + 5)}
${VERTEX_POINT(i + 2, i + 6)}
${VERTEX_POINT(i + 3, i + 7)}
${VERTEX_POINT(i + 4, i + 8)}
${ORIENTED_EDGE_big(i + 1, i + 5, i + 6, i + 9)}
${ORIENTED_EDGE_big(i + 2, i + 6, i + 7, i + 14)}
${ORIENTED_EDGE_big(i + 3, i + 7, i + 8, i + 19)}
${ORIENTED_EDGE_big(i + 4, i + 8, i + 5, i + 24)}
${SHELL_BASED_SURFACE_MODEL_big(i + 9, i + 14, i + 19, i + 24, i + 38, i + 33)}
${MANIFOLD_SURFACE_SHAPE_REPRESENTATION(i + 33, i + 43)}
${PLANEbig(n3, n1, i + 38)}
${MECHANICAL_DESIGN_GEOMETRIC_PRESENTATION_REPRESENTATION(parseRgb(m.normal), i + 33, i + 44)}`;
  return [step, 55];
}
