import * as AD from "../../abstract-document/index.js";
import type { Font } from "../../abstract-document/primitives/font.js";
import type { TextFontWeight, TextTransform } from "../../abstract-document/styles/text-style.js";
import { getResources } from "../shared/get_resources.js";

// Characters the current font may lack, with replacements in order of preference. pdfkit doesn't warn about
// missing characters: built-in fonts only cover WinAnsi and encode anything else as wrong bytes (U+2212 → `"`),
// and embedded fonts draw their missing-character glyph.
const fallbackChars: Readonly<Record<string, ReadonlyArray<string>>> = {
  "\u{202F}": ["\u{00A0}", " "], // narrow no-break space
  "\u{2009}": [" "], // thin space
  "\u{2007}": ["\u{00A0}", " "], // figure space
  "\u{2212}": ["-"], // minus sign
  "\u{2011}": ["-"], // non-breaking hyphen
};
const fallbackCharsRegex = new RegExp(`[${Object.keys(fallbackChars).join("")}]`, "gu");

// pdfkit's font object behind `pdf.font()`: a fontkit font for embedded fonts, an AFMFont for built-in fonts.
// pdfkit exposes neither, so it's read from the private `_font` field.
type PdfKitFont = {
  readonly hasGlyphForCodePoint?: (codePoint: number) => boolean;
  readonly characterToGlyph?: (codePoint: number) => string;
};
const resolvedCharsByFont = new WeakMap<PdfKitFont, Map<string, string>>();

/**
 * Applies the text transform, then replaces characters the current font (set with `pdf.font()`) lacks with a fallback it has. Measure and draw text
 * through this so the measured width matches what's drawn.
 */
export function transformText(pdf: PDFKit.PDFDocument, text: string, transform: TextTransform | undefined): string {
  const transformed = transform === "uppercase" ? text.toUpperCase() : transform === "lowercase" ? text.toLowerCase() : text;
  const font = (pdf as unknown as { readonly _font?: { readonly font?: PdfKitFont } })._font?.font;
  if (!font) {
    return transformed;
  }
  const resolvedChars = resolvedCharsByFont.get(font) ?? new Map<string, string>();
  resolvedCharsByFont.set(font, resolvedChars);
  return transformed.replace(fallbackCharsRegex, (char) => {
    const cached = resolvedChars.get(char);
    if (cached !== undefined) {
      return cached;
    }
    const resolved = [char, ...(fallbackChars[char] ?? [])].find((c) => fontHasChar(font, c)) ?? char;
    resolvedChars.set(char, resolved);
    return resolved;
  });
}

function fontHasChar(font: PdfKitFont, char: string): boolean {
  const codePoint = char.codePointAt(0) ?? 0;
  if (font.hasGlyphForCodePoint) {
    return font.hasGlyphForCodePoint(codePoint);
  }
  // An unknown font shape counts as having the character, which keeps pdfkit's own behaviour
  return font.characterToGlyph?.(codePoint) !== ".notdef";
}

export function registerFonts(registerFont: (fontName: string, fontSource: AD.Font.FontSource) => void, document: AD.AbstractDoc.AbstractDoc): void {
  const resources = getResources(document);
  for (const [fontName, font] of Object.entries(resources.fonts ?? {})) {
    // Required
    registerFont(fontName, font.normal);
    registerFont(fontName + "-Bold", font.bold);
    registerFont(fontName + "-Oblique", font.italic);
    registerFont(fontName + "-Italic", font.italic);
    registerFont(fontName + "-BoldOblique", font.boldItalic);
    registerFont(fontName + "-BoldItalic", font.boldItalic);
    // Optional
    registerFont(fontName + "-Light", font.light ?? font.normal);
    registerFont(fontName + "-Medium", font.medium ?? font.normal);
    registerFont(fontName + "-ExtraBold", font.extraBold ?? font.bold);
    registerFont(fontName + "-LightOblique", font.lightItalic ?? font.normal);
    registerFont(fontName + "-LightItalic", font.lightItalic ?? font.normal);
    registerFont(fontName + "-MediumOblique", font.mediumItalic ?? font.italic);
    registerFont(fontName + "-MediumItalic", font.mediumItalic ?? font.italic);
    registerFont(fontName + "-ExtraBoldItalic", font.extraBoldItalic ?? font.boldItalic);
    registerFont(fontName + "-ExtraBoldOblique", font.extraBoldItalic ?? font.boldItalic);
  }
}

