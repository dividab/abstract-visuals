import { Shape, Material, Vec3, vec3TransRot, vec3RotCombine, vec3Zero, vec3 } from "../../../abstract-3d.js";
import { color } from "../color.js";
import { dxf3DFACE } from "../dxf-encoding.js";

const chunkSize = 4;

export function dxfPolygon(s: Shape, m: Material, parentPos: Vec3, parentRot: Vec3, handleRef: {handle: number}): string {
  let polygonString = "";
  const pos = vec3TransRot(s.pos, parentPos, parentRot);
  const rot = vec3RotCombine(parentRot, s.rot ?? vec3Zero);
  const points = s.points.map((p) => vec3TransRot(vec3(p.x, p.y, 0), pos, rot));
  const mat = color(m.normal);
  let i = 0;
  if (points.length >= chunkSize) {
    for (i; i < points.length; i += chunkSize) {
      polygonString += dxf3DFACE(points[i]!, points[i + 1]!, points[i + 2]!, points[i + 3]!, mat, handleRef);
    }
  }

  if (i <= points.length && chunkSize - 1 <= points.length) {
    const lastArrayLength = points.length - i;
    switch (lastArrayLength) {
      case 1:
        polygonString += dxf3DFACE(points[i - 2]!, points[i - 1]!, points[i]!, points[i]!, mat, handleRef);
        break;
      case 2:
        polygonString += dxf3DFACE(points[i - 1]!, points[i]!, points[i + 1]!, points[i + 1]!, mat, handleRef);
        break;
      case 3:
        polygonString += dxf3DFACE(points[i]!, points[i + 1]!, points[i + 2]!, points[i + 2]!, mat, handleRef);
        break;
      default:
        break;
    }
  }

  return polygonString;
}
