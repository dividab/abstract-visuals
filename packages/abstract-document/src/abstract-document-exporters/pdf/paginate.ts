import * as AD from "../../abstract-document/index.js";
import { getResources } from "../shared/get_resources.js";
import { registerFonts } from "./font.js";
import { measureTable } from "./measure.js";

export interface PageColumn {
  readonly elements: ReadonlyArray<AD.SectionElement.SectionElement>;
}

export interface Page {
  readonly pageNo: number;
  readonly namedDestionations: ReadonlyArray<string>;
  readonly pageOptions: any;
  readonly section: AD.Section.Section;
  readonly contentRect: AD.Rect.Rect;
  readonly columns: ReadonlyArray<PageColumn>;
  readonly header: ReadonlyArray<AD.SectionElement.SectionElement>;
  readonly footer: ReadonlyArray<AD.SectionElement.SectionElement>;
}

export function paginate(
  pdfKit: PDFKit.PDFDocument,
  document: AD.AbstractDoc.AbstractDoc,
  desiredSizes: Map<any, AD.Size.Size>
): ReadonlyArray<Page> {
  const resources = getResources(document);
  const pdf = new pdfKit({ compress: false, autoFirstPage: false, bufferPages: true });

  registerFonts((fontName: string, fontSource: AD.Font.FontSource) => pdf.registerFont(fontName, fontSource), document);
  const pages = new Array<Page>();
  for (let section of document.children) {
    const previousPage = pages.length > 0 ? pages[pages.length - 1] : undefined;
    pages.push(...paginateSection(pdfKit, document, resources, desiredSizes, previousPage, section));
  }

  return pages;
}

function paginateSection(
  pdfKit: PDFKit.PDFDocument,
  document: AD.AbstractDoc.AbstractDoc,
  parentResources: AD.Resources.Resources,
  desiredSizes: Map<{}, AD.Size.Size>,
  previousPage: Page | undefined,
  section: AD.Section.Section
): Array<Page> {
  const resources = AD.Resources.mergeResources([parentResources, section]);
  const pages = new Array<Page>();

  let children = section.children;
  let columns = new Array<PageColumn>();
  let elements = new Array<AD.SectionElement.SectionElement>();
  let elementsHeight = 0;
  let currentPage = previousPage;
  for (let i = 0; i < children.length; ++i) {
    const contentRect = getPageContentRect(desiredSizes, section, pages.length + 1);
    const element = children[i];
    if (element.type === "PageBreak") {
      columns.push({ elements });
      currentPage = createPage(resources, desiredSizes, currentPage, section, columns, pages.length === 0);
      pages.push(currentPage);
      columns = [];
      elements = [];
      elementsHeight = 0;
      continue;
    }
    const elementSize = getDesiredSize(element, desiredSizes);

    // Collapse groups that doesn't fit on empty page
    if (elementSize.height > contentRect.height && element.type === "Group") {
      children = [...children.slice(0, i), ...element.children, ...children.slice(i + 1)];
      i--;
      continue;
    }
    const isPositionAbsolute = AD.Position.isPositionAbsolute(element);

    elements.push(element);
    elementsHeight += isPositionAbsolute ? 0 : elementSize.height;

    const [leadingSpace, trailingSpace] = getLeadingAndTrailingSpace(resources, section, elements);
    const availableHeight = contentRect.height + leadingSpace + trailingSpace;
    if (elementsHeight > availableHeight) {
      if (element.type === "Table" && element.children.length > 1) {
        //Remove last element
        elements.pop();
        elementsHeight -= elementSize.height; //TODO: handle absolute positioned elements

        //Try to split table
        const [tableHead, tableTail] = splitTable(
          pdfKit,
          document,
          resources,
          desiredSizes,
          element,
          elementsHeight,
          availableHeight,
          elements.length
        );

        const tableSplit: AD.Table.Table[] = [];
        if (tableHead) {
          elements.push(tableHead);
          tableSplit.push(tableHead);
        } else {
          i--;
        }
        if (tableTail) {
          tableSplit.push(tableTail);
        }

        //Add split table to children to process tableTail in next iteration
        children = [...children.slice(0, i), ...tableSplit, ...children.slice(i + 1)];
      } else if (elements.length > 1) {
        elements.pop();
        i--;
      }

      columns.push({ elements });
      elements = [];
      elementsHeight = 0;

      if (columns.length === section.page.style.columnLayout.columnCount) {
        currentPage = createPage(resources, desiredSizes, currentPage, section, columns, pages.length === 0);
        pages.push(currentPage);
        columns = [];
      }
    }
  }

  if (elements.length > 0) {
    columns.push({ elements });
    pages.push(createPage(resources, desiredSizes, currentPage, section, columns, pages.length === 0));
  }

  return pages;
}

