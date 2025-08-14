import * as AD from "../../abstract-document/index.js";
import { exhaustiveCheck } from "ts-exhaustive-check";
import { Page } from "./paginate.js";
import { registerFonts, getFontNameStyle } from "./font.js";

//tslint:disable:no-any variable-name

export function measure(pdfKit: PDFKit.PDFDocument, document: AD.AbstractDoc.AbstractDoc): Map<any, AD.Size.Size> {
  let pdf = new pdfKit();
  registerFonts((fontName: string, fontSource: AD.Font.FontSource) => pdf.registerFont(fontName, fontSource), document);
  return mergeMaps(document.children.map((s) => measureSection(pdf, document, s)));
}

export function measurePages(
  pdfKit: PDFKit.PDFDocument,
  document: AD.AbstractDoc.AbstractDoc,
  pages: ReadonlyArray<Page>
): Map<any, AD.Size.Size> {
  const pdf = new pdfKit();
  registerFonts((fontName: string, fontSource: AD.Font.FontSource) => pdf.registerFont(fontName, fontSource), document);
  return mergeMaps(
    pages.map((page) => measureSection(pdf, document, page.section, page.header, page.footer, page.elements))
  );
}

function measureSection(
  pdfKit: PDFKit.PDFDocument,
  parentResources: AD.Resources.Resources,
  section: AD.Section.Section,
  separateHeader?: ReadonlyArray<AD.SectionElement.SectionElement>,
  separateFooter?: ReadonlyArray<AD.SectionElement.SectionElement>,
  separateChildren?: ReadonlyArray<AD.SectionElement.SectionElement>
): Map<any, AD.Size.Size> {
  const header = separateHeader || section.page.header;
  const footer = separateFooter || section.page.footer;
  const children = separateChildren || section.children;

  const pageWidth = AD.PageStyle.getWidth(section.page.style);
  const pageHeight = AD.PageStyle.getHeight(section.page.style);
  const resources = AD.Resources.mergeResources([section, parentResources]);

  const contentAvailableWidth =
    pageWidth - (section.page.style.contentMargins.left + section.page.style.contentMargins.right);
  const contentAvailableSize = AD.Size.create(contentAvailableWidth, pageHeight);
  const sectionSizes = children.map((e) => measureSectionElement(pdfKit, resources, contentAvailableSize, e));

  const headerAvailableWidth =
    pageWidth - (section.page.style.headerMargins.left + section.page.style.headerMargins.right);
  const headerAvailableSize = AD.Size.create(headerAvailableWidth, pageHeight);
  const headerSizes = header.map((e) => measureSectionElement(pdfKit, resources, headerAvailableSize, e));

  const footerAvailableWidth =
    pageWidth - (section.page.style.footerMargins.left + section.page.style.footerMargins.right);
  const footerAvailableSize = AD.Size.create(footerAvailableWidth, pageHeight);
  const footerSizes = footer.map((e) => measureSectionElement(pdfKit, resources, footerAvailableSize, e));

  return mergeMaps([...sectionSizes, ...headerSizes, ...footerSizes]);
}

function measureSectionElement(
  pdf: PDFKit.PDFDocument,
  parentResources: AD.Resources.Resources,
  availableSize: AD.Size.Size,
  element: AD.SectionElement.SectionElement
): Map<any, AD.Size.Size> {
  const resources = AD.Resources.mergeResources([parentResources, element]);
  switch (element.type) {
    case "Paragraph":
      return measureParagraph(pdf, resources, availableSize, element);
    case "Table":
      return measureTable(pdf, resources, availableSize, element);
    case "Group":
      return measureGroup(pdf, resources, availableSize, element);
    case "PageBreak":
      return measurePageBreak(availableSize, element);
    default:
      return exhaustiveCheck(element);
  }
}

function measurePageBreak(availableSize: AD.Size.Size, pageBreak: AD.PageBreak.PageBreak): Map<any, AD.Size.Size> {
  let desiredSizes = new Map<any, AD.Size.Size>();
  desiredSizes.set(pageBreak, availableSize);
  return desiredSizes;
}

