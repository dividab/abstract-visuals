import { Vector3 } from "three/src/math/Vector3.js";
import { Matrix4 } from "three/src/math/Matrix4.js";
import { Euler } from "three/src/math/Euler.js";
import { Quaternion } from "three/src/math/Quaternion.js";

export type Scene = {
  readonly size_deprecated: Vec3; // Move size calculation to every renderer??
  readonly groups: ReadonlyArray<Group>;
  readonly data?: Record<string, string>;
  // should be removed
  readonly center_deprecated?: Vec3;
  readonly rotation_deprecated?: Vec3;
  // might be removed
  readonly dimensions_deprecated?: Dimensions;
  readonly hotSpots_deprecated?: ReadonlyArray<HotSpot>;
};

export type Renderer = "react" | "ai_schematic" | "ai_detailed" | "dxf";

export type Dimensions = {
  readonly dimensions: ReadonlyArray<Dimension>;
  readonly material: Material;
  readonly bounds: DimensionBounds;
};

export type Dimension = {
  readonly views: ReadonlyArray<View>;
  readonly pos: Vec3;
  readonly rot: Vec3;
  readonly meshes: ReadonlyArray<Mesh>;
};

export type DimensionBounds = {
  readonly front: Bounds2;
  readonly back: Bounds2;
  readonly left: Bounds2;
  readonly right: Bounds2;
  readonly top: Bounds2;
  readonly bottom: Bounds2;
  readonly threeD: Bounds3;
};

export type HotSpot = {
  readonly id: string;
  readonly mesh: Mesh;
};

export type Group = {
  readonly pos: Vec3;
  readonly rot?: Vec3;
  readonly groups?: ReadonlyArray<Group>;
  readonly meshes?: ReadonlyArray<Mesh>;
  readonly data?: Record<string, string>;
  readonly animation?: Animation;
};

export type Mesh = {
  readonly material: Material;
  readonly geometry: Cylinder | Cone | Box | Line | Text | Polygon | Plane | Tube | Sphere | Shape;
};

export type Material = {
  readonly normal: string;
  readonly opacity?: number;
  readonly metalness?: number;
  readonly roughness?: number;
  readonly imageUrl?: string;
};

export type Cylinder = {
  readonly type: "Cylinder";
  readonly pos: Vec3;
  readonly rot?: Vec3;
  readonly length: number;
  readonly radius: number;
  readonly holes?: ReadonlyArray<Hole>;
  readonly open?: boolean;
  readonly angleStart?: number;
  readonly angleLength?: number;
};

export type Sphere = {
  readonly type: "Sphere";
  readonly pos: Vec3;
  readonly radius: number;
};

export type Cone = {
  readonly type: "Cone";
  readonly pos: Vec3;
  readonly rot?: Vec3;
  readonly length: number;
  readonly radius: number;
};

export type Line = {
  readonly type: "Line";
  readonly start: Vec3;
  readonly end: Vec3;
  readonly thickness: number;
};

export type Tube = {
  readonly type: "Tube";
  readonly pos: Vec3;
  readonly rot?: Vec3;
  readonly radius: number;
  readonly curve: Curve;
};

export type Curve = CircleCurve | SplineCurve;

export type CircleCurve = {
  readonly type: "CircleCurve";
  readonly radius: number;
  readonly angleStart: number;
  readonly angleLength: number;
};

export type SplineCurve = { readonly type: "SplineCurve"; readonly points: ReadonlyArray<Vec3> };

export type Polygon = {
  readonly type: "Polygon";
  readonly points: ReadonlyArray<Vec3>;
  readonly pos: Vec3;
  readonly rot?: Vec3;
};

export type Shape = {
  readonly type: "Shape";
  readonly points: ReadonlyArray<Vec2>;
  readonly pos: Vec3;
  readonly rot?: Vec3;
  readonly holes?: ReadonlyArray<Hole>;
  readonly thickness: number;
};

