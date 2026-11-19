import { type Polygon, type Vec3, vec3RotCombine, vec3TransRot, vec3Zero } from "../../../abstract-3d.js";
import { dxfEnc3DFace } from "../dxf-encoding/dxf-3dface.js";
import type { Handle } from "../dxf-encoding/dxf-common.js";
import { dxfEnc3DFaceTriangle } from "../dxf-encoding/dxf-triangle.js";

/** As in the other renderers, a quad for 4 points, else a list of triangles */
export function dxfPolygon(p: Polygon, style: string, parentPos: Vec3, parentRot: Vec3, handleRef: Handle): string {
  const pos = vec3TransRot(p.pos, parentPos, parentRot);
  const rot = vec3RotCombine(parentRot, p.rot ?? vec3Zero);
  const points = p.points.map((pt) => vec3TransRot(pt, pos, rot));
  const [p0, p1, p2, p3] = points;
  if (points.length === 4 && p0 && p1 && p2 && p3) {
    return dxfEnc3DFace(p0, p1, p2, p3, style, handleRef);
  }
  return Array.from({ length: Math.floor(points.length / 3) }, (_, i) =>
    dxfEnc3DFaceTriangle(points[i * 3]!, points[i * 3 + 1]!, points[i * 3 + 2]!, style, handleRef)
  ).join("");
}