function measureParagraph(
  pdfKit: PDFKit.PDFDocument,
  resources: AD.Resources.Resources,
  availableSize: AD.Size.Size,
  paragraph: AD.Paragraph.Paragraph
): Map<any, AD.Size.Size> {
  const style = AD.Resources.getStyle(
    undefined,
    paragraph.style,
    "ParagraphStyle",
    paragraph.styleName,
    resources
  ) as AD.ParagraphStyle.ParagraphStyle;
  const contentAvailableWidth = availableSize.width - (style.margins.left + style.margins.right);
  const contentAvailableHeight = availableSize.height - (style.margins.top + style.margins.bottom);
  const contentAvailableSize = AD.Size.create(contentAvailableWidth, contentAvailableHeight);

  let paragraphHeight = style.margins.top + style.margins.bottom;
  let desiredSizes = new Map<any, AD.Size.Size>();

  const rows: Array<Array<AD.Atom.Atom>> = [];
  let currentRow: Array<AD.Atom.Atom> = [];
  for (const atom of paragraph.children) {
    currentRow.push(atom);
    if (atom.type === "LineBreak") {
      rows.push(currentRow);
      currentRow = [];
    }
  }
  if (currentRow.length > 0) {
    rows.push(currentRow);
  }

  for (const row of rows) {
    let desiredHeight = 0;
    let currentRowWidth = 0;
    let currentRowHeight = 0;
    let concatenatedText = "";
    let hasAtomImage = false;
    let textOptions;
    for (const atom of row) {
      if (atom.type === "Image") {
        hasAtomImage = true;
      }
      const atomSize = measureAtom(
        pdfKit,
        resources,
        style.textStyle,
        contentAvailableSize,
        contentAvailableSize.width - currentRowWidth,
        atom
      );
      if (atom.type === "TextRun" || atom.type === "TextField" || atom.type === "HyperLink") {
        concatenatedText += atom.text;
        textOptions = getBiggestStyle(atom, style, resources, textOptions);
      }
      desiredSizes.set(atom, atomSize);
      currentRowWidth += atomSize.width;
      currentRowHeight = Math.max(atomSize.height, currentRowHeight);
      if (currentRowWidth > contentAvailableSize.width) {
        desiredHeight += currentRowHeight;
        currentRowWidth = 0;
        currentRowHeight = 0;
      }
    }
    if (row.length === 1 && row[0].type === "LineBreak") {
      paragraphHeight += currentRowHeight;
    } else if (hasAtomImage) {
      paragraphHeight += desiredHeight + currentRowHeight;
    } else {
      paragraphHeight += pdfKit.heightOfString(concatenatedText, {
        width: textOptions && textOptions.lineBreak === false ? Infinity : availableSize.width,
        ...textOptions,
      });
    }
  }

  desiredSizes.set(paragraph, AD.Size.create(availableSize.width, paragraphHeight));

  return desiredSizes;
}

function getBiggestStyle(
  atom: AD.TextField.TextField | AD.TextRun.TextRun | AD.HyperLink.HyperLink,
  style: AD.ParagraphStyle.ParagraphStyle,
  resources: AD.Resources.Resources,
  textOptions: AD.TextStyle.TextStyle | undefined
): AD.TextStyle.TextStyle | undefined {
  const textStyle = AD.Resources.getNestedStyle(
    style.textStyle,
    atom.style,
    "TextStyle",
    atom.styleName,
    resources,
    atom.type === "TextRun" && atom.nestedStyleNames ? atom.nestedStyleNames : []
  ) as AD.TextStyle.TextStyle;

  if (textOptions) {
    if ((textOptions.fontSize ?? 100) < (textStyle.fontSize ?? 100)) {
      return atom.style;
    }
  } else {
    return textStyle;
  }
  return textOptions;
}

