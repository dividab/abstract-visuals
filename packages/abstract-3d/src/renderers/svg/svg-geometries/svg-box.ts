import * as A3D from "../../../abstract-3d";
import { gray, black, zElem, zOrderElement } from "./shared";
import { svgPolygon } from "../svg-encoding";
import { rgbGray } from "../../shared";

export function box(
  b: A3D.Box,
  point: (x: number, y: number) => A3D.Vec2,
  color: string,
  onlyStroke: boolean,
  grayScale: boolean,
  stroke: number,
  onlyStrokeFill: string,
  parentPos: A3D.Vec3,
  parentRot: A3D.Vec3
): ReadonlyArray<zOrderElement> {
  const half = A3D.vec3Scale(b.size, 0.5);
  const pos = A3D.vec3TransRot(b.pos, parentPos, parentRot);
  const rot = A3D.vec3RotCombine(parentRot, b.rot ?? A3D.vec3Zero);
  const vec3tr = (p: A3D.Vec3): A3D.Vec3 => A3D.vec3TransRot(p, pos, rot);

  const v1 = vec3tr(A3D.vec3(-half.x, -half.y, half.z));
  const v2 = vec3tr(A3D.vec3(half.x, -half.y, half.z));
  const v3 = vec3tr(A3D.vec3(half.x, half.y, half.z));
  const v4 = vec3tr(A3D.vec3(-half.x, half.y, half.z));
  const v5 = vec3tr(A3D.vec3(-half.x, -half.y, -half.z));
  const v6 = vec3tr(A3D.vec3(half.x, -half.y, -half.z));
  const v7 = vec3tr(A3D.vec3(half.x, half.y, -half.z));
  const v8 = vec3tr(A3D.vec3(-half.x, half.y, -half.z));

  const frontMean = A3D.vec3ZMean(v1, v2, v3, v4);
  const backMean = A3D.vec3ZMean(v5, v6, v7, v8);
  const [frontBackPoints, frontBackMean] =
    frontMean > backMean
      ? [[point(v1.x, v1.y), point(v2.x, v2.y), point(v3.x, v3.y), point(v4.x, v4.y)], frontMean]
      : [[point(v5.x, v5.y), point(v6.x, v6.y), point(v7.x, v7.y), point(v8.x, v8.y)], backMean];

  const topMean = A3D.vec3ZMean(v8, v7, v3, v4);
  const botMean = A3D.vec3ZMean(v5, v6, v2, v1);
  const [topBotPoints, topBotMean] =
    topMean > botMean
      ? [[point(v8.x, v8.y), point(v7.x, v7.y), point(v3.x, v3.y), point(v4.x, v4.y)], topMean]
      : [[point(v5.x, v5.y), point(v6.x, v6.y), point(v2.x, v2.y), point(v1.x, v1.y)], botMean];

  const rightMean = A3D.vec3ZMean(v6, v2, v3, v7);
  const leftMean = A3D.vec3ZMean(v5, v1, v4, v8);
  const [rightLeftPoints, rightLeftMean] =
    rightMean > leftMean
      ? [[point(v6.x, v6.y), point(v2.x, v2.y), point(v3.x, v3.y), point(v7.x, v7.y)], rightMean]
      : [[point(v5.x, v5.y), point(v1.x, v1.y), point(v4.x, v4.y), point(v8.x, v8.y)], leftMean];

  const [strokeColor, fill, strokeUse] = onlyStroke
    ? [grayScale ? gray : color, onlyStrokeFill, stroke]
    : [black, grayScale ? rgbGray(color) : color, 0];

  return [
    zElem(svgPolygon(frontBackPoints, fill, strokeColor, strokeUse), frontBackMean),
    zElem(svgPolygon(topBotPoints, fill, strokeColor, strokeUse), topBotMean),
    zElem(svgPolygon(rightLeftPoints, fill, strokeColor, strokeUse), rightLeftMean),
  ];
}
