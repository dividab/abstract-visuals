import * as AD from "../../abstract-document/index";
import { preProcess } from "./pre-process";
import { measure, measurePages } from "./measure";
import { paginate, Page } from "./paginate";
import { updatePageRefs } from "./update-refs";
import BlobStream from "blob-stream";
import { renderImage } from "./render-image";
import { registerFonts, getFontName } from "./font";

//tslint:disable

export function exportToHTML5Blob(
  // tslint:disable-next-line:no-any
  pdfKit: any,
  doc: AD.AbstractDoc.AbstractDoc
): Promise<Blob> {
  return new Promise((resolve) => {
    const stream = BlobStream();
    exportToStream(pdfKit, stream, doc);
    stream.on("finish", () => {
      const blob = stream.toBlob("application/pdf");
      resolve(blob);
    });
  });
}

/**
 * On the client side the stream can be a BlobStream from the blob-stream package.
 * On the server-side the stream can be a file stream from the fs package.
 * @param pdfKit
 * @param blobStream
 * @param doc
 */
export function exportToStream(pdfKit: any, blobStream: {}, doc: AD.AbstractDoc.AbstractDoc): void {
  const PDFDocument = pdfKit;
  const document = preProcess(doc);

  let pdf = new PDFDocument({
    compress: false,
    autoFirstPage: false,
    bufferPages: true,
  }) as any;

  registerFonts((fontName: string, fontSource: AD.Font.FontSource) => pdf.registerFont(fontName, fontSource), document);

  const desiredSizes = measure(pdfKit, document);
  const pages = paginate(pdfKit, document, desiredSizes);
  const updatedPages = updatePageRefs(pages);
  const pageDesiredSizes = measurePages(pdfKit, document, updatedPages);

  for (let page of updatedPages) {
    renderPage(document, pdf, pageDesiredSizes, page);
  }

  pdf.pipe(blobStream);
  pdf.end();
}

// // Can only be used on the server-side
// export function exportToNodeStream(pdfKit: any, doc: AD.AbstractDoc.AbstractDoc, stream: any): void {
//   const PDFDocument = pdfKit;
//   const document = preProcess(doc);
//   const desiredSizes = measure(pdfKit, document);
//   let pdf = new PDFDocument({compress: false, autoFirstPage: false}) as any;
//   registerFonts(
//     (fontName: string, fontSource: AD.Font.FontSource) =>
//       pdf.registerFont(fontName, fontSource),
//     document
//   );
//   let pageNo = 0;
//   for (let section of document.children){
//     pageNo = renderSection(document, pdf, desiredSizes, section, pageNo);
//   }
//   pdf.pipe(stream);
//   pdf.end();
// }

function renderPage(
  parentResources: AD.Resources.Resources,
  pdf: any,
  desiredSizes: Map<{}, AD.Size.Size>,
  page: Page
): void {
  const section = page.section;
  const style = section.page.style;
  const resources = AD.Resources.mergeResources([parentResources, section]);
  const pageHeight = AD.PageStyle.getHeight(style);
  const contentRect = addPage(pdf, page);

  page.namedDestionations.forEach((dest) => {
    if (pdf.addNamedDestination) {
      pdf.addNamedDestination(dest);
    }
  });

  const headerX = style.headerMargins.left;
  let headerY = style.headerMargins.top;
  for (let element of page.header) {
    const elementSize = getDesiredSize(element, desiredSizes);
    renderSectionElement(
      resources,
      pdf,
      desiredSizes,
      AD.Rect.create(headerX, headerY, elementSize.width, elementSize.height),
      element
    );
    headerY += elementSize.height;
  }
  headerY += style.headerMargins.bottom;

  const footerHeight = page.footer.reduce(
    (a, b) => a + getDesiredSize(b, desiredSizes).height,
    style.footerMargins.top + style.footerMargins.bottom
  );
  const footerX = style.footerMargins.left;
  let footerY = pageHeight - (footerHeight - style.footerMargins.top);
  for (let element of page.footer) {
    const elementSize = getDesiredSize(element, desiredSizes);
    renderSectionElement(
      resources,
      pdf,
      desiredSizes,
      AD.Rect.create(footerX, footerY, elementSize.width, elementSize.height),
      element
    );
    footerY += elementSize.height;
  }

  let y = contentRect.y;
  for (const element of page.elements) {
    const elementSize = getDesiredSize(element, desiredSizes);
    renderSectionElement(
      resources,
      pdf,
      desiredSizes,
      AD.Rect.create(contentRect.x, y, elementSize.width, elementSize.height),
      element
    );
    y += elementSize.height;
  }
}

