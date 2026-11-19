import type { CircleCurve, Tube, Vec3 } from "../../abstract-3d.js";
import {
  vec3,
  vec3Add,
  vec3Cross,
  vec3DistSquared,
  vec3Dot,
  vec3Length,
  vec3Normalize,
  vec3Rot,
  vec3Scale,
  vec3Sub,
  vec3TransRot,
  vec3Zero,
} from "../../abstract-3d.js";

/** Tube paths and the rings around them, for the exporters that build tubes themselves, without three.js */

/** An arc of a circle: its center, unit axis, the unit direction from the center to its start, and the angle it turns counterclockwise around the axis */
export type Arc = { readonly center: Vec3; readonly axis: Vec3; readonly start: Vec3; readonly radius: number; readonly angle: number };

/** Points along a tube's curve and its unit direction at each */
export type TubePath = { readonly points: ReadonlyArray<Vec3>; readonly tangents: ReadonlyArray<Vec3> };

/** How far, relative to its radius, a spline's points may be off a circle and still make an arc */
const ARC_TOLERANCE = 1e-6;
const GEOMETRY_EPSILON = 1e-9;
/** A spline segment gets a ring per this much it turns, so a straight one only needs its ends */
const SPLINE_TURN_PER_RING = Math.PI / 12;
const SPLINE_MAX_RINGS_PER_SEGMENT = 8;

/**
 * The arc the tube follows, in the coordinates its pos and rot are in: its circle, or its spline if that's through points on an arc, e.g. a bend, as
 * the spline is the arc but for how three.js rounds it between the points
 */
export function tubeArc(t: Tube, pos: Vec3, rot: Vec3): Arc | undefined {
  return t.curve.type === "CircleCurve" ? circleArc(t.curve, pos, (v) => vec3Rot(v, vec3Zero, rot)) : splineArc(tubeSplinePoints(t, pos, rot));
}

/** The tube's spline's points in the coordinates its pos and rot are in, none along a circle */
export const tubeSplinePoints = (t: Tube, pos: Vec3, rot: Vec3): ReadonlyArray<Vec3> =>
  t.curve.type === "SplineCurve" ? t.curve.points.map((p) => vec3TransRot(p, pos, rot)) : [];

/** The curve is at (-sin, -cos) of the angle, going clockwise around z as it grows, so counterclockwise around -z */
function circleArc(c: CircleCurve, center: Vec3, turn: (v: Vec3) => Vec3): Arc {
  const [start, angle] = c.angleLength < 0 ? [c.angleStart + c.angleLength, -c.angleLength] : [c.angleStart, c.angleLength];
  return { center, axis: turn(vec3(0, 0, -1)), start: turn(vec3(-Math.sin(start), -Math.cos(start), 0)), radius: c.radius, angle };
}

/** The arc the points are on, in order, if they are, by the circle through the first, middle and last */
function splineArc(points: ReadonlyArray<Vec3>): Arc | undefined {
  const [a, b, c] = [points[0], points[Math.floor(points.length / 2)], points.at(-1)];
  if (a === undefined || b === undefined || c === undefined || points.length < 3) {
    return undefined;
  }
  const [ab, ac] = [vec3Sub(b, a), vec3Sub(c, a)];
  const normal = vec3Cross(ab, ac);
  if (vec3Length(normal) < GEOMETRY_EPSILON * vec3Length(ab) * vec3Length(ac)) {
    return undefined;
  }
  // The circumcenter, and the points' angles around the normal, along which a, b and c turn counterclockwise
  const center = vec3Add(
    a,
    vec3Scale(
      vec3Add(vec3Scale(vec3Cross(normal, ab), vec3Dot(ac, ac)), vec3Scale(vec3Cross(ac, normal), vec3Dot(ab, ab))),
      1 / (2 * vec3Dot(normal, normal))
    )
  );
  const radius = vec3Length(vec3Sub(a, center));
  const [axis, start] = [vec3Normalize(normal), vec3Normalize(vec3Sub(a, center))];
  const side = vec3Cross(axis, start);
  const onArc = points.every((p) => {
    const d = vec3Sub(p, center);
    return Math.abs(vec3Length(d) - radius) <= ARC_TOLERANCE * radius && Math.abs(vec3Dot(d, axis)) <= ARC_TOLERANCE * radius;
  });
  // The first at 0, however it rounds
  const angles = points.map((p, i) => {
    const angle = Math.atan2(vec3Dot(vec3Sub(p, center), side), vec3Dot(vec3Sub(p, center), start));
    return i === 0 ? 0 : angle <= 0 ? angle + Math.PI * 2 : angle;
  });
  const turning = angles.every((angle, i) => i === 0 || angle > angles[i - 1]!);
  return onArc && turning ? { center, axis, start, radius, angle: angles.at(-1)! } : undefined;
}

