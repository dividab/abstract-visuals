import * as R from "ramda";
import { split } from "ramda";
import * as AD from "../../abstract-document/index";
import { Table } from "../../abstract-document/section-elements/table";
import { getResources } from "../shared/get_resources";
import { registerFonts } from "./font";
import { measureTable } from "./measure";

/* tslint:disable:no-any */

export interface Page {
  readonly pageNo: number;
  readonly namedDestionations: ReadonlyArray<string>;
  readonly pageOptions: any;
  readonly section: AD.Section.Section;
  readonly contentRect: AD.Rect.Rect;
  readonly elements: ReadonlyArray<AD.SectionElement.SectionElement>;
  readonly header: ReadonlyArray<AD.SectionElement.SectionElement>;
  readonly footer: ReadonlyArray<AD.SectionElement.SectionElement>;
}

export function paginate(
  pdfKit: any,
  document: AD.AbstractDoc.AbstractDoc,
  desiredSizes: Map<any, AD.Size.Size>
): ReadonlyArray<Page> {
  const resources = getResources(document);
  let pdf = new pdfKit({
    compress: false,
    autoFirstPage: false,
    bufferPages: true,
  }) as any;

  registerFonts((fontName: string, fontSource: AD.Font.FontSource) => pdf.registerFont(fontName, fontSource), document);

  let pages = new Array<Page>();
  for (let section of document.children) {
    const previousPage = pages.length > 0 ? pages[pages.length - 1] : undefined;
    pages.push(...splitSection(pdfKit, document, resources, desiredSizes, previousPage, section));
  }

  return pages;
}

function splitSection(
  pdfKit: any,
  document: AD.AbstractDoc.AbstractDoc,
  parentResources: AD.Resources.Resources,
  desiredSizes: Map<{}, AD.Size.Size>,
  previousPage: Page | undefined,
  section: AD.Section.Section
): Array<Page> {
  const resources = AD.Resources.mergeResources([parentResources, section]);
  const pages = new Array<Page>();
  const contentRect = getPageContentRect(desiredSizes, section);

  let children = section.children;
  let elements = new Array<AD.SectionElement.SectionElement>();
  let elementsHeight = 0;
  let currentPage = previousPage;
  for (let i = 0; i < children.length; ++i) {
    const element = children[i];
    if (element.type === "PageBreak") {
      currentPage = createPage(resources, desiredSizes, currentPage, section, elements, pages.length === 0);
      pages.push(currentPage);
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

    elements.push(element);
    elementsHeight += elementSize.height;

    const [leadingSpace, trailingSpace] = getLeadingAndTrailingSpace(resources, section, elements);
    const availableHeight = contentRect.height + leadingSpace + trailingSpace;
    if (elementsHeight > availableHeight) {
      if (element.type === "Table") {
        //Try to split table
        elements.pop();
        elementsHeight -= elementSize.height;
        let tableHead = {} as AD.Table.Table;
        let tableRest = {} as AD.Table.Table;

        //Find where to split table
        for (const [rowIndex, row] of element.children.entries()) {
          const rowSize = getDesiredSize(row, desiredSizes);
          elementsHeight += rowSize.height;
          if (elementsHeight > availableHeight) {
            const [newTableHead, newTableRest] = splitTableAt(
              pdfKit,
              document,
              resources,
              desiredSizes,
              element,
              rowIndex
            );
            tableHead = newTableHead;
            tableRest = newTableRest;
            break;
          }
        }

        elements.push(tableHead);
        currentPage = createPage(resources, desiredSizes, currentPage, section, elements, pages.length === 0);
        pages.push(currentPage);
        elements = [];
        elementsHeight = 0;

        //Add split table to children to process tableRest
        children = [...children.slice(0, i), tableHead, tableRest, ...children.slice(i + 1)];
        continue;
      }

      if (elements.length > 1) {
        elements.pop();
        i--;
      }
      currentPage = createPage(resources, desiredSizes, currentPage, section, elements, pages.length === 0);
      pages.push(currentPage);
      elements = [];
      elementsHeight = 0;
    }
  }

  if (elements.length > 0) {
    pages.push(createPage(resources, desiredSizes, currentPage, section, elements, pages.length === 0));
  }

  return pages;
}

function createPage(
  resources: AD.Resources.Resources,
  desiredSizes: Map<{}, AD.Size.Size>,
  previousPage: Page | undefined,
  section: AD.Section.Section,
  elements: ReadonlyArray<AD.SectionElement.SectionElement>,
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

  const sectionName = isFirst && section.id !== "" ? [section.id] : [];
  // For now, only support link targets at base level. Tree search would be needed to find all targets.
  const targetNames = R.unnest(
    elements.map((e) => (e.type === "Paragraph" ? e.children.map((c) => (c.type === "LinkTarget" ? c.name : "")) : []))
  ).filter((t) => t !== "");
  const namedDestionations = [...sectionName, ...targetNames];

  // Ignore leading space by expanding the content rect upwards
  const rect = getPageContentRect(desiredSizes, section);
  const [leadingSpace] = getLeadingAndTrailingSpace(resources, section, elements);
  const contentRect = AD.Rect.create(rect.x, rect.y - leadingSpace, rect.width, rect.height + leadingSpace);

  return {
    pageNo: pageNo,
    namedDestionations: namedDestionations,
    pageOptions: pageOptions,
    section: section,
    contentRect: contentRect,
    elements: elements,
    header: section.page.header,
    footer: section.page.footer,
  };
}

function getPageContentRect(desiredSizes: Map<{}, AD.Size.Size>, section: AD.Section.Section): AD.Rect.Rect {
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
  pdfKit: any,
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
  const tableHead = { ...table, children: headRows };
  const tableTail = { ...table, children: tailRows };

  const availableSize = getDesiredSize(table, desiredSizes);
  let pdf = new pdfKit();
  registerFonts((fontName: string, fontSource: AD.Font.FontSource) => pdf.registerFont(fontName, fontSource), document);
  const headSizes = measureTable(pdf, resources, availableSize, tableHead);
  const tailSizes = measureTable(pdf, resources, availableSize, tableTail);

  headSizes.forEach((value, key) => desiredSizes.set(key, value));
  tailSizes.forEach((value, key) => desiredSizes.set(key, value));

  return [tableHead, tableTail];
}
