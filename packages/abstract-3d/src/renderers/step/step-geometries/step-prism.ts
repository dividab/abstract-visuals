import type { Hole, Vec2, Vec3 } from "../../../abstract-3d.js";
import {
  vec2,
  vec3,
  vec3Add,
  vec3Cross,
  vec3Dot,
  vec3Length,
  vec3Normalize,
  vec3Rot,
  vec3Scale,
  vec3Sub,
  vec3TransRot,
  vec3Zero,
  equals,
} from "../../../abstract-3d.js";
import type { MutableStep } from "../step-encoding.js";
import {
  STEP_NUMBER_EPSILON,
  ADVANCED_FACE,
  AXIS2_PLACEMENT_3D,
  CARTESIAN_POINT,
  CIRCLE,
  CLOSED_SHELL,
  CYLINDRICAL_SURFACE,
  DIRECTION,
  EDGE_CURVE,
  EDGE_LOOP,
  FACE_BOUND,
  LINE,
  MANIFOLD_SOLID_BREP,
  ORIENTED_EDGE,
  PLANE,
  VECTOR,
  VERTEX_POINT,
} from "../step-encoding.js";

/**
 * A plane's thickness, as STEP has no solids without one; thick enough that viewers tell its sides apart, else e.g. eDrawings' selection color
 * z-fights with the other side's color
 */
export const PLANE_THICKNESS = 0.1;

const GEOMETRY_EPSILON = 1e-9;

/** A prism's outline or a hole through it, a loop of points or a circle around the prism's normal */
export type PrismLoop = ReadonlyArray<Vec3> | { readonly center: Vec3; readonly radius: number };

/** Newell's normal, its length is twice the area, and the loop is counterclockwise around it */
export const newell = (loop: ReadonlyArray<Vec3>): Vec3 =>
  loop.reduce((n, a, i) => {
    const b = loop[(i + 1) % loop.length]!;
    return vec3(n.x + (a.y - b.y) * (a.z + b.z), n.y + (a.z - b.z) * (a.x + b.x), n.z + (a.x - b.x) * (a.y + b.y));
  }, vec3Zero);

/** A straight edge from a to b. It's one entity whichever way it's walked, so the two faces sharing it use it in opposite senses */
export function lineEdge(a: Vec3, b: Vec3, m: MutableStep): number {
  const [pa, pb] = [CARTESIAN_POINT(a, m), CARTESIAN_POINT(b, m)];
  const forward = pa < pb;
  const [start, end, pStart, pEnd] = forward ? [a, b, pa, pb] : [b, a, pb, pa];
  const line = LINE(pStart, VECTOR(DIRECTION(vec3Normalize(vec3Sub(end, start)), m), m), m);
  return ORIENTED_EDGE(EDGE_CURVE(VERTEX_POINT(pStart, m), VERTEX_POINT(pEnd, m), line, m, "T"), m, forward ? "T" : "F");
}

const lineEdges = (loop: ReadonlyArray<Vec3>, m: MutableStep): ReadonlyArray<number> =>
  loop.map((a, i) => lineEdge(a, loop[(i + 1) % loop.length]!, m));

/** A face in the plane through origin, bounded by loops of oriented edges, each counterclockwise around the normal if outer, else clockwise */
const planarFace = (origin: Vec3, normal: Vec3, ref: Vec3, loops: ReadonlyArray<ReadonlyArray<number>>, m: MutableStep): number =>
  ADVANCED_FACE(
    loops.map((edges) => FACE_BOUND(EDGE_LOOP(edges, m), "T", m)),
    PLANE(AXIS2_PLACEMENT_3D(CARTESIAN_POINT(origin, m), DIRECTION(normal, m), DIRECTION(ref, m), m), m),
    m,
    "T"
  );

/** A planar face of the loop, counterclockwise around its outward normal */
export const polygonFace = (loop: ReadonlyArray<Vec3>, m: MutableStep): number =>
  planarFace(loop[0]!, vec3Normalize(newell(loop)), vec3Normalize(vec3Sub(loop[1]!, loop[0]!)), [lineEdges(loop, m)], m);

/**
 * A solid of the outline, minus the holes, thickness thick along the unit normal and centered on the outline's plane; ref is a unit direction in the
 * plane, where circles start. Undefined if the outline has no area
 */
