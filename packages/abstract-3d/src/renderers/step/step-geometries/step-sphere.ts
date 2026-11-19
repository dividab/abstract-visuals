import type { Material, Sphere, Vec3 } from "../../../abstract-3d.js";
import { vec3, vec3Add, vec3TransRot } from "../../../abstract-3d.js";
import type { MutableStep } from "../step-encoding.js";
import {
  ADVANCED_FACE,
  AXIS2_PLACEMENT_3D,
  CARTESIAN_POINT,
  CLOSED_SHELL,
  DIRECTION,
  FACE_BOUND,
  MANIFOLD_SOLID_BREP,
  SPHERICAL_SURFACE,
  stepProduct,
  VERTEX_LOOP,
  VERTEX_POINT,
} from "../step-encoding.js";

/** One face all around, bounded only by its bottom pole */
export function stepSphere(s: Sphere, mat: Material, parentPos: Vec3, parentRot: Vec3, m: MutableStep): void {
  if (s.radius <= 0) {
    return;
  }
  const center = vec3TransRot(s.pos, parentPos, parentRot);
  const pole = VERTEX_POINT(CARTESIAN_POINT(vec3Add(center, vec3(0, -s.radius, 0)), m), m);
  const surface = SPHERICAL_SURFACE(
    AXIS2_PLACEMENT_3D(CARTESIAN_POINT(center, m), DIRECTION(vec3(0, 1, 0), m), DIRECTION(vec3(1, 0, 0), m), m),
    s.radius,
    m
  );
  const face = ADVANCED_FACE([FACE_BOUND(VERTEX_LOOP(pole, m), "T", m)], surface, m, "T");
  stepProduct("solids", [MANIFOLD_SOLID_BREP(CLOSED_SHELL([face], m), m)], "Sphere", mat, m);
}
