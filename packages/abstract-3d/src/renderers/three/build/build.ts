import {
  Box3,
  type BufferGeometry,
  Group,
  type Intersection,
  Matrix4,
  type Mesh,
  type MeshBasicMaterial,
  type Object3D,
  type Texture,
  Vector3,
  Vector4,
} from "three";
import type { PaintState, StructureState, TargetState } from "../appearance/appearance.js";
import { getHighlight, getItemColor, getMaterialClass, getTargetStates, SELECTED } from "../appearance/appearance.js";
import type { CompiledScene } from "../compile/compile.js";
import { getItemMatrix, transform } from "../compile/compile.js";
import { createSolidGeometry, getSolidShape, keepGeometries } from "../geometry/geometry.js";
import type { Selection, SelectionBox } from "../selection/selection.js";
import { createSelection, disposeSelection, setSelection } from "../selection/selection.js";
import type { GlyphAtlas } from "../text/text.js";
import type { TextureCache } from "./materials.js";
import { createClassMaterial, createImageMaterial, getImageUrl, loadSymbolStateTexture, loadTexture, symbolStatePadding } from "./materials.js";
import type { Part } from "./parts.js";
import {
  addSlotBounds,
  createImagePart,
  createLinePart,
  createSolidPart,
  createTextPart,
  cullLines,
  disposePart,
  flushPart,
  getHitSlot,
  paintSlot,
  placeSlot,
} from "./parts.js";

/** Compiled items → parts, with a slot per item, and painting, animating, culling, picking and disposing them */

export type BuildOptions = {
  readonly structure: StructureState;
  readonly activeRelations?: ReadonlyArray<string>;
  /** Geometries by shape key, shared between builds */
  readonly geometries: Map<string, BufferGeometry>;
  readonly atlas: GlyphAtlas;
  /** Without it images aren't shown */
  readonly textures?: TextureCache;
  readonly useAlphaTest?: boolean;
  readonly onTextureLoaded?: () => void;
  /** Lit by the studio, whose reflections metals show; true by default */
  readonly studio?: boolean;
};

export type BuiltScene = {
  readonly compiled: CompiledScene;
  readonly targetStates: ReadonlyArray<TargetState>;
  readonly root: Group;
  /** Holds the dimensions, shown or hidden by its `visible` */
  readonly dimensions: Group;
  readonly parts: ReadonlyArray<Part>;
  /** Each compiled item's part and slot, -1 for items not built */
  readonly partOfItem: Int32Array;
  readonly slotOfItem: Int32Array;
  readonly itemsOfPart: ReadonlyArray<ReadonlyArray<number>>;
  readonly itemsOfTarget: ReadonlyArray<ReadonlyArray<number>>;
  readonly animatedItems: ReadonlyArray<number>;
  /** Each target's painted highlight, -1 before the first paint */
  readonly highlights: Int8Array;
  /** The edges of the selected groups' boxes */
  readonly selection: Selection;
  /** Each group target's box, once it's been selected */
  readonly boxes: Array<SelectionBox | undefined>;
  readonly partOfObject: ReadonlyMap<Object3D, number>;
  readonly state: { disposed: boolean };
};

