import { Polygon, Material, Vec3, vec3TransRot, vec3RotCombine, vec3Zero } from "../../../abstract-3d.js";
import { color } from "../color.js";
import { dxf3DFACE, Handle } from "../dxf-encoding.js";

const QUAD_STRIDE = 4;
const TRIANGLE_STRIDE = 3;

export function dxfPolygon(p: Polygon, m: Material, parentPos: Vec3, parentRot: Vec3, handleRef: Handle): string {
  let polygonString = "";
  const col = m.normal;
  const pos = vec3TransRot(p.pos, parentPos, parentRot);
  const rot = vec3RotCombine(parentRot, p.rot ?? vec3Zero);
  const points = p.points.map((p) => vec3TransRot(p, pos, rot));
  let i = 0;
  while((points.length - i) >= QUAD_STRIDE) {
    const vec1 = points[i];
    const vec2 = points[i + 1];
    const vec3 = points[i + 2];
    const vec4 = points[i + 3];
    if(vec1 && vec2 && vec3 && vec4) {
      polygonString += dxf3DFACE(
        vec1,
        vec2,
        vec3,
        vec4,
        col,
        handleRef
      );
    }
    i += QUAD_STRIDE;
  }

  if (i <= points.length && TRIANGLE_STRIDE <= points.length) {
    const lastArrayLength = points.length - i;
    switch (lastArrayLength) {
      case 1: {
        const vec1 = points[i];
        const vec2 = points[i - 1];
        const vec3 = points[i - 2];
        if(vec1 && vec2 && vec3) {
          polygonString += dxf3DFACE(vec3, vec2, vec1, vec1, col, handleRef);
        }
        break;
      }
      case 2: {
        const vec1 = points[i];
        const vec2 = points[i - 1];
        const vec3 = points[i + 1];
        if(vec1 && vec2 && vec3) {
          polygonString += dxf3DFACE(
            vec2,
            vec1,
            vec3,
            vec3,
            col,
            handleRef
          );
        }
        break;
      }
      case 3: {
        const vec1 = points[i];
        const vec2 = points[i + 1];
        const vec3 = points[i + 2];
        if(vec1 && vec2 && vec3) {
          polygonString += dxf3DFACE(
            vec1,
            vec2,
            vec3,
            vec3,
            col,
            handleRef
          );
        }
        break;
      }
      default:
        break;
    }
  }

  return polygonString;
}
