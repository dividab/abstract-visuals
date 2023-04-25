/**
 * Defines a data-type that represents a single test for the Docx render function
 */
export type ExportTestDef = {
  readonly name: string;
  readonly only?: boolean;
  readonly skip?: boolean;
  readonly abstractDocXML: string;
  readonly images: {};
  readonly fonts: {};
  readonly expectedPdfJson: {};
};
