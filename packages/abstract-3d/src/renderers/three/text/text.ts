import TinySDF from "@mapbox/tiny-sdf";
import { DataTexture, LinearFilter, RedFormat, UnsignedByteType } from "three";

/**
 * Text as signed distance field glyphs from the system font, packed into one atlas texture, so all text draws in one call. The glyph atlas is Mapbox
 * GL JS's approach (its @mapbox/tiny-sdf rasterizes), and the distance field text Valve's (Green, "Improved Alpha-Tested Magnification for Vector
 * Textures and Special Effects", SIGGRAPH 2007)
 */

export const RASTER_SIZE = 40;
export const SDF_BUFFER = 4;
/** The distance field's value at the glyph's edge, from tiny-sdf's default cutoff of 0.25 */
export const SDF_EDGE = 0.75;
const LINE_HEIGHT = 1.5;
const LETTER_SPACING = 0.001;
/** Of the font size, above the baseline, to center a line's glyphs in it */
const ASCENT = 0.8;

export type GlyphBitmap = ReturnType<TinySDF["draw"]>;
export type Rasterize = (char: string) => GlyphBitmap;

export type Glyph = {
  /** The glyph's place in the atlas as a uv offset and scale, for a quad with uv (0, 0) at its bottom left */
  readonly rect: readonly [number, number, number, number];
  /** The bitmap's left and top edges and size, in em, from the pen at the baseline; no width for glyphs without ink */
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
  readonly advance: number;
};

export type GlyphAtlas = {
  readonly texture: DataTexture;
  readonly size: number;
  readonly glyphs: Map<string, Glyph>;
  /** Where the next glyph goes: the current row's top and next x, and its height */
  readonly shelf: { x: number; y: number; height: number };
  readonly rasterize: Rasterize | undefined;
  readonly sdf: { current?: TinySDF };
};

/** A quad of a laid out text, with its center and size in the text's units, centered on the origin */
export type GlyphQuad = {
  readonly glyph: Glyph;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
};

/** Without `rasterize`, glyphs are rasterized with the OS's built-in Helvetica or Arial, on a canvas created at first use */
export function createGlyphAtlas(rasterize?: Rasterize, size = 1024): GlyphAtlas {
  const texture = new DataTexture(new Uint8Array(size * size), size, size, RedFormat, UnsignedByteType);
  Object.assign(texture, { minFilter: LinearFilter, magFilter: LinearFilter, generateMipmaps: false });
  return { texture, size, glyphs: new Map(), shelf: { x: 0, y: 0, height: 0 }, rasterize, sdf: {} };
}

export function getGlyph(atlas: GlyphAtlas, char: string): Glyph {
  const cached = atlas.glyphs.get(char);
  if (cached) {
    return cached;
  }
  atlas.sdf.current ??= atlas.rasterize
    ? undefined
    : new TinySDF({ fontSize: RASTER_SIZE, buffer: SDF_BUFFER, radius: 10, fontFamily: "Helvetica, Arial, sans-serif" });
  const bitmap = atlas.rasterize?.(char) ?? atlas.sdf.current!.draw(char);
  const rect = bitmap.width > 2 * SDF_BUFFER && bitmap.height > 2 * SDF_BUFFER ? packGlyph(atlas, bitmap) : undefined;
  const glyph: Glyph = {
    rect: rect ?? [0, 0, 0, 0],
    left: (bitmap.glyphLeft - SDF_BUFFER) / RASTER_SIZE,
    top: (bitmap.glyphTop + SDF_BUFFER) / RASTER_SIZE,
    width: rect ? bitmap.width / RASTER_SIZE : 0,
    height: rect ? bitmap.height / RASTER_SIZE : 0,
    advance: bitmap.glyphAdvance / RASTER_SIZE,
  };
  atlas.glyphs.set(char, glyph);
  return glyph;
}

/** Copies the bitmap to the atlas, left to right in rows, or leaves it out when the atlas is full; shelf packing, as @mapbox/shelf-pack does */
function packGlyph({ texture, size, shelf }: GlyphAtlas, bitmap: GlyphBitmap): Glyph["rect"] | undefined {
  if (shelf.x + bitmap.width > size) {
    Object.assign(shelf, { x: 0, y: shelf.y + shelf.height, height: 0 });
  }
  if (shelf.y + bitmap.height > size) {
    return undefined;
  }
  const { x, y } = shelf;
  const data = texture.image.data as Uint8Array;
  for (let row = 0; row < bitmap.height; row++) {
    data.set(bitmap.data.subarray(row * bitmap.width, (row + 1) * bitmap.width), (y + row) * size + x);
  }
  Object.assign(shelf, { x: x + bitmap.width, height: Math.max(shelf.height, bitmap.height) });
  texture.needsUpdate = true;
  // Bitmap rows run top down from the texture's v = 0, while the quad's uv runs bottom up
  return [x / size, (y + bitmap.height) / size, bitmap.width / size, -bitmap.height / size];
}

/**
 * Lays out the text centered on the origin, each line centered, as drei's Text (troika-three-text) did with the r3f renderer's line height and
 * spacing
 */
export function layoutText(atlas: GlyphAtlas, text: string, fontSize: number): ReadonlyArray<GlyphQuad> {
  const lineHeight = LINE_HEIGHT * fontSize;
  const lines = text.split("\n");
  return lines.flatMap((line, i) => {
    const glyphs = Array.from(line, (char) => getGlyph(atlas, char));
    const advances = glyphs.map((g) => (g.advance + LETTER_SPACING) * fontSize);
    const baseline = (lines.length * lineHeight) / 2 - i * lineHeight - (lineHeight - fontSize) / 2 - ASCENT * fontSize;
    const pen = { x: -advances.reduce((sum, a) => sum + a, 0) / 2 };
    return glyphs.flatMap((glyph, j) => {
      const x = pen.x;
      pen.x += advances[j]!;
      return glyph.width === 0
        ? []
        : [
            {
              glyph,
              x: x + (glyph.left + glyph.width / 2) * fontSize,
              y: baseline + (glyph.top - glyph.height / 2) * fontSize,
              width: glyph.width * fontSize,
              height: glyph.height * fontSize,
            },
          ];
    });
  });
}
