import { Cone, Material, Vec3, vec3TransRot, vec3RotCombine, vec3Zero, vec3 } from "../../../abstract-3d.js";
import { dxfTriangle, Handle } from "../dxf-encoding.js";

export function dxfCone(
  c: Cone,
  m: Material,
  sides: number,
  parentPos: Vec3,
  parentRot: Vec3,
  handleRef: Handle
): string {
  let dxfString = "";
  const pos = vec3TransRot(c.pos, parentPos, parentRot);
  const rot = vec3RotCombine(parentRot, c.rot ?? vec3Zero);
  const vec3tr = (x: number, y: number, z: number): Vec3 => vec3TransRot(vec3(x, y, z), pos, rot);
  const angleStep = (2 * Math.PI) / sides;
  let currentAngle = 0;

  const half = c.length / 2;
  const botPos = vec3tr(0, -half, 0);
  const topPos = vec3tr(0, half, 0);

  const botVec3Array = Array<Vec3>();
  for (let i = 0; i <= sides; i++) {
    const currBot = vec3tr(Math.sin(currentAngle) * c.radius, -half, Math.cos(currentAngle) * c.radius);
    botVec3Array.push(currBot);

    if (i !== 0) {
      const prevBot = botVec3Array[i - 1]!;
      dxfString +=
        dxfTriangle(botPos, prevBot, currBot, m.normal, handleRef) +
        dxfTriangle(currBot, prevBot, topPos, m.normal, handleRef);
    }
    currentAngle += angleStep;
  }

  return dxfString;
}