function splitTable(
  pdfKit: PDFKit.PDFDocument,
  document: AD.AbstractDoc.AbstractDoc,
  resources: AD.Resources.Resources,
  desiredSizes: Map<{}, AD.Size.Size>,
  table: AD.Table.Table,
  elementsHeight: number,
  availableHeight: number,
  elementsLength: number
): [AD.Table.Table | undefined, AD.Table.Table | undefined] {
  let tableHead = undefined;
  let tableRest = undefined;
  elementsHeight += table.style.margins.top || 0;
  if (table.headerRows.length > 0) {
    const headerSize = table.headerRows.reduce((acc, row) => (acc += getDesiredSize(row, desiredSizes).height), 0);
    elementsHeight += headerSize;
  }

  //Find where to split table
  for (const [rowIndex, row] of table.children.entries()) {
    const rowSize = getDesiredSize(row, desiredSizes);
    elementsHeight += rowSize.height;

    if (elementsHeight > availableHeight) {
      if (rowIndex === 0 && elementsLength !== 0) {
        //Not even first row fit on the page, shove it all to the next page
        return [undefined, table];
      }

      const [newTableHead, newTableRest] = splitTableAt(
        pdfKit,
        document,
        resources,
        desiredSizes,
        table,
        Math.max(rowIndex, 1)
      );

      if (newTableHead.children.length > 0) {
        tableHead = newTableHead;
      }
      if (newTableRest.children.length > 0) {
        tableRest = newTableRest;
      }
      break;
    }
  }

  if (!tableHead && !tableRest) {
    //Didnt find a place to split the table, meaning the whole table fits on current page
    return [table, undefined];
  }

  return [tableHead, tableRest];
}

function createPage(
  resources: AD.Resources.Resources,
  desiredSizes: Map<{}, AD.Size.Size>,
  previousPage: Page | undefined,
  section: AD.Section.Section,
  columns: ReadonlyArray<PageColumn>,
  isFirst: boolean
): Page {
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
      bottom: 0,
    },
  };
  const pageNo = previousPage ? previousPage.pageNo + 1 : 1;

  const namedDestionations = [];

  const sectionName = isFirst && section.id !== "" ? [section.id] : [];
  namedDestionations.push(...sectionName);

  // For now, only support link targets at base level. Tree search would be needed to find all targets.
  for (const { elements } of columns) {
    const targetNames = elements
      .flatMap((e) => (e.type === "Paragraph" ? e.children.map((c) => (c.type === "LinkTarget" ? c.name : "")) : []))
      .filter((t) => t !== "");
    namedDestionations.push(...targetNames);
  }

  // Ignore leading space by expanding the content rect upwards
  const rect = getPageContentRect(desiredSizes, section, pageNo);
  let leadingSpace = undefined;
  for (const { elements } of columns) {
    const [columnLeadingSpace] = getLeadingAndTrailingSpace(resources, section, elements);
    leadingSpace = Math.min(leadingSpace ?? columnLeadingSpace, columnLeadingSpace);
  }
  leadingSpace ||= 0;
  const contentRect = AD.Rect.create(rect.x, rect.y - leadingSpace, rect.width, rect.height + leadingSpace);

  const frontHeader =
    section.page.frontHeader === undefined || section.page.frontHeader.length === 0
      ? section.page.header
      : section.page.frontHeader;

  const frontFooter =
    section.page.frontFooter === undefined || section.page.frontFooter.length === 0
      ? section.page.footer
      : section.page.frontFooter;

  return {
    pageNo: pageNo,
    namedDestionations: namedDestionations,
    pageOptions: pageOptions,
    section: section,
    contentRect: contentRect,
    columns: columns,
    header: isFirst ? frontHeader : section.page.header,
    footer: isFirst ? frontFooter : section.page.footer,
  };
}

