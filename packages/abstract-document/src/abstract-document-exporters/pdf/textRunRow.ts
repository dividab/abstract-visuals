import * as AD from "../../abstract-document/index.js";
import { getFontNameStyle, transformText } from "./font.js";

export type PdfKitAlignment = PDFKit.Mixins.TextOptions["align"];

type LongWordSplit = {
  readonly text: string;
  readonly width: number;
};

export type ParagraphRows = {
  readonly rows: ReadonlyArray<ReadonlyArray<AD.Atom.Atom>>;
  readonly desiredSizes: Map<object, AD.Size.Size>;
  /** A word wider than its row was split between its characters */
  readonly hasSplitWord: boolean;
};

/** The rows a paragraph is drawn in, shared by measure and render so that they agree on its height */
export function layoutParagraphRows(
  children: ReadonlyArray<AD.Atom.Atom>,
  availableWidth: number,
  desiredSizes: Map<object, AD.Size.Size>,
  style: AD.ParagraphStyle.ParagraphStyle,
  pdf: PDFKit.PDFDocument,
  resources: AD.Resources.Resources
): ParagraphRows {
  const rows: Array<Array<AD.Atom.Atom>> = [];
  let currentRow: Array<AD.Atom.Atom> = [];
  let currentWidth = 0;
  let previousAtomType: string | undefined = undefined;
  for (const atom of children) {
    if (atom.type === "LineBreak") {
      currentRow.push(atom);
      rows.push(currentRow);
      currentRow = [];
      continue;
    }

    if (!previousAtomType) {
      // First atom
      previousAtomType = atom.type;
      currentRow.push(atom);
      const atomSize = getDesiredSize(atom, desiredSizes);
      currentWidth = atomSize.width;
      continue;
    }

    if (atom.type !== "Image") {
      // Atom is Text
      if (previousAtomType === "Image") {
        // Previous was image
        rows.push(currentRow);
        currentRow = [];
        currentWidth = 0;
        previousAtomType = atom.type;
      }
      currentRow.push(atom);
      continue;
    }

    // Atom is Image
    if (previousAtomType !== "Image") {
      // Previous was not image
      rows.push(currentRow);
      currentRow = [];
      currentWidth = 0;
      previousAtomType = atom.type;
    }
    const atomSize = getDesiredSize(atom, desiredSizes);
    if (currentWidth + atomSize.width < availableWidth || currentRow.length === 0) {
      // Image fits in current row/current row is empty
      currentRow.push(atom);
      currentWidth += atomSize.width;
    } else {
      // Image does not fit in current row
      rows.push(currentRow);
      currentRow = [atom];
      currentWidth = atomSize.width;
    }
  }
  if (currentRow.length > 0) {
    // Add any remaning children to a new row.
    rows.push(currentRow);
  }

  const alignment = parseAlignment(style.alignment);
  const split = rowsSplit(rows, availableWidth, desiredSizes, alignment, pdf, resources, style.textStyle, style.wordBreak);
  const { newDesiredSizes, combinedRows } = rowsCombineTextRuns(resources, pdf, split.rows, desiredSizes, alignment, style.textStyle);
  return { rows: combinedRows, desiredSizes: newDesiredSizes, hasSplitWord: split.hasSplitWord };
}

/** The height of the rows as render draws them, each as high as its highest atom */
export function rowsHeight(rows: ReadonlyArray<ReadonlyArray<AD.Atom.Atom>>, desiredSizes: Map<object, AD.Size.Size>): number {
  return rows.reduce((sum, row) => sum + row.reduce((max, atom) => Math.max(max, getDesiredSize(atom, desiredSizes).height), 0), 0);
}

export function parseAlignment(paragraphAlignment: AD.ParagraphStyle.TextAlignment | undefined): PdfKitAlignment {
  switch (paragraphAlignment) {
    case "Start":
      return "left";
    case "Center":
      return "center";
    case "End":
      return "right";
    case "Justify":
      return "justify";
    default:
      return "left";
  }
}

