import * as A3D from "../../../abstract-3d.js";
import { gray, stBW, zElem, zOrderElement, transparent } from "./shared.js";
import { svgPolygon } from "../svg-encoding.js";
import { rgbGray } from "../../shared.js";

export function cone(
  c: A3D.Cone,
  point: (x: number, y: number) => A3D.Vec2,
  color: string,
  onlyStroke: boolean,
  grayScale: boolean,
  _stroke: number,
  onlyStrokeFill: string,
  parentPos: A3D.Vec3,
  parentRot: A3D.Vec3
): ReadonlyArray<zOrderElement> {
  const half = A3D.vec3(c.radius, c.length / 2, c.radius);
  const pos = A3D.vec3TransRot(c.pos, parentPos, parentRot);
  const rot = A3D.vec3RotCombine(parentRot, c.rot);
  const vec3tr = (p: A3D.Vec3): A3D.Vec3 => A3D.vec3TransRot(p, pos, rot);

  const [stroke, fill] = onlyStroke
    ? [grayScale ? gray : color, onlyStrokeFill]
    : [transparent, grayScale ? rgbGray(color) : color];
  const zOrderComponents = Array<zOrderElement>();

  const sides = 8;
  const angleStep = (2 * Math.PI) / sides;
  let currentAngle = 0;

  const topPos = vec3tr(A3D.vec3(0, half.y, 0));
  const botVec3Array = Array<A3D.Vec3>();
  for (let i = 0; i <= sides; i++) {
    const currBot = vec3tr(
      A3D.vec3(0 + Math.sin(currentAngle) * c.radius, -half.y, 0 + Math.cos(currentAngle) * c.radius)
    );
    botVec3Array.push(currBot);
    if (i !== 0) {
      const prevBot = botVec3Array[i - 1]!;
      const points = [
        point(currBot.x, currBot.y),
        point(prevBot.x, prevBot.y),
        point(topPos.x, topPos.y),
        point(topPos.x, topPos.y),
      ];
      zOrderComponents.push(zElem(svgPolygon(points, fill, stroke, stBW), A3D.vec3ZMean(currBot, prevBot, topPos)));
    }
    currentAngle += angleStep;
  }

  return zOrderComponents;
}
