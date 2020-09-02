import * as R from "ramda";
import * as AD from "../../abstract-document/index";
import { getResources } from "../shared/get_resources";
import { measureSection } from "./measure";

//tslint:disable

export interface Page {
  readonly pageNo: number;
  readonly namedDestionation: string | undefined;
  readonly pageOptions: any;
  readonly section: AD.Section.Section;
  readonly contentRect: AD.Rect.Rect;
  readonly elements: ReadonlyArray<AD.SectionElement.SectionElement>;
  readonly header: ReadonlyArray<AD.SectionElement.SectionElement>;
  readonly footer: ReadonlyArray<AD.SectionElement.SectionElement>;
}

export function splitDocument(
  pdfKit: any,
  document: AD.AbstractDoc.AbstractDoc,
  desiredSizes: Map<any, AD.Size.Size>
): ReadonlyArray<Page> {
  const PDFDocument = pdfKit;
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

  let pages = new Array<Page>();
  for (let section of document.children) {
    const previousPage = pages.length > 0 ? pages[pages.length - 1] : undefined;
    pages.push(...splitSection(resources, desiredSizes, previousPage, section));
  }

  return pages;
}

export function updatePageRefs(page: Page, pages: ReadonlyArray<Page>): Page {
  const updatedElements = updateRefsInElements(page.elements, page, pages);
  const updatedHeader = updateRefsInElements(page.header, page, pages);
  const updatedFooter = updateRefsInElements(page.footer, page, pages);
  return {
    ...page,
    elements: updatedElements,
    header: updatedHeader,
    footer: updatedFooter
  };
}

export function measurePage(
  pdfKit: any,
  parentResources: AD.Resources.Resources,
  page: Page
): Map<any, AD.Size.Size> {
  const PDFDocument = pdfKit;
  let pdf = new PDFDocument();
  const section = {
    ...page.section,
    page: {
      ...page.section.page,
      header: page.header as Array<AD.SectionElement.SectionElement>,
      footer: page.footer as Array<AD.SectionElement.SectionElement>
    },
    children: page.elements
  };
  return measureSection(pdf, parentResources, section);
}

function updateRefsInElements(
  elements: ReadonlyArray<AD.SectionElement.SectionElement>,
  page: Page,
  pages: ReadonlyArray<Page>
): ReadonlyArray<AD.SectionElement.SectionElement> {
  const updatedElements = new Array<AD.SectionElement.SectionElement>();
  for (let element of elements) {
    const updatedElement = updateRefsInElement(element, page, pages);
    updatedElements.push(updatedElement);
  }
  return updatedElements;
}

function updateRefsInElement(
  element: AD.SectionElement.SectionElement,
  page: Page,
  pages: ReadonlyArray<Page>
): AD.SectionElement.SectionElement {
  switch (element.type) {
    case "Paragraph":
      return updateRefsInParagraph(element, page, pages);
    case "Table":
      return updateRefsInTable(element, page, pages);
    case "Group":
      return updateRefsInGroup(element, page, pages);
    default:
      return element;
  }
}

function updateRefsInParagraph(
  paragraph: AD.Paragraph.Paragraph,
  page: Page,
  pages: ReadonlyArray<Page>
): AD.SectionElement.SectionElement {
  const updatedChildren = paragraph.children.map(atom =>
    updateRefInAtom(atom, page, pages)
  );
  return {
    ...paragraph,
    children: updatedChildren
  };
}

function updateRefsInTable(
  table: AD.Table.Table,
  page: Page,
  pages: ReadonlyArray<Page>
): AD.SectionElement.SectionElement {
  const updatedChildren = table.children.map(row =>
    updateRefsInTableRow(row, page, pages)
  );
  return {
    ...table,
    children: updatedChildren
  };
}

function updateRefsInTableRow(
  row: AD.TableRow.TableRow,
  page: Page,
  pages: ReadonlyArray<Page>
): AD.TableRow.TableRow {
  const updatedChildren = row.children.map(cell =>
    updateRefsInTableCell(cell, page, pages)
  );
  return {
    ...row,
    children: updatedChildren
  };
}

function updateRefsInTableCell(
  cell: AD.TableCell.TableCell,
  page: Page,
  pages: ReadonlyArray<Page>
): AD.TableCell.TableCell {
  const updatedChildren = cell.children.map(element =>
    updateRefsInElement(element, page, pages)
  );
  return {
    ...cell,
    children: updatedChildren
  };
}

function updateRefsInGroup(
  group: AD.Group.Group,
  page: Page,
  pages: ReadonlyArray<Page>
): AD.SectionElement.SectionElement {
  const updatedChildren = group.children.map(element =>
    updateRefsInElement(element, page, pages)
  );
  return {
    ...group,
    children: updatedChildren
  };
}

