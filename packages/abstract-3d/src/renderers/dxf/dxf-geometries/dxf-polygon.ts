import { Polygon, Material, Vec3, vec3TransRot, vec3RotCombine, vec3Zero } from "../../../abstract-3d.js";
import { color } from "../color.js";
import { dxf3DFACE } from "../dxf-encoding.js";

const chunkSize = 4;

export function dxfPolygon(p: Polygon, m: Material, parentPos: Vec3, parentRot: Vec3, handleRef: {handle: number}): string {
  let polygonString = "";
  const pos = vec3TransRot(p.pos, parentPos, parentRot);
  const rot = vec3RotCombine(parentRot, p.rot ?? vec3Zero);
  const points = p.points.map((p) => vec3TransRot(p, pos, rot));
  let i = 0;
  if (points.length >= chunkSize) {
    for (i; i < points.length; i += chunkSize) {
      polygonString += dxf3DFACE(points[i]!, points[i + 1]!, points[i + 2]!, points[i + 3]!, color(m.normal), handleRef);
    }
  }

  if (i <= points.length && chunkSize - 1 <= points.length) {
    const lastArrayLength = points.length - i;
    switch (lastArrayLength) {
      case 1:
        polygonString += dxf3DFACE(points[i - 2]!, points[i - 1]!, points[i]!, points[i]!, color(m.normal), handleRef);
        break;
      case 2:
        polygonString += dxf3DFACE(points[i - 1]!, points[i]!, points[i + 1]!, points[i + 1]!, color(m.normal), handleRef);
        break;
      case 3:
        polygonString += dxf3DFACE(points[i]!, points[i + 1]!, points[i + 2]!, points[i + 2]!, color(m.normal), handleRef);
        break;
      default:
        break;
    }
  }

  return polygonString;
}
