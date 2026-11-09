import { describe, expect, it } from "vitest";
import type { DimensionAligned, Mesh } from "./abstract-3d.js";
import {
  alignedDimension,
  box,
  dimensionConvertToTypeMesh,
  dimensionPlacements,
  group,
  groupTextBackgrounds,
  sceneTextHeight,
  text,
  textHeightForSize,
  textSize,
  vec2,
  vec3,
  vec3Zero,
} from "./abstract-3d.js";
import { render } from "./renderers/svg/svg.js";

const material = { normal: "rgb(0,0,0)" };

describe("textHeightForSize", () => {
  it("is 32 up to the base size, then a 2^¼ step for each 2^¼ the longest side is past it, rounded up", () => {
    expect([1000, 3600, 3601, 3600 * 2 ** (1 / 4), 7200, 7201, 9000, 14400].map((x) => textHeightForSize(vec3(x, 500, 500)))).toEqual([
      32,
      32,
      expect.closeTo(32 * 2 ** (1 / 4)),
      expect.closeTo(32 * 2 ** (1 / 4)),
      expect.closeTo(64),
      expect.closeTo(64 * 2 ** (1 / 4)),
      // 2.5 is 5.3 steps, rounded up to 6
      expect.closeTo(32 * 2 ** (6 / 4)),
      expect.closeTo(128),
    ]);
    expect(textHeightForSize(vec3(500, 500, 7200))).toBeCloseTo(64);
  });
});

describe("sceneTextHeight", () => {
  it("is for the size of the scene's objects, without its texts", () => {
    const unit = group([box(vec3(7200, 1000, 1000), material)]);
    expect(sceneTextHeight([unit])).toBeCloseTo(64);
    // A text far off, as a title, doesn't make the scene larger
    expect(sceneTextHeight([unit, group([text(vec3(20000, 0, 0), "title", 500, material)])])).toBeCloseTo(64);
    expect(sceneTextHeight([])).toBe(32);
  });

  it("sizes the texts without a font size and the dimensions in the svg", () => {
    const image = render(
      {
        size_deprecated: vec3(8200, 2000, 1000),
        groups: [group([box(vec3(7200, 1000, 1000), material), text(vec3(0, 0, 600), "label", undefined, material)])],
        dimensions_deprecated: { dimensions: [dim(-3000, 3000, -600)], material },
      },
      { view: "front" }
    ).image;
    expect([...image.matchAll(/font-size="([\d.]+)px"/g)].map((m) => Number(m[1]))).toEqual([expect.closeTo(64), expect.closeTo(64)]);
  });
});

describe("groupTextBackgrounds", () => {
  const background = { padding: 30, outline: 10, depth: 0.2, material, outlineMaterial: material } as const;

  it("draws a text's rectangle background behind it, padded past the text at its font size", () => {
    const g = groupTextBackgrounds(group([text(vec3(100, 0, 0), "ab", 16, material, vec3Zero, { ...background, shape: "rectangle" })]), 44);
    const backgroundGroup = g.groups?.at(0);
    expect(backgroundGroup?.pos).toEqual(vec3(100, 0, 0));
    // The fill inside the outline, then its four sides
    expect(backgroundGroup?.meshes?.map((m) => m.geometry.type)).toEqual(["Plane", "Box", "Box", "Box", "Box"]);
    expect(backgroundGroup?.meshes?.at(0)?.geometry).toMatchObject({ size: vec2(2 * 9 + 60 - 20, 16 * 1.2 + 60 - 20), pos: vec3(0, 0, -0.2) });
  });

  it("draws a circle background around the text, sized by the text height without a font size", () => {
    const g = groupTextBackgrounds(
      group([], vec3Zero, vec3Zero, [group([text(vec3Zero, "ab", undefined, material, vec3Zero, { ...background, shape: "circle" })])]),
      88
    );
    // The background of the text in the child group, in a group of the child's own
    const backgroundGroup = g.groups?.at(0)?.groups?.at(0);
    // Half the padded text's larger side, its height
    const radius = (88 * 1.2 + 60) / 2;
    expect(backgroundGroup?.meshes?.map((m) => m.geometry)).toMatchObject([
      { type: "Cylinder", radius: radius - 10 },
      { type: "Cylinder", radius },
    ]);
  });

  it("leaves a group without backgrounds as it is", () => {
    const g = group([text(vec3Zero, "ab", 16, material)]);
    expect(groupTextBackgrounds({ ...g, groups: undefined }, 44)).toEqual({ ...g, groups: undefined });
  });
});