function addPage(pdf: any, page: Page): AD.Rect.Rect {
  const section = page.section;
  const style = section.page.style;
  // This is rotated later depending on the orientation.
  const pageWidth = AD.PageStyle.getPaperWidth(style.paperSize);
  const pageHeight = AD.PageStyle.getPaperHeight(style.paperSize);
  const layout = style.orientation === "Landscape" ? "landscape" : "portrait";
  const pageOptions = {
    size: [pageWidth, pageHeight],
    layout: layout,
    margins: {
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
  };
  pdf.addPage(pageOptions);
  return page.contentRect;
}

function renderSectionElement(
  parentResources: AD.Resources.Resources,
  pdf: {},
  desiredSizes: Map<{}, AD.Size.Size>,
  finalRect: AD.Rect.Rect,
  element: AD.SectionElement.SectionElement
) {
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
  pdf: {},
  desiredSizes: Map<{}, AD.Size.Size>,
  finalRect: AD.Rect.Rect,
  group: AD.Group.Group
) {
  let y = finalRect.y;
  for (const element of group.children) {
    const elementSize = getDesiredSize(element, desiredSizes);
    renderSectionElement(
      resources,
      pdf,
      desiredSizes,
      AD.Rect.create(finalRect.x, y, elementSize.width, elementSize.height),
      element
    );
    y += elementSize.height;
  }
}

function renderParagraph(
  resources: AD.Resources.Resources,
  pdf: {},
  desiredSizes: Map<{}, AD.Size.Size>,
  finalRect: AD.Rect.Rect,
  paragraph: AD.Paragraph.Paragraph
) {
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

  for (let row of rows) {
    if (row.length === 0) {
      continue;
    }

    const rowWidth = row.reduce((a, b) => a + getDesiredSize(b, desiredSizes).width, 0);
    let x = finalRect.x + style.margins.left;

    if (style.alignment === "Center") {
      x += 0.5 * (availableWidth - rowWidth);
    } else if (style.alignment === "End") {
      x += availableWidth - rowWidth;
    }

    let rowHeight = 0;

    const lastIndex = row.length - 1;
    for (const [i, atom] of row.entries()) {
      const atomSize = getDesiredSize(atom, desiredSizes);
      renderAtom(
        resources,
        pdf,
        AD.Rect.create(x, y, atomSize.width, atomSize.height),
        style.textStyle,
        atom,
        parseAlignment(style.alignment),
        atomSize.width,
        availableWidth,
        i !== lastIndex,
        i === 0
      );

      x += atomSize.width;
      rowHeight = Math.max(rowHeight, atomSize.height);
    }

    y += rowHeight;

    // if (row[0].type === "Image") {
    //   y += rowHeight;
    // } else {
    //   y = pdf.y;
    // }

    // if text
    // y += ceil(sum(atomSize.width) / availableWidth) * row.height;

    // atom

    // max(for(atom of row)
    //   pdf.heightOfString("Test", {
    //     width: pageWidth,
    //     ...atom.textOptions,
    //   });
    // )

    // pdf.heightOfString(concatinatedText, {
    //   width: pageWidth,
    //   ...textOptions,
    // });
  }
}

function parseAlignment(paragraphAlignment: AD.ParagraphStyle.TextAlignment | undefined): AD.TextStyle.TextAlignment {
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
  pdf: {},
  finalRect: AD.Rect.Rect,
  textStyle: AD.TextStyle.TextStyle,
  atom: AD.Atom.Atom,
  alignment: AD.TextStyle.TextAlignment,
  measureTextWidth: number,
  availableWidth: number,
  concatenate: boolean,
  isFirstAtom: boolean
): void {
  switch (atom.type) {
    case "TextField":
      renderTextField(resources, pdf, finalRect, textStyle, atom, "left", concatenate, isFirstAtom, availableWidth);
      return;
    case "TextRun":
      renderTextRun(resources, pdf, finalRect, textStyle, atom, alignment, concatenate, isFirstAtom, availableWidth);
      return;
    case "Image":
      renderImage(resources, pdf, finalRect, textStyle, atom);
      return;
    case "HyperLink":
      renderHyperLink(resources, pdf, finalRect, textStyle, atom, alignment, concatenate, isFirstAtom, availableWidth);
      return;
    case "TocSeparator":
      renderTocSeparator(pdf, finalRect, textStyle);
      return;
    case "LinkTarget":
      return;
  }
}

function renderTextField(
  resources: AD.Resources.Resources,
  pdf: {},
  finalRect: AD.Rect.Rect,
  textStyle: AD.TextStyle.TextStyle,
  textField: AD.TextField.TextField,
  alignment: AD.TextStyle.TextAlignment,
  concatenate: boolean,
  isFirstAtom: boolean,
  availableWidth: number
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
        pdf,
        finalRect,
        style,
        new Date(Date.now()).toDateString(),
        alignment,
        concatenate,
        isFirstAtom,
        availableWidth
      );
      return;
    case "PageNumber":
    case "TotalPages":
    case "PageNumberOf":
      if (textField.text) {
        drawText(pdf, finalRect, style, textField.text, alignment, concatenate, isFirstAtom, availableWidth);
      }
      return;
  }
}

