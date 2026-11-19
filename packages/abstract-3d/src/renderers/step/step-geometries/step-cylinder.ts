import type { Material, Vec2, Vec3, Cylinder } from "../../../abstract-3d.js";
import { vec3TransRot, vec3RotCombine, vec3Zero, vec3, vec3Add, vec3Rot, vec3Scale, isZero } from "../../../abstract-3d.js";
import type { MutableStep } from "../step-encoding.js";
import {
  ADVANCED_FACE,
  AXIS2_PLACEMENT_3D,
  CARTESIAN_POINT,
  CIRCLE,
  CLOSED_SHELL,
  CONICAL_SURFACE,
  CYLINDRICAL_SURFACE,
  DIRECTION,
  EDGE_CURVE,
  EDGE_LOOP,
  FACE_BOUND,
  MANIFOLD_SOLID_BREP,
  ORIENTED_EDGE,
  PLANE,
  stepProduct,
  VERTEX_POINT,
} from "../step-encoding.js";
import { lineEdge, PLANE_THICKNESS, polygonFace, prismHoles, stepPrism } from "./step-prism.js";

const SMALLEST_RADIUS = 1e-4;
const GEOMETRY_EPSILON = 1e-12;

/** A point of the profile that's turned around the axis, its distance from the axis and height along it */
type ProfilePoint = { readonly r: number; readonly y: number };

/**
 * As the viewer draws it: holes go through an untapered whole cylinder along its axis; an open one has no ends, so it's a wall as thin as a plane; a
 * part of one is closed by flat walls from the axis
 */
export function stepCylinder(c: Cylinder, mat: Material, parentPos: Vec3, parentRot: Vec3, m: MutableStep): void {
  const { length: h, radius, radiusEnd = radius, open = false, angleStart = 0, angleLength = Math.PI * 2 } = c;
  if (h <= GEOMETRY_EPSILON) {
    return;
  }
  const pos = vec3TransRot(c.pos, parentPos, parentRot);
  const rot = vec3RotCombine(parentRot, c.rot ?? vec3Zero);
  const turn = (v: Vec3): Vec3 => vec3Rot(v, vec3Zero, rot);
  const name = radiusEnd === radius ? "Cylinder" : "Cone";
  const whole = isZero(Math.PI * 2 - Math.abs(angleLength)) || Math.abs(angleLength) > Math.PI * 2;

  // A hole at (x, y) is at (x, z) across the axis
  const holes = prismHoles(c.holes, (p: Vec2) => vec3TransRot(vec3(p.x, 0, p.y), pos, rot));
  if (radiusEnd === radius && whole && holes.length > 0) {
    const brep = stepPrism({ center: pos, radius }, holes, turn(vec3(0, 1, 0)), h, turn(vec3(1, 0, 0)), m);
    if (brep !== undefined) {
      stepProduct("solids", [brep], name, mat, m);
    }
    return;
  }

  const [bottom, top] = [Math.max(radius, SMALLEST_RADIUS), Math.max(radiusEnd, SMALLEST_RADIUS)];
  const wall = open && whole && Math.min(bottom, top) > PLANE_THICKNESS ? PLANE_THICKNESS : undefined;
  const profile: ReadonlyArray<ProfilePoint> = [
    { r: wall === undefined ? 0 : bottom - wall, y: -h / 2 },
    { r: bottom, y: -h / 2 },
    { r: top, y: h / 2 },
    { r: wall === undefined ? 0 : top - wall, y: h / 2 },
  ];
  const [start, angle] = angleLength < 0 ? [angleStart + angleLength, -angleLength] : [angleStart, angleLength];
  stepProduct("solids", [revolve(profile, pos, turn, start, whole ? undefined : angle, m)], name, mat, m);
}

/**
 * The solid the profile sweeps turning around the y axis from start by angle, all the way around if undefined, counterclockwise like three.js'
 * cylinders, at angle a at (sin a, cos a) in xz. The profile is counterclockwise with r along x and y up
 */
