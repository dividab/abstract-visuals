/** Defines a data-type that represents a single test. */
export type ExportTestDef = {
  readonly name: string;
  readonly abstractDocXML: string;
  readonly images: object;
  readonly fonts: object;
  readonly expectedPdfJson: object;
};