function renderTextRun(
  resources: AD.Resources.Resources,
  pdf: {},
  finalRect: AD.Rect.Rect,
  textStyle: AD.TextStyle.TextStyle,
  textRun: AD.TextRun.TextRun,
  alignment: AD.TextStyle.TextAlignment,
  concatenate: boolean,
  isFirstAtom: boolean,
  availableWidth: number
) {
  const style = AD.Resources.getNestedStyle(
    textStyle,
    textRun.style,
    "TextStyle",
    textRun.styleName,
    resources,
    textRun.nestedStyleNames || []
  ) as AD.TextStyle.TextStyle;
  const textAlignment = style.alignment ? style.alignment : alignment;
  drawText(pdf, finalRect, style, textRun.text, textAlignment, concatenate, isFirstAtom, availableWidth);
}

function renderHyperLink(
  resources: AD.Resources.Resources,
  pdf: {},
  finalRect: AD.Rect.Rect,
  textStyle: AD.TextStyle.TextStyle,
  hyperLink: AD.HyperLink.HyperLink,
  alignment: AD.TextStyle.TextAlignment,
  concatenate: boolean,
  isFirstAtom: boolean,
  availableWidth: number
) {
  const style = AD.Resources.getStyle(
    textStyle,
    hyperLink.style,
    "TextStyle",
    hyperLink.styleName,
    resources
  ) as AD.TextStyle.TextStyle;
  const textAlignment = style.alignment ? style.alignment : alignment;
  drawHyperLink(pdf, finalRect, style, hyperLink, textAlignment, concatenate, isFirstAtom, availableWidth);
}

function renderTocSeparator(pdf: {}, finalRect: AD.Rect.Rect, textStyle: AD.TextStyle.TextStyle) {
  drawDottedLine(pdf, finalRect, textStyle);
}

