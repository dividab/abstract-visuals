import * as A3D from "../../../abstract-3d";
import { stlPlaneOfVertices } from "../stl-encoding";

export function stlCone(
  c: A3D.Cone,
  _m: A3D.Material,
  sides: number,
  parentPos: A3D.Vec3,
  parentRot: A3D.Vec3
): string {
  let dxfString = "";
  const pos = A3D.vec3TransRot(c.pos, parentPos, parentRot);
  const rot = A3D.vec3RotCombine(parentRot, c.rot);
  const vec3tr = (x: number, y: number, z: number): A3D.Vec3 => A3D.vec3TransRot(A3D.vec3(x, y, z), pos, rot);

  const angleStep = (2 * Math.PI) / sides;
  let currentAngle = 0;

  const half = c.length / 2;
  const botPos = vec3tr(0, -half, 0);
  const topPos = vec3tr(0, half, 0);

  const botVec3Array = Array<A3D.Vec3>();
  for (let i = 0; i <= sides; i++) {
    const currBot = vec3tr(Math.sin(currentAngle) * c.radius, -half, Math.cos(currentAngle) * c.radius);
    botVec3Array.push(currBot);

    if (i !== 0) {
      const prevBot = botVec3Array[i - 1]!;
      dxfString +=
        stlPlaneOfVertices(botPos, prevBot, currBot, currBot) + stlPlaneOfVertices(currBot, prevBot, topPos, topPos);
    }
    currentAngle += angleStep;
  }

  return dxfString;
}
