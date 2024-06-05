import { Polygon, vec3ZMean, Vec3, Vec2, vec3TransRot, vec3RotCombine, vec3Zero } from "../../../abstract-3d";
import { gray, zElem, zOrderElement, transparent } from "./shared";
import { svgPolygon } from "../svg-encoding";
import { rgbGray } from "../../shared";

export function polygon(
  p: Polygon,
  point: (x: number, y: number) => Vec2,
  color: string,
  onlyStroke: boolean | undefined,
  grayScale: boolean | undefined,
  onlyStrokeFill: string,
  _stroke: number,
  parentPos: Vec3,
  parentRot: Vec3
): ReadonlyArray<zOrderElement> {
  const pos = vec3TransRot(p.pos, parentPos, parentRot);
  const rot = vec3RotCombine(parentRot, p.rot ?? vec3Zero);
  const rotatedPoints = p.points.map((p) => vec3TransRot(p, pos, rot));
  const points = rotatedPoints.map(({ x, y }) => point(x, y));
  const [strokeColor, fill] = onlyStroke
    ? [grayScale ? gray : color, onlyStrokeFill]
    : [transparent, grayScale ? rgbGray(color) : color];
  return [zElem(svgPolygon(points, fill, strokeColor, 0), vec3ZMean(...rotatedPoints))];
}
