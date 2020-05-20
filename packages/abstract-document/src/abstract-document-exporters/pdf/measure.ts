import * as R from "ramda";
import * as AD from "../../abstract-document/index";
import { getResources } from "../shared/get_resources";
import { exhaustiveCheck } from "ts-exhaustive-check";

//tslint:disable:no-any variable-name

export function measure(
  PDFDocument: any,
  document: AD.AbstractDoc.AbstractDoc
): Map<any, AD.Size.Size> {
  const resources = getResources(document);
  let pdf = new PDFDocument();

  if (resources.fonts) {
    for (let fontName of R.keys(resources.fonts)) {
      const font = resources.fonts[fontName];
      pdf.registerFont(fontName, font.normal);
      pdf.registerFont(fontName + "-Bold", font.bold);
      pdf.registerFont(fontName + "-Oblique", font.italic);
      pdf.registerFont(fontName + "-BoldOblique", font.boldItalic);
    }
  }
  return mergeMaps(
    document.children.map(s => measureSection(pdf, document, s))
  );
}

function measureSection(
  pdf: any,
  parentResources: AD.Resources.Resources,
  section: AD.Section.Section
): Map<any, AD.Size.Size> {
  const pageWidth = AD.PageStyle.getWidth(section.page.style);
  const pageHeight = AD.PageStyle.getHeight(section.page.style);
  const resources = AD.Resources.mergeResources([section, parentResources]);

  const contentAvailableWidth =
    pageWidth -
    (section.page.style.contentMargins.left +
      section.page.style.contentMargins.right);
  const contentAvailableSize = AD.Size.create(
    contentAvailableWidth,
    pageHeight
  );
  const sectionSizes = section.children.map(e =>
    measureSectionElement(pdf, resources, contentAvailableSize, e)
  );

  const headerAvailableWidth =
    pageWidth -
    (section.page.style.headerMargins.left +
      section.page.style.headerMargins.right);
  const headerAvailableSize = AD.Size.create(headerAvailableWidth, pageHeight);
  const headerSizes = section.page.header.map(e =>
    measureSectionElement(pdf, resources, headerAvailableSize, e)
  );

  const footerAvailableWidth =
    pageWidth -
    (section.page.style.footerMargins.left +
      section.page.style.footerMargins.right);
  const footerAvailableSize = AD.Size.create(footerAvailableWidth, pageHeight);
  const footerSizes = section.page.footer.map(e =>
    measureSectionElement(pdf, resources, footerAvailableSize, e)
  );

  return mergeMaps(R.unnest([sectionSizes, headerSizes, footerSizes]));
}

function measureSectionElement(
  pdf: any,
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
    default:
      return exhaustiveCheck(element);
  }
}

function measureParagraph(
  pdf: any,
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
  const contentAvailableWidth =
    availableSize.width - (style.margins.left + style.margins.left);
  const contentAvailableHeight =
    availableSize.height - (style.margins.top + style.margins.bottom);
  const contentAvailableSize = AD.Size.create(
    contentAvailableWidth,
    contentAvailableHeight
  );

  let desiredHeight = style.margins.top + style.margins.bottom;
  let currentRowWidth = 0;
  let currentRowHeight = 0;
  let desiredSizes = new Map<any, AD.Size.Size>();
  for (let atom of paragraph.children) {
    const atomSize = measureAtom(
      pdf,
      resources,
      style.textStyle,
      contentAvailableSize,
      atom
    );
    desiredSizes.set(atom, atomSize);
    if (currentRowWidth + atomSize.width > contentAvailableSize.width) {
      desiredHeight += currentRowHeight;
      currentRowWidth = 0;
      currentRowHeight = 0;
    }
    currentRowWidth += atomSize.width;
    currentRowHeight = Math.max(atomSize.height, currentRowHeight);
  }
  desiredHeight += currentRowHeight;

  desiredSizes.set(
    paragraph,
    AD.Size.create(availableSize.width, desiredHeight)
  );

  return desiredSizes;
}

