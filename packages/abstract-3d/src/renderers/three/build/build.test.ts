import { BatchedMesh, InstancedMesh, Matrix4, PerspectiveCamera, Raycaster, Vector2, Vector3, Vector4 } from "three";
import { assert, describe, expect, it } from "vitest";
import type { Group, Scene } from "../../../abstract-3d.js";
import { alignedDimension, box, culledLine, group, sphere, text, vec3, vec3Zero } from "../../../abstract-3d.js";
import type { PaintState, StructureState } from "../appearance/appearance.js";
import type { CompiledScene } from "../compile/compile.js";
import { compileScene } from "../compile/compile.js";
import type { GlyphBitmap } from "../text/text.js";
import { createGlyphAtlas, SDF_BUFFER } from "../text/text.js";
import type { BuiltScene } from "./build.js";
import { animateScene, buildScene, cullScene, disposeScene, getPickables, getPickedItem, paintScene } from "./build.js";

const red = { normal: "rgb(255, 0, 0)" };
const blue = { normal: "rgb(0, 0, 255)", opacity: 0.5 };
const rasterize = (): GlyphBitmap => {
  const [width, height] = [20 + 2 * SDF_BUFFER, 40 + 2 * SDF_BUFFER];
  return {
    data: new Uint8ClampedArray(width * height),
    width,
    height,
    glyphWidth: 20,
    glyphHeight: 40,
    glyphLeft: 0,
    glyphTop: 30,
    glyphAdvance: 24,
  };
};
const idle: StructureState = { relationsActive: false };
const scene = (groups: ReadonlyArray<Group>, rest: Partial<Scene> = {}): Scene => ({ size_deprecated: vec3(1, 1, 1), groups, ...rest });
const part = (id: string, x: number, material = red): Group => group([box(vec3(10, 10, 10), material)], vec3(x, 0, 0), vec3Zero, [], { id });
// Destructured, as the build's and lint's compiler options disagree on reading an index signature by dot or bracket
const groupId = (g: Group): string => {
  const { id = "" }: Record<string, string | undefined> = g.data ?? {};
  return id;
};
const build = (s: Scene, structure = idle, activeRelations?: ReadonlyArray<string>): BuiltScene =>
  buildScene(compileScene(s, groupId), { structure, activeRelations, geometries: new Map(), atlas: createGlyphAtlas(rasterize, 256) });
const firstBatch = (built: BuiltScene): BatchedMesh => {
  const [batch] = batches(built);
  assert(batch);
  return batch;
};
const relation = (id: string): NonNullable<Scene["relations"]>[number] => ({ id, pos: vec3Zero, groups: [group([box(vec3(1, 1, 1), red)])] });
const batches = (built: BuiltScene): ReadonlyArray<BatchedMesh> => built.root.children.filter((o): o is BatchedMesh => o instanceof BatchedMesh);

/** The id of the group under the screen center for a camera at `x` looking down -z */
function pickId(built: BuiltScene, x: number): string | undefined {
  const camera = new PerspectiveCamera(45, 1, 1, 1000);
  camera.position.set(x, 0, 100);
  camera.updateMatrixWorld();
  built.root.updateMatrixWorld();
  const raycaster = new Raycaster();
  raycaster.setFromCamera(new Vector2(0, 0), camera);
  const hits = raycaster.intersectObjects(getPickables(built), false);
  const hit = hits.at(0);
  const item = hit && getPickedItem(built, hit);
  const { compiled }: { readonly compiled: CompiledScene } = built;
  const target = item === undefined ? undefined : compiled.targets[compiled.items.at(item)?.target ?? -1];
  return target?.kind === "group" || target?.kind === "dimension" ? target.id : undefined;
}