/** The arc's points, segments of them past its start */
export function arcPath(arc: Arc, segments: number): TubePath {
  const side = vec3Cross(arc.axis, arc.start);
  const angles = Array.from({ length: segments + 1 }, (_, i) => (arc.angle * i) / segments);
  return {
    points: angles.map((a) => vec3Add(arc.center, vec3Scale(vec3Add(vec3Scale(arc.start, Math.cos(a)), vec3Scale(side, Math.sin(a))), arc.radius))),
    tangents: angles.map((a) => vec3Add(vec3Scale(arc.start, -Math.sin(a)), vec3Scale(side, Math.cos(a)))),
  };
}

/** Samples of three.js' default CatmullRomCurve3, open and centripetal, the ends extrapolated, as many per segment as it turns */
export function catmullRom(points: ReadonlyArray<Vec3>): TubePath {
  const distinct = points.filter((p, i) => i === 0 || vec3DistSquared(p, points[i - 1]!) > 0);
  if (distinct.length < 2) {
    return { points: [], tangents: [] };
  }
  const at = (i: number): Vec3 =>
    distinct[i] ?? (i < 0 ? vec3Sub(vec3Scale(distinct[0]!, 2), distinct[1]!) : vec3Sub(vec3Scale(distinct.at(-1)!, 2), distinct.at(-2)!));
  const segments = distinct.slice(1).map((_, s) => {
    const [x0, x1, x2, x3] = [at(s - 1), at(s), at(s + 1), at(s + 2)];
    const dt1 = vec3DistSquared(x1, x2) ** 0.25 || 1;
    const dt0 = vec3DistSquared(x0, x1) ** 0.25 || dt1;
    const dt2 = vec3DistSquared(x2, x3) ** 0.25 || dt1;
    const tangent = (a: Vec3, b: Vec3, c: Vec3, d0: number, d1: number): Vec3 =>
      vec3Scale(vec3Add(vec3Sub(vec3Scale(vec3Sub(b, a), 1 / d0), vec3Scale(vec3Sub(c, a), 1 / (d0 + d1))), vec3Scale(vec3Sub(c, b), 1 / d1)), dt1);
    const t1 = tangent(x0, x1, x2, dt0, dt1);
    const t2 = tangent(x1, x2, x3, dt1, dt2);
    const c2 = vec3Sub(vec3Sub(vec3Scale(vec3Sub(x2, x1), 3), vec3Scale(t1, 2)), t2);
    const c3 = vec3Add(vec3Add(vec3Scale(vec3Sub(x1, x2), 2), t1), t2);
    const point = (t: number): Vec3 => vec3Add(vec3Add(x1, vec3Scale(t1, t)), vec3Add(vec3Scale(c2, t * t), vec3Scale(c3, t * t * t)));
    const direction = (t: number): Vec3 => vec3Normalize(vec3Add(t1, vec3Add(vec3Scale(c2, 2 * t), vec3Scale(c3, 3 * t * t))));
    // As many rings as it turns, between the directions it starts and ends in
    const cos = vec3Dot(t1, t2) / (vec3Length(t1) * vec3Length(t2));
    const turn = Number.isFinite(cos) ? Math.acos(Math.min(1, Math.max(-1, cos))) : 0;
    const rings = Math.min(SPLINE_MAX_RINGS_PER_SEGMENT, Math.max(1, Math.ceil(turn / SPLINE_TURN_PER_RING)));
    const ts = Array.from({ length: rings }, (_, i) => i / rings);
    return { points: ts.map(point), tangents: ts.map(direction), end: direction(1) };
  });
  return {
    points: [...segments.flatMap((s) => s.points), distinct.at(-1)!],
    tangents: [...segments.flatMap((s) => s.tangents), segments.at(-1)!.end],
  };
}

/** A ring of points around each of the path's, sides of them, its normals carried along the path so the rings don't twist */
export function tubeRings(path: TubePath, radius: number, sides: number): ReadonlyArray<ReadonlyArray<Vec3>> {
  const first = path.tangents[0] ?? vec3(1, 0, 0);
  const seed = Math.abs(first.x) < 0.9 ? vec3(1, 0, 0) : vec3(0, 1, 0);
  const normals = path.tangents.reduce<ReadonlyArray<Vec3>>((acc, t) => {
    const prev = acc.at(-1) ?? vec3Normalize(vec3Cross(first, seed));
    return [...acc, vec3Normalize(vec3Sub(prev, vec3Scale(t, vec3Dot(prev, t))))];
  }, []);
  return path.points.map((center, i) => {
    const [n, b] = [normals[i]!, vec3Cross(path.tangents[i]!, normals[i]!)];
    return Array.from({ length: sides }, (_, j) => {
      const angle = (j / sides) * Math.PI * 2;
      return vec3Add(center, vec3Add(vec3Scale(n, radius * Math.cos(angle)), vec3Scale(b, radius * Math.sin(angle))));
    });
  });
}
