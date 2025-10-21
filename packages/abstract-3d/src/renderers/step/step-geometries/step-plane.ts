import {
  Plane,
  Material,
  Vec3,
  vec3,
  Box,
} from "../../../abstract-3d.js";
import {
  MutableStep,
} from "../step-encoding.js";
import { stepBox } from "./step-box.js";

const PLANE_THICKNESS = 1e-4;

export function stepPlane(p: Plane, mat: Material, parentPos: Vec3, parentRot: Vec3, m: MutableStep): void {
  //convert it into a box
  const box: Box = {
    type: "Box",
    pos: p.pos,
    rot: p.rot,
    holes: p.holes,
    size: vec3(p.size.x, p.size.y, PLANE_THICKNESS),
  };
  stepBox(box, mat, parentPos, parentRot, m);
}