function rowsSplit(
  rows: ReadonlyArray<ReadonlyArray<AD.Atom.Atom>>,
  availableWidth: number,
  desiredSizes: Map<object, AD.Size.Size>,
  alignment: PdfKitAlignment,
  pdf: PDFKit.PDFDocument,
  resources: AD.Resources.Resources,
  defaultStyle: AD.TextStyle.TextStyle,
  wordBreak: AD.ParagraphStyle.WordBreak = "Anywhere"
): { readonly rows: ReadonlyArray<ReadonlyArray<AD.Atom.Atom>>; readonly hasSplitWord: boolean } {
  const newRows: Array<ReadonlyArray<AD.Atom.Atom>> = [];
  const splitWords = wordBreak === "Anywhere";
  let hasSplitWord = false;

  for (const row of rows) {
    if (splitWords ? row.length < 1 : row.length <= 1) {
      newRows.push(row);
      continue;
    }

    const width = row.reduce((a, b) => a + getDesiredSize(b, desiredSizes).width, 0);
    if (splitWords ? width < availableWidth : width <= availableWidth) {
      newRows.push(row);
      continue;
    }

    //we need to split it, because it doesn't fit
    let currentRow: Array<AD.Atom.Atom> = [];
    let currentWidth = 0;
    let lastWasSpace = false;

    for (let i = 0; i < row.length; i++) {
      const atom = row[i]!;
      const width = getDesiredSize(atom, desiredSizes).width;

      if (atom.type !== "TextRun") {
        currentRow.push(atom);
        currentWidth += width;
        continue;
      }

      const isSpace = atom.text.replaceAll(/[\p{Zs}]/gu, "").length === 0;
      const lastSpace = lastWasSpace;
      lastWasSpace = isSpace;

      //if the next atom is a space, we need to split this row early if it doesnt fit
      const nextAtom = row[i + 1];
      const nextWidthIfSpace =
        !isSpace && nextAtom?.type === "TextRun" && nextAtom.text.replaceAll(/[\p{Zs}]/gu, "").length === 0
          ? getDesiredSize(nextAtom, desiredSizes).width
          : 0;

      if (isSpace && currentWidth === 0 && i !== 0 && (alignment === "left" || alignment === "justify")) {
        continue;
      }

      if (currentWidth + width + nextWidthIfSpace < availableWidth) {
        currentRow.push(atom);
        currentWidth += width;
        continue;
      }

      //was it a space??
      if (isSpace) {
        newRows.push(currentRow);
        currentRow = [];
        currentWidth = 0;
        continue;
      }

      //it is now longer than the remaning size
      const remSize = availableWidth - (currentWidth + nextWidthIfSpace);
      const splittedWord = splitWords ? splitWord(atom, remSize, availableWidth, pdf, resources, defaultStyle) : [];
      if (splittedWord.length > 0) {
        hasSplitWord = true;
        const [first, ...rest] = splittedWord;
        if (!first) {
          continue;
        }
        // Each part is one line, as high as an unsplit word of one line. The word's measured height is for pdfkit's
        // own wrapping of it, which can have fewer lines than the parts, e.g. when the first part continues a row.
        //add the first to the current row
        const newFirstRowAtom = { ...atom, text: first.text };
        desiredSizes.set(newFirstRowAtom, {
          width: first.width,
          height: stringHeight(atom, pdf, first.text, availableWidth, resources, defaultStyle),
        });
        currentRow.push(newFirstRowAtom);

        //then add new rows
        for (const part of rest) {
          newRows.push(currentRow);
          const newAtom = { ...atom, text: part.text };
          desiredSizes.set(newAtom, {
            width: part.width,
            height: stringHeight(atom, pdf, part.text, availableWidth, resources, defaultStyle),
          });
          currentRow = [newAtom];
          currentWidth = part.width;
        }
        continue;
      }

      newRows.push(lastSpace && (alignment === "right" || alignment === "justify") ? currentRow.slice(0, -1) : currentRow);
      currentRow = [atom];
      currentWidth = width;
    }
    newRows.push(lastWasSpace && (alignment === "right" || alignment === "justify") ? currentRow.slice(0, -1) : currentRow);
  }
  return { rows: newRows, hasSplitWord };
}

/*
  the first entry fits inside the current row
*/
function splitWord(
  word: AD.TextRun.TextRun,
  firstRowRemainingWidth: number,
  rowWidth: number,
  pdf: PDFKit.PDFDocument,
  resources: AD.Resources.Resources,
  defaultStyle: AD.TextStyle.TextStyle
): ReadonlyArray<LongWordSplit> {
  const strings: Array<LongWordSplit> = [];
  const totalWidth = stringWidth(word, pdf, word.text, resources, defaultStyle);
  if (totalWidth < rowWidth) {
    return [];
  }

  let currentString = "";
  let atFirstRow = true;
  for (const char of word.text) {
    const remWidth = atFirstRow ? firstRowRemainingWidth : rowWidth;
    const newString = currentString + char;
    const newWidth = stringWidth(word, pdf, newString, resources, defaultStyle);
    if (newWidth < remWidth) {
      currentString = newString;
      continue;
    }

    strings.push({
      text: currentString,
      width: newWidth,
    });

    //reset
    currentString = char;
    atFirstRow = false;
  }

  //add any remainder
  if (currentString !== "") {
    const newWidth = stringWidth(word, pdf, currentString, resources, defaultStyle);
    strings.push({
      text: currentString,
      width: newWidth,
    });
  }

  return strings;
}

