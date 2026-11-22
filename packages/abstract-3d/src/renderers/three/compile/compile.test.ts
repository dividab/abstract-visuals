import { Matrix4, Vector3 } from "three";
import { assert, describe, expect, it } from "vitest";
import type { Group, Scene } from "../../../abstract-3d.js";
import { alignedDimension, bounds3FromPosAndSize, box, group, line, sphere, text, vec3, vec3Zero } from "../../../abstract-3d.js";
import type { CompiledScene, Item } from "./compile.js";
import { compileScene, getItemMatrix } from "./compile.js";

const red = { normal: "rgb(255, 0, 0)" };
const scene = (groups: ReadonlyArray<Group>, rest: Partial<Scene> = {}): Scene => ({
  bounds: bounds3FromPosAndSize(vec3Zero, vec3(1, 1, 1)),
  groups,
  ...rest,
});
const apply = (m: Matrix4 | undefined, x: number, y: number, z: number): ReadonlyArray<number> => {
  assert(m);
  return new Vector3(x, y, z)
    .applyMatrix4(m)
    .toArray()
    .map((v) => Math.round(v * 1000) / 1000 + 0);
};
const getItem = (compiled: CompiledScene, index: number): Item => {
  const item = compiled.items.at(index);
  assert(item);
  return item;
};
// Destructured, as the build's and lint's compiler options disagree on reading an index signature by dot or bracket
const groupId = (g: Group): string => {
  const { id = "" }: Record<string, string | undefined> = g.data ?? {};
  return id;
};

