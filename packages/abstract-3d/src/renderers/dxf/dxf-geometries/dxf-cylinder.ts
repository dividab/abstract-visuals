import { type Cylinder, type Material, type Vec3, equals, vec3, vec3RotCombine, vec3TransRot, vec3Zero } from "../../../abstract-3d.js";
import { dxfEnc3DFace } from "../dxf-encoding/dxf-3dface.js";
import type { Handle } from "../dxf-encoding/dxf-common.js";
import { dxfEnc3DFaceTriangle } from "../dxf-encoding/dxf-triangle.js";

export function dxfCylinder(c: Cylinder, m: Material, sides: number, parentPos: Vec3, parentRot: Vec3, handleRef: Handle): string {
  const pos = vec3TransRot(c.pos, parentPos, parentRot);
  const rot = vec3RotCombine(parentRot, c.rot ?? vec3Zero);
  const vec3tr = (x: number, y: number, z: number): Vec3 => vec3TransRot(vec3(x, y, z), pos, rot);

  const angleStart = c.angleStart ?? 0.0;
  const angleLength = c.angleLength ?? Math.PI * 2;
  const angleEnd = angleStart + angleLength;
  const angleStep = angleLength / sides;
  let currentAngle = angleStart;
  let dxfString = "";

  const half = c.length / 2;
  const radiusEnd = c.radiusEnd ?? c.radius;
  const topPos = vec3tr(0, half, 0);
  const botPos = vec3tr(0, -half, 0);

  const botVec3Array = Array<Vec3>();
  const topVec3Array = Array<Vec3>();
  for (let i = 0; i <= sides; i++) {
    const sin = Math.sin(currentAngle);
    const cos = Math.cos(currentAngle);
    const currBot = vec3tr(sin * c.radius, -half, cos * c.radius);
    const currTop = vec3tr(sin * radiusEnd, half, cos * radiusEnd);
    botVec3Array.push(currBot);
    topVec3Array.push(currTop);
    if (i !== 0) {
      const prevBot = botVec3Array[i - 1]!;
      const prevTop = topVec3Array[i - 1]!;
      if (!c.open) {
        dxfString +=
          dxfEnc3DFaceTriangle(botPos, prevBot, currBot, m.normal, handleRef) + dxfEnc3DFaceTriangle(topPos, prevTop, currTop, m.normal, handleRef);
      }
      dxfString += dxfEnc3DFace(currBot, prevBot, prevTop, currTop, m.normal, handleRef);
    }
    currentAngle += angleStep;
  }

  if (!equals(angleStart, angleEnd - Math.PI * 2) && angleLength > 0.0) {
    dxfString += dxfEnc3DFace(botPos, botVec3Array[0]!, topVec3Array[0]!, topPos, m.normal, handleRef);
    dxfString += dxfEnc3DFace(botPos, topPos, topVec3Array[sides]!, botVec3Array[sides]!, m.normal, handleRef);
  }

  return dxfString;
}
