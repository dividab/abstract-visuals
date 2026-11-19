import type { Shape, Material, Vec3 } from "../../../abstract-3d.js";
import { vec3TransRot, vec3RotCombine, vec3Zero } from "../../../abstract-3d.js";
import type { MutableStep } from "../step-encoding.js";
import { stepProduct } from "../step-encoding.js";
import { PLANE_THICKNESS, stepExtrusion } from "./step-prism.js";

/** Without a thickness it's flat, as thin as a plane */
export function stepShape(s: Shape, mat: Material, parentPos: Vec3, parentRot: Vec3, m: MutableStep): void {
  const pos = vec3TransRot(s.pos, parentPos, parentRot);
  const rot = vec3RotCombine(parentRot, s.rot ?? vec3Zero);
  const brep = stepExtrusion(s.points, s.holes, s.thickness > 0 ? s.thickness : PLANE_THICKNESS, pos, rot, m);
  if (brep !== undefined) {
    stepProduct("solids", [brep], "Shape", mat, m);
  }
}
