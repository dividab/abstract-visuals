import { Color, Vector4 } from "three";
import { assert, describe, expect, it } from "vitest";
import type { Material, Mesh } from "../../../abstract-3d.js";
import { box, line, text, vec3, vec3Zero } from "../../../abstract-3d.js";
import { shade } from "../../../utils.js";
import type { Item, Style, Target } from "../compile/compile.js";
import type { MaterialClass, PaintState } from "./appearance.js";
import { getHighlight, getItemColor, getMaterialClass, getTargetStates, HOVERED, SELECTED } from "./appearance.js";

const red = "rgb(255, 0, 0)";
const select = "rgb(14,82,184)";
const item = (mesh: Mesh, style: Style = "group", role: Item["role"] = "solid"): Item => ({
  mesh,
  role,
  style,
  matrix: undefined!,
  target: 0,
  data: undefined,
  animation: undefined,
});
const solid = (material: Material, style: Style = "group"): Item => item(box(vec3(1, 1, 1), material), style);
const group: Target = { kind: "group", id: "fan", root: 0, rootData: undefined };
const relation: Target = { kind: "relation", relation: { id: "r", pos: vec3Zero } };
const idle: PaintState = { relationsActive: false, dimensionsClickable: true };
const round = (v: number): number => Math.round(v * 1e4) / 1e4;
const rgba = (color: string, alpha = 1): ReadonlyArray<number> => [...new Color(color).toArray(), alpha].map(round);
const classify = (i: Item, target: Target, state: Partial<PaintState> = {}): MaterialClass => {
  const [targetState] = getTargetStates([target], { ...idle, ...state });
  assert(targetState);
  return getMaterialClass(i, targetState);
};
const paint = (i: Item, target: Target, partial: Partial<PaintState> = {}): ReadonlyArray<number> => {
  const state = { ...idle, ...partial };
  const [targetState] = getTargetStates([target], state);
  assert(targetState);
  return getItemColor(i, targetState, getHighlight(target, 0, state), new Vector4())
    .toArray()
    .map(round);
};

describe("getMaterialClass", () => {
  it("lights solids, with the material's metalness, roughness and side", () => {
    expect(classify(solid({ normal: red, metalness: 0.3, roughness: 0.7 }), group)).toEqual({
      lit: true,
      metalness: 0.3,
      roughness: 0.7,
      side: "double",
      transparent: false,
      castShadow: true,
    });
    expect(classify(solid({ normal: red, backfaceCulling: true }), group)).toMatchObject({ side: "front", metalness: 0, roughness: 1 });
  });

  it("casts shadows from opaque solids unless their material turns it off, e.g. for symbols", () => {
    expect(classify(solid({ normal: red, castShadow: false }), group).castShadow).toBe(false);
    expect(classify(solid({ normal: red, opacity: 0.5 }), group).castShadow).toBe(false);
    expect(classify(solid({ normal: red }), group, { relationsActive: true }).castShadow).toBe(false);
    expect(classify(solid({ normal: red }, "relation"), relation, { relationsActive: true }).castShadow).toBe(false);
  });

  it("gives solids of a type its finish, in one class whatever their color, their own metalness and roughness over it, unless a material state replaces it", () => {
    const painted = classify(solid({ normal: red, type: "painted" }), group);
    expect(painted).toMatchObject({ lit: true, type: "painted", metalness: undefined, roughness: undefined });
    expect(classify(solid({ normal: "rgb(0,0,255)", type: "painted" }), group)).toEqual(painted);
    expect(classify(solid({ normal: red, type: "painted", metalness: 0.9 }), group)).toMatchObject({
      type: "painted",
      metalness: 0.9,
      roughness: undefined,
    });
    expect(classify(solid({ normal: red, type: "painted" }), group, { activeComponents: { fan: "Accept" } }).type).toBeUndefined();
  });

  it("ignores a type that isn't a material type, e.g. a number from a database", () => {
    const fromDatabase = { normal: red, metalness: 0.3, roughness: 0.7, type: 2 } as unknown as Material;
    expect(classify(solid(fromDatabase), group)).toMatchObject({ metalness: 0.3, roughness: 0.7 });
    expect(classify(solid(fromDatabase), group).type).toBeUndefined();
  });

  it("makes glass see-through unless its material has an opacity", () => {
    expect(classify(solid({ normal: red, type: "glass" }), group).transparent).toBe(true);
    expect(paint(solid({ normal: red, type: "glass" }), group)).toEqual(rgba(red, 0.25));
    expect(classify(solid({ normal: red, type: "glass", opacity: 1 }), group).transparent).toBe(false);
  });

  it("makes translucent materials and disabled groups transparent", () => {
    expect(classify(solid({ normal: red, opacity: 0.5 }), group).transparent).toBe(true);
    expect(classify(solid({ normal: red }), group, { relationsActive: true }).transparent).toBe(true);
    expect(classify(solid({ normal: red }), group, { relationsActive: true, activeComponents: { fan: "Accept" } }).transparent).toBe(false);
  });

  it("uses the material state's metalness and roughness", () => {
    expect(classify(solid({ normal: red }), group, { activeComponents: { fan: "Error" } })).toMatchObject({ metalness: 0.5, roughness: 0.5 });
  });

  it("draws relations unlit on both sides, and their outlines on the back", () => {
    expect(classify(solid({ normal: red }, "relation"), relation)).toMatchObject({ lit: false, side: "double", transparent: false });
    expect(classify(solid({ normal: red }, "outline"), relation)).toMatchObject({ lit: false, side: "back" });
  });
});

