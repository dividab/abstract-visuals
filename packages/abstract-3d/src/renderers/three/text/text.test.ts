import { describe, expect, it } from "vitest";
import type { GlyphBitmap } from "./text.js";
import { createGlyphAtlas, getGlyph, layoutText, RASTER_SIZE, SDF_BUFFER } from "./text.js";

/** Glyphs of 20 px ink, 30 px of it above the baseline, a 24 px advance, filled with their char code; their bitmaps add the buffer around */
const [bitmapWidth, bitmapHeight] = [20 + 2 * SDF_BUFFER, 40 + 2 * SDF_BUFFER];
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
    const atlas = createGlyphAtlas(rasterize, 128);
    const a = getGlyph(atlas, "A");
    expect(getGlyph(atlas, "A")).toBe(a);
    const b = getGlyph(atlas, "B");
    const data = atlas.texture.image.data as Uint8Array;
    expect([data[0], data[bitmapWidth]]).toEqual([65, 66]);
    expect(a.rect.map(round)).toEqual([0, round(bitmapHeight / 128), round(bitmapWidth / 128), round(-bitmapHeight / 128)]);
    expect(b.rect[0]).toBe(bitmapWidth / 128);
  });

  it("starts a new row when a row is full", () => {
    const size = 4 * bitmapWidth + 1;
    const atlas = createGlyphAtlas(rasterize, size);
    ["A", "B", "C", "D"].forEach((char) => getGlyph(atlas, char));
    expect(getGlyph(atlas, "E").rect.slice(0, 2)).toEqual([0, (2 * bitmapHeight) / size]);
  });

  it("gives glyphs their bitmap's position and size in em, from the pen at the baseline", () => {
    expect(getGlyph(createGlyphAtlas(rasterize, 128), "A")).toMatchObject({
      left: em(2 - SDF_BUFFER),
      top: em(30 + SDF_BUFFER),
      width: em(bitmapWidth),
      height: em(bitmapHeight),
      advance: em(24),
    });
  });

  it("leaves glyphs without ink out of the atlas", () => {
    const atlas = createGlyphAtlas(rasterize, 128);
    expect(getGlyph(atlas, " ").width).toBe(0);
    expect(getGlyph(atlas, "A").rect[0]).toBe(0);
  });
});

describe("layoutText", () => {
  const atlas = createGlyphAtlas(rasterize, 256);

  it("centers a line on the origin", () => {
    const advance = (em(24) + 0.001) * 40;
    // A glyph's center is 12 px right of its pen: the ink's left at 2 plus half its 20
    const center = em(12) * 40;
    const quads = layoutText(atlas, "AA", 40);
    expect(quads.map((q) => round(q.x))).toEqual([round(-advance + center), round(center)]);
    expect(quads.map((q) => [round(q.width), round(q.height)])).toEqual([
      [round(em(bitmapWidth) * 40), round(em(bitmapHeight) * 40)],
      [round(em(bitmapWidth) * 40), round(em(bitmapHeight) * 40)],
    ]);
  });

  it("stacks lines 1.5 font sizes apart, centered vertically as a block", () => {
    // The block is 120 high; each baseline is half the 20 of leading and an ascent of 32 below its line's top, and the glyphs' centers 10 px above it
    const above = em(10) * 40;
    expect(layoutText(atlas, "A\nA", 40).map((q) => round(q.y))).toEqual([round(18 + above), round(-42 + above)]);
  });

  it("skips glyphs without ink but keeps their advance", () => {
    expect(layoutText(atlas, "A A", 40)).toHaveLength(2);
  });
});
