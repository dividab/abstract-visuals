import { Cylinder, Material, Vec3, vec3TransRot, vec3RotCombine, vec3Zero, vec3 } from "../../../abstract-3d.js";
import { color } from "../color.js";
import { dxf3DFACE } from "../dxf-encoding.js";

export function dxfCylinder(c: Cylinder, m: Material, sides: number, parentPos: Vec3, parentRot: Vec3): string {
  let dxfString = "";
  const pos = vec3TransRot(c.pos, parentPos, parentRot);
  const rot = vec3RotCombine(parentRot, c.rot ?? vec3Zero);
  const vec3tr = (x: number, y: number, z: number): Vec3 => vec3TransRot(vec3(x, y, z), pos, rot);
  const mat = color(m.normal);
  const angleStep = (2 * Math.PI) / sides;
  let currentAngle = 0;

  const half = c.length / 2;
  const topPos = vec3tr(0, half, 0);
  const botPos = vec3tr(0, -half, 0);

  const botVec3Array = Array<Vec3>();
  const topVec3Array = Array<Vec3>();

  for (let i = 0; i <= sides; i++) {
    const x = Math.sin(currentAngle) * c.radius;
    const z = Math.cos(currentAngle) * c.radius;
    const currBot = vec3tr(x, -half, z);
    const currTop = vec3tr(x, half, z);
    botVec3Array.push(currBot);
    topVec3Array.push(currTop);
    if (i !== 0) {
      const prevBot = botVec3Array[i - 1]!;
      const prevTop = topVec3Array[i - 1]!;
      dxfString +=
        dxf3DFACE(botPos, prevBot, currBot, currBot, mat) +
        dxf3DFACE(topPos, prevTop, currTop, currTop, mat) +
        dxf3DFACE(currBot, prevBot, prevTop, currTop, mat);
    }
    currentAngle += angleStep;
  }

  return dxfString;
}
