import {
  BoxGeometry,
  BufferGeometry,
  CatmullRomCurve3,
  ConeGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Float32BufferAttribute,
  type Matrix4,
  PlaneGeometry,
  Shape,
  SphereGeometry,
  TubeGeometry,
  Vector2,
  Vector3,
} from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import type { Hole, Mesh } from "../../../abstract-3d.js";
import { isZero, vec3, vec3Zero } from "../../../abstract-3d.js";
import { addHoles, CircleCurve, CYLINDER_SEGMENTS, cylinderCutPositions, holeIsZero } from "../../shared/three-geometry.js";
import { transform } from "../compile/compile.js";

/**
 * Solid geometries by key, so identical shapes share one geometry; primitives are unit geometries scaled by their local matrix. The shapes, holes and
 * radius-ratio cylinders are the r3f renderer's react-mesh.tsx
 */

export type SolidShape = {
  readonly key: string;
  /** Position, rotation and, for unit geometries, scale, relative to the item's matrix */
  readonly local: Matrix4;
};

/**
 * The shape of a solid geometry, undefined for text and lines; images are unit planes. Shapes with their own geometry are keyed by JSON of what
 * identifies them: cheap next to the geometry creation that sharing skips (measured: unique keys built systemair3 2–4 times slower)
 */
export function getSolidShape(g: Mesh["geometry"]): SolidShape | undefined {
  switch (g.type) {
    case "Box":
    case "Plane": {
      const size = g.type === "Box" ? g.size : vec3(g.size.x, g.size.y, 1);
      return g.holes?.some((h) => !holeIsZero(h))
        ? { key: JSON.stringify([g.type, g.size, g.holes]), local: transform(g.pos, g.rot) }
        : { key: g.type === "Box" && g.radius ? `Box ${g.radius}` : g.type, local: transform(g.pos, g.rot, undefined, size) };
    }
    case "Image":
      return { key: "Plane", local: transform(g.pos, g.rot, undefined, vec3(g.size.x, g.size.y, 1)) };
    case "Sphere":
      return { key: g.type, local: transform(g.pos, vec3Zero, undefined, vec3(g.radius, g.radius, g.radius)) };
    case "Cone":
      return { key: g.type, local: transform(g.pos, g.rot, undefined, vec3(g.radius, g.length, g.radius)) };
    case "Cylinder": {
      const { radius, radiusEnd = radius, open = false, angleStart = 0, angleLength = Math.PI * 2 } = g;
      if (radiusEnd === radius && isZero(Math.PI * 2 - angleLength) && g.holes?.some((h) => !holeIsZero(h))) {
        return { key: JSON.stringify([g.type, radius, g.length, g.holes]), local: transform(g.pos, g.rot) };
      }
      // Unit geometry scaled by the largest radius, so only the radius ratio needs its own geometry
      const max = Math.max(radius, radiusEnd) || 1;
      return {
        key: `${g.type} ${radiusEnd / max} ${radius / max} ${open} ${angleStart} ${angleLength}`,
        local: transform(g.pos, g.rot, undefined, vec3(max, g.length, max)),
      };
    }
    case "Shape":
      return { key: JSON.stringify([g.type, g.points, g.thickness, g.holes]), local: transform(g.pos, g.rot) };
    case "Polygon":
      return { key: JSON.stringify([g.type, g.points]), local: transform(g.pos, g.rot) };
    case "Tube":
      return { key: JSON.stringify([g.type, g.curve, g.radius]), local: transform(g.pos, g.rot) };
    default:
      return undefined;
  }
}

/** The geometry of a solid shape, indexed, with exactly position, normal and uv attributes and no groups, as a BatchedMesh needs */
export function createSolidGeometry(g: Mesh["geometry"]): BufferGeometry {
  const geometry = createGeometry(g);
  const count = geometry.getAttribute("position").count;
  if (!geometry.index) {
    geometry.setIndex(Array.from({ length: count }, (_, i) => i));
  }
  if (!geometry.hasAttribute("normal")) {
    geometry.computeVertexNormals();
  }
  if (!geometry.hasAttribute("uv")) {
    geometry.setAttribute("uv", new Float32BufferAttribute(new Float32Array(count * 2), 2));
  }
  // The radius a unit box's edges are shaded as rounded by, 0 for sharp; every geometry has it, as a batch's geometries share their attributes
  const radius = geometry instanceof BoxGeometry && g.type === "Box" ? (g.radius ?? 0) : 0;
  geometry.setAttribute("bevel", new Float32BufferAttribute(new Float32Array(count).fill(radius), 1));
  Object.keys(geometry.attributes).forEach((name) => {
    if (name !== "position" && name !== "normal" && name !== "uv" && name !== "bevel") {
      geometry.deleteAttribute(name);
    }
  });
  geometry.clearGroups();
  return geometry;
}

