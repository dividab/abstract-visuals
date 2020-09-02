import * as R from "ramda";
import * as AD from "../../abstract-document/index";
import { preProcess } from "./pre-process";
import { measure, measurePages } from "./measure";
import { paginate, Page } from "./paginate";
import { updatePageRefs } from "./update-refs";
import * as BlobStream from "blob-stream";
import { renderImage } from "./render-image";
import { getResources } from "../shared/get_resources";

//tslint:disable

export function exportToHTML5Blob(
  // tslint:disable-next-line:no-any
  pdfKit: any,
  doc: AD.AbstractDoc.AbstractDoc
): Promise<Blob> {
  return new Promise(resolve => {
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
export function exportToStream(
  pdfKit: any,
  blobStream: {},
  doc: AD.AbstractDoc.AbstractDoc
): void {
  const PDFDocument = pdfKit;
  const document = preProcess(doc);
  const resources = getResources(document);

  let pdf = new PDFDocument({
    compress: false,
    autoFirstPage: false,
    bufferPages: true
  }) as any;
  if (resources.fonts) {
    for (let fontName of R.keys(document.fonts as {})) {
      const font = resources.fonts[fontName];
      pdf.registerFont(fontName, font.normal);
      pdf.registerFont(fontName + "-Bold", font.bold);
      pdf.registerFont(fontName + "-Oblique", font.italic);
      pdf.registerFont(fontName + "-BoldOblique", font.boldItalic);
    }
  }

  const desiredSizes = measure(pdfKit, document);
  const pages = paginate(pdfKit, document, desiredSizes);
  const updatedPages = pages.map(page => updatePageRefs(page, pages));
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
//   const resources = getResources(document);
//
//   let pdf = new PDFDocument({compress: false, autoFirstPage: false}) as any;
//   if (resources.fonts) {
//     for (let fontName of R.keys(resources.fonts)) {
//       const font = resources.fonts[fontName];
//       pdf.registerFont(fontName, font.normal);
//       pdf.registerFont(fontName + "-Bold", font.bold);
//       pdf.registerFont(fontName + "-Oblique", font.italic);
//       pdf.registerFont(fontName + "-BoldOblique", font.boldItalic);
//     }
//   }
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
  const pageHeight = AD.PageStyle.getPaperHeight(style.paperSize);
  const contentRect = addPage(pdf, page);

  if (page.namedDestionation) {
    if (pdf.addNamedDestination) {
      pdf.addNamedDestination(page.namedDestionation);
    }
  }

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
  let footerY = pageHeight - (style.footerMargins.bottom + footerHeight);
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
      bottom: 0
    }
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
  const availableWidth =
    finalRect.width - (style.margins.left + style.margins.right);

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
    const rowWidth = row.reduce(
      (a, b) => a + getDesiredSize(b, desiredSizes).width,
      0
    );
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
        atom
      );
      x += atomSize.width;
      rowHeight = Math.max(rowHeight, atomSize.height);
    }

    y += rowHeight;
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
  atom: AD.Atom.Atom
): void {
  switch (atom.type) {
    case "TextField":
      renderTextField(resources, pdf, finalRect, textStyle, atom);
      return;
    case "TextRun":
      renderTextRun(resources, pdf, finalRect, textStyle, atom);
      return;
    case "Image":
      renderImage(pdf, finalRect, atom);
      return;
    case "HyperLink":
      renderHyperLink(resources, pdf, finalRect, textStyle, atom);
      return;
  }
}

function renderTextField(
  resources: AD.Resources.Resources,
  pdf: {},
  finalRect: AD.Rect.Rect,
  textStyle: AD.TextStyle.TextStyle,
  textField: AD.TextField.TextField
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
      drawText(pdf, finalRect, style, new Date(Date.now()).toDateString());
      return;
    case "PageNumber":
    case "TotalPages":
    case "PageNumberOf":
      if (textField.text) {
        drawText(pdf, finalRect, style, textField.text);
      }
      return;
  }
}