export type Plane = {
  readonly type: "Plane";
  readonly pos: Vec3;
  readonly rot?: Vec3;
  readonly size: Vec2;
  readonly holes?: ReadonlyArray<Hole>;
};

export type Text = {
  readonly type: "Text";
  readonly pos: Vec3;
  readonly rot?: Vec3;
  readonly text: string;
  readonly fontSize: number;
};

export type Box = {
  readonly type: "Box";
  readonly pos: Vec3;
  readonly rot?: Vec3;
  readonly size: Vec3;
  readonly holes?: ReadonlyArray<Hole>;
};

export type Hole = RoundHole | SquareHole;

export type RoundHole = {
  readonly type: "RoundHole";
  readonly pos: Vec2;
  readonly radius: number;
};

export type SquareHole = {
  readonly type: "SquareHole";
  readonly pos: Vec2;
  readonly size: Vec2;
};

export type Animation = {
  readonly transform: Transform;
  readonly duration: number;
};

export type Transform = {
  readonly rot: Vec3;
  readonly trans: Vec3;
};

export type Bounds = {
  readonly min: number;
  readonly max: number;
};

export type Bounds2 = {
  readonly min: Vec2;
  readonly max: Vec2;
};

export type Bounds3 = {
  readonly min: Vec3;
  readonly max: Vec3;
};

export type Vec2 = {
  readonly x: number;
  readonly y: number;
};

export type Vec3 = {
  readonly x: number;
  readonly y: number;
  readonly z: number;
};

export const views = ["front", "back", "top", "bottom", "left", "right"] as const;
export type View = (typeof views)[number];

export type PlaneMesh = { readonly geometry: Plane; readonly material: Material };
export type BoxMesh = { readonly geometry: Box; readonly material: Material };
export type CylinderMesh = { readonly geometry: Cylinder; readonly material: Material };
export type ConeMesh = { readonly geometry: Cone; readonly material: Material };
export type LineMesh = { readonly geometry: Line; readonly material: Material };
export type TextMesh = { readonly geometry: Text; readonly material: Material };
export type PolygonMesh = { readonly geometry: Polygon; readonly material: Material };
export type TubeMesh = { readonly geometry: Tube; readonly material: Material };
export type SphereMesh = { readonly geometry: Sphere; readonly material: Material };
export type ShapeMesh = { readonly geometry: Shape; readonly material: Material };

export const vec3 = (x: number, y: number, z: number): Vec3 => ({ x, y, z });
export const vec2 = (x: number, y: number): Vec2 => ({ x, y });

export const vec3Zero = vec3(0, 0, 0);
export const vec3PosX = vec3(1, 0, 0);
export const vec3NegX = vec3(-1, 0, 0);
export const vec3PosY = vec3(0, 1, 0);
export const vec3NegY = vec3(0, -1, 0);
export const vec3PosZ = vec3(0, 0, 1);
export const vec3NegZ = vec3(0, 0, -1);

export const vec2Zero = vec2(0, 0);

export const vec2Flip = (v: Vec2): Vec2 => vec2(-v.x, -v.y);
export const vec3Flip = (v: Vec3): Vec3 => vec3(-v.x, -v.y, -v.z);

export const vec2Scale = (v: Vec2, s: number): Vec2 => vec2(v.x * s, v.y * s);
export const vec3Scale = (v: Vec3, s: number): Vec3 => vec3(v.x * s, v.y * s, v.z * s);

export const vec2Add = (a: Vec2, b: Vec2): Vec2 => vec2(a.x + b.x, a.y + b.y);
export const vec3Add = (a: Vec3, b: Vec3): Vec3 => vec3(a.x + b.x, a.y + b.y, a.z + b.z);

export const vec2Sub = (a: Vec2, b: Vec2): Vec2 => vec2(a.x - b.x, a.y - b.y);
export const vec3Sub = (a: Vec3, b: Vec3): Vec3 => vec3(a.x - b.x, a.y - b.y, a.z - b.z);

