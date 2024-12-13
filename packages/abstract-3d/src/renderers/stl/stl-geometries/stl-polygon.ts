import { Polygon, Material, Vec3, vec3TransRot, vec3RotCombine, vec3Zero } from "../../../abstract-3d.js";
import { stlTriangle } from "../stl-encoding.js";

const chunkSize = 3;

export function stlPolygon(p: Polygon, _m: Material, parentPos: Vec3, parentRot: Vec3): string {
  let polygonString = "";
  const pos = vec3TransRot(p.pos, parentPos, parentRot);
  const rot = vec3RotCombine(parentRot, p.rot ?? vec3Zero);
  const points = p.points.map((p) => vec3TransRot(p, pos, rot));
  let i = 0;
  const nbrIterations = Math.floor(points.length / chunkSize);
  for (i; i < nbrIterations; i++) {
    const start = i * chunkSize;
    polygonString += stlTriangle(points[start]!, points[start + 1]!, points[start + 2]!);
  }

  const usedPoints = i * chunkSize;

  if (usedPoints <= points.length && chunkSize - 1 <= points.length) {
    const lastArrayLength = points.length - usedPoints;
    switch (lastArrayLength) {
      case 1:
        polygonString += stlTriangle(points[usedPoints - 1]!, points[usedPoints]!, points[0]!);
        break;
      case 2:
        polygonString += stlTriangle(points[usedPoints]!, points[usedPoints + 1]!, points[0]!);
        break;
      default:
        break;
    }
  }

  return polygonString;
}
