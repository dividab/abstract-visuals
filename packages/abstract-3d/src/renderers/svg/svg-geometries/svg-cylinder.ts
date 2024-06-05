import * as A3D from "../../../abstract-3d";
import { gray, stBW, transparent, zElem, zOrderElement } from "./shared";
import { svgPolygon } from "../svg-encoding";
import { rgbGray } from "../../shared";

export function cylinder(
  c: A3D.Cylinder,
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

  const botVec3Array = Array<A3D.Vec3>();
  const topVec3Array = Array<A3D.Vec3>();
  for (let i = 0; i <= sides; i++) {
    const x = Math.sin(currentAngle) * c.radius;
    const z = Math.cos(currentAngle) * c.radius;
    const currBot = vec3tr(A3D.vec3(x, -half.y, z));
    const currTop = vec3tr(A3D.vec3(x, half.y, z));
    botVec3Array.push(currBot);
    topVec3Array.push(currTop);
    if (i !== 0) {
      const prevBot = botVec3Array[i - 1]!;
      const prevTop = topVec3Array[i - 1]!;

      const points = [
        point(currBot.x, currBot.y),
        point(prevBot.x, prevBot.y),
        point(prevTop.x, prevTop.y),
        point(currTop.x, currTop.y),
      ];
      zOrderComponents.push(
        zElem(svgPolygon(points, fill, stroke, stBW), A3D.vec3ZMean(currBot, prevBot, currTop, prevTop))
      );
    }
    currentAngle += angleStep;
  }

  return zOrderComponents;
}