function drawHyperLink(
  pdf: any,
  finalRect: AD.Rect.Rect,
  textStyle: AD.TextStyle.TextStyle,
  hyperLink: AD.HyperLink.HyperLink,
  alignment: AD.TextStyle.TextAlignment,
  concatenate: boolean,
  isFirstAtom: boolean,
  availableWidth: number
) {
  const font = getFontName(textStyle);
  const isInternalLink = hyperLink.target.startsWith("#") && !hyperLink.target.startsWith("#page=");
  const fontSize = AD.TextStyle.calculateFontSize(textStyle, 10);

  //the + 2 is compensation that's needed as pdfKit's widthOfString may return a slightly
  //lower value than the actual size due to loss of precision
  pdf
    .font(font)
    .fontSize(fontSize)
    .fillColor(textStyle.color || "blue");

  applyTextOffset(pdf, textStyle);
  pdf
    .text(hyperLink.text, finalRect.x, finalRect.y, {
      underline: textStyle.underline || false,
      align: alignment,
      goTo: isInternalLink ? hyperLink.target.substr(1) : undefined,
      indent: textStyle.indent || 0,
      continued: concatenate,
      ...(isFirstAtom ? { width: finalRect.width, height: finalRect.height + 2 } : {}),
      ...(textStyle.lineGap !== undefined ? { lineGap: textStyle.lineGap } : {}),
    })
    .underline(finalRect.x, finalRect.y + 2, finalRect.width, finalRect.height, {
      color: "blue",
    });
  resetTextOffset(pdf, textStyle);

  if (!isInternalLink) {
    pdf.link(finalRect.x, finalRect.y, finalRect.width, finalRect.height, hyperLink.target);
  }
}

function drawText(
  pdf: any,
  finalRect: AD.Rect.Rect,
  textStyle: AD.TextStyle.TextStyle,
  text: string,
  alignment: AD.TextStyle.TextAlignment,
  concatenate: boolean,
  isFirstAtom: boolean,
  availableWidth: number
) {
  const font = getFontName(textStyle);
  const fontSize = AD.TextStyle.calculateFontSize(textStyle, 10);

  pdf
    .font(font)
    .fontSize(fontSize)
    .fillColor(textStyle.color || "black");

  applyTextOffset(pdf, textStyle);

  if (isFirstAtom) {
    pdf.text(text, finalRect.x, finalRect.y, {
      width: availableWidth,
      underline: textStyle.underline || false,
      align: alignment,
      indent: textStyle.indent || 0,
      continued: concatenate,
      ...(textStyle.lineGap !== undefined ? { lineGap: textStyle.lineGap } : {}),
    });
  } else {
    pdf.text(text, {
      underline: textStyle.underline || false,
      align: alignment,
      indent: textStyle.indent || 0,
      continued: concatenate,
      ...(textStyle.lineGap !== undefined ? { lineGap: textStyle.lineGap } : {}),
    });
  }

  resetTextOffset(pdf, textStyle);
}

