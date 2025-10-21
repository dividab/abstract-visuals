import * as AD from "../../abstract-document/index.js";
import { getFontNameStyle } from "./font.js";

export type PdfKitAlignment = PDFKit.Mixins.TextOptions["align"];

export function rowsSplit(rows: ReadonlyArray<ReadonlyArray<AD.Atom.Atom>>, availableWidth: number, desiredSizes: Map<{}, AD.Size.Size>, alignment: PdfKitAlignment): ReadonlyArray<ReadonlyArray<AD.Atom.Atom>> {
  const newRows: Array<ReadonlyArray<AD.Atom.Atom>> = [];

  for(const row of rows) {
    if(row.length <= 1) {
      newRows.push(row);
      continue;
    }
    
    const width = row.reduce((a, b) => a + getDesiredSize(b, desiredSizes).width, 0);
    if(width <= availableWidth) {
      newRows.push(row);
      continue;
    }

    //we need to split it, because it doesn't fit
    let currentRow: Array<AD.Atom.Atom> = [];
    let currentWidth = 0;
    let lastWasSpace = false;

    for(let i = 0; i < row.length; i++) {
      const atom = row[i];

      const width = getDesiredSize(atom, desiredSizes).width;

      if(atom.type !== "TextRun") {
        currentRow.push(atom);
        currentWidth += width;
        continue;
      }

      const isSpace = atom.text.replaceAll(/[\p{Zs}]/ug, "").length === 0;
      const lastSpace = lastWasSpace;
      lastWasSpace = isSpace;

      //if the next atom is a space, we need to split this row early if it doesnt fit
      const nextAtom = row[i + 1];
      const nextWidthIfSpace = 
        !isSpace
        && nextAtom
        && nextAtom.type === "TextRun"
        && nextAtom.text.replaceAll(/[\p{Zs}]/ug, "").length === 0
          ? getDesiredSize(nextAtom, desiredSizes).width
          : 0;

      if(isSpace && currentWidth === 0 && i !== 0 && (alignment === "left" || alignment === "justify")) {
        continue;
      }
      
      if((currentWidth + width + nextWidthIfSpace) < availableWidth) {
        currentRow.push(atom);
        currentWidth += width;
        continue;
      }

      //was it a space??
      if(isSpace) {
        newRows.push(currentRow);
        currentRow = [];
        currentWidth = 0;
        continue;
      }

      newRows.push((lastSpace && (alignment === "right" || alignment === "justify")) ? currentRow.slice(0, -1) : currentRow);
      currentRow = [atom];
      currentWidth = width;
    }
    newRows.push((lastWasSpace && (alignment === "right" || alignment === "justify")) ? currentRow.slice(0, -1) : currentRow);
  }
  return newRows;
}