export function measureTable(
  pdfKit: PDFKit.PDFDocument,
  resources: AD.Resources.Resources,
  availableSize: AD.Size.Size,
  table: AD.Table.Table
): Map<any, AD.Size.Size> {
  const style = AD.Resources.getStyle(
    undefined,
    table.style,
    "TableStyle",
    table.styleName,
    resources
  ) as AD.TableStyle.TableStyle;
  const tableAvailableWidth = availableSize.width - (style.margins.left + style.margins.right);
  const numInfinityColumns = table.columnWidths.filter((w) => !isFinite(w)).length;
  const fixedColumnsWidth = table.columnWidths.filter((w) => isFinite(w)).reduce((a, b) => a + b, 0);
  const infinityWidth = (tableAvailableWidth - fixedColumnsWidth) / numInfinityColumns;
  const columnWidths = table.columnWidths.map((w) => (isFinite(w) ? w : infinityWidth));
  const desiredSizes = new Map<any, AD.Size.Size>();
  const rows = [...table.headerRows, ...table.children];
  for (let row of rows) {
    let column = 0;
    for (let cell of row.children) {
      const cellStyle = AD.Resources.getStyle(
        style.cellStyle,
        cell.style,
        "TableCellStyle",
        cell.styleName,
        resources
      ) as AD.TableCellStyle.TableCellStyle;
      const cellWidth = columnWidths.slice(column, column + cell.columnSpan).reduce((a, b) => a + b, 0);

      const contentAvailableWidth = cellWidth - (cellStyle.padding.left + cellStyle.padding.right);
      let cellDesiredHeight = cellStyle.padding.top + cellStyle.padding.bottom;

      for (let element of cell.children) {
        const elementAvailableSize = AD.Size.create(contentAvailableWidth, Infinity);
        const elementSizes = measureSectionElement(pdfKit, resources, elementAvailableSize, element);
        elementSizes.forEach((v, k) => desiredSizes.set(k, v));
        const elementSize = getDesiredSize(element, desiredSizes);
        if (!AD.Position.isPositionAbsolute(element)) {
          cellDesiredHeight += elementSize.height;
        }
      }

      desiredSizes.set(cell, AD.Size.create(cellWidth, cellDesiredHeight));
      column += cell.columnSpan;
    }
  }

  // Try to find the minimal height required for each row
  const cells = [];
  for (let i = 0; i < rows.length; i++) {
    cells.push(...rows[i].children.map((child) => ({ child, rowIndex: i })));
  }
  cells.sort((a, b) => {
    if (a.child.rowSpan === b.child.rowSpan) {
      return a.rowIndex - b.rowIndex;
    } else {
      return a.child.rowSpan - b.child.rowSpan;
    }
  });
  const minRowHeights = new Array(rows.length).fill(0);
  for (const { child, rowIndex } of cells) {
    const rowSpan = child.rowSpan || 1;
    let currentHeight = 0;
    for (let i = rowIndex; i < rowIndex + rowSpan; i++) {
      currentHeight += minRowHeights[i];
    }
    const adjustment = getDesiredSize(child, desiredSizes).height - currentHeight;
    if (adjustment > 0) {
      const adjustmentPerRow = adjustment / rowSpan;
      for (let i = rowIndex; i < rowIndex + rowSpan; i++) {
        minRowHeights[i] += adjustmentPerRow;
      }
    }
  }

  const desiredWidth = table.columnWidths.some((w) => !isFinite(w))
    ? availableSize.width
    : table.columnWidths.reduce((a, b) => a + b, style.margins.left + style.margins.right);
  let desiredHeight = style.margins.top + style.margins.bottom;
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowHeight = minRowHeights[i];
    desiredHeight += rowHeight;
    desiredSizes.set(row, AD.Size.create(desiredWidth, rowHeight));
    for (let cell of row.children) {
      const cellSize = desiredSizes.get(cell) || AD.Size.create(0, 0);
      desiredSizes.set(cell, AD.Size.create(cellSize.width, rowHeight));
    }
  }

  desiredSizes.set(table, AD.Size.create(tableAvailableWidth, desiredHeight));

  return desiredSizes;
}

function measureGroup(
  pdfKit: PDFKit.PDFDocument,
  resources: AD.Resources.Resources,
  availableSize: AD.Size.Size,
  keepTogether: AD.Group.Group
): Map<any, AD.Size.Size> {
  let desiredSizes = mergeMaps(
    keepTogether.children.map((e) => measureSectionElement(pdfKit, resources, availableSize, e))
  );
  let desiredHeight = keepTogether.children.reduce(
    (sum, e) => sum + (AD.Position.isPositionAbsolute(e) ? 0 : getDesiredSize(e, desiredSizes).height),
    0.0
  );
  desiredSizes.set(keepTogether, AD.Size.create(availableSize.width, desiredHeight));
  return desiredSizes;
}

function measureAtom(
  pdfKit: PDFKit.PDFDocument,
  resources: AD.Resources.Resources,
  textStyle: AD.TextStyle.TextStyle,
  availableSize: AD.Size.Size,
  availableRowSpace: number,
  atom: AD.Atom.Atom
): AD.Size.Size {
  switch (atom.type) {
    case "TextRun":
      return measureTextRun(pdfKit, resources, textStyle, atom, availableSize);
    case "TextField":
      return measureTextField(pdfKit, resources, textStyle, atom, availableSize);
    case "Image":
      return measureImage(availableSize, atom);
    case "HyperLink":
      return measureHyperLink(pdfKit, resources, textStyle, atom, availableSize);
    case "TocSeparator":
      return measureTocSeparator(pdfKit, textStyle, availableSize, availableRowSpace);
    case "LineBreak":
      return measureLineBreak(pdfKit, resources, textStyle, availableSize);
    case "LinkTarget":
      return {
        width: availableSize.width,
        height: 0,
      };
    default:
      return exhaustiveCheck(atom);
  }
}