describe("compileScene", () => {
  it("flattens nested groups into items with world matrices", () => {
    const inner = group([sphere(1, red)], vec3(0, 10, 0));
    const compiled = compileScene(scene([group([box(vec3(1, 1, 1), red)], vec3(100, 0, 0), vec3Zero, [inner])]));
    expect(compiled.items.map((i) => i.role)).toEqual(["solid", "solid"]);
    expect(apply(compiled.items.at(0)?.matrix, 0, 0, 0)).toEqual([100, 0, 0]);
    expect(apply(compiled.items.at(1)?.matrix, 0, 0, 0)).toEqual([100, 10, 0]);
  });

  it("applies group rotation before the group's position", () => {
    const compiled = compileScene(scene([group([box(vec3(1, 1, 1), red)], vec3(5, 0, 0), vec3(0, 0, Math.PI / 2))]));
    expect(apply(compiled.items.at(0)?.matrix, 1, 0, 0)).toEqual([5, 1, 0]);
  });

  it("moves the scene by minus its bounds' center", () => {
    const g = group([box(vec3(1, 1, 1), red)], vec3(10, 0, 0));
    const centered = compileScene(scene([g], { bounds: bounds3FromPosAndSize(vec3(10, 0, 0), vec3(1, 1, 1)) }));
    expect(apply(centered.items.at(0)?.matrix, 0, 0, 0)).toEqual([0, 0, 0]);
  });

  it("gives every item of a top-level group that group's target, and the data of the group it's in", () => {
    const inner = group([sphere(1, red)], vec3Zero, vec3Zero, [], { part: "motor" });
    const fan = group([box(vec3(1, 1, 1), red)], vec3Zero, vec3Zero, [inner], { id: "fan" });
    const compiled = compileScene(scene([fan, group([box(vec3(1, 1, 1), red)], vec3Zero, vec3Zero, [], { id: "coil" })]), groupId);
    expect(compiled.targets).toEqual([
      { kind: "group", id: "fan", root: 0, rootData: { id: "fan" } },
      { kind: "group", id: "coil", root: 1, rootData: { id: "coil" } },
    ]);
    expect(compiled.items.map((i) => [i.target, i.data])).toEqual([
      [0, { id: "fan" }],
      [0, { part: "motor" }],
      [1, { id: "coil" }],
    ]);
  });

  it("gives groups an empty id without createGroupId", () => {
    const compiled = compileScene(scene([group([box(vec3(1, 1, 1), red)])]));
    expect(compiled.targets[0]).toMatchObject({ kind: "group", id: "" });
  });

  it("assigns roles by geometry type", () => {
    const g = group([box(vec3(1, 1, 1), red), text(vec3Zero, "A", 10, red), line(vec3Zero, vec3(1, 0, 0), 1, red)]);
    expect(compileScene(scene([g])).items.map((i) => i.role)).toEqual(["solid", "text", "line"]);
  });

  it("makes items of animated groups relative to an animation that rotates the group", () => {
    const fan = group(
      [box(vec3(1, 1, 1), red)],
      vec3(0, 5, 0),
      vec3Zero,
      [],
      {},
      { transform: { rot: vec3(0, 0, Math.PI), trans: vec3Zero }, duration: 1000 }
    );
    const compiled = compileScene(scene([group([], vec3(10, 0, 0), vec3Zero, [fan])]));
    expect(compiled.animations).toHaveLength(1);
    expect(compiled.animations.at(0)?.speed).toEqual(vec3(0, 0, Math.PI));
    expect(compiled.items.at(0)?.animation).toBe(0);
    const world = (seconds: number): ReadonlyArray<number> => apply(getItemMatrix(compiled, getItem(compiled, 0), seconds, new Matrix4()), 1, 0, 0);
    expect(world(0)).toEqual([11, 5, 0]);
    expect(world(0.5)).toEqual([10, 6, 0]);
  });

  it("chains nested animations", () => {
    const spin = { transform: { rot: vec3(0, 0, Math.PI), trans: vec3Zero }, duration: 1000 };
    const inner = group([box(vec3(1, 1, 1), red)], vec3(1, 0, 0), vec3Zero, [], {}, spin);
    const compiled = compileScene(scene([group([], vec3Zero, vec3Zero, [inner], {}, spin)]));
    expect(compiled.animations.map((a) => a.parent)).toEqual([undefined, 0]);
    expect(apply(getItemMatrix(compiled, getItem(compiled, 0), 0.5, new Matrix4()), 0, 0, 0)).toEqual([0, 1, 0]);
    expect(apply(getItemMatrix(compiled, getItem(compiled, 0), 0.5, new Matrix4()), 1, 0, 0)).toEqual([-1, 1, 0]);
  });

  it("converts aligned dimensions to dimension items with a target per dimension", () => {
    const dimension = alignedDimension(vec3Zero, vec3(1000, 0, 0), vec3(0, -100, 0), "1000", ["front"], undefined, "fan");
    const compiled = compileScene(scene([], { dimensions: { dimensions: [dimension], material: red } }));
    const items = compiled.items.filter((i) => i.style === "dimension");
    expect(items.length).toBeGreaterThan(0);
    expect(new Set(items.map((i) => i.role))).toEqual(new Set(["line", "text", "solid"]));
    expect(compiled.targets[items.at(0)?.target ?? -1]).toEqual({ kind: "dimension", id: "fan" });
  });

  it("adds relation shapes, their boxes as slabs with rounded corners across their thinnest side, with an outline around them", () => {
    const relation = { id: "r1", pos: vec3Zero, groups: [group([box(vec3(2, 10, 20), red), sphere(1, red)], vec3(5, 0, 0))] };
    const compiled = compileScene(scene([], { relations: [relation] }));
    expect(compiled.items.map((i) => i.style)).toEqual(["relation", "outline", "relation"]);
    expect(compiled.targets[getItem(compiled, 0).target]).toEqual({ kind: "relation", relation });
    const slab = getItem(compiled, 0).mesh.geometry;
    assert(slab.type === "Shape");
    // Across x, its 20 along z and 10 along y, its corners rounded by 0.04 of 10
    expect(slab.thickness).toBe(2);
    expect([Math.max(...slab.points.map((p) => p.x)), Math.max(...slab.points.map((p) => p.y))]).toEqual([10, 5]);
    expect(slab.points.some((p) => Math.abs(p.x) === 10 && Math.abs(p.y) === 5)).toBe(false);
    const outline = getItem(compiled, 1).mesh.geometry;
    // Past it by 0.08 of the empty scene's 32 high text on every side
    expect(outline.type === "Shape" && outline.thickness).toBeCloseTo(2 + 2 * 0.08 * 32);
    expect(apply(compiled.items.at(0)?.matrix, 0, 0, 0)).toEqual([5, 0, 0]);
  });

  it("keeps the world matrix of each top-level group for its tooltips", () => {
    const compiled = compileScene(scene([group([], vec3(3, 0, 0))], { bounds: bounds3FromPosAndSize(vec3(1, 0, 0), vec3(1, 1, 1)) }));
    expect(apply(compiled.roots.at(0), 0, 0, 0)).toEqual([2, 0, 0]);
    expect(apply(compiled.matrix, 0, 0, 0)).toEqual([-1, 0, 0]);
  });
});