function createGeometry(g: Mesh["geometry"]): BufferGeometry {
  switch (g.type) {
    case "Box":
    case "Plane": {
      if (!g.holes?.some((h) => !holeIsZero(h))) {
        return g.type === "Box" ? new BoxGeometry() : new PlaneGeometry();
      }
      const [x, y] = [g.size.x / 2, g.size.y / 2];
      return extrude(
        new Shape([new Vector2(-x, -y), new Vector2(-x, y), new Vector2(x, y), new Vector2(x, -y)]),
        g.holes,
        g.type === "Box" ? g.size.z : 0
      );
    }
    case "Image":
      return new PlaneGeometry();
    case "Sphere":
      return new SphereGeometry(1, 12, 12);
    case "Cone":
      return new ConeGeometry(1, 1, 16, 1);
    case "Cylinder": {
      const { radius, radiusEnd = radius, open = false, angleStart = 0, angleLength = Math.PI * 2 } = g;
      const whole = isZero(Math.PI * 2 - angleLength);
      if (radiusEnd === radius && whole && g.holes?.some((h) => !holeIsZero(h))) {
        return extrude(new Shape().moveTo(0, radius).absellipse(0, 0, radius, radius, 0, Math.PI * 2, true), g.holes, g.length).rotateX(Math.PI / 2);
      }
      const max = Math.max(radius, radiusEnd) || 1;
      const [top, bottom] = [radiusEnd / max, radius / max];
      const mantle = new CylinderGeometry(top, bottom, 1, CYLINDER_SEGMENTS, 1, open && whole, angleStart, angleLength);
      if (whole) {
        return mantle;
      }
      // The walls closing the cut, merged with the mantle, both unindexed
      const positions = cylinderCutPositions(top, bottom, 1, angleStart, angleLength);
      const walls = new BufferGeometry().setAttribute("position", new Float32BufferAttribute(positions, 3));
      walls.setAttribute("uv", new Float32BufferAttribute(new Float32Array((positions.length / 3) * 2), 2));
      walls.computeVertexNormals();
      return mergeGeometries([mantle.toNonIndexed(), walls]);
    }
    case "Shape":
      return extrude(new Shape(g.points.map((p) => new Vector2(p.x, p.y))), g.holes, g.thickness);
    case "Polygon": {
      // A quad for 4 points, else a list of triangles, as the points are given
      const geometry = new BufferGeometry().setAttribute(
        "position",
        new Float32BufferAttribute(
          g.points.flatMap((p) => [p.x, p.y, p.z]),
          3
        )
      );
      geometry.setIndex(g.points.length === 4 ? [0, 1, 2, 2, 3, 0] : Array.from({ length: Math.floor(g.points.length / 3) * 3 }, (_, i) => i));
      geometry.computeVertexNormals();
      return geometry;
    }
    case "Tube":
      return new TubeGeometry(
        g.curve.type === "SplineCurve" ? new CatmullRomCurve3(g.curve.points.map((p) => new Vector3(p.x, p.y, p.z))) : new CircleCurve(g.curve),
        9,
        g.radius,
        9,
        false
      );
    default:
      return new BufferGeometry();
  }
}

/** Extruded along z and centered on it */
function extrude(shape: Shape, holes: ReadonlyArray<Hole> | undefined, depth: number): BufferGeometry {
  addHoles(holes, shape);
  return new ExtrudeGeometry(shape, { depth, bevelEnabled: false }).translate(0, 0, -depth / 2);
}

/** Disposes the cached geometries whose keys aren't in `keys` */
export function keepGeometries(cache: Map<string, BufferGeometry>, keys: ReadonlySet<string>): void {
  cache.forEach((geometry, key) => {
    if (!keys.has(key)) {
      geometry.dispose();
      cache.delete(key);
    }
  });
}
