import * as AD from "../../abstract-document/index.js";
import { preProcess } from "./pre-process.js";
import { measure, measurePages } from "./measure.js";
import { paginate, Page, getHeaderAndFooter } from "./paginate.js";
import { updatePageRefs } from "./update-refs.js";
import { renderImage } from "./render-image.js";
import { registerFonts, getFontNameStyle } from "./font.js";
import { PdfKitAlignment, rowsCombineTextRuns, rowsSplit } from "./textRunRow.js";

export type PdfExportOptions = {
  compress: boolean;
};

export function exportToHTML5Blob(
  pdfKit: PDFKit.PDFDocument,
  doc: AD.AbstractDoc.AbstractDoc,
  options: PdfExportOptions = { compress: false }
): Promise<Blob> {
  return new Promise((resolve) => {
    let pdf = createDocument(pdfKit, options, doc);
    const buffers = Array<BlobPart>();
    pdf.on("data", buffers.push.bind(buffers));
    pdf.on("end", () => resolve(new Blob(buffers, { type: "application/pdf" })));
  });
}

/**
 * On the client side the stream can be a BlobStream from the blob-stream package.
 * On the server-side the stream can be a file stream from the fs package.
 * @param pdfKit
 * @param blobStream
 * @param doc
 * @param options
 */
export function exportToStream(
  pdfKit: PDFKit.PDFDocument,
  blobStream: any,
  doc: AD.AbstractDoc.AbstractDoc,
  options: PdfExportOptions = { compress: false }
): void {
  let pdf = createDocument(pdfKit, options, doc);
  pdf.pipe(blobStream);
}

function createDocument(
  pdfKit: PDFKit.PDFDocument,
  options: PdfExportOptions,
  ad: AD.AbstractDoc.AbstractDoc
): PDFKit.PDFDocument {
  const pdf = new pdfKit({ ...options, autoFirstPage: false, bufferPages: true });

  const document = preProcess(ad);
  registerFonts((fontName: string, fontSource: AD.Font.FontSource) => pdf.registerFont(fontName, fontSource), document);
  const desiredSizes = measure(pdfKit, document);
  const pages = paginate(pdfKit, document, desiredSizes);
  const updatedPages = updatePageRefs(pages);
  const pageDesiredSizes = measurePages(pdfKit, document, updatedPages);

  for (let page of updatedPages) {
    renderPage(document, pdf, pageDesiredSizes, page);
  }
  pdf.end();
  return pdf;
}

function renderPage(
  parentResources: AD.Resources.Resources,
  pdfKit: PDFKit.PDFDocument,
  desiredSizes: Map<{}, AD.Size.Size>,
  page: Page
): void {
  const section = page.section;
  const style = section.page.style;
  const resources = AD.Resources.mergeResources([parentResources, section]);
  const pageHeight = AD.PageStyle.getHeight(style);
  const contentRect = addPage(pdfKit, page);

  page.namedDestionations.forEach((dest) => {
    if ((pdfKit as any).addNamedDestination) {
      (pdfKit as any).addNamedDestination(dest);
    }
  });

  const { headerMargins, footerMargins } = getHeaderAndFooter(section, page.pageNo);
  const headerX = headerMargins.left;
  const headerStart = headerMargins.top;
  let headerY = headerStart;
  for (let element of page.header) {
    const elementSize = getDesiredSize(element, desiredSizes);
    const isAbsolute = AD.Position.isPositionAbsolute(element);
    renderSectionElement(
      resources,
      pdfKit,
      desiredSizes,
      AD.Rect.create(headerX, isAbsolute ? headerStart : headerY, elementSize.width, elementSize.height),
      element
    );
    if (!isAbsolute) {
      headerY += elementSize.height;
    }
  }
  headerY += headerMargins.bottom;

  const footerHeight = page.footer.reduce(
    (a, b) => a + (AD.Position.isPositionAbsolute(b) ? 0 : getDesiredSize(b, desiredSizes).height),
    footerMargins.top + footerMargins.bottom
  );
  const footerX = footerMargins.left;
  const footerStart = pageHeight - (footerHeight - footerMargins.top);
  let footerY = footerStart;
  for (let element of page.footer) {
    const elementSize = getDesiredSize(element, desiredSizes);
    const isAbsolute = AD.Position.isPositionAbsolute(element);
    renderSectionElement(
      resources,
      pdfKit,
      desiredSizes,
      AD.Rect.create(footerX, isAbsolute ? footerStart : footerY, elementSize.width, elementSize.height),
      element
    );
    if (!isAbsolute) {
      footerY += elementSize.height;
    }
  }

  const elementStart = contentRect.y;
  let y = elementStart;
  for (const element of page.elements) {
    const elementSize = getDesiredSize(element, desiredSizes);
    const isAbsolute = AD.Position.isPositionAbsolute(element);
    renderSectionElement(
      resources,
      pdfKit,
      desiredSizes,
      AD.Rect.create(contentRect.x, isAbsolute ? elementStart : y, elementSize.width, elementSize.height),
      element
    );
    if (!isAbsolute) {
      y += elementSize.height;
    }
  }
}