export function rowsCombineTextRuns(resources: AD.Resources.Resources, pdf: PDFKit.PDFDocument, rows: ReadonlyArray<ReadonlyArray<AD.Atom.Atom>>, desiredSizes: Map<{}, AD.Size.Size>, alignment: PdfKitAlignment, defaultStyle: AD.TextStyle.TextStyle): { newDesiredSizes: Map<{}, AD.Size.Size>; combinedRows: ReadonlyArray<ReadonlyArray<AD.Atom.Atom>> } {
  if(alignment === "justify") {
    return { combinedRows: rows, newDesiredSizes: desiredSizes };
  }

  let currentString = "";
  let currentHeight = 0;
  let current: AD.Atom.Atom | undefined = undefined;
  let currentStyle: string = "";

  const newRows: Array<ReadonlyArray<AD.Atom.Atom>> = [];
  for(const row of rows) {
    const newRow: Array<AD.Atom.Atom> = [];
    let isFirst = true;

    for(let i = 0; i < row.length; i++) {
      const atom = row[i];
      const isLast = i === row.length - 1;
      const measurement = getDesiredSize(atom, desiredSizes);

      if(atom.type !== "TextRun") {
        if(current !== undefined) {
          const newTextRun = {
            ...current,
            text: currentString
          };
          if(isFirst && alignment === "left") {
            while(currentString.startsWith(" ")) {
              currentString = currentString.slice(1);
            }
            isFirst = false;
          } else if(isFirst) {
            isFirst = false;
          }
          newRow.push(newTextRun);
          desiredSizes.set(newTextRun, { width: stringWidth(current, pdf, currentString, resources, defaultStyle), height: currentHeight });
          currentString = "";
          currentStyle = "";
          currentHeight = 0;
          current = undefined;
        }
        newRow.push(atom);
        continue;
      }

      const style = JSON.stringify(AD.Resources.getNestedStyle(
        defaultStyle,
        atom.style,
        "TextStyle",
        atom.styleName,
        resources,
        atom.nestedStyleNames || []
      ));

      if(current === undefined) {
        currentString = atom.text;
        current = atom;
        currentHeight = Math.max(measurement.height, currentHeight);
        currentStyle = style;
      } else if(style !== currentStyle) {
        const newTextRun = {
          ...current,
          text: currentString
        };
        if(isFirst && alignment === "left") {
          while(currentString.startsWith(" ")) {
            currentString = currentString.slice(1);
          }
          isFirst = false;
        } else if(isFirst) {
          isFirst = false;
        }
        newRow.push(newTextRun);
        desiredSizes.set(newTextRun, { width: stringWidth(current, pdf, currentString, resources, defaultStyle), height: currentHeight });
        currentString = atom.text;
        currentHeight = Math.max(measurement.height, currentHeight);
        current = atom;
        currentStyle = style;
      } else {
        currentString += atom.text;
        currentHeight = Math.max(measurement.height, currentHeight);
      }

      if(isLast) {
        if(current) {
          //does the last contain spaces at the end?
          if(alignment === "right") {
            while(currentString.endsWith(" ")) {
              currentString = currentString.slice(0, -1);
            }
          }
          if(isFirst && alignment === "left") {
            while(currentString.startsWith(" ")) {
              currentString = currentString.slice(1);
            }
            isFirst = false;
          }

          const newTextRun: AD.Atom.Atom = {
            ...current,
            text: currentString,
          }
          newRow.push(newTextRun);
          desiredSizes.set(newTextRun, { width: stringWidth(current, pdf, currentString, resources, defaultStyle), height: currentHeight });
        }
      }
    }
    current = undefined;
    currentHeight = 0;
    currentString = "";
    currentStyle = "";
    newRows.push(newRow);
  }
  return { newDesiredSizes: desiredSizes, combinedRows: newRows };
}

function stringWidth(
  textRun: AD.TextRun.TextRun,
  pdf: PDFKit.PDFDocument,
  text: string,
  resources: AD.Resources.Resources,
  defaultStyle: AD.TextStyle.TextStyle
): number {
  const style = AD.Resources.getNestedStyle(
    defaultStyle,
    textRun.style,
    "TextStyle",
    textRun.styleName,
    resources,
    textRun.nestedStyleNames || []
  ) as AD.TextStyle.TextStyle ?? defaultStyle;

  const font = getFontNameStyle(style);
  const fontSize = AD.TextStyle.calculateFontSize(style, 10);
  pdf
    .font(font)
    .fontSize(fontSize)
    .fillColor(style.color || "black");

  const textOptions = {
    underline: style.underline || false,
    indent: style.indent || 0,
    lineBreak: false,
    ...(style.characterSpacing !== undefined ? { characterSpacing: style.characterSpacing } : {}),
    ...(style.lineGap !== undefined ? { lineGap: style.lineGap } : {}),
  };
  return pdf.widthOfString(text, textOptions);
}

function getDesiredSize(element: {}, desiredSizes: Map<{}, AD.Size.Size>): AD.Size.Size {
  const size = desiredSizes.get(element);
  if (size) {
    return size;
  }
  throw new Error("Could not find size for element!");
}