function getFontWeightFromStyle(textStyle: AD.TextStyle.TextStyle): TextFontWeight {
  return (
    textStyle.fontWeight ??
    (textStyle.light
      ? "light"
      : textStyle.normal
        ? "normal"
        : textStyle.bold
          ? "bold"
          : textStyle.mediumBold
            ? "mediumBold"
            : textStyle.extraBold
              ? "extraBold"
              : "normal")
  );
}

function getFontWeightFromAttributes(attribs: Record<string, string>): TextFontWeight {
  const style = AD.TextStyle.create(attribs);
  return getFontWeightFromStyle(style);
}

export function getFontNameStyle(textStyle: AD.TextStyle.TextStyle): string {
  const fontWeight = getFontWeightFromStyle(textStyle);
  return getFontName(textStyle.fontFamily, fontWeight, textStyle.italic);
}

export function getFontStyleName(attributes: Record<string, string>): keyof Font {
  const fontWeight = getFontWeightFromAttributes(attributes);
  // oxlint-disable-next-line typescript/no-unnecessary-template-expression
  const stringifiedItalic = `${attributes["italic"]}`;
  const italic = stringifiedItalic === "true" || stringifiedItalic === "1";
  if (fontWeight === "normal") {
    return italic ? "italic" : fontWeight;
  }
  return `${fontWeight === "mediumBold" ? "medium" : fontWeight}${italic ? "Italic" : ""}`;
}

export function getFontName(fontFamily: string | undefined, fontWeight: TextFontWeight, italic: boolean | undefined): string {
  const name = fontFamily === undefined || fontFamily.length === 0 ? "Helvetica" : fontFamily;
  if (fontWeight === "light" && italic) {
    return name + "-LightOblique";
  } else if (fontWeight === "bold" && italic) {
    return name + "-BoldOblique";
  } else if (fontWeight === "mediumBold" && italic) {
    return name + "-MediumOblique";
  } else if (fontWeight === "extraBold" && italic) {
    return name + "-ExtraBoldOblique";
  } else if (fontWeight === "light") {
    return name + "-Light";
  } else if (fontWeight === "bold") {
    return name + "-Bold";
  } else if (fontWeight === "mediumBold") {
    return name + "-Medium";
  } else if (fontWeight === "extraBold") {
    return name + "-ExtraBold";
  } else if (italic) {
    return name + "-Oblique";
  } else {
    return name;
  }
}

export function isFontAvailable(fontName: string, resources: AD.Resources.Resources): boolean {
  if (resources.fonts) {
    for (const [name, font] of Object.entries(resources.fonts)) {
      if (font.light && fontName === `${name}-Light`) {
        return true;
      }
      if (font.normal && fontName === name) {
        return true;
      }
      if (font.medium && fontName === `${name}-Medium`) {
        return true;
      }
      if (font.bold && fontName === `${name}-Bold`) {
        return true;
      }
      if (font.extraBold && fontName === `${name}-ExtraBold`) {
        return true;
      }
      if (font.lightItalic && (fontName === `${name}-LightOblique` || fontName === `${name}-LightItalic`)) {
        return true;
      }
      if (font.italic && (fontName === `${name}-Oblique` || fontName === `${name}-Italic`)) {
        return true;
      }
      if (font.boldItalic && (fontName === `${name}-BoldOblique` || fontName === `${name}-BoldItalic`)) {
        return true;
      }
      if (font.mediumItalic && (fontName === `${name}-MediumOblique` || fontName === `${name}-MediumItalic`)) {
        return true;
      }
      if (font.extraBoldItalic && (fontName === `${name}-ExtraBoldOblique` || fontName === `${name}-ExtraBoldItalic`)) {
        return true;
      }
    }
  }
  return false;
}
