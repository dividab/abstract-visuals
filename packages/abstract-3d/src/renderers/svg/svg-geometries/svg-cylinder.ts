import * as A3D from "../../../abstract-3d";
import { gray, stBW, transparent, zElem, zOrderElement } from "./shared";
import { svgCircle, svgPolygon } from "../svg-encoding";
import { rgbGrayScale } from "../../shared";

export function cylinder(
  c: A3D.Cylinder,
  point: (x: number, y: number) => A3D.Vec2,
  color: string,
  onlyStroke: boolean | undefined,
  grayScale: boolean | undefined,
  _stroke: number,
  onlyStrokeFill: string,
  parentPos: A3D.Vec3,
  parentRot: A3D.Vec3,
  factor: number
): ReadonlyArray<zOrderElement> {
  const half = A3D.vec3(c.radius, c.length / 2, c.radius);
  const pos = A3D.vec3TransRot(c.pos, parentPos, parentRot);
  const rot = A3D.vec3RotCombine(parentRot, c.rot ?? A3D.vec3Zero);
  const vec3tr = (p: A3D.Vec3): A3D.Vec3 => A3D.vec3TransRot(p, pos, rot);

  const [stroke, fill] = onlyStroke
    ? [grayScale ? gray : color, onlyStrokeFill]
    : [transparent, grayScale ? rgbGrayScale(color) : color];
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

  // Add circle if direcly facing camera
  const circleTop = vec3tr(A3D.vec3(0, +half.y, 0));
  const circleBottom = vec3tr(A3D.vec3(0, -half.y, 0));
  if (A3D.equals(circleTop.x, circleBottom.x, 0.1) && A3D.equals(circleTop.y, circleBottom.y, 0.1)) {
    const circlePos = circleTop.z > circleBottom.z ? circleTop : circleBottom;
    zOrderComponents.push(
      zElem(svgCircle(factor * c.radius, point(circlePos.x, circlePos.y), fill, stroke, stBW), circlePos.z)
    );
  }

  return zOrderComponents;
}