describe("textSize", () => {
  it("measures the widest row and the rows", () => {
    expect(textSize("ab\nabcd", 16)).toEqual(vec2(4 * 9, 2 * 16 * 1.2));
  });
});

// A dimension along x measured from `from` to `to`, its line at y, 110 and 220 out as products' rows
const dim = (from: number, to: number, y = -110): DimensionAligned =>
  alignedDimension(vec3(from, 0, 0), vec3(to, 0, 0), vec3(0, y, 0), `${Math.abs(to - from)}`, ["front"]);

const centred = { inward: false } as const;
const geometries = (dims: ReadonlyArray<DimensionAligned>, i: number, textHeight?: number): ReadonlyArray<Mesh["geometry"]> =>
  dimensionConvertToTypeMesh(dims[i] ?? dim(0, 0), vec3Zero, undefined, textHeight, dimensionPlacements(dims, textHeight)[i]).meshes.map(
    (m) => m.geometry
  );

// A run of neighbours `width` wide, `gap` apart, between a 1000 and the rest of 2000
const run = (width: number, count: number, gap: number): ReadonlyArray<DimensionAligned> => [
  dim(0, 1000),
  ...Array.from({ length: count }, (_, i) => dim(1000 + gap + i * (width + gap), 1000 + gap + i * (width + gap) + width)),
  dim(1000 + gap + count * (width + gap), 2000),
];