function measureTable(
  pdf: any,
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
  const tableAvailableWidth =
    availableSize.width - (style.margins.left + style.margins.right);
  const numInfinityColumns = table.columnWidths.filter(w => !isFinite(w))
    .length;
  const fixedColumnsWidth = table.columnWidths
    .filter(w => isFinite(w))
    .reduce((a, b) => a + b, 0);
  const infinityWidth =
    (tableAvailableWidth - fixedColumnsWidth) / numInfinityColumns;
  const columnWidths = table.columnWidths.map(
    w => (isFinite(w) ? w : infinityWidth)
  );
  const desiredSizes = new Map<any, AD.Size.Size>();

  for (let row of table.children) {
    let column = 0;
    for (let cell of row.children) {
      const cellStyle = AD.Resources.getStyle(
        style.cellStyle,
        cell.style,
        "TableCellStyle",
        cell.styleName,
        resources
      ) as AD.TableCellStyle.TableCellStyle;
      const cellWidth = columnWidths
        .slice(column, column + cell.columnSpan)
        .reduce((a, b) => a + b, 0);

      const contentAvailableWidth =
        cellWidth - (cellStyle.padding.left + cellStyle.padding.right);
      let cellDesiredHeight = cellStyle.padding.top + cellStyle.padding.bottom;

      for (let element of cell.children) {
        const elementAvailableSize = AD.Size.create(
          contentAvailableWidth,
          Infinity
        );
        const elementSizes = measureSectionElement(
          pdf,
          resources,
          elementAvailableSize,
          element
        );
        elementSizes.forEach((v, k) => desiredSizes.set(k, v));
        const elementSize = getDesiredSize(element, desiredSizes);
        cellDesiredHeight += elementSize.height;
      }

      desiredSizes.set(cell, AD.Size.create(cellWidth, cellDesiredHeight));
      column += cell.columnSpan;
    }
  }

  const desiredWidth = table.columnWidths.some(w => !isFinite(w))
    ? availableSize.width
    : table.columnWidths.reduce(
        (a, b) => a + b,
        style.margins.left + style.margins.right
      );

  let desiredHeight = style.margins.top + style.margins.bottom;
  for (let row of table.children) {
    let rowHeight = row.children
      .map(c => getDesiredSize(c, desiredSizes).height)
      .reduce((a, b) => Math.max(a, b), 0);
    desiredHeight += rowHeight;
    desiredSizes.set(row, AD.Size.create(desiredWidth, rowHeight));
    for (let cell of row.children) {
      const cellSize = desiredSizes.get(cell) || AD.Size.create(0, 0);
      desiredSizes.set(cell, AD.Size.create(cellSize.width, rowHeight));
    }
  }

  desiredSizes.set(table, AD.Size.create(desiredWidth, desiredHeight));

  return desiredSizes;
}

function measureGroup(
  pdf: any,
  resources: AD.Resources.Resources,
  availableSize: AD.Size.Size,
  keepTogether: AD.Group.Group
): Map<any, AD.Size.Size> {
  let desiredSizes = mergeMaps(
    keepTogether.children.map(e =>
      measureSectionElement(pdf, resources, availableSize, e)
    )
  );
  let desiredHeight = R.reduce(
    (sum, e) => sum + getDesiredSize(e, desiredSizes).height,
    0.0,
    keepTogether.children
  );
  desiredSizes.set(
    keepTogether,
    AD.Size.create(availableSize.width, desiredHeight)
  );
  return desiredSizes;
}

