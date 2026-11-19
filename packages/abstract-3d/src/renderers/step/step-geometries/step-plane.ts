import type { Plane, Material, Vec3 } from "../../../abstract-3d.js";
import { vec3TransRot, vec3RotCombine, vec3Zero } from "../../../abstract-3d.js";
import type { MutableStep } from "../step-encoding.js";
import { stepProduct } from "../step-encoding.js";
import { PLANE_THICKNESS, rectangle, stepExtrusion } from "./step-prism.js";

export function stepPlane(p: Plane, mat: Material, parentPos: Vec3, parentRot: Vec3, m: MutableStep): void {
  const pos = vec3TransRot(p.pos, parentPos, parentRot);
  const rot = vec3RotCombine(parentRot, p.rot ?? vec3Zero);
  const brep = stepExtrusion(rectangle(p.size), p.holes, PLANE_THICKNESS, pos, rot, m);
  if (brep !== undefined) {
    stepProduct("solids", [brep], "Plane", mat, m);
  }
}
