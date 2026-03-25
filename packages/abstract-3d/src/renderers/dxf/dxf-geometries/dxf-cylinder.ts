import {
  Cylinder,
  Material,
  Vec3,
  vec3TransRot,
  vec3RotCombine,
  vec3Zero,
  vec3,
  vec3Scale,
  equals,
} from "../../../abstract-3d.js";
import { dxfQuad, dxfTriangle, Handle } from "../dxf-encoding.js";
import { dxfPlane } from "./dxf-plane.js";

export function dxfCylinder(
  c: Cylinder,
  m: Material,
  sides: number,
  parentPos: Vec3,
  parentRot: Vec3,
  handleRef: Handle
): string {
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
  const topPos = vec3tr(0, half, 0);
  const botPos = vec3tr(0, -half, 0);

  let prevBot = undefined;
  let prevTop = undefined;
  for (let i = 0; i <= sides; i++) {
    const x = Math.sin(currentAngle) * c.radius;
    const z = Math.cos(currentAngle) * c.radius;
    const currBot = vec3tr(x, -half, z);
    const currTop = vec3tr(x, half, z);
    if (i !== 0 && prevBot && prevTop) {
      if (!c.open) {
        dxfString +=
          dxfTriangle(botPos, prevBot, currBot, m.normal, handleRef) +
          dxfTriangle(topPos, prevTop, currTop, m.normal, handleRef);
      }
      dxfString += dxfQuad(currBot, prevBot, prevTop, currTop, m.normal, handleRef);
    }

    prevBot = currBot;
    prevTop = currTop;
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
