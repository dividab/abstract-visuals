import type { Box, Material, Vec3 } from "../../../abstract-3d.js";
import { vec2, vec3TransRot, vec3RotCombine, vec3Zero } from "../../../abstract-3d.js";
import type { MutableStep } from "../step-encoding.js";
import { stepProduct } from "../step-encoding.js";
import { rectangle, stepExtrusion } from "./step-prism.js";

/** Holes go through it along z, as in the other renderers */
export function stepBox(b: Box, mat: Material, parentPos: Vec3, parentRot: Vec3, m: MutableStep): void {
  if (b.size.x === 0.0 || b.size.y === 0.0 || b.size.z === 0.0) {
    return;
  }
  const pos = vec3TransRot(b.pos, parentPos, parentRot);
  const rot = vec3RotCombine(parentRot, b.rot ?? vec3Zero);
  const brep = stepExtrusion(rectangle(vec2(b.size.x, b.size.y)), b.holes, b.size.z, pos, rot, m);
  if (brep !== undefined) {
    stepProduct("solids", [brep], "Cube", mat, m);
  }
}
