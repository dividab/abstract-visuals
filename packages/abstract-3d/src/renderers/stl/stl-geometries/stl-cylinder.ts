import type { Cylinder, Material, Vec3 } from "../../../abstract-3d.js";
import { vec3TransRot, vec3RotCombine, vec3Zero, vec3, equals } from "../../../abstract-3d.js";
import { stlPlaneOfVertices } from "../stl-encoding.js";

export function stlCylinder(c: Cylinder, _m: Material, sides: number, parentPos: Vec3, parentRot: Vec3): string {
  let stlString = "";
  const pos = vec3TransRot(c.pos, parentPos, parentRot);
  const rot = vec3RotCombine(parentRot, c.rot ?? vec3Zero);
  const vec3tr = (x: number, y: number, z: number): Vec3 => vec3TransRot(vec3(x, y, z), pos, rot);

  const angleStart = c.angleStart ?? 0.0;
  const angleLength = c.angleLength ?? Math.PI * 2;
  const angleEnd = angleStart + angleLength;
  const angleStep = angleLength / sides;
  let currentAngle = angleStart;

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
        stlString += stlPlaneOfVertices(botPos, prevBot, currBot, currBot) + stlPlaneOfVertices(topPos, prevTop, currTop, currTop);
      }
      stlString += stlPlaneOfVertices(currBot, prevBot, prevTop, currTop);
    }
    currentAngle += angleStep;
  }

  if (!equals(angleStart, angleEnd - Math.PI * 2) && angleLength > 0.0) {
    stlString += stlPlaneOfVertices(botPos, botVec3Array[0]!, topVec3Array[0]!, topPos);
    stlString += stlPlaneOfVertices(botPos, topPos, topVec3Array[sides]!, botVec3Array[sides]!);
  }

  return stlString;
}