export const vec2Dot = (a: Vec2, b: Vec2): number => a.x * b.x + a.y * b.y;
export const vec3Dot = (a: Vec3, b: Vec3): number => a.x * b.x + a.y * b.y + a.z * b.z;

export const vec2Length = (v: Vec2): number => Math.sqrt(v.x * v.x + v.y * v.y);
export const vec3Length = (v: Vec3): number => Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);

export const vec2Normalize = (v: Vec2): Vec2 => vec2Scale(v, 1 / vec2Length(v));
export const vec3Normalize = (v: Vec3): Vec3 => vec3Scale(v, 1 / vec3Length(v));

export const vec2Greater = (a: Vec2, b: Vec2): Vec2 => vec2(a.x > b.x ? a.x : b.x, a.y > b.y ? a.y : b.y);

export const vec2DistSquared = (a: Vec2, b: Vec2): number => Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2);

export const vec2Dist = (a: Vec2, b: Vec2): number => vec2DistSquared(a, b);

export const vec2Mult = (a: Vec2, b: Vec2): Vec2 => vec2(a.x * b.x, a.y * b.y);
export const vec3Mult = (a: Vec3, b: Vec3): Vec3 => vec3(a.x * b.x, a.y * b.y, a.z * b.z);

export const vec2Dupl = (num: number): Vec2 => vec2(num, num);
export const vec3Dupl = (num: number): Vec3 => vec3(num, num, num);

export const vec2Equals = (a: Vec2, b: Vec2): boolean => equals(a.x, b.x) && equals(a.y, b.y);
export const vec3Equals = (a: Vec3, b: Vec3): boolean => equals(a.x, b.x) && equals(a.y, b.y) && equals(a.z, b.z);

export const vec3XMean = (...v: ReadonlyArray<Vec3>): number => v.reduce((a, c) => a + c.x, 0) / v.length;
export const vec3YMean = (...v: ReadonlyArray<Vec3>): number => v.reduce((a, c) => a + c.y, 0) / v.length;
export const vec3ZMean = (...v: ReadonlyArray<Vec3>): number => v.reduce((a, c) => a + c.z, 0) / v.length;

export const vec3Greater = (a: Vec3, b: Vec3): Vec3 =>
  vec3(a.x > b.x ? a.x : b.x, a.y > b.y ? a.y : b.y, a.z > b.z ? a.z : b.z);

export const vec3DistSquared = (a: Vec3, b: Vec3): number =>
  Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2) + Math.pow(b.z - a.z, 2);

export const vec3Dist = (a: Vec3, b: Vec3): number => vec3DistSquared(a, b);

export const vec3Cross = (a: Vec3, b: Vec3): Vec3 =>
  vec3(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x);

export const equals = (num1: number, num2: number, equality = Number.EPSILON): boolean =>
  Math.abs(num1 - num2) <= equality;
export const isZero = (num: number, equality = Number.EPSILON): boolean => Math.abs(num) <= equality;
export const geq = (num1: number, num2: number, equality = Number.EPSILON): boolean => num1 >= num2 - equality;
export const greater = (num1: number, num2: number, equality = Number.EPSILON): boolean => num1 > num2 + equality;
export const leq = (num1: number, num2: number, equality = Number.EPSILON): boolean => num1 <= num2 + equality;
export const less = (num1: number, num2: number, equality = Number.EPSILON): boolean => num1 < num2 - equality;

// -- Bounds

export const bounds = (min: number, max: number): Bounds => ({ min, max });
export const bounds2 = (min: Vec2, max: Vec2): Bounds2 => ({ min, max });
export const bounds3 = (min: Vec3, max: Vec3): Bounds3 => ({ min, max });

