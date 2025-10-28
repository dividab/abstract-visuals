import { Cylinder, Material, Vec3, vec3TransRot, vec3RotCombine, vec3Zero, vec3, vec3Add, vec3Rot, vec3Scale, leq, less, equals } from "../../../abstract-3d.js";
import { color } from "../color.js";
import { dxf3DFACE } from "../dxf-encoding.js";
import { dxfPlane } from "./dxf-plane.js";

export function dxfCylinder(c: Cylinder, m: Material, sides: number, parentPos: Vec3, parentRot: Vec3, handleRef: { handle: number }): string {
  const angleStart = c.angleStart ?? 0.0;
  const angleLength = c.angleLength ?? (Math.PI * 2);
  const angleEnd = angleStart + angleLength;
  let dxfString = "";
  const pos = vec3TransRot(c.pos, parentPos, parentRot);
  const rot = vec3RotCombine(parentRot, c.rot ?? vec3Zero);
  const vec3tr = (x: number, y: number, z: number): Vec3 => vec3TransRot(vec3(x, y, z), pos, rot);
  const mat = color(m.normal);
  const angleStep = angleLength / sides;
  let currentAngle = angleStart;

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
      if (!c.open) {
        dxfString +=
          dxf3DFACE(botPos, prevBot, currBot, currBot, mat, handleRef) + dxf3DFACE(topPos, prevTop, currTop, currTop, mat, handleRef);
      }
      dxfString += dxf3DFACE(currBot, prevBot, prevTop, currTop, mat, handleRef);
    }
    currentAngle += angleStep;
  }

  if (!equals(angleStart, angleEnd - Math.PI * 2) && angleLength > 0.0) {
    const aStart = angleStart - Math.PI / 2;
    const aEnd = angleEnd - Math.PI / 2;
    const halfRadius = c.radius / 2;
    const plane1Rot = vec3(0, aStart, 0);
    const plane2Rot = vec3(0, aEnd, 0);
    const plane1Pos = vec3Scale(vec3(Math.cos(aStart), 0, -Math.sin(aStart)), halfRadius);
    const plane2Pos = vec3Scale(vec3(Math.cos(aEnd), 0, -Math.sin(aEnd)), halfRadius);
    const planeSize = vec3(c.radius, c.length, 1);
    dxfString += dxfPlane({ type: "Plane", pos: plane1Pos, size: planeSize, rot: plane1Rot }, m, pos, rot, handleRef);
    dxfString += dxfPlane({ type: "Plane", pos: plane2Pos, size: planeSize, rot: plane2Rot }, m, pos, rot, handleRef);
  }

  return dxfString;
}
