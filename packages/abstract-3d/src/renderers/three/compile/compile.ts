import { Euler, Matrix4, Quaternion, Vector3 } from "three";
import type { Group, Mesh, Relation, Scene, Vec3 } from "../../../abstract-3d.js";
import { dimensionConvertToTypeMesh, vec3, vec3Scale, vec3Zero } from "../../../abstract-3d.js";

/**
 * Scene → flat items with world matrices, with no GPU objects, so everything here is testable in Node; groups transform as the r3f renderer's
 * react-group.tsx
 */

/** How the item's geometry is drawn */
export type Role = "solid" | "text" | "line" | "image";
/** What the item belongs to, which decides its material and whether it's shown */
export type Style = "group" | "dimension" | "relation" | "outline";

/** What a pointer event on an item is about, and what hover and selection apply to */
export type Target =
  | { readonly kind: "group"; readonly id: string; readonly root: number; readonly rootData: Record<string, string> | undefined }
  | { readonly kind: "dimension"; readonly id: string | undefined }
  | { readonly kind: "relation"; readonly relation: Relation };

export type Item = {
  readonly mesh: Mesh;
  readonly role: Role;
  readonly style: Style;
  /** World matrix, or for an animated item its matrix relative to its animation's group */
  readonly matrix: Matrix4;
  readonly target: number;
  /** The data of the group the mesh is in */
  readonly data: Record<string, string> | undefined;
  readonly animation: number | undefined;
};

export type Animation = {
  readonly parent: number | undefined;
  /** The matrix of the group's parent, in world space or relative to the parent animation's group */
  readonly base: Matrix4;
  readonly pos: Vec3;
  readonly rot: Vec3;
  /** Radians per second around x, y and z */
  readonly speed: Vec3;
};

export type CompiledScene = {
  readonly items: ReadonlyArray<Item>;
  readonly targets: ReadonlyArray<Target>;
  readonly animations: ReadonlyArray<Animation>;
  /** World matrix of the scene's root, from its deprecated center and rotation */
  readonly matrix: Matrix4;
  /** World matrix of each top-level group */
  readonly roots: ReadonlyArray<Matrix4>;
};

type Output = { readonly items: Array<Item>; readonly animations: Array<Animation> };
type ItemBase = Pick<Item, "style" | "target" | "data" | "animation">;

const outlineScale = 1.0125;

/** Targets are the top-level groups, then the dimensions, then the relations */
export function compileScene(scene: Scene, createGroupId?: (g: Group) => string): CompiledScene {
  const out: Output = { items: [], animations: [] };
  const center = scene.center_deprecated ?? vec3Zero;
  const matrix = new Matrix4().makeTranslation(-center.x, -center.y, -center.z).multiply(transform(vec3Zero, scene.rotation_deprecated));
  const dimensions = scene.dimensions_deprecated?.dimensions ?? [];
  const relations = scene.relations ?? [];
  const targets: ReadonlyArray<Target> = [
    ...scene.groups.map((g, root): Target => ({ kind: "group", id: createGroupId?.(g) ?? "", root, rootData: g.data })),
    ...dimensions.map((d): Target => ({ kind: "dimension", id: d.id })),
    ...relations.map((relation): Target => ({ kind: "relation", relation })),
  ];
  scene.groups.forEach((g, i) => addGroup(out, g, matrix, undefined, "group", i));
  dimensions.forEach((dimension, i) => {
    const mesh = dimensionConvertToTypeMesh(dimension, scene.rotation_deprecated ?? vec3Zero, scene.dimensions_deprecated?.material);
    const base = { style: "dimension", target: scene.groups.length + i, data: undefined, animation: undefined } as const;
    addMeshes(out, mesh.meshes, matrix.clone().multiply(transform(mesh.pos, mesh.rot)), base);
  });
  relations.forEach((relation, i) =>
    relation.groups?.forEach((g) => addGroup(out, g, matrix, undefined, "relation", scene.groups.length + dimensions.length + i))
  );
  return { ...out, targets, matrix, roots: scene.groups.map((g) => matrix.clone().multiply(transform(g.pos, g.rot))) };
}

function addGroup(out: Output, g: Group, parent: Matrix4, parentAnimation: number | undefined, style: "group" | "relation", target: number): void {
  const animation = g.animation ? out.animations.push(createAnimation(g, parent, parentAnimation)) - 1 : parentAnimation;
  // An animated group's items are relative to it, so its animation can move them
  const matrix = g.animation ? new Matrix4() : parent.clone().multiply(transform(g.pos, g.rot));
  addMeshes(out, g.meshes ?? [], matrix, { style, target, data: g.data, animation });
  g.groups?.forEach((child) => addGroup(out, child, matrix, animation, style, target));
}

function addMeshes(out: Output, meshes: ReadonlyArray<Mesh>, matrix: Matrix4, base: ItemBase): void {
  meshes.forEach((mesh) => {
    out.items.push({ ...base, mesh, role: getRole(mesh), matrix });
    if (base.style === "relation" && mesh.geometry.type === "Box") {
      const outline = { ...mesh, geometry: { ...mesh.geometry, size: vec3Scale(mesh.geometry.size, outlineScale) } };
      out.items.push({ ...base, style: "outline", mesh: outline, role: "solid", matrix });
    }
  });
}

/** The item's world matrix at `seconds` into its animations, written to `out` */
export function getItemMatrix(compiled: CompiledScene, item: Item, seconds: number, out: Matrix4): Matrix4 {
  return item.animation === undefined
    ? out.copy(item.matrix)
    : getAnimationMatrix(compiled.animations, item.animation, seconds, out).multiply(item.matrix);
}

function getAnimationMatrix(animations: ReadonlyArray<Animation>, index: number, seconds: number, out: Matrix4): Matrix4 {
  const a = animations[index]!;
  const rot = vec3(a.rot.x + a.speed.x * seconds, a.rot.y + a.speed.y * seconds, a.rot.z + a.speed.z * seconds);
  out.copy(a.base).multiply(transform(a.pos, rot, scratch));
  return a.parent === undefined ? out : out.premultiply(getAnimationMatrix(animations, a.parent, seconds, new Matrix4()));
}

/** The r3f renderer turned an animated group by its rotation per duration in milliseconds */
function createAnimation(g: Group, parent: Matrix4, parentAnimation: number | undefined): Animation {
  const { rot } = g.animation!.transform;
  const perSecond = 1000 / g.animation!.duration;
  return {
    parent: parentAnimation,
    base: parent.clone(),
    pos: g.pos,
    rot: g.rot ?? vec3Zero,
    speed: vec3(rot.x * perSecond, rot.y * perSecond, rot.z * perSecond),
  };
}

function getRole(mesh: Mesh): Role {
  switch (mesh.geometry.type) {
    case "Text":
      return "text";
    case "Line":
    case "CulledLine":
      return "line";
    case "Image":
      return "image";
    default:
      return "solid";
  }
}

const scratch = new Matrix4();
const euler = new Euler();
const quaternion = new Quaternion();
const position = new Vector3();
const scale = new Vector3();

/** Translation, then XYZ Euler rotation, then scale, as on a three.js Object3D */
export function transform(pos: Vec3, rot: Vec3 | undefined, out = new Matrix4(), size?: Vec3): Matrix4 {
  quaternion.setFromEuler(euler.set(rot?.x ?? 0, rot?.y ?? 0, rot?.z ?? 0));
  return out.compose(position.set(pos.x, pos.y, pos.z), quaternion, scale.set(size?.x ?? 1, size?.y ?? 1, size?.z ?? 1));
}
