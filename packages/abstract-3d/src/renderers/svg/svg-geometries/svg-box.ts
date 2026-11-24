import type { Box, BoxEdge, Vec2, Vec3, Material } from "../../../abstract-3d.js";
import { vec3Scale, vec3TransRot, vec3RotCombine, vec3Zero, vec3, vec3ZMean, vec3Add, vec3Sub, vec3Length } from "../../../abstract-3d.js";
import { rgbGrayScale } from "../../../utils.js";
import { svgPolygon } from "../svg-encoding.js";
import type { zOrderElement, SvgOptions } from "./shared.js";
import { gray, black, zElem, getArea, isOpaque, minArea } from "./shared.js";

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
  const local = unitCorners.map((c) => vec3(c.x * half.x, c.y * half.y, c.z * half.z));
  const corners = local.map((c) => vec3TransRot(c, pos, rot));

  const color = material.normal;
  const opacity = material.opacity ?? 1.0;
  const [strokeColor, fill, strokeUse] = opts.only_stroke
    ? [opts.gray_scale ? gray : color, opts.background, opts.stroke_thickness]
    : [black, opts.gray_scale ? rgbGrayScale(color) : color, 0];
  const opaque = isOpaque(fill, opacity);

  return faces.flatMap(([one, other], i) => {
    const face = one.reduce((z, c) => z + corners[c]!.z, 0) > other.reduce((z, c) => z + corners[c]!.z, 0) ? one : other;
    // Seen edge on, a face is only a line along the edges of the box's other faces
    if (Math.abs(getArea(face.map((c) => point(corners[c]!.x, corners[c]!.y)))) < minArea) {
      return [];
    }
    const polygon = b.radius ? getRounded(face, faceEdges[i]!, local, b, pos, rot) : face.map((c) => corners[c]!);
    const points = polygon.map((c) => point(c.x, c.y));
    // Only the front and back have holes, which show what's behind them
    const holes = i === 0 ? b.holes : undefined;
    const plain = !holes?.length;
    return [
      zElem(
        plain ? "" : svgPolygon(rot, points, fill, opacity, strokeColor, strokeUse, holes),
        vec3ZMean(...polygon),
        polygon,
        opaque && plain,
        plain ? { fill, opacity, stroke: strokeColor, strokeWidth: strokeUse } : undefined
      ),
    ];
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
/** Of each face in `faces`, the edge seen end on at each of its corners, which `roundedEdges` names */
const faceEdges: ReadonlyArray<ReadonlyArray<BoxEdge>> = [
  ["BottomLeft", "BottomRight", "TopRight", "TopLeft"],
  ["BackLeft", "BackRight", "FrontRight", "FrontLeft"],
  ["BottomBack", "BottomFront", "TopFront", "TopBack"],
];
/** How far a rounded corner's lines may be from its quarter circle, half the svg's precision, as its points are rounded to whole units */
const arcTolerance = 0.5;

/** A face's outline, each corner whose edge is rounded a quarter circle of the radius, at most half its shorter side */
function getRounded(
  face: ReadonlyArray<number>,
  edges: ReadonlyArray<BoxEdge>,
  local: ReadonlyArray<Vec3>,
  b: Box,
  pos: Vec3,
  rot: Vec3
): ReadonlyArray<Vec3> {
  const outline: Array<Vec3> = [];
  for (let i = 0; i < face.length; i++) {
    const c = local[face[i]!]!;
    const prev = vec3Sub(local[face[(i + face.length - 1) % face.length]!]!, c);
    const next = vec3Sub(local[face[(i + 1) % face.length]!]!, c);
    const [lp, ln] = [vec3Length(prev), vec3Length(next)];
    const r = (b.roundedEdges?.includes(edges[i]!) ?? true) ? Math.min(b.radius ?? 0, lp / 2, ln / 2) : 0;
    // A corner as far from its quarter circle as the tolerance stays sharp
    if (r * (Math.SQRT2 - 1) <= arcTolerance) {
      outline.push(vec3TransRot(c, pos, rot));
      continue;
    }
    // From the point r along the side to the previous corner, about the center r in from both sides, to the point r along the next, in as few
    // lines as stay within the tolerance of it
    const [p, n] = [vec3Scale(prev, r / lp), vec3Scale(next, r / ln)];
    const center = vec3Add(c, vec3Add(p, n));
    const steps = Math.ceil(Math.PI / 4 / Math.acos(Math.max(0, 1 - arcTolerance / r)));
    for (let k = 0; k <= steps; k++) {
      const a = (k / steps) * (Math.PI / 2);
      outline.push(vec3TransRot(vec3Sub(center, vec3Add(vec3Scale(n, Math.cos(a)), vec3Scale(p, Math.sin(a)))), pos, rot));
    }
  }
  return outline;
}