function measureLineBreak(
  pdfKit: PDFKit.PDFDocument,
  resources: AD.Resources.Resources,
  textStyle: AD.TextStyle.TextStyle,
  availableSize: AD.Size.Size
): AD.Size.Size {
  const textSize = measureText(pdfKit, "A", textStyle, availableSize);
  return {
    height: textSize.height,
    width: 0,
  };
}

function measureTextRun(
  pdf: PDFKit.PDFDocument,
  resources: AD.Resources.Resources,
  textStyle: AD.TextStyle.TextStyle,
  textRun: AD.TextRun.TextRun,
  availableSize: AD.Size.Size
): AD.Size.Size {
  const style = AD.Resources.getNestedStyle(
    textStyle,
    textRun.style,
    "TextStyle",
    textRun.styleName,
    resources,
    textRun.nestedStyleNames || []
  ) as AD.TextStyle.TextStyle;
  return measureText(pdf, textRun.text, style, availableSize);
}

function measureHyperLink(
  pdf: PDFKit.PDFDocument,
  resources: AD.Resources.Resources,
  textStyle: AD.TextStyle.TextStyle,
  hyperLink: AD.HyperLink.HyperLink,
  availableSize: AD.Size.Size
): AD.Size.Size {
  const style = AD.Resources.getStyle(
    textStyle,
    hyperLink.style,
    "TextStyle",
    hyperLink.styleName,
    resources
  ) as AD.TextStyle.TextStyle;
  return measureText(pdf, hyperLink.text, style, availableSize);
}

function measureTextField(
  pdf: PDFKit.PDFDocument,
  resources: AD.Resources.Resources,
  textStyle: AD.TextStyle.TextStyle,
  textField: AD.TextField.TextField,
  availableSize: AD.Size.Size
): AD.Size.Size {
  const style = AD.Resources.getStyle(
    textStyle,
    textField.style,
    "TextStyle",
    textField.styleName,
    resources
  ) as AD.TextStyle.TextStyle;
  switch (textField.fieldType) {
    case "Date":
      return measureText(pdf, new Date(Date.now()).toDateString(), style, availableSize);
    case "PageNumber":
    case "TotalPages":
    case "PageNumberOf":
      return measureText(pdf, textField.text || "999", style, availableSize);
    default:
      return exhaustiveCheck(textField.fieldType);
  }
}

function measureTocSeparator(
  pdf: PDFKit.PDFDocument,
  textStyle: AD.TextStyle.TextStyle,
  availableSize: AD.Size.Size,
  availableRowSpace: number
): AD.Size.Size {
  const size = measureText(pdf, ".", textStyle, availableSize);
  return {
    height: size.height,
    width: availableRowSpace - 1,
  };
}

function measureImage(availableSize: AD.Size.Size, image: AD.Image.Image): AD.Size.Size {
  const desiredWidth = isFinite(image.width) ? image.width : availableSize.width;
  const desiredHeight = isFinite(image.height) ? image.height : availableSize.height;
  return AD.Size.create(desiredWidth, desiredHeight);
}

function measureText(
  pdf: PDFKit.PDFDocument,
  text: string,
  textStyle: AD.TextStyle.TextStyle,
  availableSize: AD.Size.Size
): AD.Size.Size {
  const font = getFontNameStyle(textStyle);
  const fontSize = AD.TextStyle.calculateFontSize(textStyle, 10);
  pdf
    .font(font)
    .fontSize(fontSize)
    .fillColor(textStyle.color || "black");

  const textOptions = {
    underline: textStyle.underline || false,
    indent: textStyle.indent || 0,
    lineBreak: textStyle.lineBreak ?? true,
    ...(textStyle.characterSpacing !== undefined ? { characterSpacing: textStyle.characterSpacing } : {}),
    ...(textStyle.lineGap !== undefined ? { lineGap: textStyle.lineGap } : {}),
  };
  const width = Math.min(availableSize.width, pdf.widthOfString(text, textOptions));
  const lineWidth = textStyle.lineBreak === false ? Infinity : availableSize.width;
  const height = pdf.heightOfString(text, {
    width: lineWidth,
    ...textOptions,
  });
  return AD.Size.create(width, height, availableSize.width);
}

function mergeMaps(maps: Array<Map<any, AD.Size.Size>>): Map<any, AD.Size.Size> {
  let newMap = new Map<any, AD.Size.Size>();
  maps.forEach((m) => m.forEach((v, k) => newMap.set(k, v)));
  return newMap;
}

function getDesiredSize(element: any, desiredSizes: Map<any, AD.Size.Size>): AD.Size.Size {
  const size = desiredSizes.get(element);
  if (size) {
    return size;
  }
  throw new Error("Could not find size for element!");
}