function drawDottedLine(pdf: any, finalRect: AD.Rect.Rect, textStyle: AD.TextStyle.TextStyle) {
  const font = getFontName(textStyle);
  const fontSize = AD.TextStyle.calculateFontSize(textStyle, 10);

  const oneDotW = pdf.widthOfString(".", {
    width: finalRect.width,
    height: finalRect.height,
    characterSpacing: 5,
  });
  const twoDotsW = pdf.widthOfString("..", {
    width: finalRect.width,
    height: finalRect.height,
    characterSpacing: 5,
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
  pdf.text(dotsText, finalRect.x, finalRect.y, {
    width: finalRect.width,
    height: finalRect.height,
    align: "right",
    characterSpacing: 5,
  });
  resetTextOffset(pdf, textStyle);
}

function renderTable(
  resources: AD.Resources.Resources,
  pdf: any,
  desiredSizes: Map<{}, AD.Size.Size>,
  finalRect: AD.Rect.Rect,
  table: AD.Table.Table
) {
  const style = AD.Resources.getStyle(
    undefined,
    table.style,
    "TableStyle",
    table.styleName,
    resources
  ) as AD.TableStyle.TableStyle;
  const availableWidth = finalRect.width;
  let y = finalRect.y + style.margins.top;
  for (let row of table.children) {
    const rowSize = getDesiredSize(row, desiredSizes);
    let x = finalRect.x + style.margins.left;
    if (style.alignment === "Center") x += 0.5 * (availableWidth - rowSize.width);
    else if (style.alignment === "Right") x += availableWidth - rowSize.width;
    const rowRect = AD.Rect.create(x, y, rowSize.width, rowSize.height);
    renderRow(resources, pdf, desiredSizes, rowRect, style.cellStyle, row);
    y += rowSize.height;
  }
}

function renderRow(
  resources: AD.Resources.Resources,
  pdf: {},
  desiredSizes: Map<{}, AD.Size.Size>,
  finalRect: AD.Rect.Rect,
  tableCellStyle: AD.TableCellStyle.TableCellStyle,
  row: AD.TableRow.TableRow
): void {
  let x = finalRect.x;
  const rowSize = getDesiredSize(row, desiredSizes);
  for (const cell of row.children) {
    const cellSize = getDesiredSize(cell, desiredSizes);
    const cellRect = AD.Rect.create(x, finalRect.y, cellSize.width, rowSize.height);
    renderCell(resources, pdf, desiredSizes, cellRect, tableCellStyle, cell);
    x += cellSize.width;
  }
}

function renderCell(
  resources: AD.Resources.Resources,
  pdf: any,
  desiredSizes: Map<{}, AD.Size.Size>,
  finalRect: AD.Rect.Rect,
  tableCellStyle: AD.TableCellStyle.TableCellStyle,
  cell: AD.TableCell.TableCell
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
  let contentHeight = cell.children.map((c) => getDesiredSize(c, desiredSizes).height).reduce((a, b) => a + b, 0);
  let y = finalRect.y + style.padding.top;
  if (style.verticalAlignment === "Middle")
    y += 0.5 * (availableHeight - contentHeight - style.padding.top - style.padding.bottom);
  else if (style.verticalAlignment === "Bottom")
    y += availableHeight - contentHeight - style.padding.top - style.padding.bottom;

  for (const element of cell.children) {
    const elementSize = getDesiredSize(element, desiredSizes);
    const elementRect = AD.Rect.create(x, y, elementSize.width, elementSize.height);
    renderSectionElement(resources, pdf, desiredSizes, elementRect, element);
    y += elementSize.height;
  }

  if (style.borderColor) {
    if (style.borders.top) {
      pdf
        .moveTo(finalRect.x, finalRect.y)
        .lineTo(finalRect.x + finalRect.width, finalRect.y)
        .stroke(style.borderColor);
    }
    if (style.borders.bottom) {
      pdf
        .moveTo(finalRect.x, finalRect.y + finalRect.height)
        .lineTo(finalRect.x + finalRect.width, finalRect.y + finalRect.height)
        .stroke(style.borderColor);
    }
    if (style.borders.left) {
      pdf
        .moveTo(finalRect.x, finalRect.y)
        .lineTo(finalRect.x, finalRect.y + finalRect.height)
        .stroke(style.borderColor);
    }
    if (style.borders.right) {
      pdf
        .moveTo(finalRect.x + finalRect.width, finalRect.y)
        .lineTo(finalRect.x + finalRect.width, finalRect.y + finalRect.height)
        .stroke(style.borderColor);
    }
  }
}

function getDesiredSize(element: {}, desiredSizes: Map<{}, AD.Size.Size>): AD.Size.Size {
  const size = desiredSizes.get(element);
  if (size) {
    return size;
  }
  throw new Error("Could not find size for element!");
}

function applyTextOffset(pdf: any, textStyle: AD.TextStyle.TextStyle) {
  const offset = calculateTextOffset(textStyle);
  if (offset < 0) {
    pdf.moveDown(Math.abs(offset));
  } else {
    pdf.moveUp(offset);
  }
}

function resetTextOffset(pdf: any, textStyle: AD.TextStyle.TextStyle) {
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