function revolve(
  profile: ReadonlyArray<ProfilePoint>,
  center: Vec3,
  turn: (v: Vec3) => Vec3,
  start: number,
  angle: number | undefined,
  m: MutableStep
): number {
  const axis = turn(vec3(0, 1, 0));
  const radial = (a: number): Vec3 => turn(vec3(Math.sin(a), 0, Math.cos(a)));
  const onAxis = (y: number): Vec3 => vec3Add(center, vec3Scale(axis, y));
  // Where the turn ends, the same points as where it starts if it goes all the way around, so its edges are the seams
  const end = angle === undefined ? start : start + angle;
  const at = (p: ProfilePoint, a: number): Vec3 => vec3Add(onAxis(p.y), vec3Scale(radial(a), p.r));
  const placement = (y: number, direction: Vec3): number =>
    AXIS2_PLACEMENT_3D(CARTESIAN_POINT(onAxis(y), m), DIRECTION(direction, m), DIRECTION(radial(start), m), m);

  // The arc each point off the axis sweeps, counterclockwise around the axis
  const arcs = profile.map((p) => {
    if (p.r === 0) {
      return undefined;
    }
    const [from, to] = [VERTEX_POINT(CARTESIAN_POINT(at(p, start), m), m), VERTEX_POINT(CARTESIAN_POINT(at(p, end), m), m)];
    return EDGE_CURVE(from, to, CIRCLE(placement(p.y, axis), p.r, m), m, "T");
  });

  // The face each edge of the profile sweeps, counterclockwise around its outward normal: along p's arc, out along the edge at the end, back along
  // q's arc and the edge at the start. All the way around, a flat face is bounded by its circles alone
  const swept = profile.flatMap((p, i) => {
    const j = (i + 1) % profile.length;
    const q = profile[j]!;
    const [arcP, arcQ] = [arcs[i], arcs[j]];
    if (arcP === undefined && arcQ === undefined) {
      return [];
    }
    const [arcForward, arcBack] = [arcP === undefined ? [] : [ORIENTED_EDGE(arcP, m, "T")], arcQ === undefined ? [] : [ORIENTED_EDGE(arcQ, m, "F")]];
    const loop = [...arcForward, lineEdge(at(p, end), at(q, end), m), ...arcBack, lineEdge(at(q, start), at(p, start), m)];
    const bound = (edges: ReadonlyArray<number>): number => FACE_BOUND(EDGE_LOOP(edges, m), "T", m);
    if (p.y === q.y) {
      const normal = vec3Scale(axis, q.r < p.r ? 1 : -1);
      const bounds = angle === undefined ? [arcForward, arcBack].filter((edges) => edges.length > 0).map(bound) : [bound(loop)];
      return [ADVANCED_FACE(bounds, PLANE(placement(p.y, normal), m), m, "T")];
    }
    // Cylinders' and cones' own normals point away from the axis, a cone's axis toward where it widens
    const [narrow, wide] = p.r <= q.r ? [p, q] : [q, p];
    const surface =
      p.r === q.r
        ? CYLINDRICAL_SURFACE(placement(p.y, axis), p.r, m)
        : CONICAL_SURFACE(
            placement(narrow.y, vec3Scale(axis, Math.sign(wide.y - narrow.y))),
            narrow.r,
            Math.atan2(wide.r - narrow.r, Math.abs(wide.y - narrow.y)),
            m
          );
    return [ADVANCED_FACE([bound(loop)], surface, m, q.y > p.y ? "T" : "F")];
  });

  // A part is closed by the profile at the start and end
  const ends =
    angle === undefined
      ? []
      : [
          polygonFace(
            profile.map((p) => at(p, start)),
            m
          ),
          polygonFace(profile.map((p) => at(p, end)).toReversed(), m),
        ];
  return MANIFOLD_SOLID_BREP(CLOSED_SHELL([...swept, ...ends], m), m);
}
