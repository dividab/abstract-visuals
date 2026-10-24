import type { Box, Vec2, Vec3, Material } from "../../../abstract-3d.js";
import { vec3Scale, vec3TransRot, vec3RotCombine, vec3Zero, vec3, vec3ZMean } from "../../../abstract-3d.js";
import { rgbGrayScale } from "../../../utils.js";
import { svgPolygon } from "../svg-encoding.js";
import type { zOrderElement, SvgOptions } from "./shared.js";
import { gray, black, zElem, getArea, isOpaque } from "./shared.js";

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
  const corners = unitCorners.map((c) => vec3TransRot(vec3(c.x * half.x, c.y * half.y, c.z * half.z), pos, rot));

  const color = material.normal;
  const opacity = material.opacity ?? 1.0;
  const [strokeColor, fill, strokeUse] = opts.only_stroke
    ? [opts.gray_scale ? gray : color, opts.background, opts.stroke_thickness]
    : [black, opts.gray_scale ? rgbGrayScale(color) : color, 0];
  const opaque = isOpaque(fill, opacity);

  return faces.flatMap(([one, other], i) => {
    const polygon = (one.reduce((z, c) => z + corners[c]!.z, 0) > other.reduce((z, c) => z + corners[c]!.z, 0) ? one : other).map((c) => corners[c]!);
    const points = polygon.map((c) => point(c.x, c.y));
    // Seen edge on, a face is only a line along the edges of the box's other faces
    if (Math.abs(getArea(points)) < minArea) {
      return [];
    }
    // Only the front and back have holes, which show what's behind them
    const holes = i === 0 ? b.holes : undefined;
    return [zElem(svgPolygon(rot, points, fill, opacity, strokeColor, strokeUse, holes), vec3ZMean(...polygon), polygon, opaque && !holes?.length)];
  });
}

const unitCorners = [
  vec3(-1, -1, 1),
  vec3(1, -1, 1),
  vec3(1, 1, 1),
  vec3(-1, 1, 1),
  vec3(-1, -1, -1),
  vec3(1, -1, -1),
  vec3(1, 1, -1),
  vec3(-1, 1, -1),
];
/** Pairs of opposite faces by their corners, front and back, top and bottom, right and left, of which the one toward the viewer is drawn */
const faces: ReadonlyArray<readonly [ReadonlyArray<number>, ReadonlyArray<number>]> = [
  [
    [0, 1, 2, 3],
    [4, 5, 6, 7],
  ],
  [
    [7, 6, 2, 3],
    [4, 5, 1, 0],
  ],
  [
    [5, 1, 2, 6],
    [4, 0, 3, 7],
  ],
];
/** Of a face on screen, in the scene's units squared, below which it's seen edge on */
const minArea = 1e-6;
