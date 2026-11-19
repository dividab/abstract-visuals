import type { Material, Vec3, Polygon } from "../../../abstract-3d.js";
import { vec3Dot, vec3Length, vec3Normalize, vec3RotCombine, vec3Sub, vec3TransRot, vec3Zero } from "../../../abstract-3d.js";
import type { MutableStep } from "../step-encoding.js";
import { stepProduct } from "../step-encoding.js";
import { newell, PLANE_THICKNESS, stepPrism } from "./step-prism.js";

/** How far a quad's last point may be off the plane of the others and still be one face, the STEP file's uncertainty */
const FLAT_TOLERANCE = 1e-7;

/** As in the other renderers, a quad for 4 points, else a list of triangles, each as thin as a plane */
export function stepPolygon(p: Polygon, mat: Material, parentPos: Vec3, parentRot: Vec3, m: MutableStep): void {
  const pos = vec3TransRot(p.pos, parentPos, parentRot);
  const rot = vec3RotCombine(parentRot, p.rot ?? vec3Zero);
  const points = p.points.map((pt) => vec3TransRot(pt, pos, rot));
  const [p0, p1, p2, p3] = points;
  const triangleNormal = p0 && p1 && p2 && vec3Length(newell([p0, p1, p2])) > 0 ? vec3Normalize(newell([p0, p1, p2])) : undefined;

  // A flat quad is one face, a bent one two triangles
  const loops =
    p0 && p1 && p2 && p3 && points.length === 4
      ? triangleNormal && Math.abs(vec3Dot(vec3Sub(p3, p0), triangleNormal)) < FLAT_TOLERANCE
        ? [points]
        : [
            [p0, p1, p2],
            [p2, p3, p0],
          ]
      : Array.from({ length: Math.floor(points.length / 3) }, (_, i) => points.slice(i * 3, i * 3 + 3));

  // A loop without area is no prism
  const breps = loops.flatMap((loop) => {
    const prism = stepPrism(loop, [], vec3Normalize(newell(loop)), PLANE_THICKNESS, vec3Normalize(vec3Sub(loop[1]!, loop[0]!)), m);
    return prism !== undefined ? [prism] : [];
  });
  if (breps.length > 0) {
    stepProduct("solids", breps, "Polygon", mat, m);
  }
}
