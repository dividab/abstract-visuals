import {
  Material,
  Vec3,
  vec3,
  Cone,
  Cylinder,
} from "../../../abstract-3d.js";
import {
  MutableStep,
} from "../step-encoding.js";
import { stepBox } from "./step-box.js";
import { stepCylinder } from "./step-cylinder.js";

const PLANE_THICKNESS = 1e-4;

export function stepCone(c: Cone, mat: Material, parentPos: Vec3, parentRot: Vec3, m: MutableStep): void {
  //convert it into a box
  const cylinder: Cylinder = {
    type: "Cylinder",
    pos: c.pos,
    rot: c.rot,
    length: c.length,
    radius: c.radius,
  };
  stepCylinder(cylinder, mat, parentPos, parentRot, m, 0.0);
}