function measureAtom(
  pdf: any,
  resources: AD.Resources.Resources,
  textStyle: AD.TextStyle.TextStyle,
  availableSize: AD.Size.Size,
  atom: AD.Atom.Atom
): AD.Size.Size {
  switch (atom.type) {
    case "TextRun":
      return measureTextRun(pdf, resources, textStyle, atom, availableSize);
    case "TextField":
      return measureTextField(pdf, resources, textStyle, atom, availableSize);
    case "Image":
      return measureImage(availableSize, atom);
    case "HyperLink":
      return measureHyperLink(pdf, resources, textStyle, atom, availableSize);
    default:
      return exhaustiveCheck(atom);
  }
}

function measureTextRun(
  pdf: any,
  resources: AD.Resources.Resources,
  textStyle: AD.TextStyle.TextStyle,
  textRun: AD.TextRun.TextRun,
  availableSize: AD.Size.Size
): AD.Size.Size {
  const style = AD.Resources.getStyle(
    textStyle,
    textRun.style,
    "TextStyle",
    textRun.styleName,
    resources
  ) as AD.TextStyle.TextStyle;
  return measureText(pdf, textRun.text, style, availableSize);
}

function measureHyperLink(
  pdf: any,
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
  pdf: any,
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
      return measureText(
        pdf,
        new Date(Date.now()).toDateString(),
        style,
        availableSize
      );
    case "PageNumber":
    case "TotalPages":
    case "PageNumberOf":
      return measureText(pdf, "999", style, availableSize);
    default:
      return exhaustiveCheck(textField.fieldType);
  }
}

function measureImage(
  availableSize: AD.Size.Size,
  image: AD.Image.Image
): AD.Size.Size {
  const desiredWidth = isFinite(image.width)
    ? image.width
    : availableSize.width;
  const desiredHeight = isFinite(image.height)
    ? image.height
    : availableSize.height;
  return AD.Size.create(desiredWidth, desiredHeight);
}

function measureText(
  pdf: any,
  text: string,
  textStyle: AD.TextStyle.TextStyle,
  availableSize: AD.Size.Size
): AD.Size.Size {
  let features: Array<string> = [];
  let font = textStyle.fontFamily || "Helvetica";
  if (textStyle.bold && textStyle.italic) {
    font += "-BoldOblique";
  } else if (textStyle.bold) {
    font += "-Bold";
  } else if (textStyle.italic) {
    font += "-Oblique";
  }

  if (textStyle.subScript) {
    features.push("subs");
  }
  if (textStyle.superScript) {
    features.push("sups");
  }

  pdf
    .font(font)
    .fontSize(textStyle.fontSize || 10)
    .fillColor(textStyle.color || "black");
  const width = Math.min(
    availableSize.width,
    pdf.widthOfString(text, {
      width: availableSize.width,
      height: availableSize.height,
      underline: textStyle.underline || false,
      features: features
    }) + 2
  );
  const height =
    pdf.heightOfString(text, {
      width: width,
      height: availableSize.height,
      underline: textStyle.underline || false,
      features: features
    }) + 2;
  return AD.Size.create(width, height);
  // let font = style.fontFamily || "Helvetica";
  // if (style.bold && style.italic) { font += "-BoldOblique"; }
  // else if (style.bold) { font += "-Bold"; }
  // else if (style.italic) { font += "-Oblique"; }

  // pdf.font(font).fontSize(style.fontSize || 10);
  // const width = Math.min(availableSize.width, pdf.widthOfString(text));
  // const height = Math.min(availableSize.height, pdf.heightOfString(text));

  // return AD.Size.create(width, height);
}

function mergeMaps(
  maps: Array<Map<any, AD.Size.Size>>
): Map<any, AD.Size.Size> {
  let newMap = new Map<any, AD.Size.Size>();
  maps.forEach(m => m.forEach((v, k) => newMap.set(k, v)));
  return newMap;
}

function getDesiredSize(
  element: any,
  desiredSizes: Map<any, AD.Size.Size>
): AD.Size.Size {
  const size = desiredSizes.get(element);
  if (size) {
    return size;
  }
  throw new Error("Could not find size for element!");
}
