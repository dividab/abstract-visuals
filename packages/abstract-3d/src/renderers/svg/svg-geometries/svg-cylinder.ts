import {
  Cylinder,
  Vec2,
  Vec3,
  vec3,
  vec3TransRot,
  vec3RotCombine,
  vec3Zero,
  vec3ZMean,
  equals,
} from "../../../abstract-3d.js";
import { gray, stBW, SvgOptions, transparent, zElem, zOrderElement } from "./shared.js";
import { svgCircle, svgPolygon } from "../svg-encoding.js";
import { rgbGrayScale } from "../../shared.js";

export function cylinder(
  c: Cylinder,
  point: (x: number, y: number) => Vec2,
  color: string,
  opts: SvgOptions,
  parentPos: Vec3,
  parentRot: Vec3,
  factor: number
): ReadonlyArray<zOrderElement> {
  const half = vec3(c.radius, c.length / 2, c.radius);
  const pos = vec3TransRot(c.pos, parentPos, parentRot);
  const rot = vec3RotCombine(parentRot, c.rot ?? vec3Zero);
  const vec3tr = (p: Vec3): Vec3 => vec3TransRot(p, pos, rot);

  const [stroke, fill] = opts.onlyStroke
    ? [opts.grayScale ? gray : color, opts.onlyStrokeFill]
    : [transparent, opts.grayScale ? rgbGrayScale(color) : color];
  const zOrderComponents = Array<zOrderElement>();

  const sides = 8;
  const angleStep = (2 * Math.PI) / sides;
  let currentAngle = 0;

  const botVec3Array = Array<Vec3>();
  const topVec3Array = Array<Vec3>();
  for (let i = 0; i <= sides; i++) {
    const x = Math.sin(currentAngle) * c.radius;
    const z = Math.cos(currentAngle) * c.radius;
    const currBot = vec3tr(vec3(x, -half.y, z));
    const currTop = vec3tr(vec3(x, half.y, z));
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
        zElem(svgPolygon(factor, rot, points, fill, stroke, stBW), vec3ZMean(currBot, prevBot, currTop, prevTop))
      );
    }
    currentAngle += angleStep;
  }
  if (!c.open) {
    // Add circle if direcly facing camera
    const circleTop = vec3tr(vec3(0, +half.y, 0));
    const circleBottom = vec3tr(vec3(0, -half.y, 0));
    if (equals(circleTop.x, circleBottom.x, 0.1) && equals(circleTop.y, circleBottom.y, 0.1)) {
      const circlePos = circleTop.z > circleBottom.z ? circleTop : circleBottom;
      zOrderComponents.push(
        zElem(svgCircle(factor * c.radius, rot, point(circlePos.x, circlePos.y), fill, stroke, stBW, factor, c.holes), circlePos.z)
      );
    }
  }
  return zOrderComponents;
}