function updateRefInAtom(
  atom: AD.Atom.Atom,
  page: Page,
  pages: ReadonlyArray<Page>
): AD.Atom.Atom {
  if (atom.type === "TextField") {
    return updateRefInTextField(atom, page, pages);
  } else {
    return atom;
  }
}

function updateRefInTextField(
  textField: AD.TextField.TextField,
  page: Page,
  pages: ReadonlyArray<Page>
): AD.TextField.TextField {
  switch (textField.fieldType) {
    case "PageNumber":
      return {
        ...textField,
        text: page.pageNo.toString()
      };
    case "TotalPages":
      return {
        ...textField,
        text: pages.length.toString()
      };
    case "PageNumberOf":
      const targetPage = pages.find(
        p => p.namedDestionation === textField.target
      );
      if (targetPage) {
        return {
          ...textField,
          text: targetPage.pageNo.toString()
        };
      } else {
        return textField;
      }
    default:
      return textField;
  }
}

function splitSection(
  parentResources: AD.Resources.Resources,
  desiredSizes: Map<{}, AD.Size.Size>,
  previousPage: Page | undefined,
  section: AD.Section.Section
): Array<Page> {
  const resources = AD.Resources.mergeResources([parentResources, section]);
  const pages = new Array<Page>();
  const { noLeadingSpace, noTrailingSpace } = section.page.style;
  const contentRect = getPageContentRect(desiredSizes, section);

  let leadingSpace = 0;
  let elements = new Array<AD.SectionElement.SectionElement>();
  let y = contentRect.y;
  let currentPage = previousPage;
  for (let i = 0; i < section.children.length; ++i) {
    const element = section.children[i];
    if (element.type === "PageBreak") {
      currentPage = createPage(
        desiredSizes,
        currentPage,
        section,
        elements,
        leadingSpace,
        pages.length === 0
      );
      pages.push(currentPage);
      elements = [];
      y = contentRect.y;
      leadingSpace = 0;
      continue;
    }

    const elementSize = getDesiredSize(element, desiredSizes);
    const elementMargin = getSectionElementMargin(resources, element);

    if (elements.length === 0) {
      leadingSpace = noLeadingSpace ? elementMargin.top : 0;
    }

    const trailingSpace = noTrailingSpace ? elementMargin.bottom : 0;
    const elementHeight = elementSize.height - trailingSpace;
    const heightLeft = contentRect.height + leadingSpace - y;
    if (elementHeight > heightLeft) {
      currentPage = createPage(
        desiredSizes,
        currentPage,
        section,
        elements,
        leadingSpace,
        pages.length === 0
      );
      pages.push(currentPage);
      elements = [];
      y = contentRect.y;
      leadingSpace = 0;
    }

    // TODO: noLeadingSpace not accounted for if this is a new page

    elements.push(element);
    y += elementSize.height;
  }

  if (elements.length > 0) {
    pages.push(
      createPage(
        desiredSizes,
        currentPage,
        section,
        elements,
        leadingSpace,
        pages.length === 0
      )
    );
  }

  return pages;
}

function createPage(
  desiredSizes: Map<{}, AD.Size.Size>,
  previousPage: Page | undefined,
  section: AD.Section.Section,
  elements: ReadonlyArray<AD.SectionElement.SectionElement>,
  leadingSpace: number,
  isFirst: boolean
): Page {
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
  const namedDestionation =
    isFirst && section.id !== "" ? section.id : undefined;
  const rect = getPageContentRect(desiredSizes, section);
  const contentRect = AD.Rect.create(
    rect.x,
    rect.y - leadingSpace,
    rect.width,
    rect.height + leadingSpace
  );
  const pageNo = previousPage ? previousPage.pageNo + 1 : 1;

  return {
    pageNo: pageNo,
    namedDestionation: namedDestionation,
    pageOptions: pageOptions,
    section: section,
    contentRect: contentRect,
    elements: elements,
    header: section.page.header,
    footer: section.page.footer
  };
}

function getPageContentRect(
  desiredSizes: Map<{}, AD.Size.Size>,
  section: AD.Section.Section
): AD.Rect.Rect {
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
        top: 0
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
  const last =
    group.children.length > 0
      ? group.children[group.children.length - 1]
      : undefined;
  const firstMargin = first && getSectionElementMargin(resources, first);
  const lastMargin = last && getSectionElementMargin(resources, last);
  if (firstMargin && lastMargin) {
    return {
      ...firstMargin,
      bottom: lastMargin.bottom
    };
  } else {
    return {
      bottom: 0,
      left: 0,
      right: 0,
      top: 0
    };
  }
}

function getTableMargins(
  resources: AD.Resources.Resources,
  table: AD.Table.Table
) {
  const style = AD.Resources.getStyle(
    undefined,
    table.style,
    "TableStyle",
    table.styleName,
    resources
  ) as AD.TableStyle.TableStyle;
  return style.margins;
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
