import { type Shape, type Vec2, type Vec3, vec3, vec3RotCombine, vec3TransRot, vec3Zero } from "../../../abstract-3d.js";
import { dxfEnc3DFace } from "../dxf-encoding/dxf-3dface.js";
import type { Handle } from "../dxf-encoding/dxf-common.js";
import { dxfEnc3DFaceTriangle } from "../dxf-encoding/dxf-triangle.js";

const GEOMETRY_EPSILON = 1e-9;

type Triangle = readonly [Vec2, Vec2, Vec2];

/** The outline cut into triangles, also if it's concave, on both sides of its thickness, with walls between them; its holes are left out */
export function dxfShape(s: Shape, style: string, parentPos: Vec3, parentRot: Vec3, handleRef: Handle): string {
  const pos = vec3TransRot(s.pos, parentPos, parentRot);
  const rot = vec3RotCombine(parentRot, s.rot ?? vec3Zero);
  const outline = counterclockwise(simplify(s.points));
  if (outline.length < 3) {
    return "";
  }
  const at = (p: Vec2, z: number): Vec3 => vec3TransRot(vec3(p.x, p.y, z), pos, rot);
  const half = s.thickness / 2;
  const triangles = earClip(outline);
  const side = (z: number): ReadonlyArray<string> =>
    triangles.map(([a, b, c]) => dxfEnc3DFaceTriangle(at(a, z), at(b, z), at(c, z), style, handleRef));
  if (half <= 0) {
    return side(0).join("");
  }
  const walls = outline.map((p, i) => {
    const q = outline[(i + 1) % outline.length]!;
    return dxfEnc3DFace(at(p, -half), at(q, -half), at(q, half), at(p, half), style, handleRef);
  });
  return [...side(half), ...side(-half), ...walls].join("");
}

const cross = (a: Vec2, b: Vec2, c: Vec2): number => (b.x - a.x) * (c.y - b.y) - (b.y - a.y) * (c.x - b.x);

/** Without repeated points, e.g. the first again at the end, or points on a straight line between their neighbors */
function simplify(loop: ReadonlyArray<Vec2>): ReadonlyArray<Vec2> {
  const distinct = loop.filter((p, i) => {
    const prev = loop.at(i - 1)!;
    return Math.abs(p.x - prev.x) > GEOMETRY_EPSILON || Math.abs(p.y - prev.y) > GEOMETRY_EPSILON;
  });
  return distinct.filter((b, i) => Math.abs(cross(distinct.at(i - 1)!, b, distinct[(i + 1) % distinct.length]!)) > GEOMETRY_EPSILON);
}

/** By its signed area, the shoelace formula */
const counterclockwise = (loop: ReadonlyArray<Vec2>): ReadonlyArray<Vec2> =>
  loop.reduce((area, p, i) => {
    const q = loop[(i + 1) % loop.length]!;
    return area + p.x * q.y - q.x * p.y;
  }, 0) >= 0
    ? loop
    : loop.toReversed();

/**
 * Triangles of a counterclockwise loop, cutting off a corner at a time that's convex and has no other point in it; a fan of what's left if none is,
 * as when the loop crosses itself
 */
function earClip(loop: ReadonlyArray<Vec2>): ReadonlyArray<Triangle> {
  const corner = (i: number): Triangle => [loop.at(i - 1)!, loop[i]!, loop[(i + 1) % loop.length]!];
  if (loop.length <= 3) {
    return loop.length === 3 ? [corner(1)] : [];
  }
  const ear = loop.findIndex((_, i) => {
    const [a, b, c] = corner(i);
    return cross(a, b, c) > GEOMETRY_EPSILON && loop.every((p) => p === a || p === b || p === c || !inTriangle(p, a, b, c));
  });
  if (ear < 0) {
    return loop.slice(2).map((p, i) => [loop[0]!, loop[i + 1]!, p] as const);
  }
  return [corner(ear), ...earClip(loop.filter((_, i) => i !== ear))];
}

/** In the counterclockwise triangle or on its edges */
const inTriangle = (p: Vec2, a: Vec2, b: Vec2, c: Vec2): boolean => cross(a, b, p) >= 0 && cross(b, c, p) >= 0 && cross(c, a, p) >= 0;