function addPage(pdf: PDFKit.PDFDocument, page: Page): AD.Rect.Rect {
  const section = page.section;
  const style = section.page.style;
  // This is rotated later depending on the orientation.
  const pageWidth = AD.PageStyle.getPaperWidth(style.paperSize);
  const pageHeight = AD.PageStyle.getPaperHeight(style.paperSize);
  const layout = style.orientation === "Landscape" ? "landscape" : "portrait";
  const pageOptions: PDFKit.PDFDocumentOptions = {
    size: [pageWidth, pageHeight],
    layout: layout,
    margins: { top: 0, left: 0, right: 0, bottom: 0 },
  };
  pdf.addPage(pageOptions);
  return page.contentRect;
}

function renderSectionElement(
  parentResources: AD.Resources.Resources,
  pdf: PDFKit.PDFDocument,
  desiredSizes: Map<{}, AD.Size.Size>,
  finalRect: AD.Rect.Rect,
  element: AD.SectionElement.SectionElement
): void {
  const resources = AD.Resources.mergeResources([parentResources, element]);
  switch (element.type) {
    case "Paragraph":
      renderParagraph(resources, pdf, desiredSizes, finalRect, element);
      return;
    case "Table":
      renderTable(resources, pdf, desiredSizes, finalRect, element);
      return;
    case "Group":
      renderGroup(resources, pdf, desiredSizes, finalRect, element);
      return;
  }
}

function renderGroup(
  resources: AD.Resources.Resources,
  pdfKit: PDFKit.PDFDocument,
  desiredSizes: Map<{}, AD.Size.Size>,
  finalRect: AD.Rect.Rect,
  group: AD.Group.Group
): void {
  const finalX = finalRect.x + group.style.margins.left;
  const startY = finalRect.y + group.style.margins.top;
  let y = startY;
  for (const element of group.children) {
    const elementSize = getDesiredSize(element, desiredSizes);
    const isAbsolute = AD.Position.isPositionAbsolute(element);
    renderSectionElement(
      resources,
      pdfKit,
      desiredSizes,
      AD.Rect.create(finalX, isAbsolute ? startY : y, elementSize.width, elementSize.height),
      element
    );
    if (!isAbsolute) {
      y += elementSize.height;
    }
  }
}

