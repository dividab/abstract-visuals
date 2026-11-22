import { Curve, Path, type Shape, Vector2, Vector3 } from "three";
import { exhaustiveCheck } from "ts-exhaustive-check";
import type { CircleCurve as A3dCircleCurve, Hole, Lathe, Vec3 } from "../../abstract-3d.js";
import { vec2Scale, vec2Sub, vec2Add, vec3, equals } from "../../abstract-3d.js";

/** Three.js geometry helpers shared by the react renderer and the triangulating exporters */

export const CYLINDER_SEGMENTS = 40;

export function holeIsZero(hole: Hole): boolean {
  switch (hole.type) {
    case "RoundHole": {
      return equals(hole.radius, 0.0);
    }
    case "SquareHole": {
      return equals(hole.size.x, 0.0) || equals(hole.size.y, 0.0);
    }
    default:
      return false;
  }
}

export function nonZeroHoles(holes: ReadonlyArray<Hole> | undefined): ReadonlyArray<Hole> {
  return holes?.filter((h) => !holeIsZero(h)) ?? [];
}

export function addHoles(holes: ReadonlyArray<Hole> | undefined, shape: Shape): void {
  nonZeroHoles(holes).forEach((h) => {
    switch (h.type) {
      case "RoundHole":
        shape.holes.push(new Path().absarc(h.pos.x, h.pos.y, h.radius, 0, Math.PI * 2, true));
        break;
      case "SquareHole": {
        const path = new Path();
        const halfHole = vec2Scale(h.size, 0.5);
        const min = vec2Sub(h.pos, halfHole);
        const max = vec2Add(h.pos, halfHole);
        path.moveTo(min.x, min.y).lineTo(min.x, max.y).lineTo(max.x, max.y).lineTo(max.x, min.y).closePath();
        shape.holes.push(path);
        break;
      }
      default:
        exhaustiveCheck(h);
    }
  });
}

const rimPoint = (radius: number, y: number, angle: number): Vec3 => vec3(radius * Math.sin(angle), y, radius * Math.cos(angle));

/** Flat xyz positions of the two walls closing an angled cylinder, from the axis out to the rim at angleStart and angleEnd */
export function cylinderCutPositions(top: number, bottom: number, length: number, angleStart: number, angleLength: number): ReadonlyArray<number> {
  const half = length / 2;
  const [c0, c1] = [vec3(0, -half, 0), vec3(0, half, 0)];
  const angleEnd = angleStart + angleLength;
  const [b0, t0] = [rimPoint(bottom, -half, angleStart), rimPoint(top, half, angleStart)];
  const [b1, t1] = [rimPoint(bottom, -half, angleEnd), rimPoint(top, half, angleEnd)];
  // Unshared vertices so each wall gets its own flat normal, wound opposite so both face outwards
  const triangles = [
    [c0, b0, t0],
    [c0, t0, c1],
    [c0, c1, t1],
    [c0, t1, b1],
  ];
  return triangles.flat().flatMap((v) => [v.x, v.y, v.z]);
}

// oxlint-disable-next-line functional/no-classes -- extends three.js Curve, which requires a class
export class CircleCurve extends Curve<Vector3> {
  radius: number;
  angleLength: number;
  startAngle: number;

  constructor(circleCurve: A3dCircleCurve) {
    super();
    this.radius = circleCurve.radius;
    this.startAngle = circleCurve.angleStart;
    this.angleLength = circleCurve.angleLength;
  }

  override getPoint(t: number, optionalTarget = new Vector3()): Vector3 {
    return optionalTarget.set(
      -this.radius * Math.sin(this.startAngle + this.angleLength * t),
      -this.radius * Math.cos(this.startAngle + this.angleLength * t),
      0
    );
  }
}

/**
 * A lathe's profile for three.js' LatheGeometry, an end off the axis closed at its center, its corners rounded by its edgeRadius; a tip on the axis
 * is rounded between its side and that side mirrored across the axis, keeping the half on this side
 */
export function lathePoints(g: Lathe): ReadonlyArray<Vector2> {
  const [first, last] = [g.points[0], g.points.at(-1)];
  if (first === undefined || last === undefined) {
    return [];
  }
  const points: Array<Vector2> = first.x > 0 ? [new Vector2(0, first.y)] : [];
  for (const p of g.points) {
    points.push(new Vector2(p.x, p.y));
  }
  if (last.x > 0) {
    points.push(new Vector2(0, last.y));
  }
  const edgeRadius = g.edgeRadius ?? 0;
  if (edgeRadius <= 0) {
    return points;
  }
  const out: Array<Vector2> = [];
  const end = points.length - 1;
  for (let i = 0; i <= end; i++) {
    const p = points[i]!;
    const prev = points[i - 1] ?? p;
    const next = points[i + 1] ?? p;
    // An end's center stays
    if ((i === 0 && first.x > 0) || (i === end && last.x > 0)) {
      out.push(p);
    } else {
      roundCorner(out, p, i === 0 ? new Vector2(-next.x, next.y) : prev, i === end ? new Vector2(-prev.x, prev.y) : next, edgeRadius);
    }
  }
  return out;
}

/** Segments of a rounded corner's arc */
const EDGE_SEGMENTS = 8;

/**
 * The arc rounding the corner at `p` between its sides to `a` and `b`, from `a`'s side to `b`'s, of the radius or less where a side is shorter than
 * twice its tangent length; only its points not across the axis (x < 0), for a tip. A straight corner stays
 */
function roundCorner(out: Array<Vector2>, p: Vector2, a: Vector2, b: Vector2, radius: number): void {
  const ux = a.x - p.x;
  const uy = a.y - p.y;
  const vx = b.x - p.x;
  const vy = b.y - p.y;
  const lu = Math.hypot(ux, uy);
  const lv = Math.hypot(vx, vy);
  // As three's angleTo: a zero side is a right angle
  const half = lu * lv === 0 ? Math.PI / 4 : Math.acos(Math.min(Math.max((ux * vx + uy * vy) / (lu * lv), -1), 1)) / 2;
  if (equals(half, Math.PI / 2) || equals(half, 0)) {
    out.push(p);
    return;
  }
  const tangent = Math.min(radius / Math.tan(half), lu / 2, lv / 2);
  const nux = ux / (lu || 1);
  const nuy = uy / (lu || 1);
  const nvx = vx / (lv || 1);
  const nvy = vy / (lv || 1);
  const toCenter = tangent / Math.cos(half) / (Math.hypot(nux + nvx, nuy + nvy) || 1);
  const cx = p.x + (nux + nvx) * toCenter;
  const cy = p.y + (nuy + nvy) * toCenter;
  const start = Math.atan2(p.y + nuy * tangent - cy, p.x + nux * tangent - cx);
  const end = Math.atan2(p.y + nvy * tangent - cy, p.x + nvx * tangent - cx);
  // The shorter way around
  const step = (((end - start + 3 * Math.PI) % (2 * Math.PI)) - Math.PI) / EDGE_SEGMENTS;
  const r = tangent * Math.tan(half);
  for (let i = 0; i <= EDGE_SEGMENTS; i++) {
    const angle = start + step * i;
    const x = cx + r * Math.cos(angle);
    if (x > -1e-6) {
      out.push(new Vector2(Math.max(x, 0), cy + r * Math.sin(angle)));
    }
  }
}
