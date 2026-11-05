import { describe, expect, it } from "vitest";
import type { DimensionAligned } from "./abstract-3d.js";
import { alignedDimension, dimensionConvertToTypeMesh, dimensionPlacements, vec3, vec3Zero } from "./abstract-3d.js";

// A dimension along x measured from `from` to `to`, its line at y, 110 and 220 out as products' rows
const dim = (from: number, to: number, y = -110): DimensionAligned =>
  alignedDimension(vec3(from, 0, 0), vec3(to, 0, 0), vec3(0, y, 0), `${Math.abs(to - from)}`, ["front"]);

const inside = { type: "inside" } as const;
const dot = { type: "dot" } as const;
// The sizes are shares of the text height, so not exact
const outside = { type: "outside", tail: expect.closeTo(60) } as const;

describe("dimensionPlacements", () => {
  it("draws the arrows inside and the text between them when both fit", () => {
    expect(dimensionPlacements([dim(0, 1000)])).toMatchObject([{ start: inside, end: inside, text: inside }]);
  });

  it("draws the arrows outside when only the text fits between them", () => {
    expect(dimensionPlacements([dim(0, 120)])).toMatchObject([{ start: outside, end: outside, text: inside }]);
  });

  it("draws the text past the end when it doesn't fit either, past the start of a dimension measured the other way", () => {
    expect(dimensionPlacements([dim(0, 40), dim(40, 0, -400)])).toMatchObject([
      { start: outside, end: outside, text: { type: "end" } },
      { start: outside, end: outside, text: { type: "start" } },
    ]);
  });

  it("draws a dot where a neighbour on the same line shares the extension line", () => {
    expect(dimensionPlacements([dim(0, 1200), dim(1200, 1240), dim(1240, 2040)]).at(1)).toMatchObject({ start: dot, end: dot });
    expect(dimensionPlacements([dim(0, 1200), dim(1200, 1240)]).at(1)).toMatchObject({ start: dot, end: outside, text: { type: "end" } });
  });

  it("leaves room for a dot's radius when fitting the text between the arrows", () => {
    expect(dimensionPlacements([dim(0, 60), dim(60, 1000)]).at(0)).toMatchObject({ start: outside, end: dot, text: { type: "start" } });
  });

  it("cuts an outside arrow's tail short a gap before what's taken past it, and draws a dot where not even the arrow fits", () => {
    // The 0-120's outside arrow's tail goes to 180, a gap before it
    expect(dimensionPlacements([dim(0, 120), dim(240, 250)]).at(1)?.start).toEqual({ type: "outside", tail: expect.closeTo(240 - 180 - 8) });
    expect(dimensionPlacements([dim(0, 120), dim(200, 210)]).at(1)?.start).toEqual(dot);
  });

  // From the dimension's middle to the lifted text's: half the 40, a gap, the two characters and a gap
  const liftedAlong = 20 + (2 * 0.4815 * 44 + 16) / 2;

  it("lifts the text off the line before the start into the room before the next line out when there's no room on the line", () => {
    const [, middle] = dimensionPlacements([dim(0, 1200), dim(1200, 1240), dim(1240, 2040), dim(0, 2040, -220)]);
    expect(middle).toMatchObject({ start: dot, end: dot, text: { type: "lifted", along: expect.closeTo(-liftedAlong) } });
  });

  it("lifts the text past the end when the next line out's extension line is in the way before the start", () => {
    const [, middle] = dimensionPlacements([dim(0, 1200), dim(1200, 1240), dim(1240, 2040), dim(1190, 2040, -220), dim(0, 1190, -220)]);
    expect(middle?.text).toEqual({ type: "lifted", along: expect.closeTo(liftedAlong) });
  });

  it("lifts the texts of short dimensions next to each other apart, without crossing their leaders", () => {
    const placements = dimensionPlacements([dim(0, 1200), dim(1200, 1240), dim(1240, 1280), dim(1280, 2040), dim(0, 2040, -220)]);
    expect(placements.slice(1, 3).map((p) => p?.text)).toEqual([
      { type: "lifted", along: expect.closeTo(-liftedAlong) },
      { type: "lifted", along: expect.closeTo(liftedAlong) },
    ]);
  });

  it("leaves the lines where there's room for a lifted text before them", () => {
    expect(dimensionPlacements([dim(0, 1000), dim(0, 2000, -220)]).map((p) => p?.linePosition.y)).toEqual([-110, -220]);
  });

  it("moves the lines out for the text height, so a short dimension between neighbours has room to lift its text", () => {
    // The text height, a gap on both sides and the text on the line, past the measured points and past the line inside
    const gap = (111 * 8) / 44;
    const first = 111 + 2 * gap + 111;
    const placements = dimensionPlacements([dim(-720, 0), dim(40, 160), dim(200, 720), dim(-750, 750, -220)], 111);
    expect(placements.map((p) => p?.linePosition.y)).toEqual([
      expect.closeTo(-first),
      expect.closeTo(-first),
      expect.closeTo(-first),
      expect.closeTo(-(first + 2 * gap + 2 * 111)),
    ]);
    expect(placements[1]?.text.type).toBe("lifted");
  });

  it("bounds what a dimension draws, from its measured points to its text's outer edge", () => {
    expect(dimensionPlacements([dim(0, 1000)])[0]?.bounds).toEqual({ min: vec3(0, -110, 0), max: vec3(1000, 0, 0) });
    // The outside arrows' tails and the text past the end
    expect(dimensionPlacements([dim(0, 40)])[0]?.bounds).toEqual({
      min: vec3(expect.closeTo(-60), -110, 0),
      max: vec3(expect.closeTo(40 + 60 + 2 * 0.4815 * 44 + 16), 0, 0),
    });
    // A gap and the lifted text past the line
    const [, middle] = dimensionPlacements([dim(0, 1200), dim(1200, 1240), dim(1240, 2040), dim(0, 2040, -220)]);
    expect(middle?.bounds.min.y).toBeCloseTo(-110 - 8 - 44);
  });

  it("leaves the dimensions on another line out", () => {
    expect(dimensionPlacements([dim(0, 1200), dim(1200, 1240, -220)]).at(1)).toMatchObject({ start: outside, end: outside, text: { type: "end" } });
  });

  it("sizes the text, arrows and gaps by the text height", () => {
    expect(dimensionPlacements([dim(0, 120, -300)], 88)).toMatchObject([
      { start: { type: "outside", tail: expect.closeTo(120) }, end: { type: "outside", tail: expect.closeTo(120) }, text: { type: "end" } },
    ]);
    const meshes = dimensionConvertToTypeMesh(dim(0, 1000), vec3Zero, undefined, 88).meshes;
    expect(meshes.flatMap((m) => (m.geometry.type === "Text" ? [m.geometry.fontSize] : []))).toEqual([88]);
  });

  it("draws a dot as a filled octagon", () => {
    const dims = [dim(0, 1200), dim(1200, 1240), dim(1240, 2040)];
    const meshes = dimensionConvertToTypeMesh(dims[1] ?? dim(0, 0), vec3Zero, undefined, undefined, dimensionPlacements(dims)[1]).meshes;
    expect(meshes.filter((m) => m.geometry.type === "Polygon").length).toBe(16);
  });

  it("draws a lifted text out from the line with a leader from the dimension line's middle", () => {
    const dims = [dim(0, 1200), dim(1200, 1240), dim(1240, 2040), dim(0, 2040, -220)];
    const meshes = dimensionConvertToTypeMesh(dims[1] ?? dim(0, 0), vec3Zero, undefined, undefined, dimensionPlacements(dims)[1]).meshes;
    // The dimension line is at -110 + 22, the text's outer edge at -110, the lifted text's middle a gap and half its height further out
    expect(meshes.find((m) => m.geometry.type === "Text")?.geometry).toMatchObject({ pos: { y: expect.closeTo(-110 - 8 - 22) } });
    expect(meshes.filter((m) => m.geometry.type === "CulledLine").length).toBe(4);
  });

  it("draws the dimension at its moved line", () => {
    const dims = [dim(0, 1000), dim(0, 2000, -150)];
    const meshes = dimensionConvertToTypeMesh(dims[1] ?? dim(0, 0), vec3Zero, undefined, undefined, dimensionPlacements(dims)[1]).meshes;
    expect(meshes.find((m) => m.geometry.type === "Text")?.geometry).toMatchObject({ pos: { y: expect.closeTo(-(110 + 16 + 88) + 22) } });
  });
});
