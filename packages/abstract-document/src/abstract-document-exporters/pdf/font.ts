import * as AD from "../../abstract-document/index";
import { TextFontWeight } from "../../abstract-document/styles/text-style";
import { getResources } from "../shared/get_resources";

export function registerFonts(
  registerFont: (fontStyleName: string, fontSource: AD.Font.FontSource, fontName: string) => void,
  document: AD.AbstractDoc.AbstractDoc
): void {
  const resources = getResources(document);
  if (resources.fonts) {
    for (const [name, font] of Object.entries(resources.fonts)) {
      // Required
      registerFont(name, font.normal, name);
      registerFont(name + "-Oblique", font.italic, name);
      registerFont(name + "-Italic", font.italic, name);
      registerFont(name + "-Bold", font.bold, name);
      registerFont(name + "-BoldOblique", font.boldItalic, name);
      registerFont(name + "-BoldItalic", font.boldItalic, name);
      // Optional
      registerFont(name + "-Light", font.light || font.normal, name);
      registerFont(name + "-Medium", font.medium || font.normal, name);
      registerFont(name + "-ExtraBold", font.extraBold || font.bold, name);
      registerFont(name + "-LightOblique", font.lightItalic || font.normal, name);
      registerFont(name + "-LightItalic", font.lightItalic || font.normal, name);
      registerFont(name + "-MediumOblique", font.mediumItalic || font.italic, name);
      registerFont(name + "-MediumItalic", font.mediumItalic || font.italic, name);
      registerFont(name + "-ExtraBoldItalic", font.extraBoldItalic || font.boldItalic, name);
      registerFont(name + "-ExtraBoldOblique", font.extraBoldItalic || font.boldItalic, name);
    }
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
