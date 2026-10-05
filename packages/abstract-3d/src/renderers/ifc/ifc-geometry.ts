import {
  BoxGeometry,
  type BufferGeometry,
  CatmullRomCurve3,
  ConeGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  PlaneGeometry,
  Shape,
  ShapeGeometry,
  SphereGeometry,
  TubeGeometry,
  Vector2,
  Vector3,
} from "three";
import { exhaustiveCheck } from "ts-exhaustive-check";
import type { Hole, Mesh, Vec2, Vec3 } from "../../abstract-3d.js";
import { vec3, vec3TransRot, vec3RotCombine, vec3Zero, isZero } from "../../abstract-3d.js";
import { addHoles, CircleCurve, CYLINDER_SEGMENTS, cylinderCutPositions, nonZeroHoles } from "../shared/three-geometry.js";
import { point } from "./ifc-encoding.js";

const CONE_SEGMENTS = 32;
const SPHERE_SEGMENTS = [24, 16] as const;
const TUBE_SEGMENTS = [32, 12] as const;

/** Indexed triangles, `points` are encoded IFC coordinates and `triangles` 1-based indices into them */
export type Triangulation = {
  readonly points: ReadonlyArray<string>;
  readonly triangles: ReadonlyArray<readonly [number, number, number]>;
};

/** Abstract 3D is Y-up like three.js, IFC is Z-up */
export const toIfc = (v: Vec3): Vec3 => vec3(v.x, -v.z, v.y);

/**
 * Triangulates the mesh in the coordinate system where its parent group is at parentPos/parentRot, undefined for geometries without a solid surface
 * (lines, text, images)
 */
export function triangulate(geometry: Mesh["geometry"], parentPos = vec3Zero, parentRot = vec3Zero): Triangulation | undefined {
  const local = localPositions(geometry);
  if (local === undefined || !("pos" in geometry)) {
    return undefined;
  }
  const pos = vec3TransRot(geometry.pos, parentPos, parentRot);
  const rot = vec3RotCombine(parentRot, "rot" in geometry ? (geometry.rot ?? vec3Zero) : vec3Zero);
  const indexByPoint = new Map<string, number>();
  const index = (i: number): number => {
    const key = point(toIfc(vec3TransRot(vec3(local[i]!, local[i + 1]!, local[i + 2]!), pos, rot)));
    const existing = indexByPoint.get(key);
    if (existing !== undefined) {
      return existing;
    }
    indexByPoint.set(key, indexByPoint.size + 1);
    return indexByPoint.size;
  };
  const triangles: Array<readonly [number, number, number]> = [];
  for (let i = 0; i + 8 < local.length; i += 9) {
    const [a, b, c] = [index(i), index(i + 3), index(i + 6)];
    if (a !== b && b !== c && c !== a) {
      triangles.push([a, b, c]);
    }
  }
  return triangles.length > 0 ? { points: Array.from(indexByPoint.keys()), triangles } : undefined;
}

/** Flat xyz positions of non-indexed triangles, relative to the geometry's own pos and rot, built the same way as in the react renderer */
function localPositions(g: Mesh["geometry"]): ReadonlyArray<number> | undefined {
  switch (g.type) {
    case "Box":
      return positions(
        nonZeroHoles(g.holes).length === 0 ? new BoxGeometry(g.size.x, g.size.y, g.size.z) : extrude(rectangle(g.size, g.holes), g.size.z)
      );
    case "Plane":
      return positions(nonZeroHoles(g.holes).length === 0 ? new PlaneGeometry(g.size.x, g.size.y) : new ShapeGeometry(rectangle(g.size, g.holes)));
    case "Cylinder": {
      const { radius, radiusEnd = radius, length, open, holes, angleStart = 0, angleLength = Math.PI * 2 } = g;
      const isWhole = isZero(Math.PI * 2 - angleLength);
      // Holes are extruded along the length, which can't taper
      if (isWhole && radiusEnd === radius && nonZeroHoles(holes).length > 0) {
        const circle = new Shape().moveTo(0, radius).absellipse(0, 0, radius, radius, 0, Math.PI * 2, true);
        addHoles(holes, circle);
        return positions(new ExtrudeGeometry(circle, { depth: length, bevelEnabled: false }).rotateX(Math.PI / 2).translate(0, length / 2, 0));
      }
      if (isWhole) {
        return positions(new CylinderGeometry(radiusEnd, radius, length, CYLINDER_SEGMENTS, 1, open ?? false));
      }
      return [
        ...positions(new CylinderGeometry(radiusEnd, radius, length, CYLINDER_SEGMENTS, 1, false, angleStart, angleLength)),
        ...cylinderCutPositions(radiusEnd, radius, length, angleStart, angleLength),
      ];
    }
    case "Cone":
      return positions(new ConeGeometry(g.radius, g.length, CONE_SEGMENTS, 1));
    case "Sphere":
      return positions(new SphereGeometry(g.radius, ...SPHERE_SEGMENTS));
    case "Shape": {
      const shape = polygonShape(g.points, g.holes);
      return positions(g.thickness > 0 ? extrude(shape, g.thickness) : new ShapeGeometry(shape));
    }
    case "Polygon": {
      // A quad is two triangles, otherwise every three points is a triangle
      const [v0, v1, v2, v3] = g.points;
      const points = g.points.length === 4 ? [v0!, v1!, v2!, v2!, v3!, v0!] : g.points.slice(0, g.points.length - (g.points.length % 3));
      return points.flatMap((p) => [p.x, p.y, p.z]);
    }
    case "Tube": {
      const curve =
        g.curve.type === "SplineCurve" ? new CatmullRomCurve3(g.curve.points.map((p) => new Vector3(p.x, p.y, p.z))) : new CircleCurve(g.curve);
      return positions(new TubeGeometry(curve, TUBE_SEGMENTS[0], g.radius, TUBE_SEGMENTS[1], false));
    }
    case "Line":
    case "CulledLine":
    case "Text":
    case "Image":
      return undefined;
    default:
      return exhaustiveCheck(g);
  }
}

function positions(geometry: BufferGeometry): ReadonlyArray<number> {
  const position = geometry.getAttribute("position");
  const index = geometry.getIndex();
  const vertex = (i: number): ReadonlyArray<number> => [position.getX(i), position.getY(i), position.getZ(i)];
  return Array.from({ length: index?.count ?? position.count }, (_, i) => vertex(index?.getX(i) ?? i)).flat();
}

/** Extruded along z, centered around z = 0 like Box and Shape */
const extrude = (shape: Shape, depth: number): BufferGeometry =>
  new ExtrudeGeometry(shape, { depth, bevelEnabled: false }).translate(0, 0, -depth / 2);

function rectangle(size: Vec2, holes: ReadonlyArray<Hole> | undefined): Shape {
  const [x, y] = [size.x / 2, size.y / 2];
  return polygonShape(
    [
      { x: -x, y: -y },
      { x: -x, y },
      { x, y },
      { x, y: -y },
    ],
    holes
  );
}

function polygonShape(points: ReadonlyArray<Vec2>, holes: ReadonlyArray<Hole> | undefined): Shape {
  const shape = new Shape(points.map((p) => new Vector2(p.x, p.y)));
  addHoles(holes, shape);
  return shape;
}