export function buildScene(compiled: CompiledScene, options: BuildOptions): BuiltScene {
  const targetStates = getTargetStates(compiled.targets, compiled.items, options.structure);
  const active = new Set(options.activeRelations);
  const groups = new Map<string, Array<number>>();
  const itemsOfTarget = compiled.targets.map((): Array<number> => []);
  const animatedItems: Array<number> = [];
  compiled.items.forEach((item, i) => {
    const target = compiled.targets[item.target]!;
    if (target.kind === "relation" && !active.has(target.relation.id)) {
      return;
    }
    // Items of the same part key are drawn by one part
    const g = item.mesh.geometry;
    const container = item.style === "dimension" ? "dimension" : "scene";
    const key =
      item.role === "solid"
        ? `${container} solid ${JSON.stringify(getMaterialClass(item, targetStates[item.target]!))}`
        : item.role === "line"
          ? `${container} line ${g.type === "Line" || g.type === "CulledLine" ? g.thickness : 0}`
          : item.role === "text"
            ? `${container} text`
            : `image ${i}`;
    const group = groups.get(key);
    if (group) {
      group.push(i);
    } else {
      groups.set(key, [i]);
    }
    itemsOfTarget[item.target]!.push(i);
    if (item.animation !== undefined) {
      animatedItems.push(i);
    }
  });

  const [root, dimensions, selection] = [new Group(), new Group(), createSelection()];
  root.add(dimensions, selection.object);
  const usedShapes = new Set<string>();
  const itemsOfPart = [...groups.values()];
  const partOfItem = new Int32Array(compiled.items.length).fill(-1);
  const slotOfItem = new Int32Array(compiled.items.length).fill(-1);
  const state = { disposed: false };
  const parts = itemsOfPart.map((indices, p) => {
    indices.forEach((i, slot) => {
      partOfItem[i] = p;
      slotOfItem[i] = slot;
    });
    const part = createPart(compiled, indices, targetStates, options, usedShapes, state);
    (compiled.items[indices[0]!]!.style === "dimension" ? dimensions : root).add(part.object);
    return part;
  });
  keepGeometries(options.geometries, usedShapes);

  const built: BuiltScene = {
    compiled,
    targetStates,
    root,
    dimensions,
    parts,
    partOfItem,
    slotOfItem,
    itemsOfPart,
    itemsOfTarget,
    animatedItems,
    highlights: new Int8Array(compiled.targets.length).fill(-1),
    selection,
    boxes: [],
    partOfObject: new Map(parts.map((part, p) => [part.object, p])),
    state,
  };
  compiled.items.forEach((item, i) => {
    if (partOfItem[i]! >= 0) {
      placeSlot(parts[partOfItem[i]!]!, slotOfItem[i]!, getItemMatrix(compiled, item, 0, world));
    }
  });
  paintScene(built, { ...options.structure, dimensionsClickable: false });
  parts.forEach((part) => flushPart(part, true));
  return built;
}

/** Repaints the targets whose highlight changed, and boxes the selected groups */
export function paintScene(built: BuiltScene, state: PaintState): void {
  const { compiled, parts, highlights } = built;
  const touched = new Set<Part>();
  let selectionChanged = false;
  for (let t = 0; t < compiled.targets.length; t++) {
    const target = compiled.targets[t]!;
    const highlight = getHighlight(target, t, state);
    if (highlight !== highlights[t]) {
      selectionChanged ||= target.kind === "group" && highlight >= SELECTED !== highlights[t]! >= SELECTED;
      highlights[t] = highlight;
      built.itemsOfTarget[t]!.forEach((i) => {
        const part = parts[built.partOfItem[i]!]!;
        paintSlot(part, built.slotOfItem[i]!, getItemColor(compiled.items[i]!, built.targetStates[t]!, highlight, color));
        touched.add(part);
      });
    }
  }
  touched.forEach((part) => flushPart(part, false));
  if (selectionChanged) {
    const boxes: Array<SelectionBox> = [];
    compiled.targets.forEach((target, t) => {
      if (target.kind === "group" && highlights[t]! >= SELECTED) {
        const box = built.boxes[t] ?? getTargetBox(built, t, target.root);
        built.boxes[t] = box;
        if (!box.bounds.isEmpty()) {
          boxes.push(box);
        }
      }
    });
    setSelection(built.selection, boxes);
  }
}

/** The bounds of the target's solids, not its symbols, texts or lines, in its top-level group's axes */
function getTargetBox(built: BuiltScene, t: number, root: number): SelectionBox {
  const matrix = built.compiled.roots[root]!;
  const inverse = new Matrix4().copy(matrix).invert();
  const bounds = new Box3();
  for (const i of built.itemsOfTarget[t]!) {
    addSlotBounds(built.parts[built.partOfItem[i]!]!, built.slotOfItem[i]!, inverse, bounds);
  }
  return { bounds, matrix };
}

/** Moves the animated items to `seconds` into their animations */
export function animateScene(built: BuiltScene, seconds: number): void {
  const touched = new Set<Part>();
  built.animatedItems.forEach((i) => {
    const part = built.parts[built.partOfItem[i]!]!;
    placeSlot(part, built.slotOfItem[i]!, getItemMatrix(built.compiled, built.compiled.items[i]!, seconds, world));
    touched.add(part);
  });
  touched.forEach((part) => flushPart(part, true));
}

