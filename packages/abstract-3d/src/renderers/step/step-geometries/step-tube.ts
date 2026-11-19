import type { Material, Tube, Vec3 } from "../../../abstract-3d.js";
import { vec3Add, vec3Cross, vec3Dot, vec3RotCombine, vec3Scale, vec3Sub, vec3TransRot, vec3Zero } from "../../../abstract-3d.js";
import { type Arc, catmullRom, tubeArc, tubeRings, tubeSplinePoints } from "../../shared/tube-path.js";
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

const SPLINE_RADIAL_SEGMENTS = 12;

/**
 * Along an arc, a circle or a spline through points on one, it's a torus, closed by flat ends unless it goes all the way around; along any other
 * spline it's faceted
 */
export function stepTube(t: Tube, mat: Material, parentPos: Vec3, parentRot: Vec3, m: MutableStep): void {
  if (t.radius <= 0) {
    return;
  }
  const pos = vec3TransRot(t.pos, parentPos, parentRot);
  const rot = vec3RotCombine(parentRot, t.rot ?? vec3Zero);
  const arc = tubeArc(t, pos, rot);
  const brep = arc !== undefined ? torus(arc, t.radius, m) : spline(tubeSplinePoints(t, pos, rot), t.radius, m);
  if (brep !== undefined) {
    stepProduct("solids", [brep], "Tube", mat, m);
  }
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
  const centers = path.points;
  if (centers.length < 2) {
    return undefined;
  }
  const rings = tubeRings(path, radius, SPLINE_RADIAL_SEGMENTS);
  const sides = rings.slice(1).flatMap((b, i) => {
    const a = rings[i]!;
    const inside = vec3Scale(vec3Add(centers[i]!, centers[i + 1]!), 0.5);
    return a.flatMap((_, j) => {
      const k = (j + 1) % a.length;
      return [outward([a[j]!, b[j]!, b[k]!], inside), outward([a[j]!, b[k]!, a[k]!], inside)];
    });
  });
  const ends = [outward(rings[0]!, centers[1]!), outward(rings.at(-1)!, centers.at(-2)!)];
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
