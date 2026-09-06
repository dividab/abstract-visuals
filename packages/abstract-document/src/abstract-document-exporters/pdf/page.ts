import type * as AD from "../../abstract-document/index.js";

export interface PageColumn {
  readonly elements: ReadonlyArray<AD.SectionElement.SectionElement>;
}

export interface Page {
  readonly pageNo: number;
  readonly namedDestionations: ReadonlyArray<string>;
  readonly pageOptions: PDFKit.PDFDocumentOptions;
  readonly section: AD.Section.Section;
  readonly contentRect: AD.Rect.Rect;
  readonly columns: ReadonlyArray<PageColumn>;
  readonly header: ReadonlyArray<AD.SectionElement.SectionElement>;
  readonly footer: ReadonlyArray<AD.SectionElement.SectionElement>;
}