function renderTextRun(
  resources: AD.Resources.Resources,
  pdf: {},
  finalRect: AD.Rect.Rect,
  textStyle: AD.TextStyle.TextStyle,
  textRun: AD.TextRun.TextRun
) {
  const style = AD.Resources.getNestedStyle(
    textStyle,
    textRun.style,
    "TextStyle",
    textRun.styleName,
    resources,
    textRun.nestedStyleNames || []
  ) as AD.TextStyle.TextStyle;
  drawText(pdf, finalRect, style, textRun.text);
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

function drawHyperLink(
  pdf: any,
  finalRect: AD.Rect.Rect,
  textStyle: AD.TextStyle.TextStyle,
  hyperLink: AD.HyperLink.HyperLink
) {
  let font = textStyle.fontFamily || "Helvetica";
  if (textStyle.bold && textStyle.italic) {
    font += "-BoldOblique";
  } else if (textStyle.bold) {
    font += "-Bold";
  } else if (textStyle.italic) {
    font += "-Oblique";
  }
  const isInternalLink =
    hyperLink.target.startsWith("#") && !hyperLink.target.startsWith("#page=");
  const fontSize = textStyle.fontSize || 10;
  const offset = calculateTextOffset(textStyle, fontSize);
  pdf
    .font(font)
    .fontSize(textStyle.fontSize || 10)
    .fillColor(textStyle.color || "blue")
    .text(hyperLink.text, finalRect.x, finalRect.y + offset, {
      width: finalRect.width + 2,
      height: finalRect.height,
      underline: textStyle.underline || false,
      goTo: isInternalLink ? hyperLink.target.substr(1) : undefined
    })
    .underline(finalRect.x, finalRect.y, finalRect.width, finalRect.height, {
      color: "blue"
    });
  if (!isInternalLink) {
    pdf.link(
      finalRect.x,
      finalRect.y,
      finalRect.width,
      finalRect.height,
      hyperLink.target
    );
  }
}

function drawText(
  pdf: any,
  finalRect: AD.Rect.Rect,
  textStyle: AD.TextStyle.TextStyle,
  text: string
) {
  let font = textStyle.fontFamily || "Helvetica";
  if (textStyle.bold && textStyle.italic) {
    font += "-BoldOblique";
  } else if (textStyle.bold) {
    font += "-Bold";
  } else if (textStyle.italic) {
    font += "-Oblique";
  }
  const fontSize = textStyle.fontSize || 10;
  const offset = calculateTextOffset(textStyle, fontSize);
  pdf
    .font(font)
    .fontSize(fontSize)
    .fillColor(textStyle.color || "black")
    .text(text, finalRect.x, finalRect.y + offset, {
      width: finalRect.width + 2,
      height: finalRect.height,
      underline: textStyle.underline || false
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
  const x = finalRect.x + style.margins.left;
  let y = finalRect.y + style.margins.top;
  for (let row of table.children) {
    const rowSize = getDesiredSize(row, desiredSizes);
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
  for (const cell of row.children) {
    const cellSize = getDesiredSize(cell, desiredSizes);
    const cellRect = AD.Rect.create(
      x,
      finalRect.y,
      cellSize.width,
      cellSize.height
    );
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
    pdf
      .rect(finalRect.x, finalRect.y, finalRect.width, finalRect.height)
      .fill(style.background);
  }

  let x = finalRect.x + style.padding.left;
  let y = finalRect.y + style.padding.top;
  for (const element of cell.children) {
    const elementSize = getDesiredSize(element, desiredSizes);
    const elementRect = AD.Rect.create(
      x,
      y,
      elementSize.width,
      elementSize.height
    );
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

function getDesiredSize(
  element: {},
  desiredSizes: Map<{}, AD.Size.Size>
): AD.Size.Size {
  const size = desiredSizes.get(element);
  if (size) {
    return size;
  }
  throw new Error("Could not find size for element!");
}

function calculateTextOffset(
  textStyle: AD.TextStyle.TextStyle,
  defaultFontSize: number
): number {
  const defaultPosition = textStyle.superScript
    ? -0.5
    : textStyle.subScript ? 0.5 : 0;
  const position =
    textStyle.verticalPosition !== undefined
      ? textStyle.verticalPosition
      : defaultPosition;
  const fontSize = textStyle.fontSize || defaultFontSize;
  return fontSize * position;
}
