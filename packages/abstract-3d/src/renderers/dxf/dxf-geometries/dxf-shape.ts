import { Shape, Material, Vec3, vec3TransRot, vec3RotCombine, vec3Zero, vec3 } from "../../../abstract-3d.js";
import { dxfQuad, dxfTriangle, Handle } from "../dxf-encoding.js";

const QUAD_STRIDE = 4;
const TRIANGLE_STRIDE = 3;

export function dxfPolygon(s: Shape, m: Material, parentPos: Vec3, parentRot: Vec3, handleRef: Handle): string {
  let polygonString = "";
  const pos = vec3TransRot(s.pos, parentPos, parentRot);
  const rot = vec3RotCombine(parentRot, s.rot ?? vec3Zero);
  const points = s.points.map((p) => vec3TransRot(vec3(p.x, p.y, 0), pos, rot));
  let i = 0;
  if (points.length >= QUAD_STRIDE) {
    for (i; i < points.length; i += QUAD_STRIDE) {
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2];
      const p4 = points[i + 3];
      if(p1 && p2 && p3 && p4) {
        polygonString += dxfQuad(p1, p2, p3, p4, m.normal, handleRef);
      }
    }
  }

  if (i <= points.length && TRIANGLE_STRIDE <= points.length) {
    const lastArrayLength = points.length - i;
    switch (lastArrayLength) {
      case 1: {
        const p1 = points[i - 2];
        const p2 = points[i - 1];
        const p3 = points[i];
        if(p1 && p2 && p3) {
          polygonString += dxfTriangle(p1, p2, p3, m.normal, handleRef);
        }
        break;
      }
      case 2: {
        const p1 = points[i - 1];
        const p2 = points[i];
        const p3 = points[i + 1];
        if(p1 && p2 && p3) {
          polygonString += dxfTriangle(p1, p2, p3, m.normal, handleRef);
        }
        break;
      }
      case 3: {
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[i + 2];
        if(p1 && p2 && p3) {
          polygonString += dxfTriangle(p1, p2, p3, m.normal, handleRef);
        }
        break;
      }
      default:
        break;
    }
  }

  return polygonString;
}
