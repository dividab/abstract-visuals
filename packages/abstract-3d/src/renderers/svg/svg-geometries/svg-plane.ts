import * as A3D from "../../../abstract-3d";
import { gray, black, zElem, zOrderElement } from "./shared";
import { EmbededImage, svgImage, svgPolygon } from "../svg-encoding";
import { rgbGray } from "../../shared";

export function plane(
  p: A3D.Plane,
  point: (x: number, y: number) => A3D.Vec2,
  color: string,
  onlyStroke: boolean,
  grayScale: boolean,
  _stroke: number,
  onlyStrokeFill: string,
  parentPos: A3D.Vec3,
  parentRot: A3D.Vec3,
  view: A3D.View,
  image?: EmbededImage | undefined
): ReadonlyArray<zOrderElement> {
  const half = A3D.vec2Scale(p.size, 0.5);
  const pos = A3D.vec3TransRot(p.pos, parentPos, parentRot);
  const rot = A3D.vec3RotCombine(parentRot, p.rot ?? A3D.vec3Zero);
  const vec3tr = (point: A3D.Vec3): A3D.Vec3 => A3D.vec3TransRot(point, pos, rot);

  const v2 = vec3tr(A3D.vec3(half.x, -half.y, 0));
  const v4 = vec3tr(A3D.vec3(-half.x, half.y, 0));

  if (view === "front" && image) {
    const [leftX, rightX] = v4.x > v2.x ? [v2.x, v4.x] : [v4.x, v2.x];
    const [bottomY, topY] = v4.y > v2.y ? [v4.y, v2.y] : [v2.y, v4.y];
    const bottomLeft = point(leftX, bottomY);
    const topRight = point(rightX, topY);
    const degrees = A3D.isZero(rot.z, 0.1) ? 0 : rot.z * (-180 / Math.PI);
    const img = svgImage(bottomLeft, A3D.vec2(topRight.x - bottomLeft.x, topRight.y - bottomLeft.y), degrees, image);
    return [zElem(img, (v2.z + v4.z) / 2)];
  }

  const v1 = vec3tr(A3D.vec3(-half.x, -half.y, 0));
  const v3 = vec3tr(A3D.vec3(half.x, half.y, 0));
  const points = [point(v1.x, v1.y), point(v2.x, v2.y), point(v3.x, v3.y), point(v4.x, v4.y)];
  const [stroke, fill, strokeThickness] = onlyStroke
    ? [grayScale ? gray : color, onlyStrokeFill, _stroke]
    : [black, grayScale ? rgbGray(color) : color, 0];
  return [zElem(svgPolygon(points, fill, stroke, strokeThickness), A3D.vec3ZMean(v1, v2, v3, v4))];
}
