import { exhaustiveCheck } from "ts-exhaustive-check";
import { AbstractDoc } from "../../abstract-document/abstract-doc.js";
import { Resources, mergeResources } from "../../abstract-document/resources.js";
import { Group } from "../../abstract-document/section-elements/group.js";
import { Table } from "../../abstract-document/section-elements/table.js";
import { SectionElement } from "../../abstract-document/section-elements/section-element.js";
import { Paragraph } from "../../abstract-document/section-elements/paragraph.js";
import { Section } from "../../abstract-document/page/section.js";
import { TableRow } from "../../abstract-document/table/table-row.js";
import { TableCell } from "../../abstract-document/table/table-cell.js";

export function getResources(doc: AbstractDoc): Resources {
  const resources = doc.children.map((s) => getResourcesSection(s));
  return mergeResources([...resources, doc]);
}

function getResourcesSection(s: Section): Resources {
  const header = mergeResources(s.page.header.map((e) => getResourcesSectionElement(e)));
  const footer = mergeResources(s.page.footer.map((e) => getResourcesSectionElement(e)));
  const children = mergeResources(s.children.map((e) => getResourcesSectionElement(e)));
  return mergeResources([header, footer, children]);
}

function getResourcesSectionElement(e: SectionElement): Resources {
  switch (e.type) {
    case "Paragraph":
      return getResourcesParagraph(e);
    case "Table":
      return getResourcesTable(e);
    case "Group":
      return getResourcesGroup(e);
    case "PageBreak":
      return e;
    default:
      return exhaustiveCheck(e);
  }
}

function getResourcesParagraph(paragraph: Paragraph): Resources {
  return paragraph;
}

function getResourcesTable(table: Table): Resources {
  return mergeResources(table.children.map((r) => getResourcesTableRow(r)));
}

function getResourcesTableRow(r: TableRow): Resources {
  return mergeResources(r.children.map((c) => getResourcesTableCell(c)));
}

function getResourcesTableCell(c: TableCell): Resources {
  return mergeResources(c.children.map((e) => getResourcesSectionElement(e)));
}

function getResourcesGroup(group: Group): Resources {
  return mergeResources(group.children.map((e) => getResourcesSectionElement(e)));
}
