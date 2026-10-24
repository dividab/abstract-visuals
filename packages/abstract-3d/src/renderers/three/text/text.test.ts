import { describe, expect, it } from "vitest";
import type { GlyphBitmap } from "./text.js";
import { createGlyphAtlas, getGlyph, layoutText, RASTER_SIZE, SDF_BUFFER } from "./text.js";

/** Glyphs of 20 px ink, 30 px of it above the baseline, a 24 px advance, filled with their char code */
const rasterize = (char: string): GlyphBitmap => {
  const [glyphWidth, glyphHeight] = char === " " ? [0, 0] : [20, 40];
  const [width, height] = [glyphWidth + 2 * SDF_BUFFER, glyphHeight + 2 * SDF_BUFFER];
  return {
    data: new Uint8ClampedArray(width * height).fill(char.charCodeAt(0)),
    width,
    height,
    glyphWidth,
    glyphHeight,
    glyphLeft: 2,
    glyphTop: 30,
    glyphAdvance: 24,
  };
};
const em = (px: number): number => px / RASTER_SIZE;
const round = (v: number): number => Math.round(v * 1e4) / 1e4;

describe("getGlyph", () => {
  it("packs each glyph once, left to right, and writes its bitmap", () => {
    const atlas = createGlyphAtlas(rasterize, 64);
    const a = getGlyph(atlas, "A");
    expect(getGlyph(atlas, "A")).toBe(a);
    const b = getGlyph(atlas, "B");
    const data = atlas.texture.image.data as Uint8Array;
    expect([data[0], data[28]]).toEqual([65, 66]);
    expect(a.rect.map(round)).toEqual([0, round(48 / 64), round(28 / 64), round(-48 / 64)]);
    expect(b.rect[0]).toBe(28 / 64);
  });

  it("starts a new row when a row is full", () => {
    const atlas = createGlyphAtlas(rasterize, 128);
    ["A", "B", "C", "D"].forEach((char) => getGlyph(atlas, char));
    expect(getGlyph(atlas, "E").rect.slice(0, 2)).toEqual([0, 96 / 128]);
  });

  it("gives glyphs their bitmap's position and size in em, from the pen at the baseline", () => {
    expect(getGlyph(createGlyphAtlas(rasterize, 64), "A")).toMatchObject({
      left: em(2 - SDF_BUFFER),
      top: em(30 + SDF_BUFFER),
      width: em(28),
      height: em(48),
      advance: em(24),
    });
  });

  it("leaves glyphs without ink out of the atlas", () => {
    const atlas = createGlyphAtlas(rasterize, 64);
    expect(getGlyph(atlas, " ").width).toBe(0);
    expect(getGlyph(atlas, "A").rect[0]).toBe(0);
  });
});

describe("layoutText", () => {
  const atlas = createGlyphAtlas(rasterize, 256);

  it("centers a line on the origin", () => {
    const advance = 24 + 0.001 * 40;
    const quads = layoutText(atlas, "AA", 40);
    expect(quads.map((q) => round(q.x))).toEqual([round(-advance + 2 - SDF_BUFFER + 14), round(2 - SDF_BUFFER + 14)]);
    expect(quads.map((q) => [round(q.width), round(q.height)])).toEqual([
      [28, 48],
      [28, 48],
    ]);
  });

  it("stacks lines 1.5 font sizes apart, centered vertically as a block", () => {
    // The block is 120 high; each baseline is half the 20 of leading and an ascent of 32 below its line's top, and the glyphs' centers 10 above it
    expect(layoutText(atlas, "A\nA", 40).map((q) => round(q.y))).toEqual([28, -32]);
  });

  it("skips glyphs without ink but keeps their advance", () => {
    expect(layoutText(atlas, "A A", 40)).toHaveLength(2);
  });
});
