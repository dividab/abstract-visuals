import * as A3D from "../../../abstract-3d";
import { zElem, zOrderElement } from "./shared";
import { svgLine } from "../svg-encoding";
import { rgbGrayScale } from "../../shared";

export function line(
  l: A3D.Line,
  point: (x: number, y: number) => A3D.Vec2,
  fill: string,
  grayScale: boolean | undefined,
  _stroke: number,
  parentPos: A3D.Vec3,
  parentRot: A3D.Vec3
): ReadonlyArray<zOrderElement> {
  const v1 = A3D.vec3TransRot(l.start, parentPos, parentRot);
  const v2 = A3D.vec3TransRot(l.end, parentPos, parentRot);
  return [
    zElem(
      svgLine(point(v1.x, v1.y), point(v2.x, v2.y), grayScale ? rgbGrayScale(fill) : fill, l.thickness),
      A3D.vec3ZMean(v1, v2)
    ),
  ];
}
