import * as A3D from "../../../abstract-3d";
import { dxf3DFACE } from "../dxf-encoding";

const chunkSize = 4;

export function dxfPolygon(s: A3D.Shape, m: A3D.Material, parentPos: A3D.Vec3, parentRot: A3D.Vec3): string {
  let polygonString = "";
  const pos = A3D.vec3TransRot(s.pos, parentPos, parentRot);
  const rot = A3D.vec3RotCombine(parentRot, s.rot ?? A3D.vec3Zero);
  const points = s.points.map((p) => A3D.vec3TransRot(A3D.vec3(p.x, p.y, 0), pos, rot));
  let i = 0;
  if (points.length >= chunkSize) {
    for (i; i < points.length; i += chunkSize) {
      polygonString += dxf3DFACE(points[i]!, points[i + 1]!, points[i + 2]!, points[i + 3]!, m.dxf);
    }
  }

  if (i <= points.length && chunkSize - 1 <= points.length) {
    const lastArrayLength = points.length - i;
    switch (lastArrayLength) {
      case 1:
        polygonString += dxf3DFACE(points[i - 2]!, points[i - 1]!, points[i]!, points[i]!, m.dxf);
        break;
      case 2:
        polygonString += dxf3DFACE(points[i - 1]!, points[i]!, points[i + 1]!, points[i + 1]!, m.dxf);
        break;
      case 3:
        polygonString += dxf3DFACE(points[i]!, points[i + 1]!, points[i + 2]!, points[i + 2]!, m.dxf);
        break;
      default:
        break;
    }
  }

  return polygonString;
}