export function cullScene(built: BuiltScene, cameraPosition: Vector3): void {
  built.parts.forEach((part) => cullLines(part, cameraPosition));
}

/** The shown objects that can be picked; lines aren't picked */
export function getPickables(built: BuiltScene): Array<Object3D> {
  const pickables: Array<Object3D> = [];
  built.parts.forEach((part) => {
    if (part.kind !== "line" && part.object.visible && part.object.parent?.visible !== false) {
      pickables.push(part.object);
    }
  });
  return pickables;
}

/** The index of the compiled item hit */
export function getPickedItem(built: BuiltScene, hit: Intersection): number | undefined {
  const p = built.partOfObject.get(hit.object);
  const slot = p === undefined ? undefined : getHitSlot(built.parts[p]!, hit);
  return slot === undefined ? undefined : built.itemsOfPart[p!]![slot];
}

export function disposeScene(built: BuiltScene): void {
  built.state.disposed = true;
  built.parts.forEach(disposePart);
  disposeSelection(built.selection);
  built.root.removeFromParent();
}

function createPart(
  compiled: CompiledScene,
  indices: ReadonlyArray<number>,
  targetStates: ReadonlyArray<TargetState>,
  options: BuildOptions,
  usedShapes: Set<string>,
  state: { readonly disposed: boolean }
): Part {
  const items = indices.map((i) => compiled.items[i]!);
  const first = items[0]!;
  switch (first.role) {
    case "text":
      return createTextPart(
        items.flatMap(({ mesh: { geometry: g } }) =>
          g.type === "Text" ? [{ text: g.text, fontSize: g.fontSize ?? compiled.textHeight, local: transform(g.pos, g.rot) }] : []
        ),
        options.atlas
      );
    case "line":
      return createLinePart(
        items.flatMap(({ mesh: { geometry: g } }) => (g.type === "Line" || g.type === "CulledLine" ? [g] : [])),
        first.mesh.geometry.type === "Line" || first.mesh.geometry.type === "CulledLine" ? first.mesh.geometry.thickness : 1
      );
    default: {
      const entries = items.map((item) => {
        const shape = getSolidShape(item.mesh.geometry)!;
        const geometry = options.geometries.get(shape.key) ?? createSolidGeometry(item.mesh.geometry);
        options.geometries.set(shape.key, geometry);
        usedShapes.add(shape.key);
        return { geometry, local: shape.local };
      });
      if (first.role === "solid") {
        const c = getMaterialClass(first, targetStates[first.target]!);
        const part = createSolidPart(entries, createClassMaterial(c, options.studio !== false));
        Object.assign(part.object, { castShadow: c.castShadow, receiveShadow: c.lit });
        return part;
      }
      // Images are hidden until their texture loads; a symbol in a state is drawn larger, framed and badged
      const g = first.mesh.geometry;
      const { symbolState } = targetStates[first.target]!;
      const pad = g.type === "Image" && symbolState ? 2 * symbolStatePadding * Math.min(g.size.x, g.size.y) : 0;
      const local =
        g.type === "Image" && pad ? entries[0]!.local.clone().scale(new Vector3(1 + pad / g.size.x, 1 + pad / g.size.y, 1)) : entries[0]!.local;
      const part = createImagePart(
        entries[0]!.geometry,
        local,
        createImageMaterial(first.mesh.material.backfaceCulling, options.useAlphaTest ?? true)
      );
      if (g.type === "Image" && options.textures) {
        const url = getImageUrl(g.image);
        const entry = symbolState ? loadSymbolStateTexture(options.textures, url, symbolState, g.size) : loadTexture(options.textures, url);
        if (entry.texture) {
          showImage(part.object, entry.texture, state, undefined);
        } else {
          entry.loading.then((texture) => showImage(part.object, texture, state, options.onTextureLoaded)).catch(() => undefined);
        }
      }
      return part;
    }
  }
}

function showImage(
  mesh: Mesh<BufferGeometry, MeshBasicMaterial>,
  texture: Texture | undefined,
  state: { readonly disposed: boolean },
  onLoaded: (() => void) | undefined
): void {
  if (texture && !state.disposed) {
    mesh.material.map = texture;
    mesh.material.needsUpdate = true;
    mesh.visible = true;
    onLoaded?.();
  }
}

const world = new Matrix4();
const color = new Vector4();
