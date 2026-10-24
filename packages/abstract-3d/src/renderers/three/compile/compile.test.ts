import { Matrix4, Vector3 } from "three";
import { describe, expect, it } from "vitest";
import type { Group, Scene } from "../../../abstract-3d.js";
import { alignedDimension, box, group, line, sphere, text, vec3, vec3Zero } from "../../../abstract-3d.js";
import { compileScene, getItemMatrix } from "./compile.js";

const red = { normal: "rgb(255, 0, 0)" };
const scene = (groups: ReadonlyArray<Group>, rest: Partial<Scene> = {}): Scene => ({ size_deprecated: vec3(1, 1, 1), groups, ...rest });
const apply = (m: Matrix4, x: number, y: number, z: number): ReadonlyArray<number> =>
  new Vector3(x, y, z)
    .applyMatrix4(m)
    .toArray()
    .map((v) => Math.round(v * 1000) / 1000 + 0);

describe("compileScene", () => {
  it("flattens nested groups into items with world matrices", () => {
    const inner = group([sphere(1, red)], vec3(0, 10, 0));
    const compiled = compileScene(scene([group([box(vec3(1, 1, 1), red)], vec3(100, 0, 0), vec3Zero, [inner])]));
    expect(compiled.items.map((i) => i.role)).toEqual(["solid", "solid"]);
    expect(apply(compiled.items[0].matrix, 0, 0, 0)).toEqual([100, 0, 0]);
    expect(apply(compiled.items[1].matrix, 0, 0, 0)).toEqual([100, 10, 0]);
  });

  it("applies group rotation before the group's position", () => {
    const compiled = compileScene(scene([group([box(vec3(1, 1, 1), red)], vec3(5, 0, 0), vec3(0, 0, Math.PI / 2))]));
    expect(apply(compiled.items[0].matrix, 1, 0, 0)).toEqual([5, 1, 0]);
  });

  it("rotates the scene by its deprecated rotation, then moves it by minus its deprecated center", () => {
    const g = group([box(vec3(1, 1, 1), red)], vec3(10, 0, 0));
    const centered = compileScene(scene([g], { center_deprecated: vec3(10, 0, 0) }));
    expect(apply(centered.items[0].matrix, 0, 0, 0)).toEqual([0, 0, 0]);
    const rotated = compileScene(scene([g], { center_deprecated: vec3(-10, 0, 0), rotation_deprecated: vec3(0, Math.PI, 0) }));
    expect(apply(rotated.items[0].matrix, 1, 0, 0)).toEqual([-1, 0, 0]);
  });

  it("gives every item of a top-level group that group's target, and the data of the group it's in", () => {
    const inner = group([sphere(1, red)], vec3Zero, vec3Zero, [], { part: "motor" });
    const fan = group([box(vec3(1, 1, 1), red)], vec3Zero, vec3Zero, [inner], { id: "fan" });
    const compiled = compileScene(scene([fan, group([box(vec3(1, 1, 1), red)], vec3Zero, vec3Zero, [], { id: "coil" })]), (g) => g.data?.id ?? "");
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
    expect(compiled.animations[0].speed).toEqual(vec3(0, 0, Math.PI));
    expect(compiled.items[0].animation).toBe(0);
    const world = (seconds: number): ReadonlyArray<number> => apply(getItemMatrix(compiled, compiled.items[0], seconds, new Matrix4()), 1, 0, 0);
    expect(world(0)).toEqual([11, 5, 0]);
    expect(world(0.5)).toEqual([10, 6, 0]);
  });

  it("chains nested animations", () => {
    const spin = { transform: { rot: vec3(0, 0, Math.PI), trans: vec3Zero }, duration: 1000 };
    const inner = group([box(vec3(1, 1, 1), red)], vec3(1, 0, 0), vec3Zero, [], {}, spin);
    const compiled = compileScene(scene([group([], vec3Zero, vec3Zero, [inner], {}, spin)]));
    expect(compiled.animations.map((a) => a.parent)).toEqual([undefined, 0]);
    expect(apply(getItemMatrix(compiled, compiled.items[0], 0.5, new Matrix4()), 0, 0, 0)).toEqual([0, 1, 0]);
    expect(apply(getItemMatrix(compiled, compiled.items[0], 0.5, new Matrix4()), 1, 0, 0)).toEqual([-1, 1, 0]);
  });

  it("converts aligned dimensions to dimension items with a target per dimension", () => {
    const dimension = alignedDimension(vec3Zero, vec3(1000, 0, 0), vec3(0, -100, 0), "1000", ["front"], undefined, "fan");
    const compiled = compileScene(scene([], { dimensions_deprecated: { dimensions: [dimension], material: red } }));
    const items = compiled.items.filter((i) => i.style === "dimension");
    expect(items.length).toBeGreaterThan(0);
    expect(new Set(items.map((i) => i.role))).toEqual(new Set(["line", "text", "solid"]));
    expect(compiled.targets[items[0].target]).toEqual({ kind: "dimension", id: "fan" });
  });

  it("adds relation shapes, with an outline around their boxes", () => {
    const relation = { id: "r1", pos: vec3Zero, groups: [group([box(vec3(10, 10, 10), red), sphere(1, red)], vec3(5, 0, 0))] };
    const compiled = compileScene(scene([], { relations: [relation] }));
    expect(compiled.items.map((i) => i.style)).toEqual(["relation", "outline", "relation"]);
    expect(compiled.targets[compiled.items[0].target]).toEqual({ kind: "relation", relation });
    const outline = compiled.items[1].mesh.geometry;
    expect(outline.type === "Box" && outline.size).toEqual(vec3(10.125, 10.125, 10.125));
    expect(apply(compiled.items[0].matrix, 0, 0, 0)).toEqual([5, 0, 0]);
  });

  it("keeps the world matrix of each top-level group for its tooltips", () => {
    const compiled = compileScene(scene([group([], vec3(3, 0, 0))], { center_deprecated: vec3(1, 0, 0) }));
    expect(apply(compiled.roots[0], 0, 0, 0)).toEqual([2, 0, 0]);
    expect(apply(compiled.matrix, 0, 0, 0)).toEqual([-1, 0, 0]);
  });
});