export function rowsCombineTextRuns(
  resources: AD.Resources.Resources,
  pdf: PDFKit.PDFDocument,
  rows: ReadonlyArray<ReadonlyArray<AD.Atom.Atom>>,
  desiredSizes: Map<object, AD.Size.Size>,
  alignment: PdfKitAlignment,
  defaultStyle: AD.TextStyle.TextStyle
): { newDesiredSizes: Map<object, AD.Size.Size>; combinedRows: ReadonlyArray<ReadonlyArray<AD.Atom.Atom>> } {
  if (alignment === "justify") {
    return { combinedRows: rows, newDesiredSizes: desiredSizes };
  }

  let currentString = "";
  let currentHeight = 0;
  let current: AD.TextRun.TextRun | undefined = undefined;
  let currentStyle: string = "";

  const newRows: Array<ReadonlyArray<AD.Atom.Atom>> = [];
  for (const row of rows) {
    const newRow: Array<AD.Atom.Atom> = [];
    let isFirst = true;

    for (let i = 0; i < row.length; i++) {
      const atom = row[i]!;
      const isLast = i === row.length - 1;
      const measurement = getDesiredSize(atom, desiredSizes);

      if (atom.type !== "TextRun") {
        if (current !== undefined) {
          const newTextRun = {
            ...current,
            text: currentString,
          };
          if (isFirst && alignment === "left") {
            while (currentString.startsWith(" ")) {
              currentString = currentString.slice(1);
            }
            isFirst = false;
          } else if (isFirst) {
            isFirst = false;
          }
          newRow.push(newTextRun);
          desiredSizes.set(newTextRun, {
            width: stringWidth(current, pdf, currentString, resources, defaultStyle),
            height: currentHeight,
          });
          currentString = "";
          currentStyle = "";
          currentHeight = 0;
          current = undefined;
        }
        newRow.push(atom);
        continue;
      }

      const style = JSON.stringify(
        AD.Resources.getNestedStyle(defaultStyle, atom.style, "TextStyle", atom.styleName, resources, atom.nestedStyleNames ?? [])
      );

      if (current === undefined) {
        currentString = atom.text;
        current = atom;
        currentHeight = Math.max(measurement.height, currentHeight);
        currentStyle = style;
      } else if (style !== currentStyle) {
        const newTextRun = {
          ...current,
          text: currentString,
        };
        if (isFirst && alignment === "left") {
          while (currentString.startsWith(" ")) {
            currentString = currentString.slice(1);
          }
          isFirst = false;
        } else if (isFirst) {
          isFirst = false;
        }
        newRow.push(newTextRun);
        desiredSizes.set(newTextRun, {
          width: stringWidth(current, pdf, currentString, resources, defaultStyle),
          height: currentHeight,
        });
        currentString = atom.text;
        currentHeight = Math.max(measurement.height, currentHeight);
        current = atom;
        currentStyle = style;
      } else {
        currentString += atom.text;
        currentHeight = Math.max(measurement.height, currentHeight);
      }

      if (isLast) {
        //does the last contain spaces at the end?
        if (alignment === "right") {
          while (currentString.endsWith(" ")) {
            currentString = currentString.slice(0, -1);
          }
        }
        if (isFirst && alignment === "left") {
          while (currentString.startsWith(" ")) {
            currentString = currentString.slice(1);
          }
          isFirst = false;
        }

        const newTextRun: AD.Atom.Atom = {
          ...current,
          text: currentString,
        };
        newRow.push(newTextRun);
        desiredSizes.set(newTextRun, {
          width: stringWidth(current, pdf, currentString, resources, defaultStyle),
          height: currentHeight,
        });
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
  const { style, textOptions } = setTextRunFont(textRun, pdf, resources, defaultStyle);
  return pdf.widthOfString(transformText(pdf, text, style.transform), { ...textOptions, lineBreak: false });
}

/** The height of text in a row of the given width, measured like measure measures a TextRun */
function stringHeight(
  textRun: AD.TextRun.TextRun,
  pdf: PDFKit.PDFDocument,
  text: string,
  rowWidth: number,
  resources: AD.Resources.Resources,
  defaultStyle: AD.TextStyle.TextStyle
): number {
  const { style, textOptions } = setTextRunFont(textRun, pdf, resources, defaultStyle);
  return pdf.heightOfString(transformText(pdf, text, style.transform), {
    ...textOptions,
    width: style.lineBreak === false ? Infinity : rowWidth,
    lineBreak: style.lineBreak ?? true,
  });
}

/** Makes the TextRun's font current and returns its style and the pdfkit options its text is measured with */
function setTextRunFont(
  textRun: AD.TextRun.TextRun,
  pdf: PDFKit.PDFDocument,
  resources: AD.Resources.Resources,
  defaultStyle: AD.TextStyle.TextStyle
): { readonly style: AD.TextStyle.TextStyle; readonly textOptions: PDFKit.Mixins.TextOptions } {
  const style = (AD.Resources.getNestedStyle(
    defaultStyle,
    textRun.style,
    "TextStyle",
    textRun.styleName,
    resources,
    textRun.nestedStyleNames ?? []
  ) ?? defaultStyle) as AD.TextStyle.TextStyle;

  pdf
    .font(getFontNameStyle(style))
    .fontSize(AD.TextStyle.calculateFontSize(style, 10))
    .fillColor(style.color ?? "black");

  const textOptions = {
    underline: style.underline ?? false,
    indent: style.indent ?? 0,
    ...(style.characterSpacing !== undefined ? { characterSpacing: style.characterSpacing } : {}),
    ...(style.lineGap !== undefined ? { lineGap: style.lineGap } : {}),
  };
  return { style, textOptions };
}

function getDesiredSize(element: object, desiredSizes: Map<object, AD.Size.Size>): AD.Size.Size {
  const size = desiredSizes.get(element);
  if (size) {
    return size;
  }
  throw new Error("Could not find size for element!");
}
