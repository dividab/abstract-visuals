import type { Material, Vec3, Cone } from "../../../abstract-3d.js";
import type { MutableStep } from "../step-encoding.js";
import { stepCylinder } from "./step-cylinder.js";

export function stepCone(c: Cone, mat: Material, parentPos: Vec3, parentRot: Vec3, m: MutableStep): void {
  stepCylinder({ type: "Cylinder", pos: c.pos, rot: c.rot, length: c.length, radius: c.radius, radiusEnd: 0 }, mat, parentPos, parentRot, m);
}
