import { Cylinder, Material, Vec3, vec3TransRot, vec3RotCombine, vec3Zero, vec3, equals, vec3Scale } from "../../../abstract-3d.js";
import { stlPlaneOfVertices } from "../stl-encoding.js";
import { stlPlane } from "./stl-plane.js";

export function stlCylinder(c: Cylinder, m: Material, sides: number, parentPos: Vec3, parentRot: Vec3): string {
  let stlString = "";
  const pos = vec3TransRot(c.pos, parentPos, parentRot);
  const rot = vec3RotCombine(parentRot, c.rot ?? vec3Zero);
  const vec3tr = (x: number, y: number, z: number): Vec3 => vec3TransRot(vec3(x, y, z), pos, rot);

  const angleStart = c.angleStart ?? 0.0;
  const angleLength = c.angleLength ?? (Math.PI * 2);
  const angleEnd = angleStart + angleLength;
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
        stlString +=
          stlPlaneOfVertices(botPos, prevBot, currBot, currBot) + stlPlaneOfVertices(topPos, prevTop, currTop, currTop);
      }
      stlString += stlPlaneOfVertices(currBot, prevBot, prevTop, currTop);
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
    stlString += stlPlane({ type: "Plane", pos: plane1Pos, size: planeSize, rot: plane1Rot }, m, pos, rot);
    stlString += stlPlane({ type: "Plane", pos: plane2Pos, size: planeSize, rot: plane2Rot }, m, pos, rot);
  }

  return stlString;
}