export const boundsZero: Bounds = bounds(0, 0);
export const bounds2Zero: Bounds2 = bounds2(vec2Zero, vec2Zero);
export const bounds3Zero: Bounds3 = bounds3(vec3Zero, vec3Zero);

export const bounds3ToSize = (bounds: Bounds3): Vec3 =>
  vec3(bounds.max.x - bounds.min.x, bounds.max.y - bounds.min.y, bounds.max.z - bounds.min.z);

export const bounds3Overlap = (a: Bounds3, b: Bounds3, equality = Number.EPSILON): boolean =>
  !(
    leq(a.max.x, b.min.x, equality) ||
    geq(a.min.x, b.max.x, equality) ||
    leq(a.max.y, b.min.y, equality) ||
    geq(a.min.y, b.max.y, equality) ||
    leq(a.max.z, b.min.z, equality) ||
    geq(a.min.z, b.max.z, equality)
  );

export const boundsOverlap = (a: Bounds, b: Bounds): boolean =>
  (greater(a.max, b.min) && less(a.min, b.max)) || (greater(b.max, a.min) && less(b.min, a.max));

export const bounds2OverlapY = (a: Bounds2, b: Bounds2): boolean =>
  (greater(a.max.y, b.min.y) && less(a.min.y, b.max.y)) || (greater(b.max.y, a.min.y) && less(b.min.y, a.max.y));

export const boundsXOverlapX = (a: Bounds2, b: Bounds2): boolean =>
  (greater(a.max.x, b.min.x) && less(a.min.x, b.max.x)) || (greater(b.max.x, a.min.x) && less(b.min.x, a.max.x));

export const bounds3Center = (bounds: Bounds3): Vec3 =>
  vec3((bounds.min.x + bounds.max.x) / 2, (bounds.min.y + bounds.max.y) / 2, (bounds.min.z + bounds.max.z) / 2);

export function bounds2FromPosAndSize(pos: Vec2, size: Vec2): Bounds2 {
  const halfX = size.x * 0.5;
  const halfY = size.y * 0.5;
  return bounds2(vec2(pos.x - halfX, pos.y - halfY), vec2(pos.x + halfX, pos.y + halfY));
}

export function bounds3FromPosAndSize(pos: Vec3, size: Vec3): Bounds3 {
  const halfX = size.x * 0.5;
  const halfY = size.y * 0.5;
  const halfZ = size.z * 0.5;
  return bounds3(vec3(pos.x - halfX, pos.y - halfY, pos.z - halfZ), vec3(pos.x + halfX, pos.y + halfY, pos.z + halfZ));
}

export const bounds2Merge = (a: Bounds2, b: Bounds2): Bounds2 => {
  return bounds2(
    vec2(Math.min(a.min.x, b.min.x), Math.min(a.min.y, b.min.y)),
    vec2(Math.max(a.max.x, b.max.x), Math.max(a.max.y, b.max.y))
  );
};

export const bounds3Merge = (...bounds: ReadonlyArray<Bounds3>): Bounds3 => {
  if (bounds.length === 0) {
    return bounds3Zero;
  }
  const min = vec3Dupl(Number.MAX_VALUE) as { x: number; y: number; z: number };
  const max = vec3Dupl(-Number.MAX_VALUE) as { x: number; y: number; z: number };
  bounds.forEach((b) => {
    if (b.min.x < min.x) {
      min.x = b.min.x;
    }
    if (b.min.y < min.y) {
      min.y = b.min.y;
    }
    if (b.min.z < min.z) {
      min.z = b.min.z;
    }
    if (b.max.x > max.x) {
      max.x = b.max.x;
    }
    if (b.max.y > max.y) {
      max.y = b.max.y;
    }
    if (b.max.z > max.z) {
      max.z = b.max.z;
    }
  });
  return bounds3(min, max);
};