describe("buildScene", () => {
  it("draws solids of one material class in one batch, whatever their geometry", () => {
    const built = build(scene([part("a", 0), part("b", 20), group([sphere(5, red)], vec3(40, 0, 0)), part("c", 60, blue)]));
    expect(batches(built).map((b) => b.instanceCount)).toEqual([3, 1]);
    expect(built.parts).toHaveLength(2);
  });

  it("picks the group under the pointer", () => {
    const built = build(scene([part("a", 0), part("b", 20)]));
    expect([pickId(built, 0), pickId(built, 20), pickId(built, 100)]).toEqual(["a", "b", undefined]);
  });

  it("picks text by its glyphs", () => {
    const built = build(scene([group([text(vec3Zero, "AB", 10, red)], vec3Zero, vec3Zero, [], { id: "label" })]));
    expect(built.root.children.some((o) => o instanceof InstancedMesh)).toBe(true);
    expect(pickId(built, 0)).toBe("label");
  });

  it("repaints the hovered targets, not the selected ones", () => {
    const built = build(scene([part("a", 0), part("b", 20)]));
    const batch = firstBatch(built);
    const color = (instance: number): ReadonlyArray<number> =>
      batch
        .getColorAt(instance, new Vector4())
        .toArray()
        .map((v) => Math.round(v * 100) / 100);
    const before = color(1);
    const state: PaintState = { ...idle, dimensionsClickable: true, hoveredTarget: 1 };
    paintScene(built, state);
    expect(color(1)).not.toEqual(before);
    expect(color(0)).toEqual([1, 0, 0, 1]);
    paintScene(built, { ...state, hoveredTarget: undefined, selectedIds: { a: true } });
    expect(color(1)).toEqual(before);
    expect(color(0)).toEqual([1, 0, 0, 1]);
  });

  it("boxes the selected groups on their solids' bounds, in their top-level group's axes, tinted, with their edges", () => {
    const turned = group([box(vec3(10, 20, 30), red, vec3(5, 0, 0))], vec3(100, 0, 0), vec3(0, Math.PI / 2, 0), [], { id: "a" });
    const built = build(scene([turned, part("b", 20)]));
    const state: PaintState = { ...idle, dimensionsClickable: true };
    expect(built.selection.object.visible).toBe(false);
    paintScene(built, { ...state, selectedIds: { a: true } });
    expect([built.selection.object.visible, built.selection.volumes.children.length]).toEqual([true, 1]);
    const start = built.selection.front.geometry.getAttribute("instanceStart");
    const end = built.selection.front.geometry.getAttribute("instanceEnd");
    expect(start.count).toBe(12);
    // The box from x 0 to 10, y -10 to 10 and z -15 to 15, turned a quarter around y and moved to x 100
    const points = [start, end].flatMap((a) =>
      Array.from({ length: a.count }, (_, i) => new Vector3().fromBufferAttribute(a, i).round().toArray().join())
    );
    expect(new Set(points)).toEqual(
      new Set(["85,-10,0", "115,-10,0", "85,10,0", "115,10,0", "85,-10,-10", "115,-10,-10", "85,10,-10", "115,10,-10"])
    );
    paintScene(built, { ...state, selectedIds: {} });
    expect(built.selection.object.visible).toBe(false);
  });

  it("boxes a selected group on its own bounds, where it has them, in its axes", () => {
    const turned: Group = {
      ...group([box(vec3(10, 20, 30), red)], vec3(100, 0, 0), vec3(0, Math.PI / 2, 0), [], { id: "a" }),
      bounds: { min: vec3(-20, -10, -15), max: vec3(20, 10, 15) },
    };
    const built = build(scene([turned]));
    paintScene(built, { ...idle, dimensionsClickable: true, selectedIds: { a: true } });
    const start = built.selection.front.geometry.getAttribute("instanceStart");
    const xs = Array.from({ length: start.count }, (_, i) => Math.round(new Vector3().fromBufferAttribute(start, i).z));
    // Its x from -20 to 20, turned a quarter around y, is z from 20 to -20
    expect([Math.min(...xs), Math.max(...xs)]).toEqual([-20, 20]);
  });

  it("keeps dimensions in their own group, and doesn't pick hidden ones", () => {
    // Its text, the empty scene's 32 high, is centered a gap and half its height out from the line, over the origin
    const dimension = alignedDimension(vec3(-500, 100, 0), vec3(500, 100, 0), vec3(0, 30, 0), "1000", ["front"], undefined, "dim");
    const built = build(scene([], { dimensions_deprecated: { dimensions: [dimension], material: red } }));
    expect(built.dimensions.children.length).toBeGreaterThan(0);
    expect(pickId(built, 0)).toBe("dim");
    built.dimensions.visible = false;
    expect(pickId(built, 0)).toBeUndefined();
  });

  it("builds the active relations only", () => {
    const s = scene([], { relations: [relation("r1"), relation("r2")] });
    expect(build(s).parts).toHaveLength(0);
    // A relation's box and its outline
    expect(batches(build(s, { relationsActive: true }, ["r1"])).map((b) => b.instanceCount)).toEqual([1, 1]);
  });

  it("fades and moves disabled groups to a transparent batch", () => {
    const built = build(scene([part("a", 0), part("b", 20)]), { relationsActive: true, activeComponents: { b: "Accept" } });
    expect(batches(built).map((b) => [b.instanceCount, b.material.transparent])).toEqual([
      [1, true],
      [1, false],
    ]);
  });

  it("animates the instances of animated groups", () => {
    const spin = { transform: { rot: vec3(0, 0, Math.PI), trans: vec3Zero }, duration: 1000 };
    const built = build(scene([group([box(vec3(1, 1, 1), red)], vec3(5, 0, 0), vec3Zero, [], {}, spin)]));
    expect(built.animatedItems).toHaveLength(1);
    animateScene(built, 0.5);
    const position = new Vector3(1, 0, 0).applyMatrix4(firstBatch(built).getMatrixAt(0, new Matrix4()));
    expect(position.toArray().map((v) => Math.round(v * 1000) / 1000 + 0)).toEqual([5, 1, 0]);
  });

  it("doesn't draw culled lines that face away from the camera", () => {
    const built = build(
      scene([
        group([culledLine(vec3(0, 0, 0), vec3(10, 0, 0), vec3(0, 0, 1), 1, red), culledLine(vec3(0, 0, 0), vec3(20, 0, 0), vec3(0, 0, -1), 1, red)]),
      ])
    );
    const line = built.parts.find((p) => p.kind === "line")!;
    const endX = (): number => (line.object.geometry.getAttribute("instanceEnd") as unknown as { readonly getX: (i: number) => number }).getX(0);
    cullScene(built, new Vector3(0, 0, -100));
    expect([line.object.geometry.instanceCount, endX()]).toEqual([1, 20]);
    cullScene(built, new Vector3(0, 0, 100));
    expect([line.object.geometry.instanceCount, endX()]).toEqual([1, 10]);
  });

  it("disposes its batches and materials", () => {
    const built = build(scene([part("a", 0)]));
    const disposed: Array<string> = [];
    firstBatch(built).material.addEventListener("dispose", () => disposed.push("material"));
    disposeScene(built);
    expect(disposed).toEqual(["material"]);
  });
});
