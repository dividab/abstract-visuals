import { type Tube, type Vec3, vec3RotCombine, vec3TransRot, vec3Zero } from "../../../abstract-3d.js";
import { arcPath, catmullRom, tubeArc, tubeRings, tubeSplinePoints } from "../../shared/tube-path.js";
import { dxfEnc3DFace } from "../dxf-encoding/dxf-3dface.js";
import type { Handle } from "../dxf-encoding/dxf-common.js";
import { dxfEnc3DFaceTriangle } from "../dxf-encoding/dxf-triangle.js";

/** Rings of sides around its curve, along an arc as many per turn, along a spline as it turns, joined by quads, its ends closed unless it's a ring */
export function dxfTube(t: Tube, style: string, sides: number, parentPos: Vec3, parentRot: Vec3, handleRef: Handle): string {
  if (t.radius <= 0) {
    return "";
  }
  const pos = vec3TransRot(t.pos, parentPos, parentRot);
  const rot = vec3RotCombine(parentRot, t.rot ?? vec3Zero);
  const arc = tubeArc(t, pos, rot);
  const path =
    arc !== undefined ? arcPath(arc, Math.max(1, Math.ceil((arc.angle * sides) / (Math.PI * 2)))) : catmullRom(tubeSplinePoints(t, pos, rot));
  if (path.points.length < 2) {
    return "";
  }
  const rings = tubeRings(path, t.radius, sides);
  const mantle = rings
    .slice(1)
    .flatMap((b, i) => b.map((_, j) => dxfEnc3DFace(rings[i]![j]!, rings[i]![(j + 1) % sides]!, b[(j + 1) % sides]!, b[j]!, style, handleRef)));
  const whole = arc !== undefined && arc.angle >= Math.PI * 2 - 1e-9;
  const ends = whole
    ? []
    : [0, path.points.length - 1].flatMap((i) =>
        rings[i]!.map((p, j) => dxfEnc3DFaceTriangle(path.points[i]!, p, rings[i]![(j + 1) % sides]!, style, handleRef))
      );
  return [...mantle, ...ends].join("");
}
