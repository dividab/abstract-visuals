import type { Box, BoxEdge, Vec2, Vec3, Material } from "../../../abstract-3d.js";
import {
  vec3Scale,
  vec3TransRot,
  vec3RotCombine,
  vec3Zero,
  vec3,
  vec3ZMean,
  vec3Add,
  vec3Sub,
  vec3Length,
  boxEdgeRadius,
} from "../../../abstract-3d.js";
import { rgbGrayScale } from "../../../utils.js";
import { svgPolygon } from "../svg-encoding.js";
import type { zOrderElement, SvgOptions } from "./shared.js";
import { gray, black, zElem } from "./shared.js";

// A cubic Bézier's control points this far from its ends towards the corner draw a quarter circle
const arcControl = 0.5523;

export function box(
  b: Box,
  point: (x: number, y: number) => Vec2,
  material: Material,
  opts: SvgOptions,
  parentPos: Vec3,
  parentRot: Vec3
): ReadonlyArray<zOrderElement> {
  const half = vec3Scale(b.size, 0.5);
  const pos = vec3TransRot(b.pos, parentPos, parentRot);
  const rot = vec3RotCombine(parentRot, b.rot ?? vec3Zero);
  const vec3tr = (p: Vec3): Vec3 => vec3TransRot(p, pos, rot);

  // The corners in the box's own coordinates, each face's in order around it with the edge seen end-on from it at each, which rounds that corner
  const c1 = vec3(-half.x, -half.y, half.z);
  const c2 = vec3(half.x, -half.y, half.z);
  const c3 = vec3(half.x, half.y, half.z);
  const c4 = vec3(-half.x, half.y, half.z);
  const c5 = vec3(-half.x, -half.y, -half.z);
  const c6 = vec3(half.x, -half.y, -half.z);
  const c7 = vec3(half.x, half.y, -half.z);
  const c8 = vec3(-half.x, half.y, -half.z);
  const v1 = vec3tr(c1);
  const v2 = vec3tr(c2);
  const v3 = vec3tr(c3);
  const v4 = vec3tr(c4);
  const v5 = vec3tr(c5);
  const v6 = vec3tr(c6);
  const v7 = vec3tr(c7);
  const v8 = vec3tr(c8);

  const frontMean = vec3ZMean(v1, v2, v3, v4);
  const backMean = vec3ZMean(v5, v6, v7, v8);
  const [frontBackCorners, frontBackMean]: [Corners, number] =
    frontMean > backMean
      ? [
          [
            [c1, "BottomLeft"],
            [c2, "BottomRight"],
            [c3, "TopRight"],
            [c4, "TopLeft"],
          ],
          frontMean,
        ]
      : [
          [
            [c5, "BottomLeft"],
            [c6, "BottomRight"],
            [c7, "TopRight"],
            [c8, "TopLeft"],
          ],
          backMean,
        ];
  const topMean = vec3ZMean(v8, v7, v3, v4);
  const botMean = vec3ZMean(v5, v6, v2, v1);
  const [topBotCorners, topBotMean]: [Corners, number] =
    topMean > botMean
      ? [
          [
            [c8, "BackLeft"],
            [c7, "BackRight"],
            [c3, "FrontRight"],
            [c4, "FrontLeft"],
          ],
          topMean,
        ]
      : [
          [
            [c5, "BackLeft"],
            [c6, "BackRight"],
            [c2, "FrontRight"],
            [c1, "FrontLeft"],
          ],
          botMean,
        ];

  const rightMean = vec3ZMean(v6, v2, v3, v7);
  const leftMean = vec3ZMean(v5, v1, v4, v8);
  const [rightLeftCorners, rightLeftMean]: [Corners, number] =
    rightMean > leftMean
      ? [
          [
            [c6, "BottomBack"],
            [c2, "BottomFront"],
            [c3, "TopFront"],
            [c7, "TopBack"],
          ],
          rightMean,
        ]
      : [
          [
            [c5, "BottomBack"],
            [c1, "BottomFront"],
            [c4, "TopFront"],
            [c8, "TopBack"],
          ],
          leftMean,
        ];

  const color = material.normal;
  const opacity = material.opacity ?? 1.0;
  const [strokeColor, fill, strokeUse] = opts.only_stroke
    ? [opts.stroke_color || (opts.gray_scale ? gray : color), opts.background, opts.stroke_thickness]
    : [black, opts.gray_scale ? rgbGrayScale(color) : color, 0];

  const faces: ReadonlyArray<[Corners, number, Box["holes"]]> = [
    [frontBackCorners, frontBackMean, b.holes],
    [topBotCorners, topBotMean, undefined],
    [rightLeftCorners, rightLeftMean, undefined],
  ];
  const elements = Array<zOrderElement>();
  for (const [corners, mean, holes] of faces) {
    const points = corners.map(([c]) => {
      const v = vec3tr(c);
      return point(v.x, v.y);
    });
    if (!b.radius && !b.edgeRadius) {
      elements.push(zElem(svgPolygon(rot, points, fill, opacity, strokeColor, strokeUse, holes, parentPos), mean));
      continue;
    }
    // A rounded box's face seen edge-on is left out, the faces it's between drawing its rounded outline
    const area = points.reduce((a, p, i) => a + p.x * points[(i + 1) % points.length]!.y - points[(i + 1) % points.length]!.x * p.y, 0);
    if (Math.abs(area) < 1) {
      continue;
    }
    // A rounded corner a quarter circle of the radius, at most half its shorter side, between the points that far along its two sides
    const d = corners
      .map(([c, edge], i) => {
        const prev = corners[(i + corners.length - 1) % corners.length]![0];
        const next = corners[(i + 1) % corners.length]![0];
        const r = Math.min(boxEdgeRadius(b, edge), vec3Length(vec3Sub(prev, c)) / 2, vec3Length(vec3Sub(next, c)) / 2);
        if (r <= 0) {
          return svgPoint(point, vec3tr(c));
        }
        const start = vec3Add(c, vec3Scale(vec3Sub(prev, c), r / vec3Length(vec3Sub(prev, c))));
        const end = vec3Add(c, vec3Scale(vec3Sub(next, c), r / vec3Length(vec3Sub(next, c))));
        const startControl = vec3Add(start, vec3Scale(vec3Sub(c, start), arcControl));
        const endControl = vec3Add(end, vec3Scale(vec3Sub(c, end), arcControl));
        return `${svgPoint(point, vec3tr(start))} C ${svgPoint(point, vec3tr(startControl))} ${svgPoint(point, vec3tr(endControl))} ${svgPoint(point, vec3tr(end))}`;
      })
      .join(" L ");
    elements.push(zElem(svgPolygon(rot, points, fill, opacity, strokeColor, strokeUse, holes, parentPos, `M ${d} Z`), mean));
  }
  return elements;
}

type Corners = ReadonlyArray<readonly [Vec3, BoxEdge]>;

const svgPoint = (point: (x: number, y: number) => Vec2, v: Vec3): string => {
  const p = point(v.x, v.y);
  return `${p.x.toFixed(0)},${p.y.toFixed(0)}`;
};
