import * as R from "ramda";
import * as AD from "../../abstract-document/index";
import { getResources } from "../shared/get_resources";

export function registerFonts(
  registerFont: (fontName: string, fontSource: AD.Font.FontSource) => void,
  document: AD.AbstractDoc.AbstractDoc
): void {
  const resources = getResources(document);
  if (resources.fonts) {
    for (const fontName of R.keys(resources.fonts)) {
      const font = resources.fonts[fontName];
      registerFont(fontName, font.normal);
      registerFont(fontName + "-Medium", font.medium || font.normal);
      registerFont(fontName + "-Bold", font.bold);
      registerFont(fontName + "-Oblique", font.italic);
      registerFont(fontName + "-Italic", font.italic);
      registerFont(fontName + "-BoldOblique", font.boldItalic);
      registerFont(fontName + "-BoldItalic", font.boldItalic);
      registerFont(
        fontName + "-MediumOblique",
        font.mediumItalic || font.italic
      );
      registerFont(
        fontName + "-MediumItalic",
        font.mediumItalic || font.italic
      );
    }
  }
}

export function getFontName(textStyle: AD.TextStyle.TextStyle): string {
  const name = textStyle.fontFamily || "Helvetica";
  if (textStyle.bold && textStyle.italic) {
    return name + "-BoldOblique";
  } else if (textStyle.bold) {
    return name + "-Bold";
  } else if (textStyle.italic) {
    return name + "-Oblique";
  } else if (textStyle.mediumBold && textStyle.italic) {
    return name + "-MediumOblique";
  } else if (textStyle.mediumBold) {
    return name + "-Medium";
  } else {
    return name;
  }
}

export function isFontAvailable(
  fontName: string,
  resources: AD.Resources.Resources
): boolean {
  if (resources.fonts) {
    for (const name of R.keys(resources.fonts)) {
      const font = resources.fonts[name];
      if (font.normal && fontName === name) {
        return true;
      }
      if (font.medium && fontName === `${name}-Medium`) {
        return true;
      }
      if (font.bold && fontName === `${name}-Bold`) {
        return true;
      }
      if (
        font.italic &&
        (fontName === `${name}-Oblique` || fontName === `${name}-Italic`)
      ) {
        return true;
      }
      if (
        font.boldItalic &&
        (fontName === `${name}-BoldOblique` ||
          fontName === `${name}-BoldItalic`)
      ) {
        return true;
      }
      if (
        font.mediumItalic &&
        (fontName === `${name}-MediumOblique` ||
          fontName === `${name}-MediumItalic`)
      ) {
        return true;
      }
    }
  }
  return false;
}
