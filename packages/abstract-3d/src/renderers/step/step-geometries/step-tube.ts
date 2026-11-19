import type { CircleCurve, Material, Tube, Vec3 } from "../../../abstract-3d.js";
import {
  vec3,
  vec3Add,
  vec3Cross,
  vec3Dot,
  vec3Length,
  vec3Normalize,
  vec3Rot,
  vec3RotCombine,
  vec3Scale,
  vec3Sub,
  vec3TransRot,
  vec3Zero,
  vec3DistSquared,
} from "../../../abstract-3d.js";
import type { MutableStep } from "../step-encoding.js";
import {
  ADVANCED_FACE,
  AXIS2_PLACEMENT_3D,
  CARTESIAN_POINT,
  CIRCLE,
  CLOSED_SHELL,
  DIRECTION,
  EDGE_CURVE,
  EDGE_LOOP,
  FACE_BOUND,
  MANIFOLD_SOLID_BREP,
  ORIENTED_EDGE,
  PLANE,
  stepProduct,
  TOROIDAL_SURFACE,
  VERTEX_POINT,
} from "../step-encoding.js";
import { newell, polygonFace } from "./step-prism.js";

/** A spline segment gets a ring per this much it turns, so a straight one only needs its ends */
const SPLINE_TURN_PER_RING = Math.PI / 12;
const SPLINE_MAX_RINGS_PER_SEGMENT = 8;
const SPLINE_RADIAL_SEGMENTS = 12;
/** How far, relative to its radius, a spline's points may be off a circle and still make an arc */
const ARC_TOLERANCE = 1e-6;
const GEOMETRY_EPSILON = 1e-9;

/** An arc of a circle: its center, unit axis, the unit direction from the center to its start, and the angle it turns counterclockwise around the axis */
type Arc = { readonly center: Vec3; readonly axis: Vec3; readonly start: Vec3; readonly radius: number; readonly angle: number };

/**
 * Around a circle it's a torus, closed by flat ends unless it goes all the way around. So is it along a spline through points on an arc, e.g. a bend,
 * as the spline is the arc but for how three.js rounds it between the points; along any other spline it's faceted
 */
export function stepTube(t: Tube, mat: Material, parentPos: Vec3, parentRot: Vec3, m: MutableStep): void {
  if (t.radius <= 0) {
    return;
  }
  const pos = vec3TransRot(t.pos, parentPos, parentRot);
  const rot = vec3RotCombine(parentRot, t.rot ?? vec3Zero);
  const points = t.curve.type === "SplineCurve" ? t.curve.points.map((p) => vec3TransRot(p, pos, rot)) : [];
  const arc = t.curve.type === "CircleCurve" ? circleArc(t.curve, pos, (v) => vec3Rot(v, vec3Zero, rot)) : splineArc(points);
  const brep = arc !== undefined ? torus(arc, t.radius, m) : spline(points, t.radius, m);
  if (brep !== undefined) {
    stepProduct("solids", [brep], "Tube", mat, m);
  }
}

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

function torus(arc: Arc, radius: number, m: MutableStep): number | undefined {
  if (arc.radius <= radius) {
    return undefined;
  }
  const whole = arc.angle >= Math.PI * 2 - 1e-9;
  const side = vec3Cross(arc.axis, arc.start);
  const outward = (angle: number): Vec3 => vec3Add(vec3Scale(arc.start, Math.cos(angle)), vec3Scale(side, Math.sin(angle)));
  const along = (angle: number): Vec3 => vec3Add(vec3Scale(arc.start, -Math.sin(angle)), vec3Scale(side, Math.cos(angle)));
  const placement = AXIS2_PLACEMENT_3D(CARTESIAN_POINT(arc.center, m), DIRECTION(arc.axis, m), DIRECTION(arc.start, m), m);

  // The tube's circle at an angle, starting on its outer side
  const ring = (angle: number): { readonly vertex: number; readonly edge: number } => {
    const ringCenter = vec3Add(arc.center, vec3Scale(outward(angle), arc.radius));
    const vertex = VERTEX_POINT(CARTESIAN_POINT(vec3Add(ringCenter, vec3Scale(outward(angle), radius)), m), m);
    const ringPlacement = AXIS2_PLACEMENT_3D(CARTESIAN_POINT(ringCenter, m), DIRECTION(along(angle), m), DIRECTION(outward(angle), m), m);
    return { vertex, edge: EDGE_CURVE(vertex, vertex, CIRCLE(ringPlacement, radius, m), m, "T") };
  };
  const first = ring(0);
  const last = whole ? first : ring(arc.angle);
  const outer = EDGE_CURVE(first.vertex, last.vertex, CIRCLE(placement, arc.radius + radius, m), m, "T");
  const loop = [ORIENTED_EDGE(first.edge, m, "T"), ORIENTED_EDGE(outer, m, "T"), ORIENTED_EDGE(last.edge, m, "F"), ORIENTED_EDGE(outer, m, "F")];
  const mantle = ADVANCED_FACE([FACE_BOUND(EDGE_LOOP(loop, m), "T", m)], TOROIDAL_SURFACE(placement, arc.radius, radius, m), m, "T");

  const end = (angle: number, sign: number, edge: number): number => {
    const endCenter = vec3Add(arc.center, vec3Scale(outward(angle), arc.radius));
    const plane = PLANE(
      AXIS2_PLACEMENT_3D(CARTESIAN_POINT(endCenter, m), DIRECTION(vec3Scale(along(angle), sign), m), DIRECTION(outward(angle), m), m),
      m
    );
    return ADVANCED_FACE([FACE_BOUND(EDGE_LOOP([ORIENTED_EDGE(edge, m, sign > 0 ? "T" : "F")], m), "T", m)], plane, m, "T");
  };
  const ends = whole ? [] : [end(0, -1, first.edge), end(arc.angle, 1, last.edge)];
  return MANIFOLD_SOLID_BREP(CLOSED_SHELL([mantle, ...ends], m), m);
}

