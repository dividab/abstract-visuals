import * as AD from "../../abstract-document/index";
import { Page } from "./paginate";

export function updatePageRefs(pages: ReadonlyArray<Page>): Array<Page> {
  return pages.map(page => updateRefsOnPage(page, pages));
}

export function updateRefsOnPage(page: Page, pages: ReadonlyArray<Page>): Page {
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
      const targetPage = pages.find(p =>
        p.namedDestionations.some(dest => dest === textField.target)
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
