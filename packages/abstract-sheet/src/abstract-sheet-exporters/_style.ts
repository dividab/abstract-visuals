import { Style } from "../abstract-sheet/abstract-sheet.js";

export function createStyle(style: Style): any {
  let s: any = {};
  if (style.vertical || style.horizontal || style.wrapText !== undefined || style.textRotation !== undefined) {
    s.alignment = {};
    if (style.vertical) {
      s.alignment.vertical = style.vertical;
    }
    if (style.horizontal) {
      s.alignment.horizontal = style.horizontal;
    }
    if (style.wrapText !== undefined) {
      s.alignment.wrapText = style.wrapText;
    }
    if (style.textRotation !== undefined) {
      s.alignment.textRotation = style.textRotation;
    }
  }
  if (style.fillType || style.foreground || style.background) {
    s.fill = {};
    if (style.fillType) {
      s.fill.patternType = style.fillType;
    }
    if (style.foreground) {
      s.fill.fgColor = { rgb: style.foreground.slice(1) };
    }
    if (style.background) {
      s.fill.bgColor = { rgb: style.background.slice(1) };
    }
  }

  if (style.borderStyle || style.borderColor) {
    s.border = {};
    if (style.borderStyle?.top || style.borderColor?.top) {
      s.border.top = {};
    }
    if (style.borderStyle?.top) {
      s.border.top.style = style.borderStyle.top;
    }
    if (style.borderColor?.top) {
      s.border.top.color = { rgb: style.borderColor.top.slice(1) };
    }
    if (style.borderStyle?.right || style.borderColor?.right) {
      s.border.right = {};
    }
    if (style.borderStyle?.right) {
      s.border.right.style = style.borderStyle.right;
    }
    if (style.borderColor?.right) {
      s.border.right.color = { rgb: style.borderColor.right.slice(1) };
    }
    if (style.borderStyle?.bottom || style.borderColor?.bottom) {
      s.border.bottom = {};
    }
    if (style.borderStyle?.bottom) {
      s.border.bottom.style = style.borderStyle.bottom;
    }
    if (style.borderColor?.bottom) {
      s.border.bottom.color = { rgb: style.borderColor.bottom.slice(1) };
    }
    if (style.borderStyle?.left || style.borderColor?.left) {
      s.border.left = {};
    }
    if (style.borderStyle?.left) {
      s.border.left.style = style.borderStyle.left;
    }
    if (style.borderColor?.left) {
      s.border.left.color = { rgb: style.borderColor.left.slice(1) };
    }
  }

  if (
    style.bold !== undefined ||
    style.color ||
    style.italic !== undefined ||
    style.font ||
    style.strike !== undefined ||
    style.size !== undefined ||
    style.underline !== undefined ||
    style.script
  ) {
    s.font = {};
    if (style.bold !== undefined) {
      s.font.bold = style.bold;
    }
    if (style.color) {
      s.font.color = { rgb: style.color.slice(1) };
    }
    if (style.italic !== undefined) {
      s.font.italic = style.italic;
    }
    if (style.font) {
      s.font.name = style.font;
    }
    if (style.strike !== undefined) {
      s.font.strike = style.strike;
    }
    if (style.size !== undefined) {
      s.font.sz = style.size;
    }
    if (style.underline !== undefined) {
      s.font.underline = style.underline;
    }
    if (style.script !== undefined) {
      s.font.vertAlign = style.script;
    }
  }
  if (style.numberFormat !== undefined) {
    s.font.numFmt = style.numberFormat;
  }
  return s;
}
