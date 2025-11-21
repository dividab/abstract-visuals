import {
  Cone,
  Vec2,
  Vec3,
  vec3,
  vec3TransRot,
  vec3RotCombine,
  vec3Zero,
  vec3ZMean,
  equals,
} from "../../../abstract-3d.js";
import { gray, stBW, zElem, zOrderElement, transparent, SvgOptions } from "./shared.js";
import { svgCircle, svgPolygon } from "../svg-encoding.js";
import { rgbGrayScale } from "../../shared.js";

export function cone(
  c: Cone,
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

  const topPos = vec3tr(vec3(0, half.y, 0));
  const botVec3Array = Array<Vec3>();
  for (let i = 0; i <= sides; i++) {
    const currBot = vec3tr(vec3(0 + Math.sin(currentAngle) * c.radius, -half.y, 0 + Math.cos(currentAngle) * c.radius));
    botVec3Array.push(currBot);
    if (i !== 0) {
      const prevBot = botVec3Array[i - 1]!;
      const points = [
        point(currBot.x, currBot.y),
        point(prevBot.x, prevBot.y),
        point(topPos.x, topPos.y),
        point(topPos.x, topPos.y),
      ];
      zOrderComponents.push(zElem(svgPolygon(factor, rot, points, fill, stroke, stBW), vec3ZMean(currBot, prevBot, topPos)));
    }
    currentAngle += angleStep;
  }

  // Add circle if direcly facing camera
  const cylTop = vec3tr(vec3(0, +half.y, 0));
  const cylBottom = vec3tr(vec3(0, -half.y, 0));
  if (equals(cylTop.x, cylBottom.x, 0.1) && equals(cylTop.y, cylBottom.y, 0.1)) {
    zOrderComponents.push(
      zElem(svgCircle(factor * c.radius, rot, point(cylBottom.x, cylBottom.y), fill, stroke, stBW, factor), cylBottom.z)
    );
  }

  return zOrderComponents;
}
