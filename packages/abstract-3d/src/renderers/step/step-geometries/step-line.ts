import type { CulledLine, Line, Material, Vec3 } from "../../../abstract-3d.js";
import { vec3Dist, vec3TransRot } from "../../../abstract-3d.js";
import type { MutableStep } from "../step-encoding.js";
import { CARTESIAN_POINT, GEOMETRIC_CURVE_SET, POLYLINE, stepProduct } from "../step-encoding.js";

/** A wire, as the viewer draws lines a number of pixels thick whatever the distance, not as solids */
export function stepLine(l: Line | CulledLine, mat: Material, parentPos: Vec3, parentRot: Vec3, m: MutableStep): void {
  const [start, end] = [vec3TransRot(l.start, parentPos, parentRot), vec3TransRot(l.end, parentPos, parentRot)];
  if (vec3Dist(start, end) === 0) {
    return;
  }
  const curves = GEOMETRIC_CURVE_SET([POLYLINE([CARTESIAN_POINT(start, m), CARTESIAN_POINT(end, m)], m)], m);
  stepProduct("curves", [curves], "Line", mat, m);
}
