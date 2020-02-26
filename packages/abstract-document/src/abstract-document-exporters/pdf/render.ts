import * as R from "ramda";
import * as AD from "../../abstract-document/index";
import { preProcess } from "./pre-process";
import { measure } from "./measure";
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
  const desiredSizes = measure(pdfKit, document);
  const resources = getResources(document);

  let pdf = new PDFDocument({ compress: false, autoFirstPage: false }) as any;
  if (resources.fonts) {
    for (let fontName of R.keys(document.fonts as {})) {
      const font = resources.fonts[fontName];
      pdf.registerFont(fontName, font.normal);
      pdf.registerFont(fontName + "-Bold", font.bold);
      pdf.registerFont(fontName + "-Oblique", font.italic);
      pdf.registerFont(fontName + "-BoldOblique", font.boldItalic);
    }
  }

  let totalPages = 0;
  for (let section of document.children) {
    totalPages = pagesForSection(desiredSizes, section, totalPages);
  }

  let pageNo = 0;
  for (let section of document.children) {
    pageNo = renderSection(
      document,
      pdf,
      desiredSizes,
      section,
      pageNo,
      totalPages
    );
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

function pagesForSection(
  desiredSizes: Map<{}, AD.Size.Size>,
  section: AD.Section.Section,
  totalPages: number
) {
  totalPages++;
  const contentRect = pagesForPage(desiredSizes, section);

  let y = contentRect.y;
  for (let element of section.children) {
    const elementSize = getDesiredSize(element, desiredSizes);
    if (y + elementSize.height > contentRect.y + contentRect.height) {
      totalPages++;
      y = contentRect.y;
    }

    y += elementSize.height;
  }
  return totalPages;
}

function pagesForPage(
  desiredSizes: Map<{}, AD.Size.Size>,
  section: AD.Section.Section
): AD.Rect.Rect {
  const style = section.page.style;
  const pageWidth = AD.PageStyle.getWidth(style);
  const pageHeight = AD.PageStyle.getHeight(style);

  const headerHeight = section.page.header.reduce(
    (a, b) => a + getDesiredSize(b, desiredSizes).height,
    style.headerMargins.top + style.headerMargins.bottom
  );
  const footerHeight = section.page.footer.reduce(
    (a, b) => a + getDesiredSize(b, desiredSizes).height,
    style.footerMargins.top + style.footerMargins.bottom
  );

  let headerY = style.headerMargins.top;
  for (let element of section.page.header) {
    const elementSize = getDesiredSize(element, desiredSizes);
    headerY += elementSize.height;
  }
  headerY += style.headerMargins.bottom;

  const rectX = style.contentMargins.left;
  const rectY = headerY + style.contentMargins.top;
  const rectWidth =
    pageWidth - (style.contentMargins.left + style.contentMargins.right);
  const rectHeight =
    pageHeight -
    headerHeight -
    footerHeight -
    style.contentMargins.top -
    style.contentMargins.bottom;

  return AD.Rect.create(rectX, rectY, rectWidth, rectHeight);
}

function renderSection(
  parentResources: AD.Resources.Resources,
  pdf: any,
  desiredSizes: Map<{}, AD.Size.Size>,
  section: AD.Section.Section,
  pageNo: number,
  totalPages: number
) {
  pageNo++;
  const resources = AD.Resources.mergeResources([parentResources, section]);
  const contentRect = renderPage(
    resources,
    pdf,
    desiredSizes,
    section,
    pageNo,
    totalPages
  );

  if (section.id !== "" && pdf.addNamedDestination) {
    pdf.addNamedDestination(section.id);
  }

  let y = contentRect.y;
  for (let element of section.children) {
    const elementSize = getDesiredSize(element, desiredSizes);
    if (y + elementSize.height > contentRect.y + contentRect.height) {
      pageNo++;
      renderPage(resources, pdf, desiredSizes, section, pageNo, totalPages);
      y = contentRect.y;
    }
    renderSectionElement(
      resources,
      pdf,
      desiredSizes,
      AD.Rect.create(contentRect.x, y, elementSize.width, elementSize.height),
      element,
      pageNo,
      totalPages
    );
    y += elementSize.height;
  }
  return pageNo;
}

function renderPage(
  resources: AD.Resources.Resources,
  pdf: any,
  desiredSizes: Map<{}, AD.Size.Size>,
  section: AD.Section.Section,
  pageNo: number,
  totalPages: number
): AD.Rect.Rect {
  const style = section.page.style;
  const pageWidth = AD.PageStyle.getWidth(style);
  const pageHeight = AD.PageStyle.getHeight(style);
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

  const headerHeight = section.page.header.reduce(
    (a, b) => a + getDesiredSize(b, desiredSizes).height,
    style.headerMargins.top + style.headerMargins.bottom
  );
  const footerHeight = section.page.footer.reduce(
    (a, b) => a + getDesiredSize(b, desiredSizes).height,
    style.footerMargins.top + style.footerMargins.bottom
  );

  const headerX = style.headerMargins.left;
  let headerY = style.headerMargins.top;
  for (let element of section.page.header) {
    const elementSize = getDesiredSize(element, desiredSizes);
    renderSectionElement(
      resources,
      pdf,
      desiredSizes,
      AD.Rect.create(headerX, headerY, elementSize.width, elementSize.height),
      element,
      pageNo,
      totalPages
    );
    headerY += elementSize.height;
  }
  headerY += style.headerMargins.bottom;

  const footerX = style.footerMargins.left;
  let footerY = pageHeight - (style.footerMargins.bottom + footerHeight);
  for (let element of section.page.footer) {
    const elementSize = getDesiredSize(element, desiredSizes);
    renderSectionElement(
      resources,
      pdf,
      desiredSizes,
      AD.Rect.create(footerX, footerY, elementSize.width, elementSize.height),
      element,
      pageNo,
      totalPages
    );
    footerY += elementSize.height;
  }

  const rectX = style.contentMargins.left;
  const rectY = headerY + style.contentMargins.top;
  const rectWidth =
    pageWidth - (style.contentMargins.left + style.contentMargins.right);
  const rectHeight =
    pageHeight -
    headerHeight -
    footerHeight -
    style.contentMargins.top -
    style.contentMargins.bottom;

  return AD.Rect.create(rectX, rectY, rectWidth, rectHeight);
}

function renderSectionElement(
  parentResources: AD.Resources.Resources,
  pdf: {},
  desiredSizes: Map<{}, AD.Size.Size>,
  finalRect: AD.Rect.Rect,
  element: AD.SectionElement.SectionElement,
  pageNo: number,
  totalPages: number
) {
  const resources = AD.Resources.mergeResources([parentResources, element]);
  switch (element.type) {
    case "Paragraph":
      renderParagraph(
        resources,
        pdf,
        desiredSizes,
        finalRect,
        element,
        pageNo,
        totalPages
      );
      return;
    case "Table":
      renderTable(
        resources,
        pdf,
        desiredSizes,
        finalRect,
        element,
        pageNo,
        totalPages
      );
      return;
    case "Group":
      renderGroup(
        resources,
        pdf,
        desiredSizes,
        finalRect,
        element,
        pageNo,
        totalPages
      );
      return;
  }
}

function renderParagraph(
  resources: AD.Resources.Resources,
  pdf: {},
  desiredSizes: Map<{}, AD.Size.Size>,
  finalRect: AD.Rect.Rect,
  paragraph: AD.Paragraph.Paragraph,
  pageNo: number,
  totalPages: number
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
        atom,
        pageNo,
        totalPages
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
  group: AD.Group.Group,
  pageNo: number,
  totalPages: number
) {
  let y = finalRect.y;
  for (const element of group.children) {
    const elementSize = getDesiredSize(element, desiredSizes);
    renderSectionElement(
      resources,
      pdf,
      desiredSizes,
      AD.Rect.create(finalRect.x, y, elementSize.width, elementSize.height),
      element,
      pageNo,
      totalPages
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
  pageNo: number,
  totalPages: number
) {
  switch (atom.type) {
    case "TextField":
      renderTextField(
        resources,
        pdf,
        finalRect,
        textStyle,
        atom,
        pageNo,
        totalPages
      );
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
  textField: AD.TextField.TextField,
  pageNo: number,
  totalPages: number
) {
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
      drawText(pdf, finalRect, style, pageNo.toString());
      return;
    case "TotalPages":
      drawText(pdf, finalRect, style, totalPages.toString());
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
  const style = AD.Resources.getStyle(
    textStyle,
    textRun.style,
    "TextStyle",
    textRun.styleName,
    resources
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
  let features: Array<string> = [];
  let font = textStyle.fontFamily || "Helvetica";
  if (textStyle.bold && textStyle.italic) {
    font += "-BoldOblique";
  } else if (textStyle.bold) {
    font += "-Bold";
  } else if (textStyle.italic) {
    font += "-Oblique";
  }

  if (textStyle.subScript) features.push("subs");
  if (textStyle.superScript) features.push("sups");

  const isInternalLink =
    hyperLink.target.startsWith("#") && !hyperLink.target.startsWith("#page=");
  pdf
    .font(font)
    .fontSize(textStyle.fontSize || 10)
    .fillColor(textStyle.color || "blue")
    .text(hyperLink.text, finalRect.x, finalRect.y, {
      width: finalRect.width,
      height: finalRect.height,
      underline: textStyle.underline || false,
      features: features,
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
  let features: Array<string> = [];
  let font = textStyle.fontFamily || "Helvetica";
  if (textStyle.bold && textStyle.italic) {
    font += "-BoldOblique";
  } else if (textStyle.bold) {
    font += "-Bold";
  } else if (textStyle.italic) {
    font += "-Oblique";
  }

  if (textStyle.subScript) features.push("subs");
  if (textStyle.superScript) features.push("sups");

  pdf
    .font(font)
    .fontSize(textStyle.fontSize || 10)
    .fillColor(textStyle.color || "black")
    .text(text, finalRect.x, finalRect.y, {
      width: finalRect.width,
      height: finalRect.height,
      underline: textStyle.underline || false,
      features: features
    });
}

function renderTable(
  resources: AD.Resources.Resources,
  pdf: any,
  desiredSizes: Map<{}, AD.Size.Size>,
  finalRect: AD.Rect.Rect,
  table: AD.Table.Table,
  pageNo: number,
  totalPages: number
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
    renderRow(
      resources,
      pdf,
      desiredSizes,
      rowRect,
      style.cellStyle,
      row,
      pageNo,
      totalPages
    );
    y += rowSize.height;
  }
}

function renderRow(
  resources: AD.Resources.Resources,
  pdf: {},
  desiredSizes: Map<{}, AD.Size.Size>,
  finalRect: AD.Rect.Rect,
  tableCellStyle: AD.TableCellStyle.TableCellStyle,
  row: AD.TableRow.TableRow,
  pageNo: number,
  totalPages: number
) {
  let x = finalRect.x;
  for (const cell of row.children) {
    const cellSize = getDesiredSize(cell, desiredSizes);
    const cellRect = AD.Rect.create(
      x,
      finalRect.y,
      cellSize.width,
      cellSize.height
    );
    renderCell(
      resources,
      pdf,
      desiredSizes,
      cellRect,
      tableCellStyle,
      cell,
      pageNo,
      totalPages
    );
    x += cellSize.width;
  }
}

function renderCell(
  resources: AD.Resources.Resources,
  pdf: any,
  desiredSizes: Map<{}, AD.Size.Size>,
  finalRect: AD.Rect.Rect,
  tableCellStyle: AD.TableCellStyle.TableCellStyle,
  cell: AD.TableCell.TableCell,
  pageNo: number,
  totalPages: number
) {
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
    renderSectionElement(
      resources,
      pdf,
      desiredSizes,
      elementRect,
      element,
      pageNo,
      totalPages
    );
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
