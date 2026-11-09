/* oxlint-disable max-lines */
import type { AbstractImage } from "abstract-image";

export type Scene = {
  readonly size_deprecated: Vec3; //move size calculation to every renderer??
  readonly groups: ReadonlyArray<Group>;
  readonly relations?: ReadonlyArray<Relation>;
  /** What the scene is as a whole, e.g. a unit its groups are the parts of, which a relation can have as an end by its `id` */
  readonly id?: string;
  readonly name?: string;
  readonly type?: GroupType;
  readonly data?: Record<string, string>;
  //should be removed
  readonly center_deprecated?: Vec3;
  readonly rotation_deprecated?: Vec3;
  //might be removed
  readonly dimensions_deprecated?: Dimensions;
};

export type Renderer = "react" | "ai_schematic" | "ai_detailed" | "dxf";

export type Dimensions = {
  readonly dimensions: ReadonlyArray<Dimension>;
  readonly material: Material;
};

/** Where a dimension's line and text are drawn, see `dimensionPlacements` */
export type DimensionPlacement = {
  /** The dimension's `linePosition`, moved out where its line is too near the line inside it or the measured points for the texts between them */
  readonly linePosition: Vec3;
  readonly text: DimensionTextPlacement;
  /**
   * The lines at the dimension's ends: the marks across its dimension line and the extension lines from the measured points to them, broken around
   * the texts they'd cross
   */
  readonly endLines: ReadonlyArray<readonly [Vec3, Vec3]>;
  /** Everything the dimension draws: its dimension line, the lines at its ends and its text */
  readonly bounds: Bounds3;
};

/** The text a gap from the dimension line, out from its middle, out from the line or, `inward`, towards the measured points */
export type DimensionTextPlacement = { readonly inward: boolean };

export type Dimension = DimensionMesh | DimensionAligned;

export type DimensionMesh = {
  readonly views: ReadonlyArray<View>;
  readonly pos: Vec3;
  readonly rot: Vec3;
  readonly meshes: ReadonlyArray<Mesh>;
  /** Makes the dimension clickable in the react renderer, which then calls the group callbacks with this id. */
  readonly id?: string;
};

export type DimensionAligned = {
  readonly measurementStart: Vec3;
  readonly measurementEnd: Vec3;

  /*
    any position that lies on the line that contains the number
  */
  readonly linePosition: Vec3;

  /*
    the distance between the measurementStart and measurementEnd will be used if this isn't set
  */
  readonly text?: string;
  readonly views?: ReadonlyArray<View>;
  readonly material?: Material;
  /** Makes the dimension clickable in the react renderer, which then calls the group callbacks with this id. */
  readonly id?: string;
};

