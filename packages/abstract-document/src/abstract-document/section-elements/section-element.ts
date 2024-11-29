import * as Group from "./group.js";
import * as Paragraph from "./paragraph.js";
import * as Table from "./table.js";
import * as PageBreak from "./page-break.js";

export type SectionElement = Group.Group | Paragraph.Paragraph | Table.Table | PageBreak.PageBreak;
export type SectionElementNoPageBreak = Exclude<SectionElement, PageBreak.PageBreak>;
export type SectionElementStyle = SectionElementNoPageBreak["style"];
export const SectionElementTypeNoPagebreak = [Group.sectionType, Paragraph.sectionType, Table.sectionType];

export function isSectionElement(value: SectionElement): value is SectionElementNoPageBreak {
  return SectionElementTypeNoPagebreak.includes(value.type);
}

export function getSectionStyle(element: SectionElement): SectionElementStyle | undefined {
  return isSectionElement(element) ? element.style : undefined;
}
