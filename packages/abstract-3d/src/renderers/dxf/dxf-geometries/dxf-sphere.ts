import { type Sphere, type Vec3, vec3, vec3Add, vec3TransRot } from "../../../abstract-3d.js";
import { dxfEnc3DFace } from "../dxf-encoding/dxf-3dface.js";
import type { Handle } from "../dxf-encoding/dxf-common.js";
import { dxfEnc3DFaceTriangle } from "../dxf-encoding/dxf-triangle.js";

/** Bands between circles of latitude, sides around and half as many from pole to pole, triangles at the poles */
export function dxfSphere(s: Sphere, style: string, sides: number, parentPos: Vec3, parentRot: Vec3, handleRef: Handle): string {
  if (s.radius <= 0) {
    return "";
  }
  const center = vec3TransRot(s.pos, parentPos, parentRot);
  const bands = Math.max(2, Math.round(sides / 2));
  const at = (band: number, side: number): Vec3 => {
    const [polar, around] = [(band / bands) * Math.PI, (side / sides) * Math.PI * 2];
    return vec3Add(
      center,
      vec3(s.radius * Math.sin(polar) * Math.sin(around), s.radius * Math.cos(polar), s.radius * Math.sin(polar) * Math.cos(around))
    );
  };
  return Array.from({ length: bands }, (_, band) =>
    Array.from({ length: sides }, (_, side) => {
      const [a, b, c, d] = [at(band, side), at(band, side + 1), at(band + 1, side + 1), at(band + 1, side)];
      return band === 0
        ? dxfEnc3DFaceTriangle(a, c, d, style, handleRef)
        : band === bands - 1
          ? dxfEnc3DFaceTriangle(a, b, d, style, handleRef)
          : dxfEnc3DFace(a, b, c, d, style, handleRef);
    }).join("")
  ).join("");
}
