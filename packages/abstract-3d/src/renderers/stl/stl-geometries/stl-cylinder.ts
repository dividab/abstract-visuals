import * as A3D from "../../../abstract-3d.js";
import { stlPlaneOfVertices } from "../stl-encoding.js";

export function stlCylinder(
  c: A3D.Cylinder,
  _m: A3D.Material,
  sides: number,
  parentPos: A3D.Vec3,
  parentRot: A3D.Vec3
): string {
  let dxfString = "";
  const pos = A3D.vec3TransRot(c.pos, parentPos, parentRot);
  const rot = A3D.vec3RotCombine(parentRot, c.rot ?? A3D.vec3Zero);
  const vec3tr = (x: number, y: number, z: number): A3D.Vec3 => A3D.vec3TransRot(A3D.vec3(x, y, z), pos, rot);

  const angleStep = (2 * Math.PI) / sides;
  let currentAngle = 0;

  const half = c.length / 2;
  const topPos = vec3tr(0, half, 0);
  const botPos = vec3tr(0, -half, 0);

  const botVec3Array = Array<A3D.Vec3>();
  const topVec3Array = Array<A3D.Vec3>();

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
        stlPlaneOfVertices(botPos, prevBot, currBot, currBot) +
        stlPlaneOfVertices(topPos, prevTop, currTop, currTop) +
        stlPlaneOfVertices(currBot, prevBot, prevTop, currTop);
    }
    currentAngle += angleStep;
  }

  return dxfString;
}
