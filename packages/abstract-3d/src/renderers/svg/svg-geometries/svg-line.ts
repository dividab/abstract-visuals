import { Line, Vec2, Vec3, vec3TransRot, vec3ZMean } from "../../../abstract-3d.js";
import { SvgOptions, zElem, zOrderElement } from "./shared.js";
import { svgLine } from "../svg-encoding.js";
import { rgbGrayScale } from "../../shared.js";

export function line(
  l: Line,
  point: (x: number, y: number) => Vec2,
  fill: string,
  opts: SvgOptions,
  parentPos: Vec3,
  parentRot: Vec3
): ReadonlyArray<zOrderElement> {
  const v1 = vec3TransRot(l.start, parentPos, parentRot);
  const v2 = vec3TransRot(l.end, parentPos, parentRot);
  return [
    zElem(
      svgLine(point(v1.x, v1.y), point(v2.x, v2.y), opts.grayScale ? rgbGrayScale(fill) : fill, l.thickness),
      vec3ZMean(v1, v2)
    ),
  ];
}