export function bounds2FromVec2Array(vec2Array: ReadonlyArray<Vec2>): Bounds2 {
  let minX = Number.MAX_VALUE;
  let minY = Number.MAX_VALUE;
  let maxX = Number.MIN_VALUE;
  let maxY = Number.MIN_VALUE;
  for (const v of vec2Array) {
    if (v.x < minX) {
      minX = v.x;
    }
    if (v.y < minY) {
      minY = v.y;
    }
    if (v.x > maxX) {
      maxX = v.x;
    }
    if (v.y > maxY) {
      maxY = v.y;
    }
  }
  return bounds2(vec2(minX, minY), vec2(maxX, maxY));
}

export function bounds3FromVec3Array(vec3Array: ReadonlyArray<Vec3>): Bounds3 {
  const min = vec3Dupl(Number.MAX_VALUE) as { x: number; y: number; z: number };
  const max = vec3Dupl(-Number.MAX_VALUE) as { x: number; y: number; z: number };
  vec3Array.forEach((v) => {
    if (v.x < min.x) {
      min.x = v.x;
    }
    if (v.y < min.y) {
      min.y = v.y;
    }
    if (v.z < min.z) {
      min.z = v.z;
    }
    if (v.x > max.x) {
      max.x = v.x;
    }
    if (v.y > max.y) {
      max.y = v.y;
    }
    if (v.z > max.z) {
      max.z = v.z;
    }
  });
  return bounds3(min, max);
}

export function boundsScene(scene: Scene): Bounds3 {
  const bounds: Array<Bounds3> = [];
  for (const group of scene.groups) {
    bounds.push(...boundsGroup(group, vec3Zero, vec3Zero))
  }
  return bounds3Merge(...bounds);
}

export function boundsGroup(group: Group, parentPos: Vec3, parentRot: Vec3): ReadonlyArray<Bounds3> {
  const pos = vec3TransRot(group.pos, parentPos, parentRot);
  const rot = vec3RotCombine(parentRot, group.rot ?? vec3Zero);
  const bounds: Array<Bounds3> = [];

  for (const childMesh of group.meshes ?? []) {
    switch (childMesh.geometry.type) {
      case "Sphere": {
        bounds.push(boundsSphere(childMesh.geometry, pos, rot));
        break;
      }
      case "Plane": {
        bounds.push(boundsPlane(childMesh.geometry, pos, rot));
        break;
      }
      case "Box": {
        bounds.push(boundsBox(childMesh.geometry, pos, rot));
        break;
      }
      case "Cylinder": {
        bounds.push(boundsCylinder(childMesh.geometry, pos, rot));
        break;
      }
      case "Cone": {
        bounds.push(boundsCone(childMesh.geometry, pos, rot));
        break;
      }
      case "Text": {
        bounds.push(boundsText(childMesh.geometry, pos, rot));
        break;
      }
      default:
        break;
    }
  }

  for (const childGroup of group.groups ?? []) {
    bounds.push(...boundsGroup(childGroup, pos, rot));
  }
  return bounds;
}

export function boundsSphere(s: Sphere, parentPos: Vec3, parentRot: Vec3): Bounds3 {
  const pos = vec3TransRot(s.pos, parentPos, parentRot);
  const half = vec3(s.radius, s.radius, s.radius);
  return bounds3(vec3Sub(pos, half), vec3Add(pos, half));
}

export function boundsPlane(p: Plane, parentPos: Vec3, parentRot: Vec3): Bounds3 {
  const pos = vec3TransRot(p.pos, parentPos, parentRot);
  const rot = vec3RotCombine(parentRot, p.rot ?? vec3Zero);
  const half = vec3(p.size.x / 2, p.size.y / 2, 0);
  const points = [
    vec3(-half.x, half.y, half.z),
    vec3(half.x, half.y, half.z),
    vec3(-half.x, half.y, -half.z),
    vec3(half.x, half.y, -half.z),
    vec3(-half.x, -half.y, half.z),
    vec3(half.x, -half.y, half.z),
    vec3(-half.x, -half.y, -half.z),
    vec3(half.x, -half.y, -half.z),
  ].map((p) => vec3Add(pos, vec3Rot(p, vec3Zero, rot)));
  return bounds3FromVec3Array(points);
}

