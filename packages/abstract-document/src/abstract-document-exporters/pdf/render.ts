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
  for (const atom of paragraph.children) {
    const atomSize = getDesiredSize(atom, desiredSizes);
    if (currentWidth + atomSize.width >= availableWidth) {
      rows.push(currentRow);
      currentRow = [];
      currentWidth = 0;
    }
    currentRow.push(atom);
    currentWidth += atomSize.width;
  }
  if (currentRow.length > 0)
    // Add any remaning children to a new row.
    rows.push(currentRow);

  let y = finalRect.y + style.margins.top;

  for (let row of rows) {
    const rowWidth = row.reduce((a, b) => a + getDesiredSize(b, desiredSizes).width, 0);
    let x = finalRect.x + style.margins.left;
    if (style.alignment === "Center") x += 0.5 * (availableWidth - rowWidth);
    else if (style.alignment === "End") x += availableWidth - rowWidth;

    let rowHeight = 0;
    for (const atom of row) {
      const atomSize = getDesiredSize(atom, desiredSizes);
      renderAtom(
        resources,
        pdf,
        AD.Rect.create(x, y, atomSize.width, atomSize.height),
        style.textStyle,
        atom,
        parseAlignment(style.alignment)
      );
      x += atomSize.width;
      rowHeight = Math.max(rowHeight, atomSize.height);
    }

    y += rowHeight;
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

function renderAtom(
  resources: AD.Resources.Resources,
  pdf: {},
  finalRect: AD.Rect.Rect,
  textStyle: AD.TextStyle.TextStyle,
  atom: AD.Atom.Atom,
  alignment: AD.TextStyle.TextAlignment
): void {
  switch (atom.type) {
    case "TextField":
      renderTextField(resources, pdf, finalRect, textStyle, atom, "left");
      return;
    case "TextRun":
      renderTextRun(resources, pdf, finalRect, textStyle, atom, alignment);
      return;
    case "Image":
      renderImage(resources, pdf, finalRect, atom, textStyle);
      return;
    case "HyperLink":
      renderHyperLink(resources, pdf, finalRect, textStyle, atom);
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
  alignment: AD.TextStyle.TextAlignment
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
      drawText(pdf, finalRect, style, new Date(Date.now()).toDateString(), alignment);
      return;
    case "PageNumber":
    case "TotalPages":
    case "PageNumberOf":
      if (textField.text) {
        drawText(pdf, finalRect, style, textField.text, alignment);
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
  alignment: AD.TextStyle.TextAlignment
) {
  const style = AD.Resources.getNestedStyle(
    textStyle,
    textRun.style,
    "TextStyle",
    textRun.styleName,
    resources,
    textRun.nestedStyleNames || []
  ) as AD.TextStyle.TextStyle;
  drawText(pdf, finalRect, style, textRun.text, alignment);
}

function renderHyperLink(
  resources: AD.Resources.Resources,
  pdf: {},
  finalRect: AD.Rect.Rect,
  textStyle: AD.TextStyle.TextStyle,
  hyperLink: AD.HyperLink.HyperLink
) {
  const style = AD.Resources.getStyle(
    textStyle,
    hyperLink.style,
    "TextStyle",
    hyperLink.styleName,
    resources
  ) as AD.TextStyle.TextStyle;
  drawHyperLink(pdf, finalRect, style, hyperLink);
}

function renderTocSeparator(pdf: {}, finalRect: AD.Rect.Rect, textStyle: AD.TextStyle.TextStyle) {
  drawDottedLine(pdf, finalRect, textStyle);
}

function drawHyperLink(
  pdf: any,
  finalRect: AD.Rect.Rect,
  textStyle: AD.TextStyle.TextStyle,
  hyperLink: AD.HyperLink.HyperLink
) {
  const font = getFontName(textStyle);
  const isInternalLink = hyperLink.target.startsWith("#") && !hyperLink.target.startsWith("#page=");
  const fontSize = AD.TextStyle.calculateFontSize(textStyle, 10);
  const offset = calculateTextOffset(textStyle, fontSize);
  pdf
    .font(font)
    .fontSize(fontSize)
    .fillColor(textStyle.color || "blue")
    .text(hyperLink.text, finalRect.x, finalRect.y + offset, {
      width: finalRect.width,
      height: finalRect.height,
      underline: textStyle.underline || false,
      goTo: isInternalLink ? hyperLink.target.substr(1) : undefined,
      indent: textStyle.indent || 0,
      ...(textStyle.lineGap !== undefined ? { lineGap: textStyle.lineGap } : {}),
    })
    .underline(finalRect.x, finalRect.y, finalRect.width, finalRect.height, {
      color: "blue",
    });
  if (!isInternalLink) {
    pdf.link(finalRect.x, finalRect.y, finalRect.width, finalRect.height, hyperLink.target);
  }
}

function drawText(
  pdf: any,
  finalRect: AD.Rect.Rect,
  textStyle: AD.TextStyle.TextStyle,
  text: string,
  alignment: AD.TextStyle.TextAlignment
) {
  const font = getFontName(textStyle);
  const fontSize = AD.TextStyle.calculateFontSize(textStyle, 10);
  const offset = calculateTextOffset(textStyle, fontSize);
  pdf
    .font(font)
    .fontSize(fontSize)
    .fillColor(textStyle.color || "black")
    .text(text, finalRect.x, finalRect.y + offset, {
      width: finalRect.width,
      height: finalRect.height,
      underline: textStyle.underline || false,
      align: alignment,
      indent: textStyle.indent || 0,
      ...(textStyle.lineGap !== undefined ? { lineGap: textStyle.lineGap } : {}),
    });
}

function drawDottedLine(pdf: any, finalRect: AD.Rect.Rect, textStyle: AD.TextStyle.TextStyle) {
  const font = getFontName(textStyle);
  const fontSize = AD.TextStyle.calculateFontSize(textStyle, 10);
  const offset = calculateTextOffset(textStyle, fontSize);

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
  console.log(oneDotW, twoDotsW, numberOfDots, finalRect.width);
  if (twoDotsW - oneDotW === 0 || numberOfDots < 1) {
    return;
  }

  const dotsText = ".".repeat(numberOfDots);
  pdf
    .font(font)
    .fontSize(fontSize)
    .fillColor(textStyle.color || "black")
    .text(dotsText, finalRect.x, finalRect.y + offset, {
      width: finalRect.width,
      height: finalRect.height,
      align: "right",
      characterSpacing: 5,
    });
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
  if (style.verticalAlignment === "Middle") y += 0.5 * (availableHeight - contentHeight);
  else if (style.verticalAlignment === "Bottom") y += availableHeight - contentHeight;

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

function calculateTextOffset(textStyle: AD.TextStyle.TextStyle, defaultFontSize: number): number {
  const defaultPosition = textStyle.superScript ? -0.5 : textStyle.subScript ? 0.5 : 0;
  const position = textStyle.verticalPosition !== undefined ? textStyle.verticalPosition : defaultPosition;
  const fontSize = AD.TextStyle.calculateFontSize(textStyle, defaultFontSize);
  return fontSize * position;
}
