import {
  Box,
  Vec2,
  Vec3,
  vec3Scale,
  vec3TransRot,
  vec3RotCombine,
  vec3Zero,
  vec3,
  vec3ZMean,
  Material,
} from "../../../abstract-3d.js";
import { gray, black, zElem, zOrderElement, SvgOptions } from "./shared.js";
import { svgPolygon } from "../svg-encoding.js";
import { rgbGrayScale } from "../../shared.js";

export function box(
  b: Box,
  point: (x: number, y: number) => Vec2,
  material: Material,
  opts: SvgOptions,
  parentPos: Vec3,
  parentRot: Vec3,
  factor: number,
): ReadonlyArray<zOrderElement> {
  const half = vec3Scale(b.size, 0.5);
  const pos = vec3TransRot(b.pos, parentPos, parentRot);
  const rot = vec3RotCombine(parentRot, b.rot ?? vec3Zero);
  const vec3tr = (p: Vec3): Vec3 => vec3TransRot(p, pos, rot);

  const v1 = vec3tr(vec3(-half.x, -half.y, half.z));
  const v2 = vec3tr(vec3(half.x, -half.y, half.z));
  const v3 = vec3tr(vec3(half.x, half.y, half.z));
  const v4 = vec3tr(vec3(-half.x, half.y, half.z));
  const v5 = vec3tr(vec3(-half.x, -half.y, -half.z));
  const v6 = vec3tr(vec3(half.x, -half.y, -half.z));
  const v7 = vec3tr(vec3(half.x, half.y, -half.z));
  const v8 = vec3tr(vec3(-half.x, half.y, -half.z));

  const frontMean = vec3ZMean(v1, v2, v3, v4);
  const backMean = vec3ZMean(v5, v6, v7, v8);
  const [frontBackPoints, frontBackMean] =
    frontMean > backMean
      ? [[point(v1.x, v1.y), point(v2.x, v2.y), point(v3.x, v3.y), point(v4.x, v4.y)], frontMean]
      : [[point(v5.x, v5.y), point(v6.x, v6.y), point(v7.x, v7.y), point(v8.x, v8.y)], backMean];

  const topMean = vec3ZMean(v8, v7, v3, v4);
  const botMean = vec3ZMean(v5, v6, v2, v1);
  const [topBotPoints, topBotMean] =
    topMean > botMean
      ? [[point(v8.x, v8.y), point(v7.x, v7.y), point(v3.x, v3.y), point(v4.x, v4.y)], topMean]
      : [[point(v5.x, v5.y), point(v6.x, v6.y), point(v2.x, v2.y), point(v1.x, v1.y)], botMean];

  const rightMean = vec3ZMean(v6, v2, v3, v7);
  const leftMean = vec3ZMean(v5, v1, v4, v8);
  const [rightLeftPoints, rightLeftMean] =
    rightMean > leftMean
      ? [[point(v6.x, v6.y), point(v2.x, v2.y), point(v3.x, v3.y), point(v7.x, v7.y)], rightMean]
      : [[point(v5.x, v5.y), point(v1.x, v1.y), point(v4.x, v4.y), point(v8.x, v8.y)], leftMean];

  const color = material.normal;
  const opacity = material.opacity ?? 1.0;
  const [strokeColor, fill, strokeUse] = opts.onlyStroke
    ? [opts.grayScale ? gray : color, opts.onlyStrokeFill, opts.stroke]
    : [black, opts.grayScale ? rgbGrayScale(color) : color, 0];

  return [
    zElem(svgPolygon(factor, rot, frontBackPoints, fill, opacity, strokeColor, strokeUse, b.holes), frontBackMean),
    zElem(svgPolygon(factor, rot, topBotPoints, fill, opacity, strokeColor, strokeUse), topBotMean),
    zElem(svgPolygon(factor, rot, rightLeftPoints, fill, opacity, strokeColor, strokeUse), rightLeftMean),
  ];
}