export function boundsBox(b: Box, parentPos: Vec3, parentRot: Vec3): Bounds3 {
  const pos = vec3TransRot(b.pos, parentPos, parentRot);
  const rot = vec3RotCombine(parentRot, b.rot ?? vec3Zero);
  const half = vec3Scale(b.size, 0.5);
  const points = [
    vec3(-half.x, half.y, half.z),
    vec3(half.x, half.y, half.z),
    vec3(-half.x, half.y, -half.z),
    vec3(half.x, half.y, -half.z),
    vec3(-half.x, -half.y, half.z),
    vec3(half.x, -half.y, half.z),
    vec3(-half.x, -half.y, -half.z),
    vec3(half.x, -half.y, -half.z),
  ].map((p) => vec3Add(pos, vec3Rot(p, vec3Zero, rot)));
  return bounds3FromVec3Array(points);
}

export function boundsCylinder(c: Cylinder, parentPos: Vec3, parentRot: Vec3): Bounds3 {
  const pos = vec3TransRot(c.pos, parentPos, parentRot);
  const rot = vec3RotCombine(parentRot, c.rot ?? vec3Zero);
  const half = vec3(c.radius, c.length / 2, c.radius);
  const points = [
    vec3(-half.x, half.y, half.z),
    vec3(half.x, half.y, half.z),
    vec3(-half.x, half.y, -half.z),
    vec3(half.x, half.y, -half.z),
    vec3(-half.x, -half.y, half.z),
    vec3(half.x, -half.y, half.z),
    vec3(-half.x, -half.y, -half.z),
    vec3(half.x, -half.y, -half.z),
  ].map((p) => vec3Add(pos, vec3Rot(p, vec3Zero, rot)));
  return bounds3FromVec3Array(points);
}

export function boundsCone(c: Cone, parentPos: Vec3, parentRot: Vec3): Bounds3 {
  const pos = vec3TransRot(c.pos, parentPos, parentRot);
  const rot = vec3RotCombine(parentRot, c.rot ?? vec3Zero);
  const half = vec3(c.radius, c.length / 2, c.radius);
  const points = [
    vec3(0, half.y, 0),
    vec3(-half.x, -half.y, half.z),
    vec3(half.x, -half.y, half.z),
    vec3(-half.x, -half.y, -half.z),
    vec3(half.x, -half.y, -half.z),
  ].map((p) => vec3Add(pos, vec3Rot(p, vec3Zero, rot)));
  return bounds3FromVec3Array(points);
}

export function boundsText(t: Text, parentPos: Vec3, parentRot: Vec3): Bounds3 {
  const charWidth = t.fontSize * 0.5;
  const rows = t.text.split("\n");
  const width = Math.max(...rows.map((v) => v.length)) * charWidth;
  const height = rows.length * t.fontSize * 1.2;
  return boundsPlane({
    type: "Plane",
    pos: t.pos,
    size: vec2(width, height),
    rot: t.rot,
  },
    parentPos,
    parentRot
  );
}

// -- Transformations

const quaternion1 = new Quaternion();
const quaternion2 = new Quaternion();
const euler1 = new Euler();
const euler2 = new Euler();
const vector = new Vector3();
const matrix = new Matrix4();

export function vec3RotCombine(outer: Vec3, inner: Vec3): Vec3 {
  euler1.set(outer.x, outer.y, outer.z);
  quaternion1.setFromEuler(euler1);
  euler2.set(inner.x, inner.y, inner.z);
  quaternion2.setFromEuler(euler2);
  quaternion1.multiply(quaternion2);
  euler1.setFromQuaternion(quaternion1);
  return vec3(euler1.x, euler1.y, euler1.z);
}

