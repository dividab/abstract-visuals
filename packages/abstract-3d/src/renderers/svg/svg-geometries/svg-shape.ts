import { vec3ZMean, Vec3, Vec2, vec3TransRot, vec3RotCombine, Shape, vec3, vec3Zero } from "../../../abstract-3d.js";
import { gray, zElem, zOrderElement, transparent } from "./shared.js";
import { svgPolygon } from "../svg-encoding.js";
import { rgbGrayScale } from "../../shared.js";

export function shape(
  s: Shape,
  point: (x: number, y: number) => Vec2,
  color: string,
  onlyStroke: boolean | undefined,
  grayScale: boolean | undefined,
  onlyStrokeFill: string,
  _stroke: number,
  parentPos: Vec3,
  parentRot: Vec3
): ReadonlyArray<zOrderElement> {
  const pos = vec3TransRot(s.pos, parentPos, parentRot);
  const rot = vec3RotCombine(parentRot, s.rot ?? vec3Zero);
  const rotatedPoints = s.points.map((p) => vec3TransRot(vec3(p.x, p.y, 0), pos, rot));
  const points = rotatedPoints.map(({ x, y }) => point(x, y));
  const [strokeColor, fill] = onlyStroke
    ? [grayScale ? gray : color, onlyStrokeFill]
    : [transparent, grayScale ? rgbGrayScale(color) : color];
  return [zElem(svgPolygon(points, fill, strokeColor, 0), vec3ZMean(...rotatedPoints))];
}