type DimensionSide = "top" | "bottom" | "left" | "right";
type DimensionViewBias = {
  readonly right: Vec3;
  readonly up: Vec3;
  readonly normal: Vec3;
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

export type Group = {
  readonly pos: Vec3;
  readonly rot?: Vec3;
  readonly groups?: ReadonlyArray<Group>;
  readonly meshes?: ReadonlyArray<Mesh>;
  /**
   * Identifies what the group is, e.g. for the relations and as the IFC GlobalId. Sibling groups with the same id are parts of the same thing, e.g.
   * something in several places, and one IFC element
   */
  readonly id?: string;
  readonly name?: string;
  /** What the group is beyond its name, e.g. the IFC element's Description */
  readonly description?: string;
  /** The layer of the group's meshes and of the groups below it that don't have their own */
  readonly layer?: string;
  readonly type?: GroupType;
  /** The application's own data, not read by the renderers */
  readonly data?: Record<string, string>;
  readonly animation?: Animation;
};

/**
 * A connection between two groups, e.g. where air flows from one section of a unit to the next, or a connection with one end, where something outside
 * the scene connects to a group. `pos` and `rot` are in the scene's coordinates like the top-level groups, and the relation's local x points along
 * the flow from `from` to `to`
 */
export type Relation = {
  readonly id: string;
  /** The `id` of the group the flow comes from, none when it comes from outside the scene */
  readonly from?: string;
  /** The `id` of the group the flow goes to, none when it goes outside the scene */
  readonly to?: string;
  readonly name?: string;
  readonly pos: Vec3;
  readonly rot?: Vec3;
  /**
   * The relation's own shape, in the scene's coordinates like the top-level groups, e.g. merged into its IFC port's shape, or what the react renderer
   * draws to be clicked when the relation is active
   */
  readonly groups?: ReadonlyArray<Group>;
  readonly airType?: AirType;
};

/** What a group or scene is, `Part` a part of what it's in, e.g. a casing's panel */
export type GroupType =
  | "AirHandler"
  | "Fan"
  | "Filter"
  | "Damper"
  | "Silencer"
  | "WaterCoil"
  | "DxCoil"
  | "RefrigerantCoil"
  | "ElectricHeater"
  | "SteamCoil"
  | "GasBurner"
  | "RotaryHeatExchanger"
  | "PlateHeatExchanger"
  | "RunAroundCoil"
  | "HeatPipe"
  | "Humidifier"
  | "SteamHumidifier"
  | "SprayHumidifier"
  | "Part";

/** The air through a relation by where the unit's air comes in or goes out: fresh air and extract air in, supply air and exhaust air out */
export type AirType = "fresh" | "supply" | "extract" | "exhaust";

export type Mesh = {
  readonly material: Material;
  readonly geometry: Cylinder | Cone | Box | Line | CulledLine | Text | Polygon | Plane | Tube | Sphere | Shape | ImageMesh;
};

export type Material = {
  readonly normal: string;
  readonly opacity?: number;
  /** With a type, over its finish's */
  readonly metalness?: number;
  /** With a type, over its finish's */
  readonly roughness?: number;
  /** Draw only the front side, e.g. an image on a wall that should not show through from behind. Default is both sides. */
  readonly backfaceCulling?: boolean;
  /**
   * What the surface is, which the three.js viewer draws with a physical finish of its own, in the material's color, its metalness and roughness
   * unless the material has its own
   */
  readonly type?: MaterialType;
  /** False for parts that shouldn't cast shadows, e.g. symbols, markers and other abstract parts; the three.js viewer's shadows, on by default */
  readonly castShadow?: boolean;
};

/**
 * Painted sheet and casings; galvanized sheet and base frames; aluminum profiles; stainless trays and fittings; copper pipes; plastic handles and
 * covers; rubber gaskets and seals; fabric filter media; glass windows
 */
export type MaterialType = (typeof materialTypes)[number];

/** The material types; a material's `type` that isn't one, e.g. a number from a database, is ignored */
export const materialTypes = ["painted", "galvanized", "aluminum", "stainless", "copper", "plastic", "rubber", "fabric", "glass"] as const;

/** The usual color of each material type, for a material whose data gives only its type */
export const materialTypeColors: Record<MaterialType, string> = {
  painted: "rgb(236, 236, 231)",
  galvanized: "rgb(165, 170, 172)",
  aluminum: "rgb(200, 203, 206)",
  stainless: "rgb(190, 192, 192)",
  copper: "rgb(184, 115, 51)",
  plastic: "rgb(60, 60, 60)",
  rubber: "rgb(30, 30, 30)",
  fabric: "rgb(230, 230, 220)",
  glass: "rgb(210, 230, 235)",
};

export type ImageMesh = {
  readonly type: "Image";
  readonly pos: Vec3;
  readonly rot?: Vec3;
  readonly size: Vec2;
  readonly image: Image;
};

export type Image =
  | {
      readonly type: "AbstractImage";
      readonly image: AbstractImage;
    }
  | {
      readonly type: "Url";
      readonly url: string;
    };

export type Cylinder = {
  readonly type: "Cylinder";
  readonly pos: Vec3;
  readonly rot?: Vec3;
  readonly length: number;
  /** Radius at the -y end */
  readonly radius: number;
  /** Radius at the +y end, defaults to `radius`. A tapered cylinder (radiusEnd !== radius) ignores `holes` */
  readonly radiusEnd?: number;
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

export type CulledLine = {
  readonly type: "CulledLine";
  readonly start: Vec3;
  readonly end: Vec3;
  readonly thickness: number;

  /*
    the front facing direction, the opposite side of this will be culled
  */
  readonly normal: Vec3;
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
  /** The scene's text height, see `sceneTextHeight`, if not set */
  readonly fontSize?: number;
  readonly background?: TextBackground;
};

/** A circle or a rectangle `depth` behind the text, half as thick, `padding` past it on every side, its edge an `outline` wide band */
export type TextBackground = {
  readonly shape: "circle" | "rectangle";
  readonly padding: number;
  readonly outline: number;
  readonly depth: number;
  readonly material: Material;
  readonly outlineMaterial: Material;
};

export type Box = {
  readonly type: "Box";
  readonly pos: Vec3;
  readonly rot?: Vec3;
  readonly size: Vec3;
  readonly holes?: ReadonlyArray<Hole>;
  /**
   * Rounds the edges by this radius, e.g. the bend of sheet metal; drawn by the three.js viewer, which shades the edges of boxes without holes as
   * rounded
   */
  readonly radius?: number;
  /** The edges `radius` rounds, all by default; e.g. only the outer ones of the boxes a corner piece is made of */
  readonly roundedEdges?: ReadonlyArray<BoxEdge>;
};

/** A box's edges, by the two sides they're between, front is +z; along x, y, then z */
export type BoxEdge = (typeof boxEdges)[number];
export const boxEdges = [
  "BottomBack",
  "TopBack",
  "BottomFront",
  "TopFront",
  "BackLeft",
  "BackRight",
  "FrontLeft",
  "FrontRight",
  "BottomLeft",
  "BottomRight",
  "TopLeft",
  "TopRight",
] as const;

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
export type CulledLineMesh = { readonly geometry: CulledLine; readonly material: Material };
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

export const vec2DistSquared = (a: Vec2, b: Vec2): number => (b.x - a.x) ** 2 + (b.y - a.y) ** 2;

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

export const vec3Greater = (a: Vec3, b: Vec3): Vec3 => vec3(a.x > b.x ? a.x : b.x, a.y > b.y ? a.y : b.y, a.z > b.z ? a.z : b.z);

export const vec3DistSquared = (a: Vec3, b: Vec3): number => (b.x - a.x) ** 2 + (b.y - a.y) ** 2 + (b.z - a.z) ** 2;

export const vec3Dist = (a: Vec3, b: Vec3): number => vec3DistSquared(a, b);

export const vec3Cross = (left: Vec3, right: Vec3): Vec3 =>
  vec3(left.y * right.z - left.z * right.y, left.z * right.x - left.x * right.z, left.x * right.y - left.y * right.x);

const TOLERANCE = 0.001;

export const equals = (num1: number, num2: number, tolerance = TOLERANCE): boolean => Math.abs(num1 - num2) <= tolerance;
export const isZero = (num: number, tolerance = TOLERANCE): boolean => Math.abs(num) <= tolerance;
export const geq = (num1: number, num2: number, tolerance = TOLERANCE): boolean => num1 >= num2 - tolerance;
export const greater = (num1: number, num2: number, tolerance = TOLERANCE): boolean => num1 > num2 + tolerance;
export const leq = (num1: number, num2: number, tolerance = TOLERANCE): boolean => num1 <= num2 + tolerance;
export const less = (num1: number, num2: number, tolerance = TOLERANCE): boolean => num1 < num2 - tolerance;

// -- Bounds

export const bounds = (min: number, max: number): Bounds => ({ min, max });
export const bounds2 = (min: Vec2, max: Vec2): Bounds2 => ({ min, max });
export const bounds3 = (min: Vec3, max: Vec3): Bounds3 => ({ min, max });

export const boundsZero: Bounds = bounds(0, 0);
export const bounds2Zero: Bounds2 = bounds2(vec2Zero, vec2Zero);
export const bounds3Zero: Bounds3 = bounds3(vec3Zero, vec3Zero);

export const bounds2ToSize = (bounds: Bounds2): Vec2 => vec2(bounds.max.x - bounds.min.x, bounds.max.y - bounds.min.y);

export const bounds2Shift = (bounds: Bounds2, offset: Vec2): Bounds2 => bounds2(vec2Add(bounds.min, offset), vec2Add(bounds.max, offset));

export const bounds3ToSize = (bounds: Bounds3): Vec3 => vec3(bounds.max.x - bounds.min.x, bounds.max.y - bounds.min.y, bounds.max.z - bounds.min.z);

export const bounds3Overlap = (a: Bounds3, b: Bounds3, tolerance = TOLERANCE): boolean =>
  !(
    leq(a.max.x, b.min.x, tolerance) ||
    geq(a.min.x, b.max.x, tolerance) ||
    leq(a.max.y, b.min.y, tolerance) ||
    geq(a.min.y, b.max.y, tolerance) ||
    leq(a.max.z, b.min.z, tolerance) ||
    geq(a.min.z, b.max.z, tolerance)
  );

export const boundsContains = (a: Bounds, b: Bounds, tolerance = TOLERANCE): boolean => leq(a.min, b.min, tolerance) && geq(a.max, b.max, tolerance);

export const boundsOverlap = (a: Bounds, b: Bounds, tolerance = TOLERANCE): boolean =>
  (greater(a.max, b.min, tolerance) && less(a.min, b.max, tolerance)) || (greater(b.max, a.min, tolerance) && less(b.min, a.max, tolerance));

export const bounds2OverlapY = (a: Bounds2, b: Bounds2, tolerance = TOLERANCE): boolean =>
  (greater(a.max.y, b.min.y, tolerance) && less(a.min.y, b.max.y, tolerance)) ||
  (greater(b.max.y, a.min.y, tolerance) && less(b.min.y, a.max.y, tolerance));

export const boundsXOverlapX = (a: Bounds2, b: Bounds2, tolerance = TOLERANCE): boolean =>
  (greater(a.max.x, b.min.x, tolerance) && less(a.min.x, b.max.x, tolerance)) ||
  (greater(b.max.x, a.min.x, tolerance) && less(b.min.x, a.max.x, tolerance));

export const bounds2Contains = (a: Bounds2, b: Bounds2, tolerance = TOLERANCE): boolean =>
  leq(a.min.x, b.min.x, tolerance) && geq(a.max.x, b.max.x, tolerance) && leq(a.min.y, b.min.y, tolerance) && geq(a.max.y, b.max.y, tolerance);

export const bounds2Center = (bounds: Bounds2): Vec2 => vec2((bounds.min.x + bounds.max.x) / 2, (bounds.min.y + bounds.max.y) / 2);

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

export const bounds2Merge = (...bounds: ReadonlyArray<Bounds2>): Bounds2 => {
  if (bounds.length === 0) {
    return bounds2Zero;
  }
  const min = vec2Dupl(Number.MAX_VALUE) as { x: number; y: number };
  const max = vec2Dupl(-Number.MAX_VALUE) as { x: number; y: number };
  bounds.forEach((b) => {
    if (b.min.x < min.x) {
      min.x = b.min.x;
    }
    if (b.min.y < min.y) {
      min.y = b.min.y;
    }
    if (b.max.x > max.x) {
      max.x = b.max.x;
    }
    if (b.max.y > max.y) {
      max.y = b.max.y;
    }
  });
  return bounds2(min, max);
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
  const textHeight = sceneTextHeight(scene.groups);
  const bounds: Array<Bounds3> = [];
  for (const group of scene.groups) {
    bounds.push(...boundsGroup(group, vec3Zero, vec3Zero, textHeight));
  }
  return bounds3Merge(...bounds);
}

/** The bounds of the group's meshes, its texts without a font size `textHeight` high */
export function boundsGroup(group: Group, parentPos: Vec3, parentRot: Vec3, textHeight: number = defaultDimensionTextHeight): ReadonlyArray<Bounds3> {
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
        bounds.push(boundsText(childMesh.geometry, pos, rot, textHeight));
        break;
      }
      default:
        break;
    }
  }

  for (const childGroup of group.groups ?? []) {
    bounds.push(...boundsGroup(childGroup, pos, rot, textHeight));
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
  const maxRadius = Math.max(c.radius, c.radiusEnd ?? c.radius);
  const half = vec3(maxRadius, c.length / 2, maxRadius);
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

/** The bounds of the text and its background, `textHeight` high without a font size */
export function boundsText(t: Text, parentPos: Vec3, parentRot: Vec3, textHeight: number = defaultDimensionTextHeight): Bounds3 {
  const size = textSize(t.text, t.fontSize ?? textHeight);
  const padding = 2 * (t.background?.padding ?? 0);
  return boundsPlane({ type: "Plane", pos: t.pos, size: vec2(size.x + padding, size.y + padding), rot: t.rot }, parentPos, parentRot);
}

/** How wide and high a text is drawn at the font size, its widest row by a rough character width and its rows a fifth of the font size apart */
export function textSize(text: string, fontSize: number): Vec2 {
  const rows = text.split("\n");
  return vec2(Math.max(...rows.map((v) => v.length)) * fontSize * (9 / 16), rows.length * fontSize * 1.2);
}

/** The longest side of the scene's objects that the text height 32 is for */
const textHeightBaseSize = 3600;
const textHeightBase = 32;
/** A step of the text height, half of ISO 3098's √2, so a scene just past a step has its text at most 19% larger than in proportion to its size */
const textHeightStep = 2 ** (1 / 4);

/**
 * The text height for a scene whose objects take `size`, without its dimensions and texts: 32 up to the base size, else as many steps of 2^¼ above it
 * as the longest side needs, rounded up, so a text is never smaller on the drawing than 32 on the base size
 */
export function textHeightForSize(size: Vec3): number {
  const steps = Math.ceil(Math.log(Math.max(size.x, size.y, size.z) / textHeightBaseSize) / Math.log(textHeightStep) - 1e-9);
  return textHeightBase * textHeightStep ** Math.max(0, steps);
}

/**
 * The text height of a scene of the groups, its texts without a font size and its dimensions': `textHeightForSize` of its objects' size, without its
 * texts, which the text height would size
 */
export function sceneTextHeight(groups: ReadonlyArray<Group>): number {
  const withoutTexts = (g: Group): Group => ({
    ...g,
    meshes: g.meshes?.filter((m) => m.geometry.type !== "Text"),
    groups: g.groups?.map(withoutTexts),
  });
  return textHeightForSize(bounds3ToSize(bounds3Merge(...groups.flatMap((g) => boundsGroup(withoutTexts(g), vec3Zero, vec3Zero)))));
}

/** The group with its texts' backgrounds as the meshes just behind each text, in a group after its own, sized by its font size or else `textHeight` */
export function groupTextBackgrounds(g: Group, textHeight: number): Group {
  const backgrounds = (g.meshes ?? []).flatMap((m): ReadonlyArray<Group> => {
    if (m.geometry.type !== "Text" || !m.geometry.background) {
      return [];
    }
    const { padding, outline, depth, material, outlineMaterial, shape } = m.geometry.background;
    const size = textSize(m.geometry.text, m.geometry.fontSize ?? textHeight);
    const width = size.x + 2 * padding;
    const height = size.y + 2 * padding;
    const thickness = depth / 2;
    const back = vec3(0, 0, -depth);
    const radius = Math.max(width, height) / 2;
    return [
      group(
        shape === "circle"
          ? [
              cylinder(back, radius - outline, thickness, material, vec3(Math.PI / 2, 0, 0)),
              cylinder(back, radius, thickness, outlineMaterial, vec3(Math.PI / 2, 0, 0), false, [
                { type: "RoundHole", radius: radius - outline, pos: vec2Zero },
              ]),
            ]
          : [
              plane(back, vec2(width - 2 * outline, height - 2 * outline), material),
              box(vec3(width, outline, thickness), outlineMaterial, vec3Add(back, vec3(0, (height - outline) / 2, 0))),
              box(vec3(width, outline, thickness), outlineMaterial, vec3Add(back, vec3(0, -(height - outline) / 2, 0))),
              box(vec3(outline, height - 2 * outline, thickness), outlineMaterial, vec3Add(back, vec3((width - outline) / 2, 0, 0))),
              box(vec3(outline, height - 2 * outline, thickness), outlineMaterial, vec3Add(back, vec3(-(width - outline) / 2, 0, 0))),
            ],
        m.geometry.pos,
        m.geometry.rot ?? vec3Zero
      ),
    ];
  });
  const groups = (g.groups ?? []).map((c) => groupTextBackgrounds(c, textHeight));
  return backgrounds.length === 0 && g.groups === undefined ? g : { ...g, groups: [...groups, ...backgrounds] };
}

// -- Transformations

export function vec3RotCombine(outer: Vec3, inner: Vec3): Vec3 {
  if (inner.x === 0 && inner.y === 0 && inner.z === 0) {
    return outer;
  }
  if (outer.x === 0 && outer.y === 0 && outer.z === 0) {
    return inner;
  }
  const oc1 = Math.cos(outer.x / 2);
  const os1 = Math.sin(outer.x / 2);
  const oc2 = Math.cos(outer.y / 2);
  const os2 = Math.sin(outer.y / 2);
  const oc3 = Math.cos(outer.z / 2);
  const os3 = Math.sin(outer.z / 2);
  const ax = os1 * oc2 * oc3 + oc1 * os2 * os3;
  const ay = oc1 * os2 * oc3 - os1 * oc2 * os3;
  const az = oc1 * oc2 * os3 + os1 * os2 * oc3;
  const aw = oc1 * oc2 * oc3 - os1 * os2 * os3;
  const ic1 = Math.cos(inner.x / 2);
  const is1 = Math.sin(inner.x / 2);
  const ic2 = Math.cos(inner.y / 2);
  const is2 = Math.sin(inner.y / 2);
  const ic3 = Math.cos(inner.z / 2);
  const is3 = Math.sin(inner.z / 2);
  const bx = is1 * ic2 * ic3 + ic1 * is2 * is3;
  const by = ic1 * is2 * ic3 - is1 * ic2 * is3;
  const bz = ic1 * ic2 * is3 + is1 * is2 * ic3;
  const bw = ic1 * ic2 * ic3 - is1 * is2 * is3;
  const qx = ax * bw + aw * bx + ay * bz - az * by;
  const qy = ay * bw + aw * by + az * bx - ax * bz;
  const qz = az * bw + aw * bz + ax * by - ay * bx;
  const qw = aw * bw - ax * bx - ay * by - az * bz;
  const m11 = 1 - 2 * (qy * qy + qz * qz);
  const m12 = 2 * (qx * qy - qw * qz);
  const m13 = 2 * (qx * qz + qw * qy);
  const m22 = 1 - 2 * (qx * qx + qz * qz);
  const m23 = 2 * (qy * qz - qw * qx);
  const m32 = 2 * (qy * qz + qw * qx);
  const m33 = 1 - 2 * (qx * qx + qy * qy);
  const ey = Math.asin(Math.max(-1, Math.min(1, m13)));
  if (Math.abs(m13) < 0.9999999) {
    return vec3(Math.atan2(-m23, m33), ey, Math.atan2(-m12, m11));
  }
  return vec3(Math.atan2(m32, m22), ey, 0);
}

export function vec3RotInverse(rotation: Vec3): Vec3 {
  const c1 = Math.cos(rotation.x / 2);
  const s1 = Math.sin(rotation.x / 2);
  const c2 = Math.cos(rotation.y / 2);
  const s2 = Math.sin(rotation.y / 2);
  const c3 = Math.cos(rotation.z / 2);
  const s3 = Math.sin(rotation.z / 2);

  // Euler -> Quaternion
  const qx = -(s1 * c2 * c3 + c1 * s2 * s3);
  const qy = -(c1 * s2 * c3 - s1 * c2 * s3);
  const qz = -(c1 * c2 * s3 + s1 * s2 * c3);
  const qw = c1 * c2 * c3 - s1 * s2 * s3;

  // Quaternion -> Euler
  const m11 = 1 - 2 * (qy * qy + qz * qz);
  const m12 = 2 * (qx * qy - qw * qz);
  const m13 = 2 * (qx * qz + qw * qy);
  const m22 = 1 - 2 * (qx * qx + qz * qz);
  const m23 = 2 * (qy * qz - qw * qx);
  const m32 = 2 * (qy * qz + qw * qx);
  const m33 = 1 - 2 * (qx * qx + qy * qy);

  const ey = Math.asin(Math.max(-1, Math.min(1, m13)));

  if (Math.abs(m13) < 0.9999999) {
    return vec3(Math.atan2(-m23, m33), ey, Math.atan2(-m12, m11));
  }

  return vec3(Math.atan2(m32, m22), ey, 0);
}

export function vec3Rot(point: Vec3, origin: Vec3, rotation: Vec3): Vec3 {
  if (rotation.x === 0 && rotation.y === 0 && rotation.z === 0) {
    return point;
  }
  const c1 = Math.cos(rotation.x / 2);
  const s1 = Math.sin(rotation.x / 2);
  const c2 = Math.cos(rotation.y / 2);
  const s2 = Math.sin(rotation.y / 2);
  const c3 = Math.cos(rotation.z / 2);
  const s3 = Math.sin(rotation.z / 2);
  const qx = s1 * c2 * c3 + c1 * s2 * s3;
  const qy = c1 * s2 * c3 - s1 * c2 * s3;
  const qz = c1 * c2 * s3 + s1 * s2 * c3;
  const qw = c1 * c2 * c3 - s1 * s2 * s3;
  const vx = point.x - origin.x;
  const vy = point.y - origin.y;
  const vz = point.z - origin.z;
  const tx = 2 * (qy * vz - qz * vy);
  const ty = 2 * (qz * vx - qx * vz);
  const tz = 2 * (qx * vy - qy * vx);
  return vec3(vx + qw * tx + qy * tz - qz * ty + origin.x, vy + qw * ty + qz * tx - qx * tz + origin.y, vz + qw * tz + qx * ty - qy * tx + origin.z);
}

export const vec3TransRot = (p: Vec3, pos: Vec3, rot: Vec3): Vec3 => {
  if (rot.x === 0 && rot.y === 0 && rot.z === 0) {
    return vec3(p.x + pos.x, p.y + pos.y, p.z + pos.z);
  }
  const c1 = Math.cos(rot.x / 2);
  const s1 = Math.sin(rot.x / 2);
  const c2 = Math.cos(rot.y / 2);
  const s2 = Math.sin(rot.y / 2);
  const c3 = Math.cos(rot.z / 2);
  const s3 = Math.sin(rot.z / 2);
  const qx = s1 * c2 * c3 + c1 * s2 * s3;
  const qy = c1 * s2 * c3 - s1 * c2 * s3;
  const qz = c1 * c2 * s3 + s1 * s2 * c3;
  const qw = c1 * c2 * c3 - s1 * s2 * s3;
  const tx = 2 * (qy * p.z - qz * p.y);
  const ty = 2 * (qz * p.x - qx * p.z);
  const tz = 2 * (qx * p.y - qy * p.x);
  return vec3(p.x + qw * tx + qy * tz - qz * ty + pos.x, p.y + qw * ty + qz * tx - qx * tz + pos.y, p.z + qw * tz + qx * ty - qy * tx + pos.z);
};

export function vec3BasisToEuler(direction: Vec3, normal: Vec3): Vec3 {
  const x = vec3Normalize(direction);
  const z = vec3Normalize(normal);
  const y = vec3Normalize(vec3Cross(z, x));
  const xx = vec3Normalize(vec3Cross(y, z));

  const m11 = xx.x;
  const m12 = y.x;
  const m13 = z.x;
  //const m21 = xx.y;
  const m22 = y.y;
  const m23 = z.y;
  //const m31 = xx.z;
  const m32 = y.z;
  const m33 = z.z;

  const ry = Math.asin(Math.max(-1, Math.min(1, m13)));

  let rx: number = Math.atan2(m32, m22);
  let rz: number = 0;

  if (Math.abs(m13) < 0.9999999) {
    rx = Math.atan2(-m23, m33);
    rz = Math.atan2(-m12, m11);
  }

  return vec3(rx, ry, rz);
}

export function geoRot<T extends Box | Plane | Cone | Cylinder | Text | Group>(g: T, origin: Vec3, rot: Vec3): T {
  return { ...g, pos: vec3Rot(g.pos, origin, rot), rot: vec3RotCombine(rot, g.rot ?? vec3Zero) };
}
export function geoTrans<T extends Box | Plane | Cone | Cylinder | Text | Group>(g: T, translate: Vec3): T {
  return { ...g, pos: vec3Add(g.pos, translate) };
}
export function geoTransRot<T extends Box | Plane | Cone | Cylinder | Text | Group | Tube>(g: T, origin: Vec3, rot: Vec3): T {
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
  animation?: Animation,
  id?: string,
  name?: string,
  description?: string,
  layer?: string
): Group => ({ meshes, pos, rot, data, groups, animation: animation!, layer, name, id, description });

export const boxMesh = (box: Box, material: Material): Mesh => ({ geometry: box, material });
export const boxGeometry = (size: Vec3, pos: Vec3 = vec3Zero, rot = vec3Zero, holes: ReadonlyArray<Hole> = []): Box => ({
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
  holes: ReadonlyArray<Hole> = [],
  radius?: number,
  roundedEdges?: ReadonlyArray<BoxEdge>
): BoxMesh => ({
  geometry: {
    type: "Box",
    pos,
    rot,
    size,
    holes,
    ...(radius === undefined ? {} : { radius }),
    ...(roundedEdges === undefined ? {} : { roundedEdges }),
  },
  material,
});
export const image = (size: Vec3, material: Material, image: ImageMesh["image"], pos: Vec3 = vec3Zero, rot: Vec3 = vec3Zero): Mesh => ({
  material,
  geometry: {
    type: "Image",
    image,
    pos,
    size,
    rot,
  },
});

export const roundHole = (pos: Vec2, radius: number): Hole => ({ type: "RoundHole", pos, radius });
export const squareHole = (pos: Vec2, size: Vec2): Hole => ({ type: "SquareHole", pos, size });

export const plane = (pos: Vec3, size: Vec2, material: Material, rot = vec3Zero, holes: ReadonlyArray<Hole> = []): PlaneMesh => ({
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
  angleLength?: number,
  radiusEnd?: number
): CylinderMesh => ({
  geometry: {
    type: "Cylinder",
    pos,
    radius,
    radiusEnd,
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

export const polygon = (points: ReadonlyArray<Vec3>, material: Material, pos = vec3Zero, rot = vec3Zero): PolygonMesh => ({
  geometry: { type: "Polygon", points, pos, rot },
  material,
});

export const lineMesh = (line: Line, material: Material): Mesh => ({ geometry: line, material });
export const lineGeo = (start: Vec3, end: Vec3, thickness: number): Line => ({ type: "Line", start, end, thickness });
export const line = (start: Vec3, end: Vec3, thickness: number, material: Material): LineMesh => ({
  geometry: { type: "Line", start, end, thickness },
  material,
});

export const culledLineMesh = (culledLine: CulledLine, material: Material): Mesh => ({
  geometry: culledLine,
  material,
});
export const culledLineGeo = (start: Vec3, end: Vec3, normal: Vec3, thickness: number): CulledLine => ({
  type: "CulledLine",
  start,
  end,
  normal,
  thickness,
});
export const culledLine = (start: Vec3, end: Vec3, normal: Vec3, thickness: number, material: Material): CulledLineMesh => ({
  geometry: { type: "CulledLine", start, end, normal, thickness },
  material,
});

export const text = (
  pos: Vec3,
  text: string,
  fontSize: number | undefined,
  material: Material,
  rot = vec3Zero,
  background?: TextBackground
): TextMesh => ({
  geometry: { type: "Text", pos, text, fontSize, rot, background },
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

export const alignedDimension = (
  measurementStart: Vec3,
  measurementEnd: Vec3,
  linePosition: Vec3,
  text: string,
  views?: ReadonlyArray<View>,
  material?: Material,
  id?: string
): DimensionAligned => ({
  measurementStart,
  measurementEnd,
  linePosition,
  text,
  views,
  material,
  id,
});

export function dimensionIsOfTypeAligned(dimension: Dimension): dimension is DimensionAligned {
  return "measurementStart" in dimension;
}

export function dimensionIsOfTypeMesh(dimension: Dimension): dimension is DimensionMesh {
  return "meshes" in dimension;
}

const defaultDimensionTextHeight = 44;
// The sizes as shares of the text height
const dimensionGap = 8 / defaultDimensionTextHeight;
/** How far the marks at a dimension's ends go to each side of the dimension line, short of the text's digits a gap from it */
const dimensionMark = 10 / defaultDimensionTextHeight;
const dimensionArrowLength = 30 / defaultDimensionTextHeight;
const dimensionArrowHalfBase = 7.5 / defaultDimensionTextHeight;
/** How far apart the rows of a dimension's text are, as `textSize` measures them, each drawn as a text of its own so every renderer spaces them alike */
const dimensionTextRowStep = 1.2;
/** The lines' thickness, whatever the text height, as the three renderer draws it in pixels */
const dimensionLineThickness = 0.5;

/** A dimension's measured length, its text and how wide the text is drawn, as `textSize` measures it */
function dimensionMeasure(
  dimension: DimensionAligned,
  textHeight: number
): { readonly length: number; readonly text: string; readonly rows: ReadonlyArray<string>; readonly textWidth: number } {
  const length = vec3Length(vec3Sub(dimension.measurementEnd, dimension.measurementStart));
  const text = dimension.text ?? length.toFixed(1).replace(/[.,]0$/, "");
  const rows = text.split("\n");
  return { length, text, rows, textWidth: textSize(text, textHeight).x };
}

type DimensionSpan = {
  readonly index: number;
  readonly view: View;
  /** The direction along the line, the same for the dimensions measured either way along it */
  readonly along: Vec3;
  /** Where the dimension line crosses the plane through the origin across it, the same for the dimensions on one line */
  readonly linePoint: Vec3;
  readonly linePosition: Vec3;
  readonly measurementStart: Vec3;
  readonly measurementEnd: Vec3;
  /** The direction from the measured points out to the line */
  readonly outward: Vec3;
  /** How far out the line is */
  readonly row: number;
  /** How far out the outermost measured point is */
  readonly measured: number;
  readonly min: number;
  readonly max: number;
  readonly startIsMin: boolean;
  readonly textWidth: number;
  readonly textBlockHeight: number;
};

/**
 * Where each dimension's line and text are drawn, decided for the dimensions on the same line together, undefined for a mesh dimension:
 *
 * - The text a gap out from the line, out from the dimension's middle, wider than the dimension where nothing's in the way
 * - Else on the other side of the line, towards the measured points, alternating with its neighbours'
 * - Placed together for the dimensions on a line, whichever together are the clearest: texts out from the line, and apart
 * - Each line moved out where it's too near the measured points or the line inside it on the same side for the texts between them
 */
export function dimensionPlacements(
  dimensions: ReadonlyArray<Dimension>,
  textHeight: number = defaultDimensionTextHeight
): ReadonlyArray<DimensionPlacement | undefined> {
  const tolerance = textHeight * 0.01;
  const gap = textHeight * dimensionGap;
  const lines = Array<Array<DimensionSpan>>();
  dimensions.forEach((d, index) => {
    if (dimensionIsOfTypeMesh(d)) {
      return;
    }
    const direction = vec3Normalize(vec3Sub(d.measurementEnd, d.measurementStart));
    const flip = Math.abs(direction.x) > 1e-6 ? direction.x < 0 : Math.abs(direction.y) > 1e-6 ? direction.y < 0 : direction.z < 0;
    const along = flip ? vec3Scale(direction, -1) : direction;
    const start = vec3Dot(d.measurementStart, along);
    const end = vec3Dot(d.measurementEnd, along);
    const linePoint = vec3Sub(d.linePosition, vec3Scale(along, vec3Dot(d.linePosition, along)));
    const outward = vec3Normalize(vec3Sub(linePoint, vec3Sub(d.measurementStart, vec3Scale(along, start))));
    const { textWidth, rows } = dimensionMeasure(d, textHeight);
    const span: DimensionSpan = {
      index,
      view: d.views?.[0] ?? "front",
      along,
      linePoint,
      linePosition: d.linePosition,
      measurementStart: d.measurementStart,
      measurementEnd: d.measurementEnd,
      outward,
      row: vec3Dot(d.linePosition, outward),
      measured: Math.max(vec3Dot(d.measurementStart, outward), vec3Dot(d.measurementEnd, outward)),
      min: Math.min(start, end),
      max: Math.max(start, end),
      startIsMin: start <= end,
      textWidth,
      textBlockHeight: textHeight * (1 + dimensionTextRowStep * (rows.length - 1)),
    };
    const line = lines.find(
      ([s]) => s && s.view === span.view && vec3Dot(s.along, along) > 1 - 1e-6 && vec3Length(vec3Sub(s.linePoint, span.linePoint)) < tolerance
    );
    if (line) {
      line.push(span);
    } else {
      lines.push([span]);
    }
  });

  const sameSide = (a: DimensionSpan | undefined, b: DimensionSpan): boolean =>
    a !== undefined && a.view === b.view && vec3Dot(a.along, b.along) > 1 - 1e-6 && vec3Dot(a.outward, b.outward) > 1 - 1e-6;
  // The lines' texts, placed before the lines are moved out, as the room on each side of a line is left for its texts
  const decisions = lines.flatMap((line) => {
    const [first] = line;
    if (!first) {
      return [];
    }
    type Placed = { readonly s: DimensionSpan; readonly inward: boolean };
    // How far apart two texts out from their dimensions' middles are
    const apart = (l: Placed, o: Placed): number => Math.abs((l.s.min + l.s.max) / 2 - (o.s.min + o.s.max) / 2) - (l.s.textWidth + o.s.textWidth) / 2;
    const sorted = line.toSorted((a, b) => a.min - b.min);
    // What makes a text unclear, worst first: across its neighbour's, so they alternate even where every other one's still clash, across another text,
    // two texts on one side so close they read as one, and a text towards the measured points, more at an end of the line, with room past it
    const placeCost = (l: Placed, placed: ReadonlyArray<Placed>): number =>
      (l.inward ? (l.s === sorted[0] || l.s === sorted.at(-1) ? 5 : 4) : 0) +
      placed
        .filter((o) => o.inward === l.inward)
        .reduce(
          (sum, o) =>
            sum +
            (apart(l, o) < 2 * gap - tolerance
              ? o === placed.at(-1)
                ? 100000
                : 1000
              : apart(l, o) < textHeight / 2
                ? 10 * (1 - (2 * apart(l, o)) / textHeight)
                : 0),
          0
        );
    const placed =
      sorted
        .reduce<ReadonlyArray<{ readonly placed: ReadonlyArray<Placed>; readonly cost: number }>>(
          (states, s) =>
            states
              .flatMap(({ placed, cost }) =>
                [false, true].map((inward) => ({ placed: [...placed, { s, inward }], cost: cost + placeCost({ s, inward }, placed) }))
              )
              .toSorted((a, b) => a.cost - b.cost)
              .slice(0, 64),
          [{ placed: [], cost: 0 }]
        )
        .at(0)?.placed ?? [];
    return [{ line, first, placed }];
  });

  // How far a line's texts, or the marks at its ends, take on each side of it
  const mark = textHeight * dimensionMark;
  const reach = (placed: ReadonlyArray<{ readonly s: DimensionSpan; readonly inward: boolean }>, inward: boolean): number =>
    Math.max(mark, ...placed.filter((l) => l.inward === inward).map((l) => gap + l.s.textBlockHeight));
  // How far out each line is moved to: its texts towards the measured points a gap past them or past the texts out from the line inside it on the same
  // side
  const rows = new Map<DimensionSpan, number>();
  for (const { line, first, placed } of decisions.toSorted((a, b) => a.first.row - b.first.row)) {
    rows.set(
      first,
      Math.max(
        first.row,
        Math.max(...line.map((s) => s.measured)) + gap + reach(placed, true),
        ...decisions
          .filter((d) => sameSide(d.first, first) && d.first.row < first.row - tolerance)
          .map((d) => (rows.get(d.first) ?? 0) + reach(d.placed, false) + gap + reach(placed, true))
      )
    );
  }

  // Every text's rectangle, along its line from its left to its right and out from its bottom to its top
  const texts = decisions.flatMap(({ first, placed }) =>
    placed.map(({ s, inward }) => {
      const row = rows.get(first) ?? first.row;
      const middle = (s.min + s.max) / 2;
      return {
        s,
        left: middle - s.textWidth / 2,
        right: middle + s.textWidth / 2,
        bottom: inward ? row - gap - s.textBlockHeight : row + gap,
        top: inward ? row - gap : row + gap + s.textBlockHeight,
      };
    })
  );
  const placements = new Map<number, DimensionPlacement>();
  for (const { first, placed } of decisions) {
    const row = rows.get(first) ?? first.row;
    for (const { s, inward } of placed) {
      const linePoint = vec3Add(s.linePoint, vec3Scale(s.outward, row - s.row));
      const at = (t: number, u: number): Vec3 => vec3Add(linePoint, vec3Add(vec3Scale(s.along, t), vec3Scale(s.outward, u - row)));
      // At each end the mark across the line, and the extension line from the measured point to it, broken half a gap short of each text
      // it'd cross on the same side
      const endLines = [
        [s.min, s.startIsMin ? s.measurementStart : s.measurementEnd] as const,
        [s.max, s.startIsMin ? s.measurementEnd : s.measurementStart] as const,
      ].flatMap(([t, point]) => {
        const extension = texts
          .filter((o) => sameSide(o.s, s) && t > o.left && t < o.right)
          .reduce<ReadonlyArray<readonly [number, number]>>(
            (pieces, o) =>
              pieces.flatMap(([from, to]) => [[from, Math.min(to, o.bottom - gap / 2)] as const, [Math.max(from, o.top + gap / 2), to] as const]),
            [[vec3Dot(point, s.outward), row - mark]]
          )
          .filter(([from, to]) => to - from >= gap);
        return [...extension, [row - mark, row + mark] as const].map(([from, to]) => [at(t, from), at(t, to)] as const);
      });
      // The rectangle the dimension line, the marks at its ends and its text take, and the extension lines
      const middle = (s.min + s.max) / 2;
      const corners = [Math.min(s.min, middle - s.textWidth / 2), Math.max(s.max, middle + s.textWidth / 2)].flatMap((t) =>
        [inward ? -gap - s.textBlockHeight : -mark, inward ? mark : gap + s.textBlockHeight].map((u) => at(t, row + u))
      );
      const linePosition = vec3Add(s.linePosition, vec3Scale(s.outward, row - s.row));
      placements.set(s.index, {
        linePosition,
        text: { inward },
        endLines,
        bounds: bounds3FromVec3Array([...corners, ...endLines.flat()]),
      });
    }
  }
  return dimensions.map((_, i) => placements.get(i));
}

/** Draws the dimension as `placement` places it, its text `textHeight` high; as if alone on its line if not given */
export function dimensionMeshifyAlignedDimension(
  dimension: DimensionAligned,
  sceneRotation: Vec3,
  _viewRotation: Vec3,
  onCreateLine: (start: Vec3, end: Vec3, norm: Vec3, thickness: number, mat: Material) => void,
  onCreateText: (pos: Vec3, measurement: string, fontSize: number, mat: Material, rot: Vec3, dir: Vec3, normal: Vec3) => void,
  onCreatePolygon: (p1: Vec3, p2: Vec3, p3: Vec3, mat: Material) => void,
  dimensionsMaterial?: Material,
  textHeight: number = defaultDimensionTextHeight,
  placement?: DimensionPlacement
): void {
  const defaultMaterial = { normal: "rgb(0, 0, 0)", opacity: 1.0, roughness: 1.0, metalness: 0.0 };
  const material = dimension.material ?? dimensionsMaterial ?? defaultMaterial;
  const place = placement ?? dimensionPlacements([dimension], textHeight)[0];
  if (!place) {
    return;
  }
  const gap = textHeight * dimensionGap;
  const lineThickness = dimensionLineThickness;

  const lp = place.linePosition;
  const ms = dimension.measurementStart;
  const me = dimension.measurementEnd;
  const { rows: measurementRows } = dimensionMeasure(dimension, textHeight);
  const textBlockHeight = textHeight * (1 + dimensionTextRowStep * (measurementRows.length - 1));

  const view = dimension.views?.[0] ?? "front";
  const basis = dimensionViewBasises[view];

  //calculate the line positions
  const direction = vec3Normalize(vec3Sub(me, ms));
  const msToLp = vec3Sub(lp, ms);
  const along = vec3Scale(direction, vec3Dot(msToLp, direction));
  const projected = vec3Add(ms, along);
  const offset = vec3Sub(lp, projected);
  const ls = vec3Add(ms, offset);
  const le = vec3Add(me, offset);
  const lc = vec3Scale(vec3Add(ls, le), 0.5);
  const dirBetweenLines = vec3Normalize(offset);

  // The lines at its ends and the dimension line
  place.endLines.forEach(([start, end]) => onCreateLine(start, end, basis.normal, lineThickness, material));
  onCreateLine(ls, le, basis.normal, lineThickness, material);

  // An arrow inside each end, pointing at its mark, where both fit with a gap of the line between them
  const arrowLength = textHeight * dimensionArrowLength;
  const arrowHalfBase = textHeight * dimensionArrowHalfBase;
  // TEMPORARY: arrows hidden to compare without them
  const showArrows: boolean = false;
  if (showArrows && vec3Length(vec3Sub(le, ls)) >= 2 * arrowLength + gap) {
    for (const [tip, inward] of [
      [ls, direction],
      [le, vec3Scale(direction, -1)],
    ] as const) {
      const base = vec3Add(tip, vec3Scale(inward, arrowLength));
      const a = vec3Add(base, vec3Scale(dirBetweenLines, arrowHalfBase));
      const b = vec3Sub(base, vec3Scale(dirBetweenLines, arrowHalfBase));
      // The winding order facing the view's normal
      if (vec3Dot(vec3Cross(vec3Sub(a, tip), vec3Sub(b, tip)), basis.normal) >= 0) {
        onCreatePolygon(tip, a, b, material);
      } else {
        onCreatePolygon(tip, b, a, material);
      }
    }
  }

  const rotatedDirBetweenLines = vec3TransRot(dirBetweenLines, vec3Zero, sceneRotation);
  const rotatedNormal = vec3TransRot(basis.normal, vec3Zero, sceneRotation);
  const renderedBasis = getDimensionViewBasisFromNormal(rotatedNormal);
  const renderedSide = getDimensionSide(rotatedDirBetweenLines, renderedBasis);
  const desiredRenderedTextDir = getDimensionTextDirection(renderedSide, renderedBasis);
  const inverseSceneRotation = vec3RotInverse(sceneRotation);
  const textDir = vec3TransRot(desiredRenderedTextDir, vec3Zero, inverseSceneRotation);
  const textRot = vec3BasisToEuler(textDir, basis.normal);

  const finalBasis = dimensionViewBasises.front;
  const finalSide = getDimensionSide(dirBetweenLines, finalBasis);
  const finalDir = getDimensionTextDirection(finalSide, finalBasis);
  const textPos = vec3Add(lc, vec3Scale(dirBetweenLines, (place.text.inward ? -1 : 1) * (gap + textBlockHeight / 2)));
  // Each row a text of its own, the first at the top, as the text reads
  const textUp = vec3Normalize(vec3Cross(basis.normal, textDir));
  measurementRows.forEach((row, i) =>
    onCreateText(
      vec3Add(textPos, vec3Scale(textUp, ((measurementRows.length - 1) / 2 - i) * dimensionTextRowStep * textHeight)),
      row,
      textHeight,
      material,
      textRot,
      finalDir,
      vec3(0, 0, 1)
    )
  );
}

export function dimensionConvertToTypeMesh(
  dimension: Dimension,
  sceneRotation: Vec3,
  dimensionsMaterial?: Material,
  textHeight?: number,
  placement?: DimensionPlacement
): DimensionMesh {
  if (dimensionIsOfTypeMesh(dimension)) {
    return dimension;
  }
  const meshes: Array<Mesh> = [];

  const onCreateLine = (start: Vec3, end: Vec3, norm: Vec3, thickness: number, mat: Material): void => {
    meshes.push(culledLine(start, end, norm, thickness, mat));
  };
  const onCreateText = (pos: Vec3, measurement: string, fontSize: number, mat: Material, rot: Vec3): void => {
    meshes.push(text(pos, measurement, fontSize, mat, rot));
  };
  const onCreatePolygon = (p1: Vec3, p2: Vec3, p3: Vec3, mat: Material): void => {
    meshes.push(polygon([p1, p2, p3], mat));
  };
  dimensionMeshifyAlignedDimension(
    dimension,
    sceneRotation,
    vec3Zero,
    onCreateLine,
    onCreateText,
    onCreatePolygon,
    dimensionsMaterial,
    textHeight,
    placement
  );

  return {
    meshes,
    pos: vec3Zero,
    rot: vec3Zero,
    views: dimension.views ?? ["front"],
    id: dimension.id,
  };
}

function getDimensionSide(dir: Vec3, basis: DimensionViewBias): DimensionSide {
  const right = vec3Dot(dir, basis.right);
  const up = vec3Dot(dir, basis.up);

  if (Math.abs(right) > Math.abs(up)) {
    return right > 0 ? "right" : "left";
  }

  return up > 0 ? "top" : "bottom";
}

function getDimensionTextDirection(side: DimensionSide, basis: DimensionViewBias): Vec3 {
  switch (side) {
    case "top":
    case "bottom":
      return basis.right;
    case "left":
      return basis.up;
    case "right":
      return vec3Scale(basis.up, -1);
    default:
      return basis.right;
  }
}

function getDimensionViewBasisFromNormal(normal: Vec3): DimensionViewBias {
  let bestBasis = dimensionViewBasises.front;
  let bestDot = -Infinity;

  for (const basis of Object.values(dimensionViewBasises)) {
    const dot = vec3Dot(normal, basis.normal);

    if (dot > bestDot) {
      bestDot = dot;
      bestBasis = basis;
    }
  }

  return bestBasis;
}

const dimensionViewBasises: Record<View, DimensionViewBias> = {
  front: { right: vec3(1, 0, 0), up: vec3(0, 1, 0), normal: vec3(0, 0, 1) },
  back: { right: vec3(-1, 0, 0), up: vec3(0, 1, 0), normal: vec3(0, 0, -1) },
  left: { right: vec3(0, 0, 1), up: vec3(0, 1, 0), normal: vec3(-1, 0, 0) },
  right: { right: vec3(0, 0, -1), up: vec3(0, 1, 0), normal: vec3(1, 0, 0) },
  top: { right: vec3(1, 0, 0), up: vec3(0, 0, -1), normal: vec3(0, 1, 0) },
  bottom: { right: vec3(1, 0, 0), up: vec3(0, 0, 1), normal: vec3(0, -1, 0) },
};

// -- Camera

export function sizeBoundsForCameraPos(size: Vec3, center: Vec3, rotation: Vec3): readonly [Vec3, Bounds3] {
  if (isZero(rotation.x) && isZero(rotation.y) && isZero(rotation.z)) {
    return [size, bounds3FromPosAndSize(center, size)];
  }

  const half = vec3Scale(size, 0.5);
  const min = vec3Sub(center, half);
  const max = vec3Add(center, half);
  const v1 = vec3Rot(vec3(min.x, min.y, max.z), center, rotation);
  const v2 = vec3Rot(vec3(max.x, min.y, max.z), center, rotation);
  const v3 = vec3Rot(vec3(max.x, max.y, max.z), center, rotation);
  const v4 = vec3Rot(vec3(min.x, max.y, max.z), center, rotation);
  const v5 = vec3Rot(vec3(min.x, min.y, min.z), center, rotation);
  const v6 = vec3Rot(vec3(max.x, min.y, min.z), center, rotation);
  const v7 = vec3Rot(vec3(max.x, max.y, min.z), center, rotation);
  const v8 = vec3Rot(vec3(min.x, max.y, min.z), center, rotation);
  const bounds = bounds3FromVec3Array([v1, v2, v3, v4, v5, v6, v7, v8]);

  return [bounds3ToSize(bounds), bounds];
}

export function rotationForCameraPos(view: View): Vec3 {
  switch (view) {
    default:
    case "front":
      return vec3Zero;
    case "back":
      return vec3(-Math.PI, 0, -Math.PI);
    case "top":
      return vec3(Math.PI / 2, 0, 0);
    case "bottom":
      return vec3(-Math.PI / 2, 0, 0);
    case "right":
      return vec3(0, -Math.PI / 2, 0);
    case "left":
      return vec3(0, Math.PI / 2, 0);
  }
}