export function stepPrism(
  outline: PrismLoop,
  holes: ReadonlyArray<PrismLoop>,
  normal: Vec3,
  thickness: number,
  ref: Vec3,
  m: MutableStep
): number | undefined {
  const usable = (loop: PrismLoop): PrismLoop | undefined => {
    const simple = "radius" in loop ? loop : simplify(loop);
    return ("radius" in simple ? simple.radius > 0 : simple.length >= 3 && vec3Length(newell(simple)) > GEOMETRY_EPSILON) ? simple : undefined;
  };
  const outer = usable(outline);
  if (outer === undefined) {
    return undefined;
  }
  const shift = (p: Vec3, side: number): Vec3 => vec3Add(p, vec3Scale(normal, (side * thickness) / 2));

  // Each loop's edges on the top and bottom, the outline's counterclockwise around their face's normal, the holes' clockwise, and its walls between
  const loops = [outer, ...holes.map(usable)].filter((loop) => loop !== undefined);
  const bounds = loops.map((loop, k) => {
    const isOuter = k === 0;
    if ("radius" in loop) {
      // A circle and its start point on the top and bottom, the wall between them closed by a seam from the bottom's start to the top's
      const rim = (side: number): { readonly start: Vec3; readonly edge: number } => {
        const center = shift(loop.center, side);
        const start = vec3Add(center, vec3Scale(ref, loop.radius));
        const vertex = VERTEX_POINT(CARTESIAN_POINT(start, m), m);
        const circle = CIRCLE(AXIS2_PLACEMENT_3D(CARTESIAN_POINT(center, m), DIRECTION(normal, m), DIRECTION(ref, m), m), loop.radius, m);
        return { start, edge: EDGE_CURVE(vertex, vertex, circle, m, "T") };
      };
      const [t, b] = [rim(1), rim(-1)];
      // The circles run counterclockwise around the normal; the wall walks each the other way from the top or bottom
      const [topSense, bottomSense] = isOuter ? (["T", "F"] as const) : (["F", "T"] as const);
      const wallLoop = [
        ORIENTED_EDGE(b.edge, m, topSense),
        lineEdge(b.start, t.start, m),
        ORIENTED_EDGE(t.edge, m, bottomSense),
        lineEdge(t.start, b.start, m),
      ];
      const surface = CYLINDRICAL_SURFACE(
        AXIS2_PLACEMENT_3D(CARTESIAN_POINT(shift(loop.center, -1), m), DIRECTION(normal, m), DIRECTION(ref, m), m),
        loop.radius,
        m
      );
      return {
        origin: loop.center,
        top: [ORIENTED_EDGE(t.edge, m, topSense)],
        bottom: [ORIENTED_EDGE(b.edge, m, bottomSense)],
        walls: [ADVANCED_FACE([FACE_BOUND(EDGE_LOOP(wallLoop, m), "T", m)], surface, m, isOuter ? "T" : "F")],
      };
    }
    const facing = vec3Dot(newell(loop), normal) * (isOuter ? 1 : -1) > 0 ? loop : loop.toReversed();
    const [tops, bottoms] = [facing.map((p) => shift(p, 1)), facing.map((p) => shift(p, -1))];
    return {
      origin: facing[0]!,
      top: lineEdges(tops, m),
      bottom: lineEdges(bottoms.toReversed(), m),
      walls: facing.map((_, i) => {
        const j = (i + 1) % facing.length;
        return polygonFace([bottoms[i]!, bottoms[j]!, tops[j]!, tops[i]!], m);
      }),
    };
  });

  const origin = bounds[0]!.origin;
  const top = planarFace(
    shift(origin, 1),
    normal,
    ref,
    bounds.map((b) => b.top),
    m
  );
  const bottom = planarFace(
    shift(origin, -1),
    vec3Scale(normal, -1),
    ref,
    bounds.map((b) => b.bottom),
    m
  );
  return MANIFOLD_SOLID_BREP(CLOSED_SHELL([top, bottom, ...bounds.flatMap((b) => b.walls)], m), m);
}

/**
 * The loop without repeated points, e.g. the first again at the end, or points on a straight line between their neighbors, which make faces without
 * area
 */
function simplify(loop: ReadonlyArray<Vec3>): ReadonlyArray<Vec3> {
  const distinct = loop.filter((p, i) => vec3Length(vec3Sub(p, loop.at(i - 1)!)) > STEP_NUMBER_EPSILON);
  return distinct.filter((b, i) => {
    const [ab, bc] = [vec3Sub(b, distinct.at(i - 1)!), vec3Sub(distinct[(i + 1) % distinct.length]!, b)];
    return vec3Length(vec3Cross(ab, bc)) > GEOMETRY_EPSILON * vec3Length(ab) * vec3Length(bc);
  });
}

/** The prism of a 2d outline and holes in the xy plane at pos and rot, thickness thick along z and centered on it, as Box, Plane and Shape are */
export function stepExtrusion(
  outline: ReadonlyArray<Vec2>,
  holes: ReadonlyArray<Hole> | undefined,
  thickness: number,
  pos: Vec3,
  rot: Vec3,
  m: MutableStep
): number | undefined {
  const at = (p: Vec2): Vec3 => vec3TransRot(vec3(p.x, p.y, 0), pos, rot);
  return stepPrism(
    outline.map(at),
    prismHoles(holes, at),
    vec3Rot(vec3(0, 0, 1), vec3Zero, rot),
    thickness,
    vec3Rot(vec3(1, 0, 0), vec3Zero, rot),
    m
  );
}

/** The holes without size left out, placed by at */
export const prismHoles = (holes: ReadonlyArray<Hole> | undefined, at: (p: Vec2) => Vec3): ReadonlyArray<PrismLoop> =>
  (holes ?? []).flatMap((h): ReadonlyArray<PrismLoop> => {
    if (h.type === "RoundHole") {
      return equals(h.radius, 0) ? [] : [{ center: at(h.pos), radius: h.radius }];
    }
    return equals(h.size.x, 0) || equals(h.size.y, 0) ? [] : [rectangle(h.size, h.pos).map(at)];
  });

export const rectangle = (size: Vec2, center: Vec2 = vec2(0, 0)): ReadonlyArray<Vec2> => {
  const [x, y] = [size.x / 2, size.y / 2];
  return [vec2(center.x - x, center.y - y), vec2(center.x + x, center.y - y), vec2(center.x + x, center.y + y), vec2(center.x - x, center.y + y)];
};