export function getHeaderAndFooter(
  section: AD.Section.Section,
  pageNo: number
): {
  readonly header: Array<AD.SectionElement.SectionElement>;
  readonly footer: Array<AD.SectionElement.SectionElement>;
  readonly headerMargins: AD.LayoutFoundation.LayoutFoundation;
  readonly footerMargins: AD.LayoutFoundation.LayoutFoundation;
} {
  const FIRST_PAGE = 1;
  const EVEN_PAGE = 0;
  const ODD_PAGE = 1;
  switch (true) {
    //first page
    case pageNo === FIRST_PAGE: {
      const normalHeader = section.page.frontHeader === undefined || section.page.frontHeader.length === 0;
      const normalFooter = section.page.frontFooter === undefined || section.page.frontFooter.length === 0;
      return {
        footer: normalFooter ? section.page.footer : section.page.frontFooter,
        header: normalHeader ? section.page.header : section.page.frontHeader,
        headerMargins: normalHeader
          ? section.page.style.headerMargins
          : section.page.style.firstPageHeaderMargins ?? section.page.style.headerMargins,
        footerMargins: normalFooter
          ? section.page.style.footerMargins
          : section.page.style.firstPageFooterMargins ?? section.page.style.footerMargins,
      };
    }
    case pageNo === 0:
    case pageNo % 2 === EVEN_PAGE:
    case pageNo % 2 === ODD_PAGE:
    default: {
      return {
        header: section.page.header,
        footer: section.page.footer,
        headerMargins: section.page.style.headerMargins,
        footerMargins: section.page.style.footerMargins,
      };
    }
  }
}

function getPageContentRect(
  desiredSizes: Map<{}, AD.Size.Size>,
  section: AD.Section.Section,
  pageNo: number
): AD.Rect.Rect {
  const style = section.page.style;
  const pageWidth = AD.PageStyle.getWidth(style);
  const pageHeight = AD.PageStyle.getHeight(style);

  const { header, footer, headerMargins, footerMargins } = getHeaderAndFooter(section, pageNo);
  const headerHeight = header.reduce(
    (prev, curr) => prev + getDesiredSize(curr, desiredSizes).height,
    headerMargins.top + headerMargins.bottom
  );
  const footerHeight = footer.reduce(
    (prev, curr) => prev + getDesiredSize(curr, desiredSizes).height,
    footerMargins.top + footerMargins.bottom
  );

  let headerY = headerMargins.top;
  for (let element of header) {
    const elementSize = getDesiredSize(element, desiredSizes);
    headerY += elementSize.height;
  }
  headerY += headerMargins.bottom;

  const rectX = style.contentMargins.left;
  const rectY = headerY + style.contentMargins.top;
  const rectWidth = pageWidth - (style.contentMargins.left + style.contentMargins.right);
  const rectHeight = pageHeight - headerHeight - footerHeight - style.contentMargins.top - style.contentMargins.bottom;
  return AD.Rect.create(rectX, rectY, rectWidth, rectHeight);
}

function getLeadingAndTrailingSpace(
  resources: AD.Resources.Resources,
  section: AD.Section.Section,
  elements: ReadonlyArray<AD.SectionElement.SectionElement>
): [number, number] {
  const { noTopBottomMargin } = section.page.style;

  const first = elements[0];
  const firstMargins = first && getSectionElementMargin(resources, first);
  const leadingSpace = firstMargins && noTopBottomMargin ? firstMargins.top : 0;

  const last = elements.length > 0 ? elements[elements.length - 1] : undefined;
  const lastMargins = last && getSectionElementMargin(resources, last);
  const trailingSpace = lastMargins && noTopBottomMargin ? lastMargins.bottom : 0;

  return [leadingSpace, trailingSpace];
}

function getSectionElementMargin(
  parentResources: AD.Resources.Resources,
  element: AD.SectionElement.SectionElement
): AD.LayoutFoundation.LayoutFoundation {
  const resources = AD.Resources.mergeResources([parentResources, element]);
  switch (element.type) {
    case "Paragraph":
      return getParagraphMargins(resources, element);
    case "Table":
      return getTableMargins(resources, element);
    case "Group":
      return getGroupMargins(resources, element);
    default:
      return {
        bottom: 0,
        left: 0,
        right: 0,
        top: 0,
      };
  }
}