describe("dimensionPlacements", () => {
  it("draws the text a gap out from the line, out from the dimension's middle, extension lines to marks across the line at its ends and arrows inside them", () => {
    expect(dimensionPlacements([dim(0, 1000)])).toEqual([expect.objectContaining({ text: centred })]);
    // Extension lines from the measured points to marks 10 to each side of the line, arrows 30 long pointing at them, the text a gap of 8 and half the
    // text height of 44 out from it
    expect(geometries([dim(0, 1000)], 0)).toEqual([
      expect.objectContaining({ type: "CulledLine", start: vec3(0, 0, 0), end: vec3(0, -100, 0) }),
      expect.objectContaining({ type: "CulledLine", start: vec3(0, -100, 0), end: vec3(0, -120, 0) }),
      expect.objectContaining({ type: "CulledLine", start: vec3(1000, 0, 0), end: vec3(1000, -100, 0) }),
      expect.objectContaining({ type: "CulledLine", start: vec3(1000, -100, 0), end: vec3(1000, -120, 0) }),
      expect.objectContaining({ type: "CulledLine", start: vec3(0, -110, 0), end: vec3(1000, -110, 0) }),
      expect.objectContaining({
        type: "Polygon",
        points: expect.arrayContaining([vec3(0, -110, 0), vec3(44 * (30 / 44), -102.5, 0), vec3(44 * (30 / 44), -117.5, 0)]),
      }),
      expect.objectContaining({
        type: "Polygon",
        points: expect.arrayContaining([vec3(1000, -110, 0), vec3(1000 - 44 * (30 / 44), -102.5, 0), vec3(1000 - 44 * (30 / 44), -117.5, 0)]),
      }),
      expect.objectContaining({ type: "Text", pos: vec3(500, -140, 0) }),
    ]);
  });

  it("leaves the arrows out where they don't both fit with a gap between them", () => {
    // Two arrows of 30 and a gap of 8
    expect(geometries([dim(0, 68)], 0).map((g) => g.type)).toContain("Polygon");
    expect(geometries([dim(0, 67)], 0).map((g) => g.type)).not.toContain("Polygon");
  });

  it("draws each row of the text as a text of its own, the first as near the line as a text of one row, the next 1.2 text heights past it", () => {
    const texts = geometries([alignedDimension(vec3Zero, vec3(1000, 0, 0), vec3(0, -110, 0), "1000\nkg", ["front"])], 0).flatMap((g) =>
      g.type === "Text" ? [[g.text, g.pos.y]] : []
    );
    expect(texts).toEqual([
      ["1000", expect.closeTo(-140)],
      ["kg", expect.closeTo(-140 - 1.2 * 44)],
    ]);
  });

  it("lets a text wider than its dimension overhang it where nothing's in the way", () => {
    expect(dimensionPlacements([dim(0, 1000), dim(1000, 1040), dim(1040, 2000)]).map((p) => p?.text)).toEqual([centred, centred, centred]);
  });

  it("draws a text on the other side of the line, towards the measured points, where a neighbour's is in the way", () => {
    // The 40's text out from its middle would be within two gaps of the 100's
    expect(dimensionPlacements([dim(0, 100), dim(100, 140), dim(140, 1000)]).map((p) => p?.text)).toEqual([centred, { inward: true }, centred]);
  });

  it("breaks an extension line half a gap short of a text it'd cross", () => {
    // The 40's text, from 58 to 102 out, crosses the 100's extension line at 100
    expect(dimensionPlacements([dim(0, 100), dim(100, 140), dim(140, 1000)])[0]?.endLines).toEqual([
      [vec3(0, 0, 0), vec3(0, -100, 0)],
      [vec3(0, -100, 0), vec3(0, -120, 0)],
      [vec3(100, 0, 0), vec3(100, -54, 0)],
      [vec3(100, -100, 0), vec3(100, -120, 0)],
    ]);
  });

  it("alternates the texts of neighbours too narrow for them across the line, moving it out for the texts towards the measured points", () => {
    const dims = run(30, 4, 10).map((d) => ({ ...d, linePosition: vec3(0, -50, 0) }));
    const placements = dimensionPlacements(dims);
    expect(placements.slice(1, 5).map((p) => p?.text.inward)).toEqual([false, true, false, true]);
    // A gap and the text height past the measured points, and a gap
    expect(placements.map((p) => p?.linePosition.y)).toEqual(dims.map(() => -(8 + 44 + 8)));
    expect(geometries(dims, 2)).toContainEqual(expect.objectContaining({ type: "Text", pos: vec3(1065, -60 + 8 + 22, 0) }));
  });

  it("alternates the texts even where every other one's still clash, rather than two neighbours' on one side", () => {
    // Four 30s at the text height 128, each text far wider than two of them
    expect(dimensionPlacements([dim(0, 30, -300), dim(30, 60, -300), dim(60, 90, -300), dim(90, 120, -300)], 128).map((p) => p?.text.inward)).toEqual(
      [false, true, false, true]
    );
  });

  it("keeps the text of a dimension at the end of a line out from it, with room past it, its neighbour's on the other side instead", () => {
    expect(dimensionPlacements([dim(0, 1000), dim(1000, 1040), dim(1040, 1080)]).map((p) => p?.text.inward)).toEqual([false, true, false]);
    expect(dimensionPlacements([dim(0, 40), dim(40, 80), dim(80, 1000)]).map((p) => p?.text.inward)).toEqual([false, true, false]);
  });

  it("draws each dimension with its own text, where neighbours are too crowded for their texts on either side of the line too", () => {
    const dims = run(10, 6, 0);
    expect(dims.map((_, i) => geometries(dims, i).flatMap((g) => (g.type === "Text" ? [g.text] : [])))).toEqual(
      ["1000", "10", "10", "10", "10", "10", "10", "940"].map((t) => [t])
    );
  });

  it("moves a line out past the texts of the line inside it, a gap and its marks, and leaves it where there's room", () => {
    expect(dimensionPlacements([dim(0, 1000), dim(0, 1000, -150), dim(0, 2000, -400)]).map((p) => p?.linePosition.y)).toEqual([
      -110,
      -(110 + 8 + 44 + 8 + 10),
      -400,
    ]);
  });

  it("leaves the dimensions on another line out", () => {
    expect(dimensionPlacements([dim(0, 1200), dim(1200, 1240, -220)]).map((p) => p?.text)).toEqual([centred, centred]);
  });

  it("bounds what a dimension draws, from its extension lines to its text's outer edge", () => {
    expect(dimensionPlacements([dim(0, 1000)])[0]?.bounds).toEqual({ min: vec3(0, -110 - 8 - 44, 0), max: vec3(1000, 0, 0) });
    // The text past the dimension's ends
    expect(dimensionPlacements([dim(0, 20)])[0]?.bounds.min.x).toBeCloseTo(10 - (2 * (9 / 16) * 44) / 2);
  });

  it("sizes the text, gaps and marks by the text height", () => {
    expect(geometries([dim(0, 1000)], 0, 88)).toEqual([
      expect.objectContaining({ start: vec3(0, 0, 0), end: vec3(0, -90, 0) }),
      expect.objectContaining({ start: vec3(0, -90, 0), end: vec3(0, -130, 0) }),
      expect.anything(),
      expect.anything(),
      expect.anything(),
      expect.objectContaining({ type: "Polygon", points: expect.arrayContaining([vec3(88 * (30 / 44), -95, 0)]) }),
      expect.anything(),
      expect.objectContaining({ type: "Text", fontSize: 88, pos: vec3(500, -110 - 16 - 44, 0) }),
    ]);
  });

  it("draws the dimension at its moved line", () => {
    expect(geometries([dim(0, 1000), dim(0, 2000, -150)], 1)).toContainEqual(
      expect.objectContaining({ type: "Text", pos: vec3(1000, -180 - 8 - 22, 0) })
    );
  });
});
