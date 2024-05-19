import * as AD from "../../abstract-document/index";
import { TextFontWeight } from "../../abstract-document/styles/text-style";
import { getResources } from "../shared/get_resources";

export function registerFonts(
  registerFont: (fontName: string, fontSource: AD.Font.FontSource, fontFamily: string) => void,
  document: AD.AbstractDoc.AbstractDoc
): void {
  const resources = getResources(document);
  for (const [fontName, font] of Object.entries(resources.fonts ?? {})) {
    // Required
    registerFont(fontName, font.normal, fontName);
    registerFont(fontName + "-Bold", font.bold, fontName);
    registerFont(fontName + "-Light", font.light || font.normal, fontName);
    registerFont(fontName + "-Oblique", font.italic, fontName);
    registerFont(fontName + "-Italic", font.italic, fontName);
    registerFont(fontName + "-BoldOblique", font.boldItalic, fontName);
    registerFont(fontName + "-BoldItalic", font.boldItalic, fontName);
    // Optional
    registerFont(fontName + "-Medium", font.medium || font.normal, fontName);
    registerFont(fontName + "-ExtraBold", font.extraBold || font.bold, fontName);
    registerFont(fontName + "-LightOblique", font.lightItalic || font.normal, fontName);
    registerFont(fontName + "-LightItalic", font.lightItalic || font.normal, fontName);
    registerFont(fontName + "-MediumOblique", font.mediumItalic || font.italic, fontName);
    registerFont(fontName + "-MediumItalic", font.mediumItalic || font.italic, fontName);
    registerFont(fontName + "-ExtraBoldItalic", font.extraBoldItalic || font.boldItalic, fontName);
    registerFont(fontName + "-ExtraBoldOblique", font.extraBoldItalic || font.boldItalic, fontName);
  }
}

export function getFontNameStyle(textStyle: AD.TextStyle.TextStyle): string {
  const fontWeight = textStyle.fontWeight
    ? textStyle.fontWeight
    : textStyle.light
    ? "light"
    : textStyle.normal
    ? "normal"
    : textStyle.bold
    ? "bold"
    : textStyle.mediumBold
    ? "mediumBold"
    : textStyle.extraBold
    ? "extraBold"
    : "normal";
  return getFontName(textStyle.fontFamily, fontWeight, textStyle.italic);
}

export function getFontName(
  fontFamily: string | undefined,
  fontWeight: TextFontWeight,
  italic: boolean | undefined
): string {
  const name = fontFamily || "Helvetica";
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
    for (const name of Object.keys(resources.fonts)) {
      const font = resources.fonts[name];
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
