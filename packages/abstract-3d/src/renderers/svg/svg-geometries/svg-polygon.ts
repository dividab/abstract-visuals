import { Polygon, vec3ZMean, Vec3, Vec2, vec3TransRot, vec3RotCombine, vec3Zero } from "../../../abstract-3d.js";
import { gray, zElem, zOrderElement, transparent, SvgOptions } from "./shared.js";
import { svgPolygon } from "../svg-encoding.js";
import { rgbGrayScale } from "../../shared.js";

export function polygon(
  p: Polygon,
  point: (x: number, y: number) => Vec2,
  factor: number,
  color: string,
  opts: SvgOptions,
  parentPos: Vec3,
  parentRot: Vec3
): ReadonlyArray<zOrderElement> {
  const pos = vec3TransRot(p.pos, parentPos, parentRot);
  const rot = vec3RotCombine(parentRot, p.rot ?? vec3Zero);
  const rotatedPoints = p.points.map((p) => vec3TransRot(p, pos, rot));
  const points = rotatedPoints.map(({ x, y }) => point(x, y));
  const [strokeColor, fill, strokeThickness] = opts.onlyStroke
    ? [opts.grayScale ? gray : color, opts.onlyStrokeFill, opts.stroke]
    : [transparent, opts.grayScale ? rgbGrayScale(color) : color, 0];
  return [zElem(svgPolygon(factor, rot, points, fill, strokeColor, strokeThickness), vec3ZMean(...rotatedPoints))];
}
