import * as A3D from "../../../abstract-3d";
import { stlTriangle } from "../stl-encoding";

const chunkSize = 3;

export function stlPolygon(p: A3D.Polygon, _m: A3D.Material, parentPos: A3D.Vec3, parentRot: A3D.Vec3): string {
  let polygonString = "";
  const pos = A3D.vec3TransRot(p.pos, parentPos, parentRot);
  const rot = A3D.vec3RotCombine(parentRot, p.rot ?? A3D.vec3Zero);
  const points = p.points.map((p) => A3D.vec3TransRot(p, pos, rot));
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