/** Triangles between rings around a centripetal Catmull-Rom spline through the points, as three.js draws it, and a flat face on each end */
function spline(points: ReadonlyArray<Vec3>, radius: number, m: MutableStep): number | undefined {
  const path = catmullRom(points);
  if (path.length < 2) {
    return undefined;
  }
  const tangents = path.map((_, i) => vec3Normalize(vec3Sub(path[Math.min(i + 1, path.length - 1)]!, path[Math.max(i - 1, 0)]!)));
  // Normals carried along the path, so the rings don't twist
  const first = tangents[0]!;
  const seed = Math.abs(first.x) < 0.9 ? vec3(1, 0, 0) : vec3(0, 1, 0);
  const normals = tangents.reduce<ReadonlyArray<Vec3>>((acc, t) => {
    const prev = acc.at(-1) ?? vec3Normalize(vec3Cross(first, seed));
    return [...acc, vec3Normalize(vec3Sub(prev, vec3Scale(t, vec3Dot(prev, t))))];
  }, []);
  const rings = path.map((center, i) =>
    Array.from({ length: SPLINE_RADIAL_SEGMENTS }, (_, j) => {
      const angle = (j / SPLINE_RADIAL_SEGMENTS) * Math.PI * 2;
      const [n, b] = [normals[i]!, vec3Cross(tangents[i]!, normals[i]!)];
      return vec3Add(center, vec3Add(vec3Scale(n, radius * Math.cos(angle)), vec3Scale(b, radius * Math.sin(angle))));
    })
  );
  const sides = rings.slice(1).flatMap((b, i) => {
    const a = rings[i]!;
    const inside = vec3Scale(vec3Add(path[i]!, path[i + 1]!), 0.5);
    return a.flatMap((_, j) => {
      const k = (j + 1) % a.length;
      return [outward([a[j]!, b[j]!, b[k]!], inside), outward([a[j]!, b[k]!, a[k]!], inside)];
    });
  });
  const ends = [outward(rings[0]!, path[1]!), outward(rings.at(-1)!, path.at(-2)!)];
  return MANIFOLD_SOLID_BREP(
    CLOSED_SHELL(
      [...sides, ...ends].map((loop) => polygonFace(loop, m)),
      m
    ),
    m
  );
}

/** The face's loop turned so its normal points away from the inside point */
const outward = (loop: ReadonlyArray<Vec3>, inside: Vec3): ReadonlyArray<Vec3> =>
  vec3Dot(newell(loop), vec3Sub(loop[0]!, inside)) > 0 ? loop : loop.toReversed();

/** Samples of three.js' default CatmullRomCurve3, open and centripetal, the ends extrapolated */
function catmullRom(points: ReadonlyArray<Vec3>): ReadonlyArray<Vec3> {
  const distinct = points.filter((p, i) => i === 0 || vec3DistSquared(p, points[i - 1]!) > 0);
  if (distinct.length < 2) {
    return [];
  }
  const at = (i: number): Vec3 =>
    distinct[i] ?? (i < 0 ? vec3Sub(vec3Scale(distinct[0]!, 2), distinct[1]!) : vec3Sub(vec3Scale(distinct.at(-1)!, 2), distinct.at(-2)!));
  const segments = distinct.slice(1).flatMap((_, s) => {
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
    // As many rings as it turns, between the directions it starts and ends in
    const cos = vec3Dot(t1, t2) / (vec3Length(t1) * vec3Length(t2));
    const turn = Number.isFinite(cos) ? Math.acos(Math.min(1, Math.max(-1, cos))) : 0;
    const rings = Math.min(SPLINE_MAX_RINGS_PER_SEGMENT, Math.max(1, Math.ceil(turn / SPLINE_TURN_PER_RING)));
    return Array.from({ length: rings }, (_, i) => {
      const t = i / rings;
      return vec3Add(vec3Add(x1, vec3Scale(t1, t)), vec3Add(vec3Scale(c2, t * t), vec3Scale(c3, t * t * t)));
    });
  });
  return [...segments, distinct.at(-1)!];
}