export function vec3RotNormal(referenceNormal: Vec3, eulerRot: Vec3): Vec3 {
  euler1.set(eulerRot.x, eulerRot.y, eulerRot.z);
  matrix.makeRotationFromEuler(euler1);
  vector.set(referenceNormal.x, referenceNormal.y, referenceNormal.z);
  vector.applyMatrix4(matrix);
  const normalized = vector.normalize();
  return vec3(normalized.x, normalized.y, normalized.z);
}

export function vec3Rot2(vec: Vec3, eulerRot: Vec3): Vec3 {
  euler1.set(eulerRot.x, eulerRot.y, eulerRot.z);
  matrix.makeRotationFromEuler(euler1);
  vector.set(vec.x, vec.y, vec.z);
  vector.applyMatrix4(matrix);
  return vec3(vector.x, vector.y, vector.z);
}

export function vec3Rot(point: Vec3, origin: Vec3, rotation: Vec3): Vec3 {
  euler1.set(rotation.x, rotation.y, rotation.z);
  quaternion1.setFromEuler(euler1);
  vector.set(point.x - origin.x, point.y - origin.y, point.z - origin.z);
  vector.applyQuaternion(quaternion1);
  return vec3(vector.x + origin.x, vector.y + origin.y, vector.z + origin.z);
}

export const vec3TransRot = (p: Vec3, pos: Vec3, rot: Vec3): Vec3 => vec3Rot(vec3Add(p, pos), pos, rot);

export function geoRot<T extends Box | Plane | Cone | Cylinder | Text | Group>(g: T, origin: Vec3, rot: Vec3): T {
  return { ...g, pos: vec3Rot(g.pos, origin, rot), rot: vec3RotCombine(rot, g.rot ?? vec3Zero) };
}
export function geoTrans<T extends Box | Plane | Cone | Cylinder | Text | Group>(g: T, translate: Vec3): T {
  return { ...g, pos: vec3Add(g.pos, translate) };
}
export function geoTransRot<T extends Box | Plane | Cone | Cylinder | Text | Group | Tube>(
  g: T,
  origin: Vec3,
  rot: Vec3
): T {
  return { ...g, pos: vec3Rot(vec3Add(g.pos, origin), origin, rot), rot: vec3RotCombine(rot, g.rot ?? vec3Zero) };
}

export function sphereRotTrans(s: Sphere, origin: Vec3, rot: Vec3): Sphere {
  return { ...s, pos: vec3Rot(vec3Add(s.pos, origin), origin, rot) };
}

export const lineRot = (l: Line, origin: Vec3, rot: Vec3): Line => ({
  ...l,
  start: vec3Rot(l.start, origin, rot),
  end: vec3Rot(l.end, origin, rot),
});
export const lineTrans = (l: Line, translation: Vec3): Line => ({
  ...l,
  start: vec3Add(l.start, translation),
  end: vec3Add(l.end, translation),
});
export const lineRotTrans = (l: Line, origin: Vec3, rot: Vec3): Line => ({
  ...l,
  start: vec3TransRot(l.start, origin, rot),
  end: vec3Rot(l.end, origin, rot),
});

export const polygonRot = (p: Polygon, origin: Vec3, rot: Vec3): Polygon => ({
  ...p,
  points: p.points.map((p) => vec3Rot(p, origin, rot)),
});
export const polygonTrans = (p: Polygon, translation: Vec3): Polygon => ({
  ...p,
  points: p.points.map((p) => vec3Add(p, translation)),
});
export const polygonRotTrans = (p: Polygon, origin: Vec3, rot: Vec3): Polygon => ({
  ...p,
  points: p.points.map((p) => vec3TransRot(p, origin, rot)),
});

// -- Constructors