describe("getHighlight", () => {
  it("combines hover by the pointer or by id with selection", () => {
    expect(getHighlight(group, 0, idle)).toBe(0);
    expect(getHighlight(group, 0, { ...idle, hoveredTarget: 1 })).toBe(0);
    expect(getHighlight(group, 0, { ...idle, hoveredTarget: 0, selectedIds: { fan: true } })).toBe(HOVERED + SELECTED);
    expect(getHighlight(group, 0, { ...idle, hoveredIds: new Set(["fan"]) })).toBe(HOVERED);
  });
});

describe("getItemColor", () => {
  it("is the material's color and opacity", () => {
    expect(paint(solid({ normal: red, opacity: 0.5 }), group)).toEqual(rgba(red, 0.5));
  });

  it("darkens hovered groups, by the pointer or by id, and colors selected ones", () => {
    expect(paint(solid({ normal: red }), group, { hoveredTarget: 0 })).toEqual(rgba(shade(-0.4, red)!));
    expect(paint(solid({ normal: red }), group, { hoveredIds: new Set(["fan"]) })).toEqual(rgba(shade(-0.4, red)!));
    expect(paint(solid({ normal: red }), group, { selectedIds: { fan: true } })).toEqual(rgba(select));
    expect(paint(solid({ normal: red }), group, { selectedIds: { fan: true }, hoveredTarget: 0 })).toEqual(rgba(shade(-0.4, select)!));
  });

  it("ignores hover by id for groups without an id", () => {
    expect(paint(solid({ normal: red }), { ...group, id: "" }, { hoveredIds: new Set([""]) })).toEqual(rgba(red));
  });

  it("colors groups by their material state and fades disabled ones", () => {
    expect(paint(solid({ normal: red }), group, { activeComponents: { fan: "Accept" } })).toEqual(rgba("rgb(0,148,91)"));
    expect(paint(solid({ normal: red, opacity: 0.8 }), group, { relationsActive: true })).toEqual(rgba(red, 0.1));
  });

  it("selects text in a dark blue", () => {
    expect(paint(item(text(vec3Zero, "A", 1, { normal: red }), "group", "text"), group, { selectedIds: { fan: true } })).toEqual(
      rgba("rgb(0, 26, 65)")
    );
  });

  it("outlines relations in black, also while hovered", () => {
    expect(paint(solid({ normal: "rgb(0,148,91)" }, "outline"), relation)).toEqual(rgba("rgb(0, 0, 0)"));
    expect(paint(solid({ normal: "rgb(0,148,91)" }, "outline"), relation, { hoveredTarget: 0 })).toEqual(rgba("rgb(0, 0, 0)"));
  });

  it("keeps lines in their material's color", () => {
    expect(paint(item(line(vec3Zero, vec3(1, 0, 0), 1, { normal: red }), "group", "line"), group, { selectedIds: { fan: true } })).toEqual(rgba(red));
  });

  it("highlights clickable dimensions when hovered or selected", () => {
    const dimension: Target = { kind: "dimension", id: "fan" };
    const d = solid({ normal: red }, "dimension");
    expect(paint(d, dimension, { hoveredTarget: 0 })).toEqual(rgba(select));
    expect(paint(d, dimension, { selectedIds: { fan: true } })).toEqual(rgba(select));
    expect(paint(d, dimension, { selectedIds: { fan: true }, dimensionsClickable: false })).toEqual(rgba(red));
    expect(paint(d, dimension, { selectedIds: { fan: true }, relationsActive: true })).toEqual(rgba(red));
  });

  it("darkens hovered relations", () => {
    expect(paint(solid({ normal: red }, "relation"), relation, { hoveredTarget: 0 })).toEqual(rgba(shade(-0.4, red)!));
  });
});