function getParagraphMargins(
  resources: AD.Resources.Resources,
  paragraph: AD.Paragraph.Paragraph
): AD.LayoutFoundation.LayoutFoundation {
  const style = AD.Resources.getStyle(
    undefined,
    paragraph.style,
    "ParagraphStyle",
    paragraph.styleName,
    resources
  ) as AD.ParagraphStyle.ParagraphStyle;
  return style.margins;
}

function getGroupMargins(
  resources: AD.Resources.Resources,
  group: AD.Group.Group
): AD.LayoutFoundation.LayoutFoundation {
  const first = group.children.length > 0 ? group.children[0] : undefined;
  const last = group.children.length > 0 ? group.children[group.children.length - 1] : undefined;
  const firstMargin = first && getSectionElementMargin(resources, first);
  const lastMargin = last && getSectionElementMargin(resources, last);
  if (firstMargin && lastMargin) {
    return {
      ...firstMargin,
      bottom: lastMargin.bottom,
    };
  } else {
    return {
      bottom: 0,
      left: 0,
      right: 0,
      top: 0,
    };
  }
}

function getTableMargins(
  resources: AD.Resources.Resources,
  table: AD.Table.Table
): AD.LayoutFoundation.LayoutFoundation {
  const style = AD.Resources.getStyle(
    undefined,
    table.style,
    "TableStyle",
    table.styleName,
    resources
  ) as AD.TableStyle.TableStyle;
  return style.margins;
}

function getDesiredSize(element: {}, desiredSizes: Map<{}, AD.Size.Size>): AD.Size.Size {
  const size = desiredSizes.get(element);
  if (size) {
    return size;
  }
  throw new Error("Could not find size for element!");
}

function splitTableAt(
  pdfKit: PDFKit.PDFDocument,
  document: AD.AbstractDoc.AbstractDoc,
  resources: AD.Resources.Resources,
  desiredSizes: Map<{}, AD.Size.Size>,
  table: AD.Table.Table,
  splitIndex: number
): [AD.Table.Table, AD.Table.Table] {
  //Push row/cells to head table while splitting rowspan
  const headRows: AD.TableRow.TableRow[] = [];
  for (const [rowIndex, row] of table.children.slice(0, splitIndex).entries()) {
    const newRow: AD.TableCell.TableCell[] = [];
    for (const cell of row.children) {
      //If this cell would span over the split index
      if (rowIndex + (cell.rowSpan || 1) - 1 >= splitIndex) {
        newRow.push({ ...cell, rowSpan: splitIndex - rowIndex });
      } else {
        newRow.push(cell);
      }
    }
    headRows.push({ ...row, children: newRow });
  }

  //Set dummy to false for all cells in the splitRow
  //This causes them to be rendered like an empty cell
  //while keeping the remaining rowspan which was calculated
  //in the pre-process step
  const splitRow = table.children[splitIndex];
  const firstTailRow: AD.TableCell.TableCell[] = [];
  for (const cell of splitRow.children) {
    firstTailRow.push({ ...cell, dummy: false });
  }

  // Push the rest of the rows to tail table
  const tailRows: AD.TableRow.TableRow[] = [{ ...splitRow, children: firstTailRow }];
  tailRows.push(...table.children.slice(splitIndex + 1));

  //Create tables and remeasure them
  const tableHead = {
    ...table,
    style: { ...table.style, margins: { ...table.style.margins, bottom: 0 } },
    children: headRows,
  };
  const tableTail = {
    ...table,
    style: { ...table.style, margins: { ...table.style.margins, top: 0 } },
    children: tailRows,
  };

  const availableSize = getDesiredSize(table, desiredSizes);
  let pdf = new pdfKit();
  registerFonts((fontName: string, fontSource: AD.Font.FontSource) => pdf.registerFont(fontName, fontSource), document);
  const headSizes = measureTable(pdf, resources, availableSize, tableHead);
  const tailSizes = measureTable(pdf, resources, availableSize, tableTail);

  headSizes.forEach((value, key) => desiredSizes.set(key, value));
  tailSizes.forEach((value, key) => desiredSizes.set(key, value));

  return [tableHead, tableTail];
}