function renderParagraph(
  resources: AD.Resources.Resources,
  pdfKit: PDFKit.PDFDocument,
  desiredSizes: Map<{}, AD.Size.Size>,
  finalRect: AD.Rect.Rect,
  paragraph: AD.Paragraph.Paragraph
): void {
  const style = AD.Resources.getStyle(
    undefined,
    paragraph.style,
    "ParagraphStyle",
    paragraph.styleName,
    resources
  ) as AD.ParagraphStyle.ParagraphStyle;
  const availableWidth = finalRect.width - (style.margins.left + style.margins.right);

  let rows: Array<Array<AD.Atom.Atom>> = [];
  let currentRow: Array<AD.Atom.Atom> = [];
  let currentWidth = 0;
  let previousAtomType: string | undefined;
  for (const atom of paragraph.children) {
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

    if (atom.type === "Image") {
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
  }
  if (currentRow.length > 0) {
    // Add any remaning children to a new row.
    rows.push(currentRow);
  }

  let y = finalRect.y + style.margins.top;
  const alignment = parseAlignment(style.alignment);
  const newRows = rowsSplit(rows, availableWidth, desiredSizes, alignment);
  const { newDesiredSizes, combinedRows } = rowsCombineTextRuns(resources, pdfKit, newRows, desiredSizes, alignment, style.textStyle);
  for (let r = 0; r < combinedRows.length; r++) {
    const row = combinedRows[r];
    const isLast = r === combinedRows.length - 1;
    if (row.length === 0) {
      continue;
    }
    
    const rowWidth = row.reduce((a, b) => a + getDesiredSize(b, newDesiredSizes).width, 0);
    const remainingWidth = availableWidth - rowWidth;
    const justificationWidth = !isLast && row.length > 1 ? remainingWidth / (row.length - 1) : 0;
    let x = finalRect.x;

    if (style.alignment === "Start" || style.alignment === "Justify") {
      x += style.margins.left;
    } else if (style.alignment === "End") {
      x -= style.margins.right;
    }

    if (row.length > 1 || row[0].type === "Image" || row[0].type === "TextRun") {
      // Using continued with alignment "center" or "right" is broken:
      // https://github.com/foliojs/pdfkit/issues/240
      // Therefore we have to position it ourself
      // NOTE:  Texts with multiple atoms with width over the available width are not supported.
      // NOTE2: This should be fixed now since we split the text into an array of words instead
      //        and place them manually here
      if (style.alignment === "Center") {
        x += 0.5 * remainingWidth;
      } else if (style.alignment === "End") {
        x += remainingWidth;
      }
    }

    let rowHeight = 0;
    const lastIndex = row[row.length - 1]?.type === "LineBreak" ? row.length - 2 : row.length - 1;
    for (const [i, atom] of row.entries()) {
      const atomSize = getDesiredSize(atom, newDesiredSizes);
      renderAtom(
        resources,
        pdfKit,
        AD.Rect.create(x, y, atomSize.width, atomSize.height),
        style.textStyle,
        atom,
        alignment,
        availableWidth,
        i === 0,
        i === lastIndex
      );
      x += atomSize.width + (style.alignment === "Justify" ? justificationWidth : 0);
      rowHeight = Math.max(rowHeight, atomSize.height);
    }

    y += rowHeight;
  }
}

function parseAlignment(paragraphAlignment: AD.ParagraphStyle.TextAlignment | undefined): PdfKitAlignment {
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

function renderAtom(
  resources: AD.Resources.Resources,
  pdfKit: PDFKit.PDFDocument,
  finalRect: AD.Rect.Rect,
  textStyle: AD.TextStyle.TextStyle,
  atom: AD.Atom.Atom,
  alignment: PdfKitAlignment,
  availableWidth: number,
  isFirstAtom: boolean,
  isLastAtom: boolean
): void {
  switch (atom.type) {
    case "TextField":
      renderTextField(
        resources,
        pdfKit,
        finalRect,
        textStyle,
        atom,
        alignment,
        isFirstAtom,
        isLastAtom,
      );
      return;
    case "TextRun":
      renderTextRun(resources, pdfKit, finalRect, textStyle, atom, alignment, isFirstAtom, isLastAtom);
      return;
    case "Image":
      renderImage(resources, pdfKit, finalRect, textStyle, atom);
      return;
    case "HyperLink":
      renderHyperLink(
        resources,
        pdfKit,
        finalRect,
        textStyle,
        atom,
        alignment,
        isFirstAtom,
        isLastAtom,
        availableWidth
      );
      return;
    case "TocSeparator":
      renderTocSeparator(pdfKit, finalRect, textStyle, atom);
      return;
    case "LinkTarget":
      return;
    case "LineBreak":
      return;
  }
}

function renderTextField(
  resources: AD.Resources.Resources,
  pdfKit: PDFKit.PDFDocument,
  finalRect: AD.Rect.Rect,
  textStyle: AD.TextStyle.TextStyle,
  textField: AD.TextField.TextField,
  alignment: PdfKitAlignment,
  isFirstAtom: boolean,
  isLastAtom: boolean,
): void {
  const style = AD.Resources.getStyle(
    textStyle,
    textField.style,
    "TextStyle",
    textField.styleName,
    resources
  ) as AD.TextStyle.TextStyle;
  switch (textField.fieldType) {
    case "Date":
      drawText(
        pdfKit,
        finalRect,
        style,
        new Date(Date.now()).toDateString(),
        alignment,
        isFirstAtom,
        isLastAtom,
      );
      return;
    case "PageNumber":
    case "TotalPages":
    case "PageNumberOf":
      if (textField.text) {
        drawText(pdfKit, finalRect, style, textField.text, alignment, isFirstAtom, isLastAtom);
      }
      return;
  }
}

function renderTextRun(
  resources: AD.Resources.Resources,
  pdf: PDFKit.PDFDocument,
  finalRect: AD.Rect.Rect,
  textStyle: AD.TextStyle.TextStyle,
  textRun: AD.TextRun.TextRun,
  alignment: PdfKitAlignment,
  isFirstAtom: boolean,
  isLastAtom: boolean,
): void {
  const style = AD.Resources.getNestedStyle(
    textStyle,
    textRun.style,
    "TextStyle",
    textRun.styleName,
    resources,
    textRun.nestedStyleNames || []
  ) as AD.TextStyle.TextStyle;
  drawText(pdf, finalRect, style, textRun.text, alignment, isFirstAtom, isLastAtom);
}

function renderHyperLink(
  resources: AD.Resources.Resources,
  pdf: PDFKit.PDFDocument,
  finalRect: AD.Rect.Rect,
  textStyle: AD.TextStyle.TextStyle,
  hyperLink: AD.HyperLink.HyperLink,
  alignment: PdfKitAlignment,
  isFirstAtom: boolean,
  isLastAtom: boolean,
  availableWidth: number
): void {
  const style = AD.Resources.getStyle(
    textStyle,
    hyperLink.style,
    "TextStyle",
    hyperLink.styleName,
    resources
  ) as AD.TextStyle.TextStyle;
  drawHyperLink(pdf, finalRect, style, hyperLink, alignment, isFirstAtom, isLastAtom, availableWidth);
}

function renderTocSeparator(
  pdf: PDFKit.PDFDocument,
  finalRect: AD.Rect.Rect,
  textStyle: AD.TextStyle.TextStyle,
  tocSeparator: AD.TocSeparator.TocSeparator
): void {
  drawDottedLine(pdf, finalRect, textStyle, tocSeparator);
}

function drawHyperLink(
  pdf: PDFKit.PDFDocument,
  finalRect: AD.Rect.Rect,
  textStyle: AD.TextStyle.TextStyle,
  hyperLink: AD.HyperLink.HyperLink,
  alignment: PdfKitAlignment,
  isFirstAtom: boolean,
  isLastAtom: boolean,
  availableWidth: number
): void {
  const font = getFontNameStyle(textStyle);
  const isInternalLink = hyperLink.target.startsWith("#") && !hyperLink.target.startsWith("#page=");
  const fontSize = AD.TextStyle.calculateFontSize(textStyle, 10);
  const isSingleAtom = isFirstAtom && isLastAtom;
  let xUnderline = finalRect.x;
  if (alignment === "center") {
    xUnderline += 0.5 * (availableWidth - finalRect.width);
  } else if (alignment === "right") {
    xUnderline += availableWidth - finalRect.width;
  }

  pdf
    .font(font)
    .fontSize(fontSize)
    .fillColor(textStyle.color || "blue");

  applyTextOffset(pdf, textStyle);

  // Using continued with alignment "center" or "right" is broken:
  // https://github.com/foliojs/pdfkit/issues/240
  // so always set alignment to left and handle it through an x offset
  // if its just a single atom then we can use its alignment to partially support multi-line texts for other alignments
  if (isFirstAtom || alignment !== "left") {
    pdf.text(hyperLink.text, finalRect.x, finalRect.y, {
      width: availableWidth,
      align: isSingleAtom ? alignment : "left",
      goTo: isInternalLink ? hyperLink.target.substr(1) : undefined,
      indent: textStyle.indent || 0,
      continued: alignment !== "left" ? false : !isLastAtom,
      baseline: textStyle.baseline || "top",
      ...(textStyle.characterSpacing !== undefined ? { characterSpacing: textStyle.characterSpacing } : {}),
      ...(textStyle.lineGap !== undefined ? { lineGap: textStyle.lineGap } : {}),
    });
    if (textStyle.underline === undefined ? true : textStyle.underline) {
      pdf.underline(xUnderline, finalRect.y + 2, finalRect.width, finalRect.height, { color: "blue" });
    }
  } else {
    pdf.text(hyperLink.text, {
      align: "left",
      goTo: isInternalLink ? hyperLink.target.substr(1) : undefined,
      indent: textStyle.indent || 0,
      continued: !isLastAtom,
      ...(textStyle.characterSpacing !== undefined ? { characterSpacing: textStyle.characterSpacing } : {}),
      ...(textStyle.lineGap !== undefined ? { lineGap: textStyle.lineGap } : {}),
    });
    if (textStyle.underline === undefined ? true : textStyle.underline) {
      pdf.underline(xUnderline, finalRect.y + 2, finalRect.width, finalRect.height, {
        color: "blue",
      });
    }
  }

  resetTextOffset(pdf, textStyle);

  if (!isInternalLink) {
    pdf.link(xUnderline, finalRect.y, finalRect.width, finalRect.height, hyperLink.target);
  }
}

/*function drawText(
  pdf: PDFKit.PDFDocument,
  finalRect: AD.Rect.Rect,
  textStyle: AD.TextStyle.TextStyle,
  text: string,
  alignment: PdfKitAlignment,
  isFirstAtom: boolean,
  isLastAtom: boolean,
  availableWidth: number
): void {
  const font = getFontNameStyle(textStyle);
  const fontSize = AD.TextStyle.calculateFontSize(textStyle, 10);
  const isSingleAtom = isFirstAtom && isLastAtom;
  pdf
    .font(font)
    .fontSize(fontSize)
    .fillColor(textStyle.color || "black", textStyle.opacity ?? 1.0);

  applyTextOffset(pdf, textStyle);

  // Using continued with alignment "center" or "right" is broken:
  // https://github.com/foliojs/pdfkit/issues/240
  // so always set alignment to left and handle it through an x offset
  // if its just a single atom then we can use its alignment to partially support multi-line texts for other alignments
  if (isFirstAtom || alignment !== "left") {
    pdf.text(text, finalRect.x, finalRect.y, {
      width: availableWidth,
      underline: textStyle.underline || false,
      align: isSingleAtom ? alignment : "left",
      indent: textStyle.indent || 0,
      continued: alignment !== "left" ? false : !isLastAtom,
      baseline: textStyle.baseline || "top",
      strike: textStyle.strike,
      ...(textStyle.characterSpacing !== undefined ? { characterSpacing: textStyle.characterSpacing } : {}),
      ...(textStyle.lineGap !== undefined ? { lineGap: textStyle.lineGap } : {}),
    });
  } else {
    pdf.text(text, {
      underline: textStyle.underline || false,
      align: "left",
      indent: textStyle.indent || 0,
      continued: !isLastAtom,
      strike: textStyle.strike || false,
      ...(textStyle.characterSpacing !== undefined ? { characterSpacing: textStyle.characterSpacing } : {}),
      ...(textStyle.lineGap !== undefined ? { lineGap: textStyle.lineGap } : {}),
    });
  }

  resetTextOffset(pdf, textStyle);
}*/

function drawText(
  pdf: PDFKit.PDFDocument,
  finalRect: AD.Rect.Rect,
  textStyle: AD.TextStyle.TextStyle,
  text: string,
  alignment: PdfKitAlignment,
  isFirst: boolean,
  isEnd: boolean,
): void {
  const font = getFontNameStyle(textStyle);
  const fontSize = AD.TextStyle.calculateFontSize(textStyle, 10);
  pdf
    .font(font)
    .fontSize(fontSize)
    .fillColor(textStyle.color || "black", textStyle.opacity ?? 1.0);

  applyTextOffset(pdf, textStyle);

  switch(alignment) {
    case "justify": {
      pdf.text(text, finalRect.x, finalRect.y, {
        width: Infinity,
        underline: textStyle.underline || false,
        continued: false,
        indent: textStyle.indent || 0,
        baseline: textStyle.baseline || "top",
        strike: textStyle.strike,
          ...(textStyle.characterSpacing !== undefined ? { characterSpacing: textStyle.characterSpacing } : {}),
          ...(textStyle.lineGap !== undefined ? { lineGap: textStyle.lineGap } : {}),
      });
      break;
    }

    

    default: {
      if(isFirst) {
        pdf.text(text, finalRect.x, finalRect.y, {
          width: Infinity,
          underline: textStyle.underline || false,
          continued: !isEnd,
          indent: textStyle.indent || 0,
          baseline: textStyle.baseline || "top",
          strike: textStyle.strike,
            ...(textStyle.characterSpacing !== undefined ? { characterSpacing: textStyle.characterSpacing } : {}),
            ...(textStyle.lineGap !== undefined ? { lineGap: textStyle.lineGap } : {}),
        });
      } else {
        pdf.text(text, {
          width: Infinity,
          underline: textStyle.underline || false,
          continued: !isEnd,
          indent: textStyle.indent || 0,
          baseline: textStyle.baseline || "top",
          strike: textStyle.strike,
            ...(textStyle.characterSpacing !== undefined ? { characterSpacing: textStyle.characterSpacing } : {}),
            ...(textStyle.lineGap !== undefined ? { lineGap: textStyle.lineGap } : {}),
        });
      }
      break;
    }
  }
  resetTextOffset(pdf, textStyle);
}

function drawDottedLine(
  pdf: PDFKit.PDFDocument,
  finalRect: AD.Rect.Rect,
  textStyle: AD.TextStyle.TextStyle,
  tocSeparator: AD.TocSeparator.TocSeparator
): void {
  const font = getFontNameStyle(textStyle);
  const fontSize = AD.TextStyle.calculateFontSize(textStyle, 10);

  const charSpacing = tocSeparator.width ? tocSeparator.width : 5;

  const oneDotW = pdf.widthOfString(".", {
    width: finalRect.width,
    height: finalRect.height,
    characterSpacing: charSpacing,
  });
  const twoDotsW = pdf.widthOfString("..", {
    width: finalRect.width,
    height: finalRect.height,
    characterSpacing: charSpacing,
  });
  const numberOfDots = Math.floor((finalRect.width - oneDotW) / (twoDotsW - oneDotW)) + 1;
  if (twoDotsW - oneDotW === 0 || numberOfDots < 1) {
    return;
  }

  const dotsText = ".".repeat(numberOfDots);
  pdf
    .font(font)
    .fontSize(fontSize)
    .fillColor(textStyle.color || "black");

  applyTextOffset(pdf, textStyle);

  // Disable continued for the dotted line to get the positioning right
  pdf.text("", {
    continued: false,
    goTo: undefined,
  });
  pdf.text(dotsText, finalRect.x, finalRect.y, {
    width: finalRect.width,
    height: finalRect.height,
    align: "right",
    characterSpacing: charSpacing,
  });
  resetTextOffset(pdf, textStyle);
}

function renderTable(
  resources: AD.Resources.Resources,
  pdf: PDFKit.PDFDocument,
  desiredSizes: Map<{}, AD.Size.Size>,
  finalRect: AD.Rect.Rect,
  table: AD.Table.Table
): void {
  const style = AD.Resources.getStyle(
    undefined,
    table.style,
    "TableStyle",
    table.styleName,
    resources
  ) as AD.TableStyle.TableStyle;
  const availableWidth = finalRect.width;
  let y = finalRect.y + style.margins.top;
  const rows = [...table.headerRows, ...table.children];
  for (let [index, row] of rows.entries()) {
    const rowSize = getDesiredSize(row, desiredSizes);
    let x = finalRect.x + style.margins.left;
    if (style.alignment === "Center") x += 0.5 * (availableWidth - rowSize.width);
    else if (style.alignment === "Right") x += availableWidth - rowSize.width;
    const rowRect = AD.Rect.create(x, y, rowSize.width, rowSize.height);
    const isTop = index === 0;
    const isBottom = index === rows.length - 1;
    renderRow(resources, pdf, desiredSizes, rowRect, style.cellStyle, table, row, index, isTop, isBottom);
    y += rowSize.height;
  }
}

function renderRow(
  resources: AD.Resources.Resources,
  pdf: PDFKit.PDFDocument,
  desiredSizes: Map<{}, AD.Size.Size>,
  finalRect: AD.Rect.Rect,
  tableCellStyle: AD.TableCellStyle.TableCellStyle,
  table: AD.Table.Table,
  row: AD.TableRow.TableRow,
  rowIndex: number,
  isTop: boolean,
  isBottom: boolean
): void {
  let x = finalRect.x;
  const rowSize = getDesiredSize(row, desiredSizes);
  for (const [cellIndex, cell] of row.children.entries()) {
    if (cell.dummy) {
      const dummySize = getDesiredSize(cell, desiredSizes);
      x += dummySize.width;
      continue;
    }

    let height = rowSize.height;
    if (cell.rowSpan > 1) {
      for (let index = rowIndex + 1; index < rowIndex + cell.rowSpan; index++) {
        height += getDesiredSize([...table.headerRows, ...table.children][index], desiredSizes).height;
      }
    }
    const cellSize = getDesiredSize(cell, desiredSizes);
    const cellRect = AD.Rect.create(x, finalRect.y, cellSize.width, height);
    const isFirst = cellIndex === 0;
    const isLast = cellIndex === row.children.length - 1;
    renderCell(resources, pdf, desiredSizes, cellRect, tableCellStyle, cell, isFirst, isLast, isTop, isBottom);
    x += cellSize.width;
  }
}

function renderCell(
  resources: AD.Resources.Resources,
  pdf: PDFKit.PDFDocument,
  desiredSizes: Map<{}, AD.Size.Size>,
  finalRect: AD.Rect.Rect,
  tableCellStyle: AD.TableCellStyle.TableCellStyle,
  cell: AD.TableCell.TableCell,
  isFirst: boolean,
  isLast: boolean,
  isTop: boolean,
  isBottom: boolean
): void {
  const style = AD.Resources.getStyle(
    tableCellStyle,
    cell.style,
    "TableCellStyle",
    cell.styleName,
    resources
  ) as AD.TableCellStyle.TableCellStyle;
  if (style.background) {
    pdf.rect(finalRect.x, finalRect.y, finalRect.width, finalRect.height).fill(style.background);
  }

  let x = finalRect.x + style.padding.left;
  const availableHeight = finalRect.height;
  let contentHeight = cell.children
    .map((c) => (AD.Position.isPositionAbsolute(c) ? 0 : getDesiredSize(c, desiredSizes).height))
    .reduce((a, b) => a + b, 0);
  const startY = finalRect.y + style.padding.top;
  let y = startY;
  if (style.verticalAlignment === "Middle")
    y += 0.5 * (availableHeight - contentHeight - style.padding.top - style.padding.bottom);
  else if (style.verticalAlignment === "Bottom")
    y += availableHeight - contentHeight - style.padding.top - style.padding.bottom;

  for (const element of cell.children) {
    const elementSize = getDesiredSize(element, desiredSizes);
    const isAbsolute = AD.Position.isPositionAbsolute(element);
    const elementRect = AD.Rect.create(x, isAbsolute ? startY : y, elementSize.width, elementSize.height);
    renderSectionElement(resources, pdf, desiredSizes, elementRect, element);
    if (!isAbsolute) {
      y += elementSize.height;
    }
  }

  //Needed to counter aliasing caused by the cells background fill
  const pixelFix = 0.3;

  if (style.borders.bottom) {
    const widthOffset = isBottom ? style.borders.bottom / 2 - pixelFix : 0;
    pdf
      .lineWidth(style.borders.bottom)
      .moveTo(finalRect.x, finalRect.y + finalRect.height - widthOffset)
      .lineTo(finalRect.x + finalRect.width, finalRect.y + finalRect.height - widthOffset)
      .stroke(borderColor(style, "bottom"));
  }
  if (style.borders.right) {
    const hasBottomBorderOffset = style.borders.bottom ? pixelFix : 0;
    const widthOffset = isLast ? style.borders.right / 2 - pixelFix : 0;
    pdf
      .lineWidth(style.borders.right)
      .moveTo(finalRect.x + finalRect.width - widthOffset, finalRect.y)
      .lineTo(finalRect.x + finalRect.width - widthOffset, finalRect.y + finalRect.height + hasBottomBorderOffset)
      .stroke(borderColor(style, "right"));
  }
  if (style.borders.left) {
    const hasBottomBorderOffset = style.borders.bottom ? pixelFix : 0;
    const widthOffset = isFirst ? style.borders.left / 2 - pixelFix : 0;
    pdf
      .lineWidth(style.borders.left)
      .moveTo(finalRect.x + widthOffset, finalRect.y)
      .lineTo(finalRect.x + widthOffset, finalRect.y + finalRect.height + hasBottomBorderOffset)
      .stroke(borderColor(style, "left"));
  }
  if (style.borders.top) {
    const hasRightBorderOffset = style.borders.right ? pixelFix : 0;
    const hasLeftBorderOffset = style.borders.left ? pixelFix : 0;
    const halfWidth = style.borders.top / 2 - pixelFix;
    const widthOffset = isTop ? halfWidth : 0;
    const notFirstOffset = !isFirst ? halfWidth : 0;
    pdf
      .lineWidth(style.borders.top)
      .moveTo(finalRect.x - notFirstOffset - hasLeftBorderOffset, finalRect.y + widthOffset)
      .lineTo(finalRect.x + finalRect.width + hasRightBorderOffset, finalRect.y + widthOffset)
      .stroke(borderColor(style, "top"));
  }
}

function borderColor(style: AD.TableCellStyle.TableCellStyle, edge: "top" | "bottom" | "left" | "right"): string {
  if (style.borderColors && style.borderColors[edge]) {
    return style.borderColors[edge];
  }
  if (style.borderColor) {
    return style.borderColor;
  }
  return "black";
}

function getDesiredSize(element: {}, desiredSizes: Map<{}, AD.Size.Size>): AD.Size.Size {
  const size = desiredSizes.get(element);
  if (size) {
    return size;
  }
  throw new Error("Could not find size for element!");
}

function applyTextOffset(pdf: PDFKit.PDFDocument, textStyle: AD.TextStyle.TextStyle): void {
  const offset = calculateTextOffset(textStyle);
  if (offset < 0) {
    pdf.moveDown(Math.abs(offset));
  } else {
    pdf.moveUp(offset);
  }
}

function resetTextOffset(pdf: PDFKit.PDFDocument, textStyle: AD.TextStyle.TextStyle): void {
  const offset = calculateTextOffset(textStyle);
  if (offset < 0) {
    pdf.moveUp(Math.abs(offset));
  } else {
    pdf.moveDown(offset);
  }
}

function calculateTextOffset(textStyle: AD.TextStyle.TextStyle): number {
  const defaultPosition = textStyle.superScript ? -0.5 : textStyle.subScript ? 0.5 : 0;
  const position = textStyle.verticalPosition !== undefined ? textStyle.verticalPosition : defaultPosition;
  return position;
}