export const group = (
  meshes: ReadonlyArray<Mesh>,
  pos = vec3Zero,
  rot = vec3Zero,
  groups: ReadonlyArray<Group> = Array<Group>(),
  data = {},
  animation: Animation | undefined = undefined
): Group => ({ meshes, pos, rot, data, groups, animation: animation! });

export const boxMesh = (box: Box, material: Material): Mesh => ({ geometry: box, material });
export const boxGeometry = (
  size: Vec3,
  pos: Vec3 = vec3Zero,
  rot = vec3Zero,
  holes: ReadonlyArray<Hole> = []
): Box => ({
  type: "Box",
  pos,
  rot,
  size,
  holes,
});
export const box = (
  size: Vec3,
  material: Material,
  pos: Vec3 = vec3Zero,
  rot = vec3Zero,
  holes: ReadonlyArray<Hole> = []
): BoxMesh => ({
  geometry: { type: "Box", pos, rot, size, holes },
  material,
});

export const roundHole = (pos: Vec2, radius: number): Hole => ({ type: "RoundHole", pos, radius });
export const squareHole = (pos: Vec2, size: Vec2): Hole => ({ type: "SquareHole", pos, size });

export const plane = (
  pos: Vec3,
  size: Vec2,
  material: Material,
  rot = vec3Zero,
  holes: ReadonlyArray<Hole> = []
): PlaneMesh => ({
  geometry: { type: "Plane", pos, rot, size, holes },
  material,
});

export const cone = (pos: Vec3, radius: number, length: number, material: Material, rot = vec3Zero): ConeMesh => ({
  geometry: { type: "Cone", pos, radius, length, rot },
  material,
});

export const cylinder = (
  pos: Vec3,
  radius: number,
  length: number,
  material: Material,
  rot = vec3Zero,
  open = false,
  holes: ReadonlyArray<Hole> = [],
  angleStart?: number,
  angleLength?: number
): CylinderMesh => ({
  geometry: {
    type: "Cylinder",
    pos,
    radius,
    length,
    rot,
    holes,
    open,
    angleStart: angleStart ?? 0,
    angleLength: angleLength ?? Math.PI * 2,
  },
  material,
});

export const sphere = (radius: number, material: Material, pos = vec3Zero): SphereMesh => ({
  geometry: { type: "Sphere", pos, radius },
  material,
});

export const shape = (
  points: ReadonlyArray<Vec2>,
  pos: Vec3,
  material: Material,
  thickness = 0,
  rot = vec3Zero,
  holes: ReadonlyArray<Hole> = []
): ShapeMesh => ({ geometry: { type: "Shape", points, pos, rot, thickness, holes }, material });

export const polygon = (
  points: ReadonlyArray<Vec3>,
  material: Material,
  pos = vec3Zero,
  rot = vec3Zero
): PolygonMesh => ({
  geometry: { type: "Polygon", points, pos, rot },
  material,
});

export const lineMesh = (line: Line, material: Material): Mesh => ({ geometry: line, material });
export const lineGeo = (start: Vec3, end: Vec3, thickness: number): Line => ({ type: "Line", start, end, thickness });
export const line = (start: Vec3, end: Vec3, thickness: number, material: Material): LineMesh => ({
  geometry: { type: "Line", start, end, thickness },
  material,
});

export const text = (pos: Vec3, text: string, fontSize: number, material: Material, rot = vec3Zero): TextMesh => ({
  geometry: { type: "Text", pos, text, fontSize, rot },
  material,
});

export const tube = (curve: Curve, radius: number, material: Material, pos: Vec3 = vec3Zero, rot = vec3Zero): Mesh => ({
  geometry: { type: "Tube", curve, radius, pos, rot },
  material,
});

export const circleCurve = (radius: number, angleStart: number, angleLength: number): CircleCurve => ({
  type: "CircleCurve",
  radius,
  angleLength,
  angleStart,
});
export const splineCurve = (points: ReadonlyArray<Vec3>): SplineCurve => ({ type: "SplineCurve", points });
